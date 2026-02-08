export const getCurrentDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const formatDate = (input) => {
  if (!input) return ''
  let date

  if (input instanceof Date) {
    date = input
  } else {
    const [y, m, d] = input.split(/[-\/]/).map(Number)

    if (input.match(/^\d{4}/)) {
      date = new Date(y, m - 1, d)
    } else {
      date = new Date(d, m - 1, y)
    }
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}
