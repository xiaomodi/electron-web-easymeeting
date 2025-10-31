export const isEmpty = (val: string | undefined | null): boolean => {
  if (val) return true
  return false
}