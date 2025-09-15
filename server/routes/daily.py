from datetime import datetime
from zoneinfo import ZoneInfo
from flask import Blueprint, jsonify
from db import get_conn_from_pool, return_conn
import requests
from psycopg2 import OperationalError, InterfaceError

daily_bp = Blueprint("daily", __name__)

def get_pt_today_date():
  return datetime.now(ZoneInfo("America/Los_Angeles")).date()

def ensure_daily_pick(conn, game_date):
  with conn.cursor() as cur:
    query = """
      INSERT INTO heardle_daily (date_chosen, track_id)
      SELECT %s::DATE AS game_date, t.track_id
      FROM tracks t
      WHERE NOT EXISTS (
        SELECT 1 FROM heardle_daily d
        WHERE d.track_id = t.track_id
          AND d.date_chosen >= (%s::DATE - INTERVAL '30 days')
      )
      ORDER BY random()
      LIMIT 1
      ON CONFLICT (date_chosen) DO NOTHING;
    """
    cur.execute(query, (game_date, game_date))

  conn.commit()

@daily_bp.route("/heardle/tracks/daily", methods=["GET"])
def get_daily():
  game_date = get_pt_today_date()
  # game_date = "2025-08-29"
  # print(f"game date = {game_date}")

  pool, conn = get_conn_from_pool()
  if pool is None or conn is None:
    return jsonify({"status": "DB connection failed"}), 503
  
  try:
    ensure_daily_pick(conn, game_date)

    with conn.cursor() as cur:
      query = """
        SELECT d.date_chosen,
                t.track_id, t.moe_anime_id, t.moe_animethemeentry_id, t.anime, t.song_name, t.slug,
                t.audio_ogg_url, t.image_url, t.artists, t.year, t.synopsis
        FROM heardle_daily d
        JOIN tracks t on t.track_id = d.track_id
        WHERE d.date_chosen = %s::DATE;        
      """
      cur.execute(query, (game_date,))

      row = cur.fetchone()
    if not row:
      return jsonify({"status": "No daily track found"}), 404

    return jsonify({
      "date": str(row[0]),
      "track": {
          "track_id": row[1],
          "moe_anime_id": row[2],
          "moe_animethemeentry_id": row[3],
          "anime": row[4],
          "songName": row[5],
          "slug": row[6],
          "audio": {"ogg": row[7]},
          "image": row[8],
          "artists": row[9],
          "year": row[10],
          "synopsis": row[11]
      }
    }), 200
  
  # retry once if neon dropped SSL connection
  except (OperationalError, InterfaceError):
    return_conn(pool, conn, close=True)
    pool, conn = get_conn_from_pool()
    if pool is None or conn is None:
        return jsonify({"status": "DB reconnection failed"}), 503
    try:
      ensure_daily_pick(conn, game_date)
      with conn.cursor() as cur:
        query = """
          SELECT d.date_chosen,
                  t.track_id, t.moe_anime_id, t.moe_animethemeentry_id, t.anime, t.song_name, t.slug,
                  t.audio_ogg_url, t.image_url, t.artists, t.year, t.synopsis
          FROM heardle_daily d
          JOIN tracks t on t.track_id = d.track_id
          WHERE d.date_chosen = %s::DATE;        
        """
        cur.execute(query, (game_date,))

        row = cur.fetchone()
      if not row:
        return jsonify({"status": "No daily track found"}), 404
      
      return jsonify({
        "date": str(row[0]),
        "track": {
            "track_id": row[1],
            "moe_anime_id": row[2],
            "moe_animethemeentry_id": row[3],
            "anime": row[4],
            "songName": row[5],
            "slug": row[6],
            "audio": {"ogg": row[7]},
            "image": row[8],
            "artists": row[9],
            "year": row[10],
            "synopsis": row[11]
        }
      }), 200
    except Exception as e:
        return jsonify({"status": "Error fetching daily song info (after retry)", "exception": str(e)}), 500
  
  except Exception as e:
    print(e)
    return jsonify({"status": "Error fetching daily song info", "exception": str(e)}), 400

  finally:
    return_conn(pool, conn)


@daily_bp.route("/heardle/tracks/daily/full", methods=["GET"])
def get_daily_full():
  game_date = get_pt_today_date()
  # game_date = "2025-08-29"
  # print(f"game date = {game_date}")

  pool, conn = get_conn_from_pool()
  if pool is None or conn is None:
    return jsonify({"status": "DB connection failed"}), 503

  try:
    ensure_daily_pick(conn, game_date)

    with conn.cursor() as cur:
      query = """
        SELECT d.date_chosen,
                t.track_id, t.moe_anime_id, t.moe_animethemeentry_id, t.anime, t.song_name, t.slug,
                t.audio_ogg_url, t.image_url, t.artists, t.year, t.synopsis
        FROM heardle_daily d
        JOIN tracks t on t.track_id = d.track_id
        WHERE d.date_chosen = %s::DATE;        
      """
      cur.execute(query, (game_date,))
      row = cur.fetchone()

    if not row:
      return jsonify({"status": "No daily track found"}), 404
    
    base_data = {
      "date": str(row[0]),
      "track": {
          "track_id": row[1],
          "moe_anime_id": row[2],
          "moe_animethemeentry_id": row[3],
          "anime": row[4],
          "songName": row[5],
          "slug": row[6],
          "audio": {"ogg": row[7]},
          "image": row[8],
          "artists": row[9],
          "year": row[10],
          "synopsis": row[11]
      }
    }

    moe_anime_id = base_data["track"]["moe_anime_id"]
    moe_animethemeenetry_id = base_data["track"]["moe_animethemeentry_id"]

    # fetch video url from moe_anime_themes_api
    moe_api_video_url = f"https://api.animethemes.moe/animethemeentry/{moe_animethemeenetry_id}?include=videos&fields[video]=id,link"
    response = requests.get(moe_api_video_url)
    if response.status_code != 200:
      print('Error fetching video url for daily track:', response.status_code)
    response_json = response.json()
    videos = (response_json.get("animethemeentry") or {}).get("videos") or []
    first_video = videos[0]
    video_url = first_video.get("link") or ""

    # fetch season and studios from moe_anime_themes_api
    moe_extra_anime_info_url = f"https://api.animethemes.moe/anime?include=studios&filter[anime][id]={moe_anime_id}&fields[anime]=season&fields[studio]=name"
    response = requests.get(moe_extra_anime_info_url)
    if response.status_code != 200:
      print('Error fetching video url for daily track:', response.status_code)
    response_json = response.json()

    anime = response_json.get("anime") or []
    if not anime:
      print("Error fetching video url, studios, and season for anime resource")
      return jsonify(base_data), 200

    season = anime[0].get("season") or ""
    studios = anime[0].get("studios") or []
    formatted_studios = []
    for studio in studios:
      formatted_studios.append(studio.get("name") or "")

    base_data["track"]["video_url"] = video_url
    base_data["track"]["season"] = season
    base_data["track"]["studios"] = formatted_studios

    return jsonify(base_data), 200
  
  # one retry on in case of dropped connection
  except (OperationalError, InterfaceError): 
    return_conn(pool, conn, close=True)
    pool, conn = get_conn_from_pool()
    if pool is None or conn is None:
      return jsonify({"status": "DB reconnection failed"}), 503

    try:
      with conn.cursor() as cur:
        query = """
          SELECT d.date_chosen,
                  t.track_id, t.moe_anime_id, t.moe_animethemeentry_id, t.anime, t.song_name, t.slug,
                  t.audio_ogg_url, t.image_url, t.artists, t.year, t.synopsis
          FROM heardle_daily d
          JOIN tracks t on t.track_id = d.track_id
          WHERE d.date_chosen = %s::DATE;        
        """
        cur.execute(query, (game_date,))
        row = cur.fetchone()

      if not row:
        return jsonify({"status": "No daily track found"}), 404
      
      # for the retry, just return the regular data and dont try to get the video url, season, etc.
      return jsonify({
          "date": str(row[0]),
          "track": {
              "track_id": row[1],
              "moe_anime_id": row[2],
              "moe_animethemeentry_id": row[3],
              "anime": row[4],
              "songName": row[5],
              "slug": row[6],
              "audio": {"ogg": row[7]},
              "image": row[8],
              "artists": row[9],
              "year": row[10],
              "synopsis": row[11],
          },
      }), 200 

    except Exception as e:
      return jsonify({"status": "Error fetching daily song info (full, after retry)", "exception": str(e)}), 500 
  
  except Exception as e:
    print(e)
    return jsonify({"status": "Error fetching daily song info (full)", "exception": str(e)}), 400

  finally:
    return_conn(pool, conn)