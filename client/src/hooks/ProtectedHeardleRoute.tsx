import { useEffect, useState } from "react";
import { fetchGameState } from "../utils/GameState";
import { Navigate, Outlet } from "react-router-dom";
import { DailyTrack } from "../types/types";

export default function ProtectedHeardleRoute() {
  const [allowed, setAllowed] = useState<null | boolean>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://chillwafflez.pythonanywhere.com/heardle/tracks/daily");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DailyTrack = await res.json();
        const todayId = data.track.track_id;

        // get current game state
        const saved = fetchGameState();

        // if there's no state, let user play heardle
        if (!saved) return setAllowed(true);

        // if it's a new day (there's a new daily song), let user play
        if (saved.dailyID !== todayId) return setAllowed(true);

        // if it's the same day and the user is still working on it, let them play
        if (saved.status === "IN_PROGRESS") return setAllowed(true);

        // if it's the same day and they already finished, redirect to result page
        setAllowed(false);
      } catch {
        // on any error, fail open so users can still play
        setAllowed(true);
      }
    })();
  }, []);

  if (allowed === null) return null;
  
  return allowed ? <Outlet /> : <Navigate to="/heardleresult" replace />;
}
