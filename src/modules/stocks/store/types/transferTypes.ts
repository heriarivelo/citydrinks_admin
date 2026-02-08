export type TransferAll = {
  id: number
  hash: string
  date: string
  is_auto_transfer: 1 | 0
  ready_for_transfer: 1 | 0
  quantity: string
  pallets: number
  packs: number
  sender: string
  receiver: string
  price: number
  status: TransferStatus
}

export type TransferStatus =
  | 'waiting'
  | 'approved'
  | 'delivered'
  | 'ready_for_transfer'
