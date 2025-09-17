import psycopg2
import psycopg2.pool
from dotenv import load_dotenv
import os

_pool_instance = None

def get_connection_psycop():
  try:
    load_dotenv() 
    print("Connecting to PostgreSQL database...")

    conn = psycopg2.connect(host = os.environ.get("DB_HOST"),
                            database = os.environ.get("DB_NAME"),
                            user = os.environ.get("DB_USER"),
                            password = os.environ.get("DB_PASSWORD"))
    print(f"Successfully connected")
    return conn
  except (Exception, psycopg2.DatabaseError) as error:
    print(error)
    return None
  
# creates a singleton connection pool
def get_connection_pool():
  global _pool_instance

  if _pool_instance is None:
    try:
      load_dotenv() 

      # _pool_instance = psycopg2.pool.SimpleConnectionPool(
      #   minconn=2, 
      #   maxconn=5, 
      #   user=os.environ.get("DB_USER"), 
      #   password=os.environ.get("DB_PASSWORD"),
      #   host=os.environ.get("DB_HOST"), 
      #   port='5432', 
      #   database=os.environ.get("DB_NAME"),
      #   sslmode="require")

      _pool_instance = psycopg2.pool.SimpleConnectionPool(
        minconn=2, 
        maxconn=5, 
        user=os.environ.get("DB_USER"), 
        password=os.environ.get("DB_PASSWORD"),
        host=os.environ.get("DB_HOST"), 
        port='5432', 
        database=os.environ.get("DB_NAME"),
        sslmode="require",
        keepalives=1,
        keepalives_idle=30,
        keepalives_interval=10,
        keepalives_count=3)

    except Exception as error:
      print("error creating postgresql pool")
      print(error)
      return None

  return _pool_instance

# borrow a db connection; refresh if it's stale
def get_conn_from_pool():
  pool = get_connection_pool()
  if pool is None:
    return None, None
  
  conn = pool.getconn()
  try:
    # quick check, if this fails, reconnect
    with conn.cursor() as cur:
      cur.execute("SELECT 1;")
      _ = cur.fetchone()
    return pool, conn
  except Exception:
    # stale/broken connection: throw it away and get a fresh one
    try:
      pool.putconn(conn, close=True)
    except Exception:
      pass
    conn = pool.getconn()
    return pool, conn
  
# returns a connection to the pool safely
def return_conn(pool, conn, *, close=False):
  if pool and conn:
    pool.putconn(conn, close=close)