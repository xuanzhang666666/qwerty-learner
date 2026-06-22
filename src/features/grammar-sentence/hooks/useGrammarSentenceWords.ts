import { getGrammarSentenceWordsByChapter } from '../getWords'
import { currentGrammarSentenceChapterIdAtom } from '../store'
import type { Word } from '@/typings'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'

export function useGrammarSentenceWords() {
  const chapterId = useAtomValue(currentGrammarSentenceChapterIdAtom)
  const [words, setWords] = useState<Word[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>()

  useEffect(() => {
    let isMounted = true

    if (chapterId === null) {
      setWords([])
      setIsLoading(false)
      setError(undefined)
      return
    }

    setIsLoading(true)
    setError(undefined)

    getGrammarSentenceWordsByChapter(chapterId)
      .then((nextWords) => {
        if (isMounted) setWords(nextWords)
      })
      .catch((nextError) => {
        if (isMounted) setError(nextError instanceof Error ? nextError : new Error('读取语法句子题库失败'))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [chapterId])

  return { words, isLoading, error }
}
