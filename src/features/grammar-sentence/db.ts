import type {
  GrammarSentenceCategory,
  GrammarSentenceCategoryWithCount,
  GrammarSentenceChapter,
  GrammarSentenceImportMode,
  GrammarSentenceImportRow,
  GrammarSentenceRecord,
} from './types'
import Dexie from 'dexie'
import type { Table } from 'dexie'

class GrammarSentenceDB extends Dexie {
  categories!: Table<GrammarSentenceCategory, number>
  chapters!: Table<GrammarSentenceChapter, number>
  records!: Table<GrammarSentenceRecord, number>

  constructor() {
    super('GrammarSentenceDB')
    this.version(2).stores({
      categories: '++id,name,createdAt,updatedAt',
      chapters: '++id,categoryId,name,createdAt,updatedAt',
      records: '++id,categoryId,chapterId,english,createdAt,updatedAt',
    })
  }
}

export const grammarSentenceDb = new GrammarSentenceDB()

function now() {
  return Date.now()
}

export async function clearGrammarSentenceData() {
  await grammarSentenceDb.records.clear()
  await grammarSentenceDb.chapters.clear()
  await grammarSentenceDb.categories.clear()
}

export async function createGrammarSentenceCategory(name: string) {
  const timestamp = now()
  return grammarSentenceDb.categories.add({
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
}

export async function updateGrammarSentenceCategoryName(categoryId: number, name: string) {
  return grammarSentenceDb.categories.update(categoryId, { name, updatedAt: now() })
}

export async function deleteGrammarSentenceCategory(categoryId: number) {
  const chapters = await grammarSentenceDb.chapters.where({ categoryId }).toArray()
  await Promise.all(
    chapters.map((chapter) => (chapter.id ? grammarSentenceDb.records.where({ chapterId: chapter.id }).delete() : undefined)),
  )
  await grammarSentenceDb.chapters.where({ categoryId }).delete()
  await grammarSentenceDb.categories.delete(categoryId)
}

export async function createGrammarSentenceChapter(categoryId: number, name: string) {
  const timestamp = now()
  return grammarSentenceDb.chapters.add({
    categoryId,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
}

export async function updateGrammarSentenceChapterName(chapterId: number, name: string) {
  return grammarSentenceDb.chapters.update(chapterId, { name, updatedAt: now() })
}

export async function deleteGrammarSentenceChapter(chapterId: number) {
  await grammarSentenceDb.records.where({ chapterId }).delete()
  await grammarSentenceDb.chapters.delete(chapterId)
}

export async function importGrammarSentenceRows(chapterId: number, rows: GrammarSentenceImportRow[], mode: GrammarSentenceImportMode) {
  const chapter = await grammarSentenceDb.chapters.get(chapterId)
  if (!chapter?.id) {
    throw new Error('章节不存在')
  }

  if (mode === 'replace') {
    await grammarSentenceDb.records.where({ chapterId }).delete()
  }

  const timestamp = now()
  const records: GrammarSentenceRecord[] = rows.map((row) => ({
    categoryId: chapter.categoryId,
    chapterId,
    chinese: row.chinese,
    english: row.english,
    usphone: row.usphone,
    ukphone: row.ukphone,
    wordPhonetics: row.wordPhonetics,
    createdAt: timestamp,
    updatedAt: timestamp,
  }))

  if (records.length > 0) {
    await grammarSentenceDb.records.bulkAdd(records)
  }

  await grammarSentenceDb.chapters.update(chapterId, { updatedAt: timestamp })
  await grammarSentenceDb.categories.update(chapter.categoryId, { updatedAt: timestamp })

  return records.length
}

export async function createGrammarSentenceRecord(
  chapterId: number,
  input: Pick<GrammarSentenceRecord, 'chinese' | 'english'> & Partial<Pick<GrammarSentenceRecord, 'ukphone' | 'usphone' | 'wordPhonetics'>>,
) {
  const chapter = await grammarSentenceDb.chapters.get(chapterId)
  if (!chapter?.id) {
    throw new Error('章节不存在')
  }

  const timestamp = now()
  const record: GrammarSentenceRecord = {
    categoryId: chapter.categoryId,
    chapterId,
    chinese: input.chinese,
    english: input.english,
    usphone: input.usphone,
    ukphone: input.ukphone,
    wordPhonetics: input.wordPhonetics,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await grammarSentenceDb.chapters.update(chapterId, { updatedAt: timestamp })
  await grammarSentenceDb.categories.update(chapter.categoryId, { updatedAt: timestamp })
  return grammarSentenceDb.records.add(record)
}

export async function updateGrammarSentenceRecord(
  recordId: number,
  input: Partial<Pick<GrammarSentenceRecord, 'chinese' | 'english' | 'ukphone' | 'usphone' | 'wordPhonetics'>>,
) {
  return grammarSentenceDb.records.update(recordId, { ...input, updatedAt: now() })
}

export function deleteGrammarSentenceRecord(recordId: number) {
  return grammarSentenceDb.records.delete(recordId)
}

export function getGrammarSentenceRecordsByChapter(chapterId: number) {
  return grammarSentenceDb.records.where({ chapterId }).toArray()
}

export function getGrammarSentenceRecordByEnglish(english: string) {
  return grammarSentenceDb.records.where({ english }).first()
}

export async function listGrammarSentenceCategoriesWithChapters(): Promise<GrammarSentenceCategoryWithCount[]> {
  const categories = await grammarSentenceDb.categories.toArray()
  const chapters = await grammarSentenceDb.chapters.toArray()
  const chapterRecords = await Promise.all(chapters.map((chapter) => grammarSentenceDb.records.where({ chapterId: chapter.id }).toArray()))

  const chaptersWithCounts = chapters.map((chapter, index) => ({
    ...chapter,
    id: chapter.id ?? -1,
    sentenceCount: chapterRecords[index].length,
    records: chapterRecords[index],
  }))

  return categories.map((category) => {
    const categoryChapters = chaptersWithCounts.filter((chapter) => chapter.categoryId === category.id)
    return {
      ...category,
      id: category.id ?? -1,
      sentenceCount: categoryChapters.reduce((sum, chapter) => sum + chapter.sentenceCount, 0),
      chapters: categoryChapters,
    }
  })
}
