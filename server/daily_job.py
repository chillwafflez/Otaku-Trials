# run in a PythonAnywhere task to ensure a daily song was picked

from datetime import datetime
from zoneinfo import ZoneInfo
from db import get_connection_pool
from routes.daily import ensure_daily_pick

def main():
    pool = get_connection_pool()
    conn = pool.getconn()
    try:
        game_date = datetime.now(ZoneInfo("America/Los_Angeles")).date()
        ensure_daily_pick(conn, game_date)
        print("Ensured daily pick for", game_date)
    finally:
        pool.putconn(conn)

if __name__ == "__main__":
    main()