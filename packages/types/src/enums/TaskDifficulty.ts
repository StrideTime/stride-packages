export const TaskDifficulty = {
  TRIVIAL: 'TRIVIAL',
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
  EXTREME: 'EXTREME',
} as const;
export type TaskDifficulty = (typeof TaskDifficulty)[keyof typeof TaskDifficulty];
