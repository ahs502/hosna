export function humanizeTimestamp(timestamp: number | undefined, mode: humanizeTimestamp.Mode): string {
  return humanizeTimestamp.withExpiration(timestamp, mode).humanizedTimestamp
}

// TODO: Needs to be refactored to a more structured implementation, the definition of `mode` is not good; maybe we need to break it into multiple functions:
export namespace humanizeTimestamp {
  export function withExpiration(
    timestamp: number | undefined,
    mode: Mode
  ): {
    humanizedTimestamp: string
    expiresInMilliseconds?: number
  } {
    if (timestamp === undefined) return { humanizedTimestamp: '' }

    if (mode === 'relative from now') {
      const seconds = Math.round((Date.now() - timestamp) / 1000)
      if (seconds < 3) return { humanizedTimestamp: 'just now', expiresInMilliseconds: 1 * 1000 }
      if (seconds < 10) return { humanizedTimestamp: 'a few seconds ago', expiresInMilliseconds: 1 * 1000 }

      const decaSeconds = Math.floor(seconds / 10)
      if (decaSeconds <= 3)
        return { humanizedTimestamp: `${decaSeconds}0 seconds ago`, expiresInMilliseconds: 10 * 1000 }
      if (decaSeconds < 6) return { humanizedTimestamp: 'less than 1 minute ago', expiresInMilliseconds: 20 * 1000 }

      const minutes = Math.floor(decaSeconds / 6)
      if (minutes <= 1) return { humanizedTimestamp: '1 minute ago', expiresInMilliseconds: 1 * 60 * 1000 }
      if (minutes < 10) return { humanizedTimestamp: `${minutes} minutes ago`, expiresInMilliseconds: 1 * 60 * 1000 }

      const pentaMinutes = Math.floor(minutes / 5)
      if (pentaMinutes < 12)
        return { humanizedTimestamp: `${pentaMinutes * 5} minutes ago`, expiresInMilliseconds: 5 * 60 * 1000 }

      const hours = Math.floor(pentaMinutes / 12)
      if (hours <= 1) return { humanizedTimestamp: '1 hour ago', expiresInMilliseconds: 1 * 60 * 60 * 1000 }
      if (hours < 24) return { humanizedTimestamp: `${hours} hours ago`, expiresInMilliseconds: 1 * 60 * 60 * 1000 }

      const days = Math.floor(hours / 24)
      if (days <= 1) return { humanizedTimestamp: '1 day ago', expiresInMilliseconds: 1 * 24 * 60 * 60 * 1000 }
      if (days < 14) return { humanizedTimestamp: `${days} days ago`, expiresInMilliseconds: 1 * 24 * 60 * 60 * 1000 }

      const weeks = Math.floor(days / 7)
      if (weeks <= 1) return { humanizedTimestamp: '1 week ago', expiresInMilliseconds: 1 * 7 * 24 * 60 * 60 * 1000 }
      if (weeks < 4)
        return { humanizedTimestamp: `${weeks} weeks ago`, expiresInMilliseconds: 1 * 7 * 24 * 60 * 60 * 1000 }

      const months = Math.floor(days / 30)
      if (months <= 1) return { humanizedTimestamp: '1 month ago', expiresInMilliseconds: 1 * 30 * 24 * 60 * 60 * 1000 }
      if (months < 12)
        return { humanizedTimestamp: `${months} months ago`, expiresInMilliseconds: 1 * 30 * 24 * 60 * 60 * 1000 }

      const years = Math.floor(days / 365)
      if (years <= 1) return { humanizedTimestamp: '1 year ago', expiresInMilliseconds: 1 * 365 * 24 * 60 * 60 * 1000 }
      return { humanizedTimestamp: `${years} years ago`, expiresInMilliseconds: 1 * 365 * 24 * 60 * 60 * 1000 }
    }

    const timestampDate = new Date(timestamp)

    if (mode === 'time only')
      return {
        humanizedTimestamp: `${timestampDate.getHours().toString().padStart(2, '0')}:${timestampDate.getMinutes().toString().padStart(2, '0')}`,
      }

    const formattedTime =
      mode === 'date with time' || mode === 'abbreviated date with time' || mode === 'abbreviated date or time'
        ? `${timestampDate.getHours()}:${timestampDate.getMinutes().toString().padStart(2, '0')}`
        : ''
    const formattedTimePrefix = mode === 'date with time' || mode === 'abbreviated date with time' ? ' at ' : ''

    const timestampDateDate = timestampDate.toDateString()

    const now = new Date()
    const todayDate = now.toDateString()
    if (timestampDateDate === todayDate)
      return {
        humanizedTimestamp:
          mode === 'abbreviated date or time' ? formattedTime : `today${formattedTimePrefix}${formattedTime}`,
        expiresInMilliseconds: 1 * 24 * 60 * 60 * 1000,
      }

    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    const yesterdayDate = yesterday.toDateString()
    if (timestampDateDate === yesterdayDate)
      return {
        humanizedTimestamp:
          mode === 'abbreviated date or time' ? 'yesterday' : `yesterday${formattedTimePrefix}${formattedTime}`,
        expiresInMilliseconds: 1 * 24 * 60 * 60 * 1000,
      }

    const formattedYear = timestampDate.getFullYear() !== now.getFullYear() ? `, ${timestampDate.getFullYear()}` : ''
    const formattedMonthName =
      mode === 'abbreviated date' || mode === 'abbreviated date with time' || mode === 'abbreviated date or time'
        ? monthNames[timestampDate.getMonth()].slice(0, 3)
        : monthNames[timestampDate.getMonth()]
    const formattedDay = timestampDate.getDate().toString()
    return {
      humanizedTimestamp:
        mode === 'abbreviated date or time'
          ? `${formattedMonthName} ${formattedDay}${formattedYear}`
          : `${formattedMonthName} ${formattedDay}${formattedYear}${formattedTimePrefix}${formattedTime}`,
    }
  }

  export type Mode =
    | 'date only' // "today", "yesterday", "March 21,2021"
    | 'time only' // "02:16"
    | 'date with time' // "today at 2:16", "yesterday at 2:16", "March 21,2021 at 2:16"
    | 'abbreviated date' // "today", "yesterday", "Mar 21,2021"
    | 'abbreviated date with time' // "today at 2:16", "yesterday at 2:16", "Mar 21,2021 at 2:16"
    | 'abbreviated date or time' // "02:16", "yesterday", "Mar 21,2021"
    | 'relative from now' // "just now", "10 seconds ago", "2 days ago"

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ] as const
}
