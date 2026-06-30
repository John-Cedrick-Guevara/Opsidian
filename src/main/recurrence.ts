import { RRule } from 'rrule'

/**
 * Given an RRULE string and a reference date (usually the current due_date),
 * compute the next occurrence after now.
 * Returns ISO date string or null if no more occurrences.
 */
export function generateNextOccurrence(
  rruleString: string,
  afterDate: string
): string | null {
  try {
    const rule = RRule.fromString(rruleString)
    const after = new Date(afterDate)

    // Get the next occurrence after the given date
    const next = rule.after(after, false) // false = exclusive of 'after'

    if (!next) return null

    return next.toISOString()
  } catch (err) {
    console.error('[Recurrence] Failed to parse RRULE:', rruleString, err)
    return null
  }
}

/**
 * Creates a human-readable label from an RRULE string.
 */
export function describeRecurrence(rruleString: string): string {
  try {
    const rule = RRule.fromString(rruleString)
    return rule.toText()
  } catch {
    return 'Custom recurrence'
  }
}

/**
 * Build common RRULE strings for the UI picker.
 */
export const COMMON_RRULES = {
  daily: 'RRULE:FREQ=DAILY;INTERVAL=1',
  weekdays: 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
  weekly: 'RRULE:FREQ=WEEKLY;INTERVAL=1',
  biweekly: 'RRULE:FREQ=WEEKLY;INTERVAL=2',
  monthly: 'RRULE:FREQ=MONTHLY;INTERVAL=1',
} as const
