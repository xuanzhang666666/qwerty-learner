import { clearGrammarSentenceData, createGrammarSentenceCategory, createGrammarSentenceChapter, importGrammarSentenceRows } from './db'
import { getGrammarSentenceWordByEnglish, getGrammarSentenceWordsByChapter } from './getWords'
import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'

describe('getGrammarSentenceWordsByChapter', () => {
  afterEach(async () => {
    await clearGrammarSentenceData()
  })

  it('returns imported sentences as Word objects for the selected category', async () => {
    const categoryId = await createGrammarSentenceCategory('方位介词')
    const chapterId = await createGrammarSentenceChapter(categoryId, '第 1 章')
    await importGrammarSentenceRows(
      chapterId,
      [{ chinese: '我的房子在公园旁边。', english: 'My house is beside the park.', rowNumber: 2 }],
      'append',
    )

    const words = await getGrammarSentenceWordsByChapter(chapterId)

    expect(words).toEqual([
      {
        name: 'My house is beside the park.',
        trans: ['我的房子在公园旁边。'],
        usphone: '',
        ukphone: '',
      },
    ])
  })

  it('returns all words in the selected chapter without a 20 sentence limit', async () => {
    const categoryId = await createGrammarSentenceCategory('方位介词')
    const firstChapterId = await createGrammarSentenceChapter(categoryId, '第 1 章')
    const secondChapterId = await createGrammarSentenceChapter(categoryId, '第 2 章')
    const rows = Array.from({ length: 21 }, (_, index) => ({
      chinese: `中文句 ${index + 1}`,
      english: `English sentence ${index + 1}.`,
      rowNumber: index + 2,
    }))
    await importGrammarSentenceRows(firstChapterId, [{ chinese: '第一章', english: 'Chapter one.', rowNumber: 2 }], 'append')
    await importGrammarSentenceRows(secondChapterId, rows, 'append')

    const words = await getGrammarSentenceWordsByChapter(secondChapterId)

    expect(words).toHaveLength(21)
    expect(words[20]).toEqual({
      name: 'English sentence 21.',
      trans: ['中文句 21'],
      usphone: '',
      ukphone: '',
    })
  })

  it('returns a sentence Word by its English text', async () => {
    const categoryId = await createGrammarSentenceCategory('基础句型')
    const chapterId = await createGrammarSentenceChapter(categoryId, '第 1 章')
    await importGrammarSentenceRows(
      chapterId,
      [
        {
          chinese: '他是一名学生。',
          english: 'He is a student.',
          wordPhonetics: [{ word: 'student', phonetic: 'ˈstuːdnt' }],
          rowNumber: 2,
        },
      ],
      'append',
    )

    const word = await getGrammarSentenceWordByEnglish('He is a student.')

    expect(word).toEqual({
      name: 'He is a student.',
      trans: ['他是一名学生。'],
      usphone: '',
      ukphone: '',
      wordPhonetics: [{ word: 'student', phonetic: 'ˈstuːdnt' }],
    })
  })
})
