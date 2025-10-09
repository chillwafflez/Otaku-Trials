import type { DailyAnidle, AnidleAnime, ClueKey } from "../types/types";

// helpers
type UpDown = "over" | "under" | "match"; // daily vs guess

const countTrue = (pairs: [string, boolean][]) =>
  pairs.reduce((acc, [, ok]) => acc + (ok ? 1 : 0), 0);

const compareNumber = (dailyVal: number, guessVal: number): UpDown => {
  if (dailyVal === guessVal) return "match";
  return dailyVal < guessVal ? "under" : "over"; // "under" => daily lower than guess => ⬇️
};

const emojiForNumber = (comp: UpDown) =>
  comp === "match" ? "🟩" : comp === "under" ? "⬇️" : "⬆️";

const emojiForSet = (totalInDaily: number, overlapCount: number) => {
  if (overlapCount === 0) return "🟥";
  return overlapCount === totalInDaily ? "🟩" : "🟨"; // full vs partial
};

// passing in 'overlap' function into overlapFn
export const emojiRow = (
  daily: DailyAnidle,
  guess: AnidleAnime,
  overlapFn: (a: string[], b: string[]) => [string, boolean][]
) => {
  // exact
  const title = daily.anilist_id === guess.anilist_id ? "🟩" : "🟥";
  const season = daily.season === guess.season ? "🟩" : "🟥";
  const source = daily.source === guess.source ? "🟩" : "🟥";

  // numbers
  const year  = emojiForNumber(compareNumber(daily.season_year, guess.season_year));
  const eps   = emojiForNumber(compareNumber(daily.num_of_episodes, guess.num_of_episodes));
  const score = emojiForNumber(compareNumber(daily.score, guess.score));

  // sets
  const genresPairs  = overlapFn(daily.genres,  guess.genres);
  const tagsPairs    = overlapFn(daily.tags,    guess.tags);
  const studiosPairs = overlapFn(daily.studios, guess.studios);

  const genres  = emojiForSet(daily.genres.length,  countTrue(genresPairs));
  const tags    = emojiForSet(daily.tags.length,    countTrue(tagsPairs));
  const studios = emojiForSet(daily.studios.length, countTrue(studiosPairs));

  return [
    title, year, season, eps, genres, tags, studios, source, score
  ].join("");
};

// build the final share text
export function buildShareText(
  daily: DailyAnidle,
  guesses: AnidleAnime[],
  used: Record<ClueKey, boolean>,
  overlapFn: (a: string[], b: string[]) => [string, boolean][],
  opts?: { footerUrl?: string }
): string {
  if (!daily || guesses.length === 0) return "";

  const attempts = guesses.length;
  const cluesUsed = Object.values(used ?? {}).filter(Boolean).length;

  const header =`Anidle ${daily.date}`;
  const guessHeader = `${attempts} ${attempts === 1 ? "guess" : "guesses"}`;
  const clueHeader = cluesUsed ? `${cluesUsed} clue${cluesUsed > 1 ? "s" : ""} used` : "No clues used";
  const footer = opts?.footerUrl ?? "https://otaku-trials.vercel.app/anidle";

  let rows = guesses.map(g => emojiRow(daily, g, overlapFn));
  // console.log(rows);
  if (rows.length > 6) {
    let first6 = [];

    for (let i = 0; i < 6; i++) {
      first6.push(rows[i]);
    }

    return `${header}\n${guessHeader}\n${clueHeader}\n${first6.join("\n")}\n+${rows.length - 6} more\n\n${footer}`;
  } 

  return `${header}\n${guessHeader}\n${clueHeader}\n${rows.join("\n")}\n\n${footer}`;
}

export async function copyText(
  text: string
): Promise<"shared" | "copied" | "unable to copy"> {
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "unable to copy";
  }
}