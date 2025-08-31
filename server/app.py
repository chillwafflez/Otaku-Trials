from flask import Flask, Response, request, jsonify
from db import get_connection_pool


app = Flask(__name__)

@app.route("/", methods=['GET'])
def home():
    return Response("test otaku-trial api home", 200)

@app.route("/heardle/tracks", methods=['GET'])
def get_tracks():
  try:
    pool = get_connection_pool()
    with pool.getconn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT track_id, anime, song_name FROM tracks;")
            rows = cur.fetchall()
            return jsonify(rows), 200
      
    response = {
        "status": "Unable to fetch Heardle tracks", 
        "exception": e
    }  
    return jsonify(response), 404
  except Exception as e:
    response = {
        "status": "Unable to fetch Heardle tracks", 
        "exception": e
    }  
    return jsonify(response), 404
  
  finally:
    pool.putconn(conn)  



if __name__ == '__main__':
  app.run(debug=True)