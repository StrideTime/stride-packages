import type { TaskDifficulty } from "@stridetime/types";

export type DifficultyLevel = TaskDifficulty;

type DifficultyConfig = {
  label: string;
  color: string;
  multiplier: number;
};

export const difficultyConfig: Record<DifficultyLevel, DifficultyConfig> = {
  TRIVIAL: { label: "Trivial", color: "#64748b", multiplier: 0.5 },
  EASY: { label: "Easy", color: "#22c55e", multiplier: 1 },
  MEDIUM: { label: "Medium", color: "#eab308", multiplier: 2 },
  HARD: { label: "Hard", color: "#f97316", multiplier: 4 },
  EXTREME: { label: "Extreme", color: "#ef4444", multiplier: 8 },
};

export const getDifficultyClasses = (difficulty: DifficultyLevel): string => {
  switch (difficulty) {
    case "TRIVIAL":
      return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20";
    case "EASY":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "HARD":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
    case "EXTREME":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
  }
};
