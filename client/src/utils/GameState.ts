import { GameState } from "../types/types.ts";


export function saveGameState(state: GameState): void {
  localStorage.setItem("heardle-game-state", JSON.stringify(state));
}

export function fetchGameState(): GameState | null {
  const state = localStorage.getItem("heardle-game-state");
  if (state == null) {
    return null;
  }

  try {
    return JSON.parse(state) as GameState; 
  } catch {
    return null;
  }
}

export function clearGameState() {
  localStorage.removeItem("heardle-game-state");
}