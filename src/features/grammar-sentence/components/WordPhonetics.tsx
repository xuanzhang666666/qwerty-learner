import { inferWordPhoneticsFromBuiltInDictionaries } from '../utils/inferWordPhonetics'
import { fontSizeConfigAtom } from '@/store'
import type { WordPhonetic } from '@/typings'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

type WordPhoneticsProps = {
  sentence?: string
  wordPhonetics?: WordPhonetic[]
}

export function GrammarSentenceWordPhonetics({ sentence, wordPhonetics }: WordPhoneticsProps) {
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)
  const [inferredWordPhonetics, setInferredWordPhonetics] = useState<WordPhonetic[]>([])
  const displayWordPhonetics = useMemo(
    () => (wordPhonetics && wordPhonetics.length > 0 ? wordPhonetics : inferredWordPhonetics),
    [inferredWordPhonetics, wordPhonetics],
  )

  useEffect(() => {
    if (!sentence || (wordPhonetics && wordPhonetics.length > 0)) {
      setInferredWordPhonetics([])
      return
    }

    let isCancelled = false
    inferWordPhoneticsFromBuiltInDictionaries(sentence)
      .then((nextWordPhonetics) => {
        if (!isCancelled) setInferredWordPhonetics(nextWordPhonetics)
      })
      .catch(() => {
        if (!isCancelled) setInferredWordPhonetics([])
      })

    return () => {
      isCancelled = true
    }
  }, [sentence, wordPhonetics])

  if (displayWordPhonetics.length === 0) return null

  return (
    <div
      className="mt-3 flex max-w-5xl flex-wrap justify-center gap-x-5 gap-y-2 text-gray-500 dark:text-gray-400"
      style={{ fontFamily: fontSizeConfig.foreignFontFamily, fontSize: `${Math.max(14, Math.round(fontSizeConfig.foreignFont * 0.28))}px` }}
    >
      {displayWordPhonetics.map((item, index) => (
        <span key={`${item.word}-${index}`} className="whitespace-nowrap">
          <span>{item.word}</span>
          <span className="ml-1">[{item.phonetic}]</span>
        </span>
      ))}
    </div>
  )
}
