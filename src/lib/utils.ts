import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  value: number | string | undefined | null,
  removeSymbolSpace = false,
  removeSymbol = false
) {
  if ((value === undefined || value === null || value === '') && removeSymbol) {
    return '0.00'
  }

  if (value === undefined || value === null || value === '') {
    return '0.00 €'
  }

  let numericValue: number
  if (typeof value === 'string') {
    numericValue = parseFloat(value.replace(',', '.').replace(/[^0-9.-]+/g, ''))
  } else {
    numericValue = value
  }

  let formattedValue = numericValue.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: removeSymbol ? 'code' : 'symbol',
  })

  if (removeSymbol) {
    formattedValue = formattedValue.replace('EUR', '').trim()
  }

  if (removeSymbolSpace) {
    formattedValue = formattedValue.replace(/\s/g, '')
  }

  return formattedValue
}

export function formatValue(value: string | number) {
  if (typeof value === 'number') {
    value = value.toString()
  }

  const isNegative = value.startsWith('-')
  const valueWithoutSign = isNegative ? value.slice(1) : value

  const sanitizedValue = valueWithoutSign.replace(/[^0-9,]/g, '')

  // Ensure only one comma is present
  const commaCount = (sanitizedValue.match(/,/g) || []).length
  const valueWithSingleComma =
    commaCount > 1 ? sanitizedValue.replace(/,(?=.*,)/g, '') : sanitizedValue

  let [integerPart, decimalPart] = valueWithSingleComma.split(',')

  // Format the integer part with dots as thousand separators
  if (integerPart) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // Ensure the decimal part has at most two digits (no padding)
  if (decimalPart) {
    decimalPart = decimalPart.slice(0, 2)
  }

  // Construct the final value with the sign if needed
  const formattedValue =
    decimalPart !== undefined ? `${integerPart},${decimalPart}` : integerPart

  return isNegative ? `-${formattedValue}` : formattedValue
}

export function parseNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0
  }

  if (typeof value === 'number') {
    return value
  }

  const sanitizedValue = value.replace(',', '.').replace(/[^0-9.-]+/g, '')
  const numericValue = parseFloat(sanitizedValue)

  return isNaN(numericValue) ? 0 : numericValue
}

export function parseEuroCurrency(
  value: string | number | null | undefined
): number {
  if (value === null || value === undefined) {
    return 0
  }

  if (typeof value === 'number') {
    return value
  }
  const sanitizedValue = value.replace(/[^0-9,.-]+/g, '')
  const parts = sanitizedValue.split(',')

  if (parts.length > 2) {
    return 0
  }

  let normalizedValue = parts.join('.')

  if (parts.length === 2) {
    normalizedValue = parts[0].replace(/\./g, '') + '.' + parts[1]
  } else {
    normalizedValue = parts[0].replace(/\./g, '')
  }

  const numericValue = parseFloat(normalizedValue)

  return isNaN(numericValue) ? 0 : numericValue
}

export const sortTable = async (
  sortType: string,
  query: { value: Record<string, any> },
  action: () => void
) => {
  if (query.value['sort[]'] === `+${sortType}`) {
    query.value = {
      ...query.value,
      page: 1,
      'sort[]': `-${sortType}`,
    }
  } else if (query.value['sort[]'] === `-${sortType}`) {
    query.value = {
      ...query.value,
      page: 1,
    }
    delete query.value['sort[]']
  } else {
    query.value = {
      ...query.value,
      page: 1,
      'sort[]': `+${sortType}`,
    }
  }

  action()
}

export const clearAllScrollPositions = () => {
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('scroll_position_')) {
      sessionStorage.removeItem(key)
    }
  })
}

export function calculatePromotionalPricePerPack(
  pricePerPack: number | string,
  promotionType: number,
  promotionAmount: number | string
): number {
  const basePrice = parseNumber(pricePerPack)
  if (promotionType === 1) {
    return basePrice * (1 - parseNumber(promotionAmount) / 100)
  } else if (promotionType === 2) {
    return basePrice - parseNumber(promotionAmount)
  } else {
    return basePrice
  }
}
