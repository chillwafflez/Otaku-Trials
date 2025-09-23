import csv
import ast
import pandas as pd
from db import get_conn_from_pool, return_conn
from psycopg2.extras import execute_values

def validate():
  df = pd.read_csv("server\\temp_data\\anime.csv")
  # fully_duplicate_rows = df.duplicated()
  # for bruh in fully_duplicate_rows:
  #   if bruh == True:
  #     print("bruh")


# converts a string like "['Action','Drama']" to a list
def parse_list_field(s):
  if s is None:
    return []
  s = s.strip()
  if not s:
    return []
  try:
    val = ast.literal_eval(s)

    # ensure its a list of strings
    if isinstance(val, (list, tuple)):
      return [str(x) for x in val]
    
    # if it's a single string, wrap it in a list
    if isinstance(val, str):
      return [val]
    return []
  except Exception:
    # if parsing fails just return to a empty list
    return []


# move data from csv into postgres
def migrate():
  rows = []
  with open("temp_data\\animev2.csv", newline='', encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
      rows.append((
          int(row["anilist_id"]),
          row["english_title"] or None,
          row["native_title"] or None,
          row["user_preferred_title"] or None,
          int(row["season_year"]) if row["season_year"] else None,
          row["season"] or None,
          int(row["num_of_episodes"]) if row["num_of_episodes"] else None,
          parse_list_field(row["genres"]),
          parse_list_field(row["tags"]),
          parse_list_field(row["studios"]),
          row["source"] or None
      ))

  pool, conn = get_conn_from_pool()
  if pool is None or conn is None:
    print("daily_job: DB connection failed")
    return 
  
  with conn.cursor() as cur:
    query = """
      INSERT INTO animes(
        anilist_id, english_title, native_title, user_preferred_title, season_year, 
        season, num_of_episodes, genres, tags, studios, source)
      VALUES %s
      ON CONFLICT (anilist_id) DO UPDATE SET
        english_title = EXCLUDED.english_title,
        native_title = EXCLUDED.native_title,
        user_preferred_title = EXCLUDED.user_preferred_title,
        season_year = EXCLUDED.season_year,
        season = EXCLUDED.season,
        num_of_episodes = EXCLUDED.num_of_episodes,
        genres = EXCLUDED.genres,
        tags = EXCLUDED.tags,
        studios = EXCLUDED.studios,
        source = EXCLUDED.source;
      """
    execute_values(cur, query, rows)
  conn.commit()
  print(f"[migrate] upserted {len(rows)} rows into animes")

def main():
  migrate()

if __name__ == "__main__":
  main()