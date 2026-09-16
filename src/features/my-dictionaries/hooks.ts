import { getCustomDictionaryWords } from './db'
import { isCustomDictionaryId } from './types'
import type { Word } from '@/typings'
import { useEffect, useState } from 'react'

export function useCustomDictionaryWords(dictionaryId: string) {
  const [words, setWords] = useState<Word[]>([])
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    if (!isCustomDictionaryId(dictionaryId)) return setWords([])
    setIsLoading(true)
    getCustomDictionaryWords(dictionaryId)
      .then(setWords)
      .finally(() => setIsLoading(false))
  }, [dictionaryId])
  return { words, isLoading }
}
