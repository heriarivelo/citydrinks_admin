export const getPhotoUrl = (path: string): string => {
  return `${import.meta.env.VITE_BASE_URL}/${path}`
}
