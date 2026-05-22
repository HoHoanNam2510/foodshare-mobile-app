import { AxiosError } from 'axios';
import api from '@/lib/axios';

// ── Types ─────────────────────────────────────────────────────────────────────

export type FeedbackType = 'BUG_REPORT' | 'SUGGESTION';
export type FeedbackStatus = 'PENDING' | 'PROCESSING' | 'CLOSED';
export type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IFeedback {
  _id: string;
  userId: string;
  userType: 'INDIVIDUAL' | 'STORE';
  type: FeedbackType;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  title: string;
  content: string;
  attachments: string[];
  contextMetadata: {
    appVersion?: string;
    os?: 'ios' | 'android' | 'web';
    relatedEntityId?: string;
  };
  adminId?: string;
  adminReply?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FieldError {
  path: string;
  message: string;
}

export class ApiValidationError extends Error {
  fieldErrors: FieldError[];
  constructor(message: string, fieldErrors: FieldError[]) {
    super(message);
    this.name = 'ApiValidationError';
    this.fieldErrors = fieldErrors;
  }
}

function extractErrorMessage(error: unknown, fallback: string): never {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      throw new ApiValidationError(data.message || fallback, data.errors);
    }
    const msg = data.error || data.message;
    if (msg) throw new Error(msg);
  }
  if (error instanceof Error) throw error;
  throw new Error(fallback);
}

// ── Payload ───────────────────────────────────────────────────────────────────

export interface CreateFeedbackPayload {
  type: FeedbackType;
  title: string;
  content: string;
  attachments?: string[];
  contextMetadata?: {
    appVersion?: string;
    os?: 'ios' | 'android' | 'web';
    relatedEntityId?: string;
  };
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function createFeedbackApi(
  payload: CreateFeedbackPayload
): Promise<{ success: boolean; message: string; data: IFeedback }> {
  try {
    const { data } = await api.post('/feedbacks', payload);
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Gửi phản hồi thất bại');
  }
}

export async function getMyFeedbacksApi(): Promise<{
  success: boolean;
  data: IFeedback[];
}> {
  try {
    const { data } = await api.get('/feedbacks/me');
    return data;
  } catch (error) {
    extractErrorMessage(error, 'Không lấy được lịch sử phản hồi');
  }
}
