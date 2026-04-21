import { create } from 'zustand';

import {
  getMyNotificationsApi,
  getUnreadCountApi,
  markAsReadApi,
  markAllAsReadApi,
  type INotification,
} from '@/lib/notificationApi';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: INotification) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await getMyNotificationsApi(1, 20);
      set({
        notifications: res.data,
        page: 1,
        totalPages: res.pagination.totalPages,
      });
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNextPage: async () => {
    const { page, totalPages, isLoading, notifications } = get();
    if (isLoading || page >= totalPages) return;

    const nextPage = page + 1;
    set({ isLoading: true });
    try {
      const res = await getMyNotificationsApi(nextPage, 20);
      set({
        notifications: [...notifications, ...res.data],
        page: nextPage,
        totalPages: res.pagination.totalPages,
      });
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await getUnreadCountApi();
      set({ unreadCount: count });
    } catch {
      // ignore
    }
  },

  markAsRead: async (id: string) => {
    try {
      await markAsReadApi(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // ignore
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllAsReadApi();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  addNotification: (notification: INotification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      page: 1,
      totalPages: 1,
      isLoading: false,
    });
  },
}));
