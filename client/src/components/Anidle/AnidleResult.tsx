import { useEffect, useState, useMemo } from "react";
import { DailyAnidle, AnidleAnime, ClueKey } from "../../types/types";
import { buildShareText } from "../../utils/AnidleShareText";
import { overlap } from "../../utils/AnidleGameState";
import { AnidleHeardleButton } from "./AnidleShareButton";

function AnidleResult({ success, dailyAnidle, guesses, used  } : {success: boolean; dailyAnidle: DailyAnidle | null; guesses: AnidleAnime[]; used: Record<ClueKey, boolean>;}) {

  const [timeLeft, setTimeLeft] = useState<string>("");
  const attempts = guesses.length;
  const cluesUsed = Object.values(used ?? {}).filter(Boolean).length;


  if (dailyAnidle === null) {
    return;
  }

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) return "00:00:00";
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    setTimeLeft(calc());
    const t = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(t);
  }, []);

  const shareText = useMemo(
    () => buildShareText(dailyAnidle, guesses, used, overlap, {
      footerUrl: "https://otaku-trials.vercel.app/anidle",
    }),
    [dailyAnidle, guesses, used]
  );


  return (
    <div className="flex flex-col w-5/6 lg:w-1/4 p-5 mx-auto mt-8 bg-[#1C1C1C] text-white">
      <h1 className="mx-auto text-4xl">
        {success ? "Yippee you got it!" : "Better luck next time!"}
      </h1>

      <div className="text-center justify-center w-full mt-12">
        <div className="text-xl">Number of Tries: {attempts}</div>
        <div className="text-xl">Clues Used: {cluesUsed}</div>

        <div className="text-xl mt-6">Next Anime In:</div>
        <p className="text-bar1 text-4xl">{timeLeft}</p>
      </div>

      <div className="mt-12 text-center justify-center w-4/5 mx-auto p-6 border">
        <div className="text-2xl">I solved today's Anidle!</div>
        <pre className="text-sm whitespace-pre-wrap mt-4">{shareText}</pre>
        {/* <button onClick={() => copyText(shareText)}
                disabled={!shareText}
                className="mt-4 border px-3 py-2 hover:bg-zinc-800 disabled:opacity-50">
          Copy
        </button> */}
        <div className="w-1/2 mx-auto">
          <AnidleHeardleButton shareText={shareText} />
        </div>
      </div>
  </div>
  );
}

export { AnidleResult };