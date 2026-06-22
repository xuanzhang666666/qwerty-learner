import { GRAMMAR_SENTENCE_DICT_ID, getGrammarSentenceWordByEnglish } from '@/features/grammar-sentence'
import type { Dictionary, Word } from '@/typings'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'

export default function useGetWord(name: string, dict: Dictionary) {
  const isGrammarSentenceDict = dict?.id === GRAMMAR_SENTENCE_DICT_ID
  const { data: wordList, error, isLoading } = useSWR(isGrammarSentenceDict ? null : dict?.url, wordListFetcher)
  const [grammarSentenceWord, setGrammarSentenceWord] = useState<Word | undefined>()
  const [isLoadingGrammarSentence, setIsLoadingGrammarSentence] = useState(false)
  const [hasError, setHasError] = useState(false)

  const word: Word | undefined = useMemo(() => {
    if (isGrammarSentenceDict) return grammarSentenceWord
    if (!wordList) return undefined

    const word = wordList.find((word) => word.name === name)
    if (word) {
      return word
    } else {
      setHasError(true)
      return undefined
    }
  }, [grammarSentenceWord, isGrammarSentenceDict, wordList, name])

  useEffect(() => {
    if (!isGrammarSentenceDict) return

    setHasError(false)
    setIsLoadingGrammarSentence(true)
    getGrammarSentenceWordByEnglish(name)
      .then((nextWord) => {
        setGrammarSentenceWord(nextWord)
        setHasError(!nextWord)
      })
      .catch(() => {
        setGrammarSentenceWord(undefined)
        setHasError(true)
      })
      .finally(() => {
        setIsLoadingGrammarSentence(false)
      })
  }, [isGrammarSentenceDict, name])

  useEffect(() => {
    if (error) setHasError(true)
  }, [error])

  return { word, isLoading: isGrammarSentenceDict ? isLoadingGrammarSentence : isLoading, hasError }
}
