import requests
from dotenv import load_dotenv
import os

load_dotenv()
MAL_CLIENT_ID = os.environ.get("MAL_CLIENT_ID")
MAL_CLIENT_SECRET = os.environ.get("MAL_CLIENT_SECRET")


# url = "https://api.myanimelist.net/v2/anime/season/2023/winter?sort=anime_score"
# url = "https://api.myanimelist.net/v2/topanime/?sort=anime_score"
url = "https://api.myanimelist.net/v2/topanime/"

headers = {
    "X-MAL-CLIENT-ID": MAL_CLIENT_ID
}

response = requests.get(url, headers=headers)
if response.status_code == 200:
  print("Response JSON:", response.json())
else:
  print(f"Error: {response.status_code}, {response.text}")