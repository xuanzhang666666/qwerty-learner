import { getSentenceResetStateAfterWrongInput } from './resetCurrentWord'
import { EXPLICIT_SPACE } from '@/constants'
import { describe, expect, it } from 'vitest'

describe('getSentenceResetStateAfterWrongInput', () => {
  it('keeps completed words and resets from the current word start', () => {
    const displayWord = `I${EXPLICIT_SPACE}am${EXPLICIT_SPACE}a${EXPLICIT_SPACE}boy.`
    const letterStates = new Array(displayWord.length).fill('correct')
    letterStates[displayWord.length - 1] = 'wrong'

    const result = getSentenceResetStateAfterWrongInput({
      displayWord,
      inputWord: displayWord,
      letterStates,
    })

    expect(result.inputWord).toBe(`I${EXPLICIT_SPACE}am${EXPLICIT_SPACE}a${EXPLICIT_SPACE}`)
    expect(result.letterStates.slice(0, result.inputWord.length)).toEqual(new Array(result.inputWord.length).fill('correct'))
    expect(result.letterStates.slice(result.inputWord.length)).toEqual(new Array(4).fill('normal'))
  })

  it('resets from the sentence start when the first word is wrong', () => {
    const displayWord = `I${EXPLICIT_SPACE}am${EXPLICIT_SPACE}a${EXPLICIT_SPACE}boy.`
    const letterStates = ['wrong', ...new Array(displayWord.length - 1).fill('normal')]

    const result = getSentenceResetStateAfterWrongInput({
      displayWord,
      inputWord: 'X',
      letterStates,
    })

    expect(result.inputWord).toBe('')
    expect(result.letterStates).toEqual(new Array(displayWord.length).fill('normal'))
  })
})
