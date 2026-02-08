import { defineStore } from 'pinia'
import {
  TBatch,
  TBatches,
  TBatchQuery,
} from '@/modules/stocks/store/types/batchTypes.ts'

export const useBatchStore = defineStore('batch', {
  state: () => ({
    batches: {} as TBatches,
    batchesTransfer: {} as any,
    batch: {} as TBatch,
    batchList: [],
    waitingBatchList: [],
    batchListQuantity: [],
    waitingBatchListQuantity: [],
    query: {
      page: 1,
      per_page: 50,
      include: ['stock', 'provider'],
    } as TBatchQuery,
    transferQuery: {
      page: 1,
      per_page: 50,
      include: [
        'product',
        'senderStock',
        'receiverStock',
        'senderStockBatchItem',
      ],
    } as TBatchQuery,
  }),
  actions: {
    async actionGetInternalCode() {
      try {
        const { data } = await this.$axios.get('/admin/batches/internal_code')
        return data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetLotNumber() {
      try {
        const { data } = await this.$axios.get('/batch_items/lot_number')
        return data
      } catch (err) {
        console.log(err)
      }
    },
    async actionCreateBatch(params: any) {
      try {
        const { data } = await this.$axios.post('/admin/batches', params)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionUpdateBatch(params: any, id: string | number) {
      try {
        const { data } = await this.$axios.put(`/admin/batches/${id}`, params)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionUpdateBatchStatus(params: any, id: string | number) {
      try {
        const { data } = await this.$axios.patch(
          `/admin/batches/${id}/status`,
          params
        )
        await this.actionGetBatchList()
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionUpdateBatchTransferStatus(params: any, id: string | number) {
      try {
        const { data } = await this.$axios.patch(
          `/admin/batch_items/transfer/${id}/status`,
          params
        )
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionUpdateBatchItems(params: any, id: number | string) {
      try {
        const { data } = await this.$axios.put(
          `/admin/batch_items/${id}`,
          params
        )
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async transferProducts(params: any) {
      try {
        const { data } = await this.$axios.post(
          `/admin/batch_items/transfer`,
          params
        )
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async updateTransferProducts(params: any, id: number | string) {
      try {
        const { data } = await this.$axios.put(
          `/admin/batch_items/transfer/${id}`,
          params
        )
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionDeleteBatch(id: number | string) {
      try {
        const { data } = await this.$axios.delete(`/admin/batch_items/${id}`)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionDeleteBatchItem(id: number | string) {
      try {
        const { data } = await this.$axios.delete(`/admin/batch_item/${id}`)
        await this.actionGetBatchList()
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionGetBatchList(params: any = {}) {
      try {
        const { data } = await this.$axios.get('/admin/batches', {
          params: {
            ...this.query,
            ...params,
          },
        })
        this.batches = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetBatchTransferList(params: any = {}) {
      try {
        const { data } = await this.$axios.get('/admin/batch_items/transfer', {
          params: {
            ...this.transferQuery,
            ...params,
          },
        })
        this.batchesTransfer = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionUpdateShowToClient(id: number | string, show: number) {
      try {
        const { data } = await this.$axios.patch(
          `/admin/batch_items/${id}/show_to_client`,
          {
            show_to_client: show,
          }
        )
        this.batches = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetBatchById(id: number | string) {
      try {
        const { data } = await this.$axios.get(`/admin/batches/${id}`, {
          params: {
            include: ['items', 'relatedItems'],
          },
        })
        this.batch = data.data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetViewBatchById(id: number | string) {
      try {
        const { data } = await this.$axios.get(
          `/admin/get-batch-history/${id}`,
          {
            params: {
              include: ['items', 'relatedItems'],
            },
          }
        )
        this.batch = data.data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetBatchListByStockAndProduct(params: any = {}) {
      try {
        const { data } = await this.$axios.get('/admin/batch_items', {
          params: {
            stock_id: params.stock_id,
            product_id: params.product_id,
          },
        })
        this.batchList = []
        this.waitingBatchList = []
        this.batchListQuantity = []
        this.waitingBatchListQuantity = []
        data.data.data.forEach((item) => {
          if (item.status !== 3) {
            this.batchList.push(item)
          } else {
            this.waitingBatchList.push(item)
          }
        })
        this.batchListQuantity = this.batchList.map((item) => {
          return `${item.palletQuantity} PL ${item.packQuantity} PK `
        })
        this.waitingBatchListQuantity = this.waitingBatchList.map((item) => {
          return `${item.palletQuantity} PL ${item.packQuantity} PK `
        })
        return data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetBatchListOrderUpdate(params: any = {}, id: number) {
      try {
        const { data } = await this.$axios.patch(
          `/admin/batch_items/order/${id}`,
          params
        )
        return data.data
      } catch (err) {
        console.log(err)
      }
    },
  },
})
