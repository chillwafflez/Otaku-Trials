# run in a PythonAnywhere task to ensure a daily song was picked

from datetime import datetime
from zoneinfo import ZoneInfo
from psycopg2 import InterfaceError, OperationalError
from db import get_conn_from_pool, return_conn
import requests
import sys

def get_pt_today_date():
  return datetime.now(ZoneInfo("America/Los_Angeles")).date()

# base function to choose a mystery song (w/o video url, seasons, studios)
# returns number of rows inserted (0 or 1)
def pick_daily_song(conn, game_date) -> int:
  with conn:
    with conn.cursor() as cur:
      cur.execute(
        """
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
        """,
        (game_date, game_date),
      )
      return cur.rowcount  # 1 if inserted 0 if already present

# fetch daily song's video url, season, and studios from animethemes.moe and update record in db
def fetch_full_daily_song_info(conn, game_date):
  with conn.cursor() as cur:
    cur.execute(
      """
      SELECT d.track_id, t.moe_anime_id, t.moe_animethemeentry_id
      FROM heardle_daily d
      JOIN tracks t ON t.track_id = d.track_id
      WHERE d.date_chosen = %s::DATE
      """,
      (game_date,),
    )
    row = cur.fetchone()
  if not row:
     return False, "no daily heardle row to add data to"
  
  track_id, moe_anime_id, moe_animethemeentry_id = row

  # fetch video url from moe_anime_themes_api
  video_url = ""
  try:
    moe_api_video_url = f"https://api.animethemes.moe/animethemeentry/{moe_animethemeentry_id}?include=videos&fields[video]=id,link"
    response = requests.get(moe_api_video_url)

    if response.status_code == 200:
      response_json = response.json()
      videos = (response_json.get("animethemeentry") or {}).get("videos") or []
      first_video = videos[0]
      video_url = first_video.get("link") or ""
    else:
      print('Error fetching video url for daily track:', response.status_code)
  except Exception as e:
    print("fetch_full_daily_song_info: video_url fetch failed:", e)

  # fetch season and studios from moe_anime_themes_api
  season = ""
  formatted_studios = []
  try:
    moe_extra_anime_info_url = f"https://api.animethemes.moe/anime?include=studios&filter[anime][id]={moe_anime_id}&fields[anime]=season&fields[studio]=name"
    response = requests.get(moe_extra_anime_info_url)
    if response.status_code == 200:
      response_json = response.json()
      anime = response_json.get("anime") or []
      if anime:
        season = anime[0].get("season") or ""
        studios = anime[0].get("studios") or []
        for studio in studios:
          formatted_studios.append(studio.get("name") or "")
      else:
        print("Error fetching anime resource object for season and studios")
    else:
      print('Error fetching video url for daily track:', response.status_code)
  except Exception as e:
    print("fetch_full_daily_song_info: video_url fetch failed:", e)

  print(f"video url = {video_url}")
  print(f"season = {season}")
  print(f"studios = {formatted_studios}")  
  # update row
  with conn:
    with conn.cursor() as cur:
      cur.execute(
        """
        UPDATE heardle_daily
          SET video_url = %s,
            season = %s,
            studios = %s
        WHERE date_chosen = %s::DATE
        """,
        (video_url, season, formatted_studios, game_date),
      )

  return True, "ok"

def main():
  game_date = get_pt_today_date()
  pool, conn = get_conn_from_pool()
  if pool is None or conn is None:
    print("daily_job: DB connection failed")
    return 2

  try:
    inserted = pick_daily_song(conn, game_date)
    if inserted:
      print(f"daily_job: picked new song for {game_date}")
    else:
      print(f"daily_job: tried picking new song but song already picked for {game_date}")
    ok, msg = fetch_full_daily_song_info(conn, game_date)
    print(f"daily_job: tried getting full daily song info = {msg}")
    return 0
  finally:
    return_conn(pool, conn)

if __name__ == "__main__":
  try:
    sys.exit(main())
  except (OperationalError, InterfaceError) as e:
    print(f"daily_job: connection error: {e}")
    sys.exit(3)