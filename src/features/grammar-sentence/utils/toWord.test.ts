import { toGrammarSentenceWord } from './toWord'
import { describe, expect, it } from 'vitest'

describe('toGrammarSentenceWord', () => {
  it('converts a grammar sentence record to a Word', () => {
    const word = toGrammarSentenceWord({
      id: 10,
      categoryId: 2,
      chinese: '我的房子在这个公园旁边。',
      english: 'My house is beside this park.',
      usphone: 'maɪ haʊs ɪz bɪˈsaɪd ðɪs pɑːrk',
      ukphone: 'maɪ haʊs ɪz bɪˈsaɪd ðɪs pɑːk',
      wordPhonetics: [
        { word: 'My', phonetic: 'maɪ' },
        { word: 'house', phonetic: 'haʊs' },
      ],
      createdAt: 100,
      updatedAt: 200,
    })

    expect(word).toEqual({
      name: 'My house is beside this park.',
      trans: ['我的房子在这个公园旁边。'],
      usphone: 'maɪ haʊs ɪz bɪˈsaɪd ðɪs pɑːrk',
      ukphone: 'maɪ haʊs ɪz bɪˈsaɪd ðɪs pɑːk',
      wordPhonetics: [
        { word: 'My', phonetic: 'maɪ' },
        { word: 'house', phonetic: 'haʊs' },
      ],
    })
  })
})
