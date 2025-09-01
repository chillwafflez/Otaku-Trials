from flask import Flask, Response, request, jsonify
import csv
import requests
from db import get_connection_pool
from routes.daily import daily_bp


app = Flask(__name__)
app.register_blueprint(daily_bp)

@app.route("/", methods=['GET'])
def home():
    return Response("test otaku-trial api home", 200)


@app.route("/heardle/refresh", methods=['POST'])
def refresh_tracks():
  max_number_tracks = request.get_json()["max_number_tracks"]
  results = []
  url = """https://api.animethemes.moe/anime?page[size]=100&sort=random
    &include=images,animethemes.animethemeentries.videos.audio,animethemes.song.artists
    &filter[has]=animethemes
    &filter[animetheme][type]=OP
    &fields[anime]=id,name,year,synopsis
    &fields[animetheme]=id,slug
    &fields[animethemeentry]=id
    &fields[video]=id
    &fields[audio]=link
    &fields[artist]=name
    &fields[image]=link
  """

  missing_data_tracker = {
    "no_animethemes": 0,
    "no_animethemeentries": 0,
    "no_videos": 0,
    "no_audio": 0,
    "images": 0,
    "missing_required_ids": 0
  }

  pool = None
  conn = None
  try:
    while url and len(results) < max_number_tracks:     
      response = requests.get(url)

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
        images = anime.get("images") or []
        if len(images) > 1 and images[1].get("link"):
          image_url = images[1]["link"]
        elif len(images) >= 1:
          image_url = images[0].get("link")
        else:
          image_url = None
          missing_data_tracker["images_missing"] += 1

        # extract OPs
        animethemes = anime["animethemes"]
        if not animethemes:
          print("SKIP: resource has no anime themes")
          missing_data_tracker["no_animethemes"] += 1
          continue

        for theme in animethemes:
          moe_animetheme_id = theme["id"]
          slug = theme["slug"]
          songname = theme["song"]["title"]
          moe_song_id = theme["song"]["id"]
          
          # extract artists
          artists = []
          song_artists = theme["song"]["artists"]
          for artist in song_artists:
            artists.append(artist["name"].strip())

          animethemeentries = theme["animethemeentries"]
          if not animethemeentries:
            print("SKIP: resource has no anime theme entries")
            missing_data_tracker["no_animethemeentries"] += 1
            continue
          theme_entry = animethemeentries[0] # even if there are multiple version of the OP, just get the first one
          moe_entry_id = theme_entry["id"]

          # extract ogg url
          videos = theme_entry["videos"]
          if not videos:
            print("SKIP: resource's anime entry has no videos")
            missing_data_tracker["no_videos"] += 1
            continue

          audio_ogg_url = None
          if not videos[0]["audio"]["link"]:
            print("SKIP: resource's video has no audio link")
            missing_data_tracker["no_audio"] += 1
            continue
          audio_ogg_url = videos[0]["audio"]["link"]

          # must have all required IDs
          if not (moe_anime_id and moe_animetheme_id and moe_entry_id and moe_song_id):
            print("SKIP: resource missing an ID")
            missing_data_tracker["missing_required_ids"] += 1
            continue

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

    print("Missing Values Log")
    print(missing_data_tracker)

    pool = get_connection_pool()
    query = """
      INSERT INTO tracks (moe_anime_id, moe_animetheme_id, moe_animethemeentry_id, moe_song_id, anime, year, song_name, slug, audio_ogg_url, image_url, artists, synopsis)
      VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
      """
    conn = pool.getconn()
    with conn.cursor() as cur:
      cur.execute('TRUNCATE tracks, heardle_daily')  # truncate table only after we have a new batch of tracks ready to be added

      for result in results:
        cur.execute(query, (result['moe_anime_id'], result['moe_animetheme_id'], result['moe_animethemeentry_id'], result['moe_song_id'], result['anime'], result['year'], result['song_name'], result['slug'], result['audio_ogg_url'], result['image_url'], result['artists'], result['synopsis']))
    conn.commit()

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
    if pool and conn:
      pool.putconn(conn)
       

@app.route("/heardle/tracks", methods=['GET'])
def fetch_tracks():
  try:
    pool = get_connection_pool()
    with pool.getconn() as conn:
      with conn.cursor() as cur:
        cur.execute("SELECT track_id, anime, song_name, artists FROM tracks;")
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