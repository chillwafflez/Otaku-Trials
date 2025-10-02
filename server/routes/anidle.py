from datetime import datetime
from zoneinfo import ZoneInfo
from flask import Blueprint, jsonify
from db import get_conn_from_pool, return_conn
from psycopg2 import OperationalError, InterfaceError

anidle_bp = Blueprint("anidle", __name__)

def get_pt_today_date():
  return datetime.now(ZoneInfo("America/Los_Angeles")).date()

@anidle_bp.route("/anidle/daily", methods=["GET"])
def get_daily():
  game_date = get_pt_today_date()

  pool, conn = get_conn_from_pool()
  if pool is None or conn is None:
    return jsonify({"status": "DB connection failed"}), 503
  
  try:
    with conn.cursor() as cur:
      query = """
        SELECT d.date_chosen, a.anilist_id, a.english_title, a.native_title,
               a.user_preferred_title, a.season_year, a.season, a.num_of_episodes,
               a.genres, a.tags, a.studios, a.source, a.cover_image, d.summary,
               d.score, d.trailer_url 
        FROM anidle_daily d
        JOIN animes a on a.anilist_id = d.anilist_id
        WHERE d.date_chosen = %s::DATE;        
      """
      cur.execute(query, (game_date,))

      row = cur.fetchone()
    if not row:
      return jsonify({"status": "No daily anidle anime found"}), 404

    return jsonify({
      "date": str(row[0]),
      "anilist_id": row[1],
      "english_title": row[2],
      "native_title": row[3],
      "user_preferred_title": row[4],
      "season_year": row[5],
      "season": row[6],
      "num_of_episodes": row[7],
      "genres": row[8],
      "tags": row[9],
      "studios": row[10],
      "source": row[11],
      "cover_image": row[12], 
      "summary": row[13],
      "score": row[14],
      "trailer_url": row[15]
    }), 200
  
  # retry once if neon dropped SSL connection
  except (OperationalError, InterfaceError):
    return_conn(pool, conn, close=True)
    pool, conn = get_conn_from_pool()
    if pool is None or conn is None:
        return jsonify({"status": "DB reconnection failed"}), 503
    try:
      with conn.cursor() as cur:
        query = """
          SELECT d.date_chosen, a.anilist_id, a.english_title, a.native_title,
                a.user_preferred_title, a.season_year, a.season, a.num_of_episodes,
                a.genres, a.tags, a.studios, a.source, a.cover_image, d.summary,
                d.score, d.trailer_url
          FROM anidle_daily d
          JOIN animes a on a.anilist_id = d.anilist_id
          WHERE d.date_chosen = %s::DATE;        
        """
        cur.execute(query, (game_date,))

        row = cur.fetchone()
      if not row:
        return jsonify({"status": "No daily anidle anime found"}), 404
      
      return jsonify({
        "date": str(row[0]),
        "track": {
          "date": str(row[0]),
          "anilist_id": row[1],
          "english_title": row[2],
          "native_title": row[3],
          "user_preferred_title": row[4],
          "season_year": row[5],
          "season": row[6],
          "num_of_episodes": row[7],
          "genres": row[8],
          "tags": row[9],
          "studios": row[10],
          "source": row[11],
          "cover_image": row[12], 
          "summary": row[13],
          "score": row[14],
          "trailer_url": row[15]
        }
      }), 200
    except Exception as e:
        return jsonify({"status": "Error fetching daily anidle info (after retry)", "exception": str(e)}), 500
  
  except Exception as e:
    print(e)
    return jsonify({"status": "Error fetching daily anidle info", "exception": str(e)}), 400

  finally:
    return_conn(pool, conn)