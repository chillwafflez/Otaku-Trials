# run in a PythonAnywhere task to ensure a anidle anime was picked

from datetime import datetime
from zoneinfo import ZoneInfo
from psycopg2 import InterfaceError, OperationalError
from db import get_conn_from_pool, return_conn
import requests
import sys

url = 'https://graphql.anilist.co'

def get_pt_today_date():
  return datetime.now(ZoneInfo("America/Los_Angeles")).date()

# base function to choose a anidle anime
# returns number of rows inserted (0 or 1)
def pick_daily_anidle(conn, game_date) -> int:
  with conn:
    with conn.cursor() as cur:
      cur.execute(
        """
        INSERT INTO anidle_daily (date_chosen, anilist_id)
        SELECT %s::DATE AS game_date, a.anilist_id
        FROM animes a
        WHERE NOT EXISTS (
          SELECT 1 FROM anidle_daily d
          WHERE d.anilist_id = a.anilist_id
            AND d.date_chosen >= (%s::DATE - INTERVAL '30 days')
        )
        ORDER BY random()
        LIMIT 1
        ON CONFLICT (date_chosen) DO NOTHING;
        """,
        (game_date, game_date),
      )
      return cur.rowcount  # 1 if inserted 0 if already present

# fetch daily anidle anime's description, average score, and trailer id
def fetch_full_anidle_info(conn, game_date):
  with conn.cursor() as cur:
    cur.execute(
      """
      SELECT anilist_id
      FROM anidle_daily
      WHERE date_chosen = %s::DATE
      """,
      (game_date,),
    )
    row = cur.fetchone()
  if not row:
     return False, "no daily anidle row to add data to"
  
  anilist_id = row[0]
  print(f"anilist id = {anilist_id}")

  # fetch additional info
  query = '''
    query getAdditionalInfo($id: Int) {
      Media(id: $id, type: ANIME) {
        description
        averageScore
        trailer {
          id
        }
        mainCharacters: characters(sort: FAVOURITES_DESC, role: MAIN, page: 1, perPage: 3) {
          nodes {
              id
              name {
                  full
                  native
              }
              image {
                large
                medium
              }
              favourites
            }
          }
        }
      }
    '''
  variables = {
      "id": anilist_id
  }
  response = requests.post(url, json={'query': query, 'variables': variables})
  json = response.json()

  media = json['data']['Media']
  description = media['description']
  average_score = media['averageScore']
  trailer_id = media['trailer']['id'] if media['trailer'] else None

  character_image_links = []
  main_characters = media['mainCharacters']['nodes']
  if main_characters:
    if len(main_characters) > 3:
      for i in range(3):
        image_link = main_characters[i]['image'].get('extraLarge') or {}
        if not image_link:
          image_link = main_characters[i]['image'].get('large')
        character_image_links.append(image_link)
    else:
      for character in main_characters:
        image_link = character['image'].get('extraLarge') or {}
        if not image_link:
          image_link = character['image'].get('large')
        character_image_links.append(image_link)     

  with conn:
    with conn.cursor() as cur:
      cur.execute(
        """
        UPDATE anidle_daily
          SET summary = %s,
            score = %s,
            trailer_url = %s,
            top_three_characters = %s
        WHERE date_chosen = %s::DATE
        """,
        (description, average_score, trailer_id, character_image_links, game_date),
      )
    
  return True, 'ok'


def main():
  game_date = get_pt_today_date()
  pool, conn = get_conn_from_pool()
  if pool is None or conn is None:
    print("daily_anidle_job: DB connection failed")
    return 2

  try:
    inserted = pick_daily_anidle(conn, game_date)
    if inserted:
      print(f"daily_anidle_job: picked new anidle for {game_date}")
    else:
      print(f"daily_anidle_job: tried picking new anidle but anidle already picked for {game_date}")
    ok, msg = fetch_full_anidle_info(conn, game_date)
    print(f"daily_anidle_job: tried getting full daily song info = {msg}")
    return 0
  finally:
    return_conn(pool, conn)

if __name__ == "__main__":
  try:
    sys.exit(main())
  except (OperationalError, InterfaceError) as e:
    print(f"daily_anidle_job: connection error: {e}")
    sys.exit(3)