import { AnidleGameState } from "../types/types.ts";


export function saveAnidleGameState(state: AnidleGameState): void {
  localStorage.setItem("anidle-game-state", JSON.stringify(state));
}

export function fetchAnidleGameState(): AnidleGameState | null {
  const state = localStorage.getItem("anidle-game-state");
  if (state == null) {
    return null;
  }

  try {
    return JSON.parse(state) as AnidleGameState; 
  } catch {
    return null;
  }
}

export function clearAnidleGameState() {
  localStorage.removeItem("anidle-game-state");
}
