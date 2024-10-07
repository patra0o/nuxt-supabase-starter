export function formatDate(dateString: string) {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString))
}
  
export function calculateDaysUntil(dateString: string) {
    const today = new Date()
    const targetDate = new Date(dateString)
    const diffTime = Math.abs(targetDate.getTime() - today.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function cutText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength) + '...'
}