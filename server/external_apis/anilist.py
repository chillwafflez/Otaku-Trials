import requests
import csv
import random
import time
url = 'https://graphql.anilist.co'


def getMostPopularAnimeQuery(page_number: int):
  query = '''
  query GetTopAnime($page: Int!, $adult: Boolean = false) {
    Page(page: $page, perPage: 50) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: $adult) {
        id
        title { english, native, userPreferred }
        seasonYear
        season      
        episodes
        genres
        source
        coverImage {
          large
          extraLarge
        }
        studios {
          nodes {
            name
          }
        }
        tags {
          id
          name
        }
        status
      }
    }
  }
  '''

  variables = {
    "page": page_number,
    "adult": False
  }

  response = requests.post(url, json={'query': query, 'variables': variables})
  return response.json()


def getRelatedAnimeQuery(id: int):
  query = '''
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      relations {
        edges {
          relationType
        }
        nodes {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            large
          }
          status
        }
      }
    }
  }
  '''
  variables = {
    "id": id  
  }
  response = requests.post(url, json={'query': query, 'variables': variables})
  return response.json()


def getAnimeCharactersQuery(id: int):
  query = '''
  query ($id: Int) {
    Media(id: $id) {
      characters {
        pageInfo {
          total
        }
      }
      main: characters(page: 1, perPage: 25, role: MAIN) {
        ...charFields
      }
      supporting: characters(page: 1, perPage: 25, role: SUPPORTING, sort: FAVOURITES_DESC) {
        ...charFields
      }
    }
  }

  fragment charFields on CharacterConnection {
    edges {
      role
      node {
        id
        name {
          first
          last
          native
          userPreferred
        }
      }
    }
  }
  '''
  variables = {
      "id": id
  }

  response = requests.post(url, json={'query': query, 'variables': variables})
  return response.json()


def getMostPopularAnime(max: int):
  animes = []
  page = 1
  while len(animes) < max:
    response_json = getMostPopularAnimeQuery(page)
    
    medias = response_json['data']['Page'].get('media') or []
    if not medias:
      print("no media data fetched")

    print(f"fetched {len(medias)} medias")
    for media in medias:
      anilist_id = media['id']

      english_title = media['title']["english"]
      native_title = media['title']["native"]
      user_preferred_title = media['title']['userPreferred']
      
      season_year = media['seasonYear']
      season = media['season']
      num_of_episodes = media['episodes']
      genres = media.get('genres') or []
      source = media['source']
      cover_image_obj = media['coverImage']
      cover_image = cover_image_obj.get('extraLarge') or {}
      if not cover_image:
        cover_image = cover_image_obj.get('large')
      status = media['status']

      # get first 2 studios
      formatted_studios = []
      studios = media['studios'].get('nodes') or []
      if studios:
        if len(studios) >= 2:
          for i in range(2):
            formatted_studios.append(studios[i]['name'])
        else:
          for node in studios:
            formatted_studios.append(node.get('name') or '')
      else:
        print("no associated studios with anime media")
      
      # get first 4 tags
      formatted_tags = []
      tags = media['tags']
      if tags:
        if len(tags) >= 4:
          for i in range(4):
            formatted_tags.append(tags[i]['name'])
        else:
          for tag in tags:
            formatted_tags.append(tag['name'])
      else:
        print("no associated tags with anime media")

      animes.append({'anilist_id': anilist_id,
                    'english_title': english_title,
                    'native_title': native_title,
                    'user_preferred_title': user_preferred_title,
                    'season_year': season_year,
                    'season': season,
                    'num_of_episodes': num_of_episodes, 
                    'genres': genres,
                    'source': source,
                    'cover_image': cover_image,
                    'status': status, 
                    'studios': formatted_studios, 
                    'tags': formatted_tags})
    page += 1
    random_pause = random.randint(6, 12)
    print(f"pausing for {random_pause} seconds")
    time.sleep(random_pause)


  print(f"number of pages combed: {page}")
  return animes

def main():
  animes_fetched = getMostPopularAnime(max=600)

  counter = 1
  difficulty = 'EASY'
  with open("server\\temp_data\\animev3.csv", mode='a', newline='', encoding="utf-8") as f:
    writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(['anilist_id', 'english_title', 'native_title', 'user_preferred_title', 'season_year', 'season', 'num_of_episodes', 'genres', 'source', 'cover_image', 'status', 'studios', 'tags', 'difficulty'])
    for result in animes_fetched:
      writer.writerow([result['anilist_id'], result['english_title'], result['native_title'], result['user_preferred_title'], result['season_year'], result['season'], result['num_of_episodes'], result['genres'], result['source'], result['cover_image'], result['status'], result['studios'], result['tags'], difficulty])
      counter += 1
      if counter > 200:
        difficulty = 'MEDIUM'
      if counter > 400:
        difficulty = 'HARD'
    

if __name__ == "__main__":
  main()