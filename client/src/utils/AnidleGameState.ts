import { AnidleGameState, GuessCache  } from "../types/types.ts";


export function initState(dailyID: number): AnidleGameState {
  return {
    dailyID,
    status: "IN_PROGRESS",
    startedAt: Date.now(),
    solvedAt: null,
    guessesIDs: [],
    openClue: null,
    unlocked: { clue1: false, clue2: false, clue3: false },
    guessCache: [],
  };
}


export function saveAnidleGameState(state: AnidleGameState): void {
  try {
    localStorage.setItem("anidle-game-state", JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save anidle state", e);
  }
}

export function fetchAnidleGameState(dailyID: number): AnidleGameState | null {
  try {
    const state = localStorage.getItem("anidle-game-state");
    if (!state) {
      return null;
    }
    const parsed = JSON.parse(state) as AnidleGameState;
    if (!parsed || parsed.dailyID !== dailyID) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearAnidleGameState() {
  localStorage.removeItem("anidle-game-state");
}


export function addGuess(state: AnidleGameState, id: number, cache?: GuessCache): AnidleGameState {
  if (state.guessesIDs.includes(id) || state.status !== "IN_PROGRESS") return state;

  const nextGuesses = [...state.guessesIDs, id];
  const count = nextGuesses.length;

  const next: AnidleGameState = {
    ...state,
    guessesIDs: nextGuesses,
    unlocked: {
      clue1: state.unlocked.clue1 || count >= 6,
      clue2: state.unlocked.clue2 || count >= 12,
      clue3: state.unlocked.clue3 || count >= 18,
    },
    guessCache: cache ? [...(state.guessCache ?? []), cache] : state.guessCache,
  };

  // if (count >= MAX_GUESSES && next.status === "IN_PROGRESS") {
  // if (next.status === "IN_PROGRESS") {
  //   next.status = "FAILED";
  // }

  return next;
}

export function markCompleted(state: AnidleGameState): AnidleGameState {
  if (state.status === "COMPLETED") {
    return state;
  }
  return { ...state, status: "COMPLETED", solvedAt: Date.now() };
}
