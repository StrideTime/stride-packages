export const WorkspaceMemberRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;
export type WorkspaceMemberRole = (typeof WorkspaceMemberRole)[keyof typeof WorkspaceMemberRole];
