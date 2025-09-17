export interface SearchResult {
  trackID: number;
  anime: string;
  songName: string;
  artists: string[];
}

export interface DailyTrack {
  date: string;
  track: {
    track_id: number;
    moe_anime_id: number;
    moe_animethemeentry_id: number;
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

export interface DailyTrackTest {
  date: string;
  track: {
    track_id: number;
    moe_anime_id: number;
    moe_animethemeentry_id: number;
    anime: string;
    songName: string;
    slug: string;
    audio: { ogg: string };
    video_url?: string;
    image: string;
    artists: string[];
    year: number;
    season: string;
    synopsis: string;
    studios?: string[];
  };
}

export interface GameState {
  dailyID: number;
  guesses: string[];
  currGuessIndex: number;
  status: string;
  timestamp: number;  // when the user started the game
}