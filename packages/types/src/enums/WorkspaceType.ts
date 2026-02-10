export const WorkspaceType = {
  PERSONAL: 'PERSONAL',
  WORK: 'WORK',
  TEAM: 'TEAM',
} as const;
export type WorkspaceType = (typeof WorkspaceType)[keyof typeof WorkspaceType];
