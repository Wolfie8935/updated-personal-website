import { createContext, useContext } from "react";

export type HorcruxId =
  | "about"
  | "skills"
  | "experience"
  | "projects"
  | "research"
  | "achievements"
  | "toggle";

export type HorcruxInkId = Exclude<HorcruxId, "toggle">;

export type HorcruxHuntContextValue = {
  tryDiscoverInk: (id: HorcruxInkId, el: HTMLElement | null) => void;
  collectInk: (id: HorcruxInkId, el: HTMLElement | null) => void;
  isFound: (id: HorcruxInkId) => boolean;
};

export const HorcruxHuntContext = createContext<HorcruxHuntContextValue | null>(null);

export function useHorcruxHunt() {
  return useContext(HorcruxHuntContext);
}
