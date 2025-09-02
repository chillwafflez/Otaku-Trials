// import SearchResult from "./types/SearchResult";

interface SearchResult {
  track_id?: number;
  anime?: string;
  artists?: string[];
}

const uri = "http://127.0.0.1:5000/heardle/tracks"

export const fetchTracks = async (): Promise<SearchResult[]> => {
  try {
    const response = await fetch(uri);
    const json = await response.json();
    const tracks: SearchResult[] = [];
    
    json.forEach((res: any) => {
      const Result: SearchResult = {
        track_id: res[0],
        anime: res[1],
        artists: res[2],
      };
      tracks.push(Result);
    });
    return tracks;
  } catch (error) {
    console.error(error);
    throw new Error("Error getting post data");
  }
};


// console.log(fetchTracks())