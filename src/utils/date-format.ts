export function toDateInputValue(isoString: string) {
  return isoString ? isoString.slice(0, 10) : "";
}
