export class StrideError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'StrideError';
  }
}

export class ValidationError extends StrideError {
  constructor(
    public field: string,
    message: string
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends StrideError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class PermissionError extends StrideError {
  constructor(permission: string) {
    super(`Missing permission: ${permission}`, 'PERMISSION_DENIED');
    this.name = 'PermissionError';
  }
}

export class SyncError extends StrideError {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message, 'SYNC_ERROR');
    this.name = 'SyncError';
  }
}
