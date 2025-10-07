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

export interface AnidleAnime {
  anilist_id: number;
  english_title: string;
  native_title: string;
  user_preferred_title: string;
  season_year: number;
  season: string;
  num_of_episodes: number;
  genres: string[];
  tags: string[];
  studios: string[];
  source: string;
  cover_image: string;
  score: number;
}

export interface DailyAnidle {
  date: string;
  anilist_id: number;
  english_title: string;
  native_title: string;
  user_preferred_title: string;
  season_year: number;
  season: string;
  num_of_episodes: number;
  genres: string[];
  tags: string[];
  studios: string[];
  source: string;
  cover_image: string;
  summary: string;
  score: number;
  trailer_url: string;
}


export type GameStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED";
export type ClueKey = "clue1" | "clue2" | "clue3";

export interface GuessCache {
  id: number;
  title: string;
  cover_image?: string;
  score: number;
}

export interface AnidleGameState {
  dailyID: number;
  status: GameStatus;
  startedAt: number;
  solvedAt: number | null;
  guessesIDs: number[];

  openClue: ClueKey | null;
  unlocked: { clue1: boolean; clue2: boolean; clue3: boolean };
  guessCache?: GuessCache[]; // tiny snapshot for instant UI
}