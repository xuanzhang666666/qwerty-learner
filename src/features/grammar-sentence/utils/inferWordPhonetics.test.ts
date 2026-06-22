import { inferWordPhonetics } from './inferWordPhonetics'
import { describe, expect, it } from 'vitest'

describe('inferWordPhonetics', () => {
  it('infers word phonetics from built-in basics and dictionary words', () => {
    const result = inferWordPhonetics('I am a boy.', [
      { name: 'am', trans: [], usphone: 'əm', ukphone: 'æm' },
      { name: 'boy', trans: [], usphone: 'bɔɪ', ukphone: 'bɔɪ' },
    ])

    expect(result).toEqual([
      { word: 'I', phonetic: 'aɪ' },
      { word: 'am', phonetic: 'əm' },
      { word: 'a', phonetic: 'ə' },
      { word: 'boy', phonetic: 'bɔɪ' },
    ])
  })

  it('skips words when no phonetic can be found', () => {
    expect(inferWordPhonetics('Unknownword appears.')).toEqual([])
  })
})
