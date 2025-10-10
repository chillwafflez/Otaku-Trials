# run in a PythonAnywhere task to ensure a anidle anime's summary was shortened

from datetime import datetime
from zoneinfo import ZoneInfo
from psycopg2 import InterfaceError, OperationalError
from db import get_conn_from_pool, return_conn
import sys
from dotenv import load_dotenv
import os
import openai
from openai import OpenAI

load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")
openai.openai_key = openai_key
client = OpenAI()

def get_pt_today_date():
  return datetime.now(ZoneInfo("America/Los_Angeles")).date()

# function to use openai to shorten and anonymize anime summary
def open_ai(summary) -> str:
  try:
    subject = client.responses.create(
        model="o4-mini",
        instructions="""
          On my Anime Quiz Game website, there is a game where user's need to guess an anime based on certain criteria. I provide 3 clues they can use if they're stuck. One
          clue I want to provide is the summary of the mystery anime. Can you shorten the actual full summary of the anime that I will provide, such that it is at most 3
          sentences long and has any character names omitted (because sometimes the name of the character is the name of the anime which would be too obvious). Another important
          thing is that I want you to ONLY return the shortened summary, nothing else. This is because I will use your direct output as the clue.
        """,
        input=summary,
        store=False
    )

    return subject.output_text
  except Exception as e:
    print(e)
    return None


# function to get anidle anime's info from db, shorten it, and update in db
def shorten_summary(conn, game_date) -> int:
  with conn:
    try:
      with conn.cursor() as cur:
        cur.execute(
          """
          SELECT a.english_title, a.user_preferred_title, d.summary
          FROM anidle_daily d
          JOIN animes a on a.anilist_id = d.anilist_id
          WHERE d.date_chosen = %s::DATE;
          """, (game_date,))
        row = cur.fetchone()

        english_title = row[0]
        user_preferred_title = row[1]
        summary = row[2]

        title_to_use = english_title
        if not title_to_use or title_to_use == "":
          title_to_use = user_preferred_title

        input = f'Here is the title of the anime: {title_to_use}. Here is the summary: "{summary}"'
        shortened_summary = open_ai(input)
        if not shortened_summary:
          print("OpenAI did not return a summary.")
          return False
        shortened_summary = shortened_summary.strip().strip('"').strip("'")
        
        cur.execute(
          """
          UPDATE anidle_daily
          SET shortened_summary = %s
          WHERE date_chosen = %s::DATE
          RETURNING date_chosen, shortened_summary;
          """,
          (shortened_summary, game_date)
        )

        updated = cur.fetchone()

        if not updated:
          print("Unable to update daily row (no match)")
          return False
        print(f"daily_anidle row updated successfully: {updated}")
        return True
    except Exception as e:
      print('error shortening daily anidle summary', e)
      return False




def main():
  game_date = get_pt_today_date()
  pool, conn = get_conn_from_pool()
  if pool is None or conn is None:
    print("anidle_summary_job: DB connection failed")
    return 2

  try:
    updated = shorten_summary(conn, game_date)
    if updated:
      print(f"anidle_summary_job: shortened summary for anidle for {game_date}")
    else:
      print(f"anidle_summary_job: tried shortening summary already picked for {game_date}")
    return 0
  finally:
    return_conn(pool, conn)

if __name__ == "__main__":
  try:
    sys.exit(main())
  except (OperationalError, InterfaceError) as e:
    print(f"daily_anidle_job: connection error: {e}")
    sys.exit(3)