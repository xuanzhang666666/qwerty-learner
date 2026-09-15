import { currentDictIdAtom } from '@/store'
import { db } from '@/utils/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

export default function ErrorBookStats({ word }: { word: string }) {
  const dict = useAtomValue(currentDictIdAtom)
  const records = useLiveQuery(() => db.wordRecords.where({ word, dict }).toArray(), [dict, word])

  const { correctCount, wrongCount } = useMemo(
    () => ({
      correctCount: records?.reduce((total, record) => total + (record.correctCount ?? 0), 0) ?? 0,
      wrongCount: records?.reduce((total, record) => total + record.wrongCount, 0) ?? 0,
    }),
    [records],
  )

  return (
    <div className="pb-4 text-center text-sm text-gray-500 dark:text-gray-400">
      错题本：错误 {wrongCount} · 正确 {correctCount}
    </div>
  )
}
