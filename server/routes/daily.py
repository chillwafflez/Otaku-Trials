from datetime import datetime
from zoneinfo import ZoneInfo
from flask import Blueprint, jsonify
from db import get_connection_pool

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
  pool = get_connection_pool()
  game_date = get_pt_today_date()
  # game_date = "2025-08-29"
  print(f"game date = {game_date}")
  conn = pool.getconn()
  try:
    ensure_daily_pick(conn, game_date)
    with conn.cursor() as cur:
      query = """
        SELECT d.date_chosen,
                t.track_id, t.anime, t.song_name, t.slug,
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
          "id": row[1],
          "anime": row[2],
          "songName": row[3],
          "slug": row[4],
          "audio": {"ogg": row[5]},
          "image": row[6],
          "artists": row[7],
          "year": row[8],
          "synopsis": row[9]
      }
    }), 200
  finally:
    pool.putconn(conn)