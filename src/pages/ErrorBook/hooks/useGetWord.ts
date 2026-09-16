import { GRAMMAR_SENTENCE_DICT_ID, getGrammarSentenceWordByEnglish } from '@/features/grammar-sentence'
import { getCustomDictionaryWord } from '@/features/my-dictionaries/db'
import { isCustomDictionaryId } from '@/features/my-dictionaries/types'
import type { Dictionary, Word } from '@/typings'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'

export default function useGetWord(name: string, dict: Dictionary) {
  const isGrammarSentenceDict = dict?.id === GRAMMAR_SENTENCE_DICT_ID
  const isCustomDictionary = isCustomDictionaryId(dict?.id ?? '')
  const { data: wordList, error, isLoading } = useSWR(isGrammarSentenceDict || isCustomDictionary ? null : dict?.url, wordListFetcher)
  const [grammarSentenceWord, setGrammarSentenceWord] = useState<Word | undefined>()
  const [isLoadingGrammarSentence, setIsLoadingGrammarSentence] = useState(false)
  const [hasError, setHasError] = useState(false)

  const word: Word | undefined = useMemo(() => {
    if (isGrammarSentenceDict || isCustomDictionary) return grammarSentenceWord
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
    if (!isGrammarSentenceDict && !isCustomDictionary) return

    setHasError(false)
    setIsLoadingGrammarSentence(true)
    ;(isCustomDictionary ? getCustomDictionaryWord(dict.id, name) : getGrammarSentenceWordByEnglish(name))
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
  }, [dict?.id, isCustomDictionary, isGrammarSentenceDict, name])

  useEffect(() => {
    if (error) setHasError(true)
  }, [error])

  return { word, isLoading: isGrammarSentenceDict || isCustomDictionary ? isLoadingGrammarSentence : isLoading, hasError }
}
