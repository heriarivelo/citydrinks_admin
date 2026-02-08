export const STOCK_NAME = [
  {
    name: 'Primary',
    value: 1,
  },
  {
    name: 'Final',
    value: 2,
  },
]

export const SHIPPING_TYPE = [
  {
    name: 'Shipping Order',
    value: 1,
  },
  {
    name: 'Shipping Pallet',
    value: 2,
  },
]

export const STOCK_NAME_BY_TYPE = {
  1: 'Primary',
  2: 'Final',
}

export const SHOW_TO_CLIENT = [
  {
    name: 'Yes',
    value: 1,
  },
  {
    name: 'No',
    value: 0,
  },
]

export const STOCK_STATUSES = {
  1: 'Active',
  2: 'Blocked',
  3: 'Waiting',
  4: 'Reserved',
  5: 'Delivered',
  6: 'Refund',
} as const

export const ACTIVE_STATUS = 1
export const BLOCKED_STATUS = 2
export const WAITING_STATUS = 3
export const RESERVED_STATUS = 4
