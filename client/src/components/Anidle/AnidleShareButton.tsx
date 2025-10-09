import { useState } from "react";
import { copyText } from "../../utils/HeardleShareText";

function AnidleHeardleButton({shareText} : {shareText: string}) {
  const [status, setStatus] = useState<"idle" | "done">("idle");


  async function onShare() {
    await copyText(shareText);
    setStatus("done");
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <button onClick={onShare}
            className="w-full rounded-lg px-4 py-2 mt-4 bg-bar1 hover:bg-white/20 transition">
      {status === "idle" ? "Share" : "Copied!"}
    </button>
  );
}

export { AnidleHeardleButton };