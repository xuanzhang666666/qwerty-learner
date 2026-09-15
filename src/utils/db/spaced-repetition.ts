import { db } from './index'
import type { ISpacedRepetitionRecord } from './record'

const DAY_IN_SECONDS = 24 * 60 * 60
export const reviewIntervalsInDays = [1, 3, 7, 14, 30]
const getUnixTimestamp = () => Math.floor(Date.now() / 1000)

export async function recordSpacedRepetitionResult(word: string, succeeded: boolean) {
  const now = getUnixTimestamp()
  const existing = await db.spacedRepetitionRecords.get(word)
  const stage = succeeded ? Math.min((existing?.stage ?? 0) + 1, reviewIntervalsInDays.length) : 0
  const nextReviewAt = succeeded ? now + reviewIntervalsInDays[stage - 1] * DAY_IN_SECONDS : now
  const record: ISpacedRepetitionRecord = {
    word,
    stage,
    nextReviewAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  await db.spacedRepetitionRecords.put(record)
  return record
}

export function isReviewDue(nextReviewAt: number | undefined, now = getUnixTimestamp()) {
  return nextReviewAt === undefined || nextReviewAt <= now
}

export function formatNextReviewStatus(nextReviewAt: number | undefined, now = getUnixTimestamp()) {
  if (nextReviewAt === undefined) return '今天到期'
  if (nextReviewAt > now) return new Date(nextReviewAt * 1000).toLocaleDateString('zh-CN')
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  return nextReviewAt < Math.floor(todayStart.getTime() / 1000) ? '已逾期' : '今天到期'
}
