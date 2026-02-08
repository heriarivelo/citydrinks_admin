import { defineStore } from 'pinia'
import { TModal } from '@/store/types/modalTypes.ts'
import type { RouteLocationRaw } from 'vue-router'

export const useModalStore = defineStore('modal', {
  state: () => ({
    modal: {
      open: false,
      target: '',
    } as TModal,
    isFormDialog: false,
    isDialogOpen: false,
    isFormDirty: false,
    targetRoute: null as RouteLocationRaw | null,
  }),
  actions: {
    setModal(data: TModal): void {
      this.modal = data
    },
    setIsDialogOpen(data: boolean): void {
      this.isDialogOpen = data
      if (!data) {
        this.targetRoute = null
      }
    },
    setIsFormDirty(data: boolean): void {
      this.isFormDirty = data
    },
    setTargetRoute(route: RouteLocationRaw): void {
      this.targetRoute = {
        path: typeof route === 'string' ? route : route.path || '/',
        query:
          typeof route === 'object' && 'query' in route
            ? route.query
            : undefined,
      }
    },
  },
})
