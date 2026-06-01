import { create } from 'zustand';

import {
  getMyNotificationsApi,
  getUnreadCountApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
  deleteAllReadApi,
  deleteManyNotificationsApi,
  type INotification,
} from '@/lib/notificationApi';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  isSelectMode: boolean;
  selectedIds: string[];

  fetchNotifications: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: INotification) => void;
  deleteNotification: (id: string) => Promise<void>;
  deleteMany: (ids: string[]) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  enterSelectMode: () => void;
  exitSelectMode: () => void;
  toggleSelect: (id: string) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  isSelectMode: false,
  selectedIds: [],

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const [res, count] = await Promise.all([
        getMyNotificationsApi(1, 20),
        getUnreadCountApi(),
      ]);
      set({
        notifications: res.data,
        page: 1,
        totalPages: res.pagination.totalPages,
        unreadCount: count,
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

  deleteNotification: async (id: string) => {
    const notification = get().notifications.find((n) => n._id === id);
    if (!notification?.isRead) return;
    try {
      await deleteNotificationApi(id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
      }));
    } catch {
      // ignore
    }
  },

  deleteMany: async (ids: string[]) => {
    const { notifications } = get();
    const readIds = ids.filter((id) => {
      const n = notifications.find((n) => n._id === id);
      return n?.isRead === true;
    });
    if (readIds.length === 0) return;
    try {
      await deleteManyNotificationsApi(readIds);
      set((state) => ({
        notifications: state.notifications.filter(
          (n) => !readIds.includes(n._id)
        ),
        selectedIds: [],
        isSelectMode: false,
      }));
    } catch {
      // ignore
    }
  },

  deleteAllRead: async () => {
    try {
      await deleteAllReadApi();
      set((state) => ({
        notifications: state.notifications.filter((n) => !n.isRead),
        selectedIds: [],
        isSelectMode: false,
      }));
    } catch {
      // ignore
    }
  },

  enterSelectMode: () => {
    set({ isSelectMode: true, selectedIds: [] });
  },

  exitSelectMode: () => {
    set({ isSelectMode: false, selectedIds: [] });
  },

  toggleSelect: (id: string) => {
    const notification = get().notifications.find((n) => n._id === id);
    if (!notification?.isRead) return;
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...state.selectedIds, id],
    }));
  },

  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      page: 1,
      totalPages: 1,
      isLoading: false,
      isSelectMode: false,
      selectedIds: [],
    });
  },
}));
