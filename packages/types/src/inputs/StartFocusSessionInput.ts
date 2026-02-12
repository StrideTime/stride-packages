import type { FocusSessionType } from '../enums/FocusSessionType';

export interface StartFocusSessionInput {
  type: FocusSessionType;
  taskId?: string;
  taskName?: string;
}
