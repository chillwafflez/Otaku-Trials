from flask import Flask, Response, request, jsonify
import csv
import requests
from db import get_connection_pool


app = Flask(__name__)

@app.route("/", methods=['GET'])
def home():
    return Response("test otaku-trial api home", 200)


@app.route("/heardle/refresh", methods=['POST'])
def refresh_tracks():
  max_number_tracks = request.get_json()["max_number_tracks"]
  results = []
  url = "https://api.animethemes.moe/anime?page[size]=10&sort=random&include=images,animethemes.animethemeentries.videos.audio,animethemes.song.artists&filter[has]=animethemes&filter[animetheme][type]=OP&fields[anime]=id,name,year,synopsis&fields[animetheme]=id,slug&fields[animethemeentry]=id&fields[video]=id&fields[audio]=link&fields[artist]=name&fields[image]=link"

  try:
    while url and len(results) < max_number_tracks:     
      response = requests.get(url, timeout=30)

      if response.status_code != 200:
        print('Error:', response.status_code)
        return jsonify({"status": "API error", "code": response.status_code}), 502

      response_json = response.json()
      animes = response_json["anime"]

      for anime in animes:
        moe_anime_id = anime["id"]
        anime_name = anime["name"].strip()
        year = anime["year"]
        synopsis = anime["synopsis"].replace('\n', '').replace("\r", "").strip() if anime["synopsis"] else ""

        # extract image
        images = anime.get("images") or []
        image_url = None
        if len(images) > 1:
          image_url = images[1]["link"]
        else:
          image_url = images[0]["link"]

        # extract OPs
        for theme in anime["animethemes"]:
          moe_animetheme_id = theme["id"]
          slug = theme["slug"]
          songname = theme["song"]["title"]
          moe_song_id = theme["song"]["id"]
          
          # extract artists
          artists = []
          song_artists = theme["song"]["artists"]
          for artist in song_artists:
            artists.append(artist["name"].strip())
          
          theme_entry = theme["animethemeentries"][0] # even if there are multiple version of the OP, just get the first one
          moe_entry_id = theme_entry["id"]
          audio_ogg_url =  theme_entry["videos"][0]["audio"]["link"]

          results.append({'moe_anime_id': moe_anime_id,
                          'moe_animetheme_id': moe_animetheme_id,
                          'moe_animethemeentry_id': moe_entry_id,
                          'moe_song_id': moe_song_id,
                          'anime': anime_name,
                          'year': year, 
                          'song_name': songname,
                          'slug': slug, 
                          'audio_ogg_url': audio_ogg_url, 
                          'image_url': image_url, 
                          'artists': artists, 
                          'synopsis': synopsis})
          
      url = response_json["links"]["next"]
      print(f"moving to next page...")


    pool = get_connection_pool()
    query = """
      INSERT INTO tracks (moe_anime_id, moe_animetheme_id, moe_animethemeentry_id, moe_song_id, anime, year, song_name, slug, audio_ogg_url, image_url, artists, synopsis)
      VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
      """
    with pool.getconn() as conn:
        with conn.cursor() as cur:
          cur.execute('TRUNCATE tracks, heardle_daily')  # truncate table only after we have a new batch of tracks ready to be added

          for result in results:
            cur.execute(query, (result['moe_anime_id'], result['moe_animetheme_id'], result['moe_animethemeentry_id'], result['moe_song_id'], result['anime'], result['year'], result['song_name'], result['slug'], result['audio_ogg_url'], result['image_url'], result['artists'], result['synopsis']))

    
    # with open("temp_data\\test.csv", mode='a', newline='', encoding="utf-8") as f:
    #   writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    #   writer.writerow(['moe_anime_id', 'moe_animetheme_id', 'moe_animethemeentry_id', 'moe_song_id', 'anime', 'year', 'song_name', 'slug', 'audio_ogg_url', 'image_url', 'artists', 'synopsis'])
    #   for result in results:
    #     writer.writerow([result['moe_anime_id'], result['moe_animetheme_id'], result['moe_animethemeentry_id'], result['moe_song_id'], result['anime'], result['year'], result['song_name'], result['slug'], result['audio_ogg_url'], result['image_url'], result['artists'], result['synopsis']])
          
    return jsonify(results), 201

  except Exception as e:
    response = {
        "status": "Error adding refreshing track list in database", 
        "exception": str(e)
    }  
    return jsonify(response), 400

  finally:
    pool.putconn(conn)
       

@app.route("/heardle/tracks", methods=['GET'])
def fetch_tracks():
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


@app.route("/heardle/tracks/daily", methods=['GET'])
def fetch_random():
  return "cock"

if __name__ == '__main__':
  app.run(debug=True)