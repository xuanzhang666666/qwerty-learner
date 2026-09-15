import { ERROR_BOOK_REVIEW_DICT_ID } from '@/resources/dictionary'
import { db } from '@/utils/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'

export default function ErrorBookStats({ word }: { word: string }) {
  const records = useLiveQuery(() => db.wordRecords.where('word').equals(word).toArray(), [word])

  const { correctCount, wrongCount } = useMemo(
    () => ({
      correctCount:
        records
          ?.filter((record) => record.dict !== ERROR_BOOK_REVIEW_DICT_ID)
          .reduce((total, record) => total + (record.correctCount ?? 0), 0) ?? 0,
      wrongCount:
        records?.filter((record) => record.dict !== ERROR_BOOK_REVIEW_DICT_ID).reduce((total, record) => total + record.wrongCount, 0) ?? 0,
    }),
    [records],
  )

  return (
    <div className="pb-4 text-center text-base text-gray-500 dark:text-gray-400">
      错题本：错误 {wrongCount} · 正确 {correctCount}
    </div>
  )
}
