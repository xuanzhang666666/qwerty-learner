import { EXPLICIT_SPACE } from '@/constants'
import type { LetterState } from '@/pages/Typing/components/WordPanel/components/Word/Letter'

type SentenceResetInput = {
  displayWord: string
  inputWord: string
  letterStates: LetterState[]
}

export function getSentenceResetStateAfterWrongInput({ displayWord, inputWord, letterStates }: SentenceResetInput) {
  const wrongIndex = Math.max(0, inputWord.length - 1)
  const currentWordStart = displayWord.lastIndexOf(EXPLICIT_SPACE, wrongIndex - 1) + 1
  const nextLetterStates = letterStates.map((state, index) => (index < currentWordStart ? state : 'normal'))

  return {
    inputWord: inputWord.slice(0, currentWordStart),
    letterStates: nextLetterStates,
  }
}
