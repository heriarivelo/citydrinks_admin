import { defineStore } from 'pinia'
import { TNotification } from '@/store/types/notificationTypes.ts'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as TNotification[],
    isLoading: false,
  }),
  actions: {
    addNotification(notification: TNotification): void {
      notification.type = notification.type || 'success'
      this.notifications.push(notification)
      setTimeout(() => {
        this.removeNotification(notification.id)
      }, 5000)
    },
    removeNotification(id: number): void {
      this.notifications = this.notifications.filter(
        (n: { id: number }) => n.id !== id
      )
    },
    setLoading(isLoading: boolean): void {
      this.isLoading = isLoading
    },
  },
})
