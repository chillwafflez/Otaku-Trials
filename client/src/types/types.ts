export interface SearchResult {
  trackID: number;
  anime: string;
  songName: string;
  artists: string[];
}

export interface DailyTrack {
  date: string;
  track: {
    id: number;
    anime: string;
    songName: string;
    slug: string;
    audio: { ogg: string };
    image: string;
    artists: string[];
    year: number;
    synopsis: string;
  };
}