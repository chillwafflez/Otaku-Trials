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
  
def get_connection_pool():
  global _pool_instance

  if _pool_instance is None:
    try:
      load_dotenv() 

      _pool_instance = psycopg2.pool.SimpleConnectionPool(2, 3, user=os.environ.get("DB_USER"), 
                                                      password=os.environ.get("DB_PASSWORD"),
                                                      host=os.environ.get("DB_HOST"), 
                                                      port='5432', 
                                                      database=os.environ.get("DB_NAME"))

    except Exception as error:
      print(error)
      return None

  return _pool_instance

# pool = get_connection_pool()
# with pool.getconn() as conn:
#     with conn.cursor() as cur:
#         cur.execute("SELECT * FROM users")
#         rows = cur.fetchall()
#         print(rows)


# second_pool = get_connection_pool()
# print(pool is second_pool)