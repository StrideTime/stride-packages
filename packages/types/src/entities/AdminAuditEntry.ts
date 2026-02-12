export type AdminAuditEntry = {
  id: string;
  adminUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string | null;
  performedAt: string;
};
