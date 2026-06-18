import { fontSizeConfigAtom, isTextSelectableAtom, phoneticConfigAtom } from '@/store'
import type { Word, WordWithIndex } from '@/typings'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

export type PhoneticProps = {
  word: WordWithIndex | Word
}

function Phonetic({ word }: PhoneticProps) {
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)
  const phoneticFontSize = useMemo(() => Math.max(16, Math.round(fontSizeConfig.foreignFont * 0.45)), [fontSizeConfig.foreignFont])

  return (
    <div
      className={`space-x-5 text-center font-normal text-gray-600 transition-colors duration-300 dark:text-gray-400 ${
        isTextSelectable && 'select-text'
      }`}
      style={{ fontFamily: fontSizeConfig.foreignFontFamily, fontSize: `${phoneticFontSize}px` }}
    >
      {phoneticConfig.type === 'us' && word.usphone && word.usphone.length > 1 && <span>{`AmE: [${word.usphone}]`}</span>}
      {phoneticConfig.type === 'uk' && word.ukphone && word.ukphone.length > 1 && <span>{`BrE: [${word.ukphone}]`}</span>}
    </div>
  )
}

export default Phonetic
