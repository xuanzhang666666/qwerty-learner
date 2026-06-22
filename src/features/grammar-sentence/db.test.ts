import {
  clearGrammarSentenceData,
  createGrammarSentenceCategory,
  createGrammarSentenceChapter,
  createGrammarSentenceRecord,
  deleteGrammarSentenceCategory,
  deleteGrammarSentenceChapter,
  deleteGrammarSentenceRecord,
  getGrammarSentenceRecordsByChapter,
  importGrammarSentenceRows,
  listGrammarSentenceCategoriesWithChapters,
  updateGrammarSentenceCategoryName,
  updateGrammarSentenceChapterName,
  updateGrammarSentenceRecord,
} from './db'
import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'

describe('grammar sentence db', () => {
  afterEach(async () => {
    await clearGrammarSentenceData()
  })

  it('appends imported rows to the selected chapter', async () => {
    const categoryId = await createGrammarSentenceCategory('方位介词')
    const chapterId = await createGrammarSentenceChapter(categoryId, '第 1 章')

    await importGrammarSentenceRows(
      chapterId,
      [{ chinese: '猫在桌子下面。', english: 'The cat is under the table.', rowNumber: 2 }],
      'append',
    )
    await importGrammarSentenceRows(chapterId, [{ chinese: '鸟在树上。', english: 'The bird is in the tree.', rowNumber: 2 }], 'append')

    const records = await getGrammarSentenceRecordsByChapter(chapterId)

    expect(records.map((record) => record.english)).toEqual(['The cat is under the table.', 'The bird is in the tree.'])
  })

  it('replaces only records in the selected chapter', async () => {
    const categoryId = await createGrammarSentenceCategory('方位介词')
    const firstChapterId = await createGrammarSentenceChapter(categoryId, '第 1 章')
    const secondChapterId = await createGrammarSentenceChapter(categoryId, '第 2 章')

    await importGrammarSentenceRows(
      firstChapterId,
      [{ chinese: '猫在桌子下面。', english: 'The cat is under the table.', rowNumber: 2 }],
      'append',
    )
    await importGrammarSentenceRows(secondChapterId, [{ chinese: '我每天读书。', english: 'I read every day.', rowNumber: 2 }], 'append')

    await importGrammarSentenceRows(
      firstChapterId,
      [{ chinese: '鸟在树上。', english: 'The bird is in the tree.', rowNumber: 2 }],
      'replace',
    )

    expect((await getGrammarSentenceRecordsByChapter(firstChapterId)).map((record) => record.english)).toEqual(['The bird is in the tree.'])
    expect((await getGrammarSentenceRecordsByChapter(secondChapterId)).map((record) => record.english)).toEqual(['I read every day.'])
  })

  it('lists categories with chapters and sentence counts', async () => {
    const categoryId = await createGrammarSentenceCategory('方位介词')
    const chapterId = await createGrammarSentenceChapter(categoryId, '第 1 章')
    await importGrammarSentenceRows(
      chapterId,
      [
        { chinese: '猫在桌子下面。', english: 'The cat is under the table.', rowNumber: 2 },
        { chinese: '鸟在树上。', english: 'The bird is in the tree.', rowNumber: 3 },
      ],
      'append',
    )

    const categories = await listGrammarSentenceCategoriesWithChapters()

    expect(categories).toEqual([
      expect.objectContaining({
        id: categoryId,
        name: '方位介词',
        sentenceCount: 2,
        chapters: [
          expect.objectContaining({
            id: chapterId,
            name: '第 1 章',
            sentenceCount: 2,
            records: [
              expect.objectContaining({ chinese: '猫在桌子下面。', english: 'The cat is under the table.' }),
              expect.objectContaining({ chinese: '鸟在树上。', english: 'The bird is in the tree.' }),
            ],
          }),
        ],
      }),
    ])
  })

  it('updates category and chapter names', async () => {
    const categoryId = await createGrammarSentenceCategory('旧分类')
    const chapterId = await createGrammarSentenceChapter(categoryId, '旧章节')

    await updateGrammarSentenceCategoryName(categoryId, '新分类')
    await updateGrammarSentenceChapterName(chapterId, '新章节')

    const categories = await listGrammarSentenceCategoriesWithChapters()

    expect(categories[0].name).toBe('新分类')
    expect(categories[0].chapters[0].name).toBe('新章节')
  })

  it('deletes a chapter and its records without deleting the category', async () => {
    const categoryId = await createGrammarSentenceCategory('方位介词')
    const chapterId = await createGrammarSentenceChapter(categoryId, '第 1 章')
    await importGrammarSentenceRows(
      chapterId,
      [{ chinese: '猫在桌子下面。', english: 'The cat is under the table.', rowNumber: 2 }],
      'append',
    )

    await deleteGrammarSentenceChapter(chapterId)

    const categories = await listGrammarSentenceCategoriesWithChapters()
    expect(categories).toEqual([expect.objectContaining({ id: categoryId, chapters: [], sentenceCount: 0 })])
    expect(await getGrammarSentenceRecordsByChapter(chapterId)).toEqual([])
  })

  it('deletes a category with its chapters and records', async () => {
    const categoryId = await createGrammarSentenceCategory('方位介词')
    const chapterId = await createGrammarSentenceChapter(categoryId, '第 1 章')
    await importGrammarSentenceRows(
      chapterId,
      [{ chinese: '猫在桌子下面。', english: 'The cat is under the table.', rowNumber: 2 }],
      'append',
    )

    await deleteGrammarSentenceCategory(categoryId)

    expect(await listGrammarSentenceCategoriesWithChapters()).toEqual([])
    expect(await getGrammarSentenceRecordsByChapter(chapterId)).toEqual([])
  })

  it('creates, updates, and deletes a single sentence record', async () => {
    const categoryId = await createGrammarSentenceCategory('基础句型')
    const chapterId = await createGrammarSentenceChapter(categoryId, '第 1 章')

    const recordId = await createGrammarSentenceRecord(chapterId, {
      chinese: '我是一个男孩。',
      english: 'I am a boy.',
    })

    await updateGrammarSentenceRecord(recordId, {
      chinese: '我是一个学生。',
      english: 'I am a student.',
    })

    expect(await getGrammarSentenceRecordsByChapter(chapterId)).toEqual([
      expect.objectContaining({
        id: recordId,
        chinese: '我是一个学生。',
        english: 'I am a student.',
      }),
    ])

    await deleteGrammarSentenceRecord(recordId)

    expect(await getGrammarSentenceRecordsByChapter(chapterId)).toEqual([])
  })
})
