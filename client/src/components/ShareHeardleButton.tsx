import { useEffect, useState } from "react";
import { GameState } from "../types/types";
import { copyText, formatText } from "../utils/HeardleShareText";
import { fetchGameState } from "../utils/GameState.ts";

function ShareHeardleButton(props: {songname: string}) {
  const [status, setStatus] = useState<"idle" | "done">("idle");
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    // get game state
    const savedState = fetchGameState();
    setGameState(savedState);
  }, [])


  async function onShare() {
    if (!gameState) return;

    const text = formatText(gameState, props.songname);
    await copyText(text);
    setStatus("done");
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <button onClick={onShare}
            className="w-full rounded-lg px-4 py-2 bg-bar1 hover:bg-white/20 transition">
      {status === "idle" ? "Share" : "Copied!"}
    </button>
  );
}

export { ShareHeardleButton };