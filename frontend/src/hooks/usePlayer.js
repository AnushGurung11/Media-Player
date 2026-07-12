import { useContext } from "react";
import { PlayerContext } from "../context/player-context-value";

export const usePlayer = () => useContext(PlayerContext);