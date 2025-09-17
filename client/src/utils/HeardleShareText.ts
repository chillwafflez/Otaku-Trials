import { GameState } from "../types/types.ts";


export function formatText(state: GameState, songname: string): string {
  const gameName: string = "Otaku Trials Heardle";
  const gameDate = new Date(state.timestamp);
  const formattedGameDate = gameDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  let message: string = "";
  let score: string = "";
  if (state.currGuessIndex >= 6) {
    message = "I suck at Anime Heardle!";
    score = "X/6";
  } else {
    score = `${state.currGuessIndex}/6`;
    message = "I solved today's Anime Heardle!"
  }

  const formattedGuesses: string = state.guesses.map(g => g === "SKIPPED" ? "⏭️" : g === songname ? "✅" : "❌").join(" ")
  const header = `${gameName} (${score}) — ${formattedGameDate}`;
  const footer = "https://otaku-trials.vercel.app/Heardle";

  return `${header}\n\n${message}\n${formattedGuesses}\n${footer}`;
}


export async function copyText(text: string): Promise<"shared" | "copied" | "unable to copy"> {

  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch (_) {
    console.log("unable to copy to clipboard");
    return "unable to copy";
  }
}