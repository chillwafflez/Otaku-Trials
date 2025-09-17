import { fetchGameState } from "../utils/GameState";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedResultRoute() {
  const state = fetchGameState();
  const allowed = state && state.status !== "IN_PROGRESS";
  return allowed ? <Outlet /> : <Navigate to="/heardle" replace />;
}
