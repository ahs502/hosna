import { webConfig } from '../../webConfig'
import { Combination } from '../types/Combination'
import { Combinations } from '../types/Combinations'

export function doesEventMatchCombinations(event: KeyboardEvent, combinations: Combinations | undefined): boolean {
  if (!combinations) return true

  return ([] as Combination[]).concat(combinations).some(combination => {
    if (typeof combination === 'string') return event.code === combination

    const shiftPreference = combination.shift
    const altPreference = combination.alt
    const ctrlPreference = combination.ctrl ?? (webConfig.keyboard.cmdIsCtrl ? combination.cmd : undefined)
    const metaPreference = combination.meta ?? (webConfig.keyboard.cmdIsMeta ? combination.cmd : undefined)
    return (
      event.code === combination.code &&
      (shiftPreference === undefined || event.shiftKey === shiftPreference) &&
      (altPreference === undefined || event.altKey === altPreference) &&
      (ctrlPreference === undefined || event.ctrlKey === ctrlPreference) &&
      (metaPreference === undefined || event.metaKey === metaPreference)
    )
  })
}
