export type Role = {
  id: string;
  displayName: string;
  description: string | null;

  // Feature flags
  cloudSync: boolean;
  mobileApp: boolean;
  teamWorkspaces: boolean;
  exportReports: boolean;
  apiAccess: boolean;
  sso: boolean;
  auditLogs: boolean;
  customIntegrations: boolean;
  prioritySupport: boolean;

  // Resource limits (null = unlimited)
  maxWorkspaces: number | null;
  maxProjects: number | null;
  maxTeamMembers: number | null;
  maxApiCallsPerDay: number | null;
  maxStorageMb: number | null;

  isActive: boolean;
};
