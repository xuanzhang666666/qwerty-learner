import type { WordPhonetic } from '@/typings'

export type GrammarSentenceImportMode = 'append' | 'replace'

export type GrammarSentenceCategory = {
  id?: number
  name: string
  createdAt: number
  updatedAt: number
}

export type GrammarSentenceCategoryWithCount = GrammarSentenceCategory & {
  id: number
  sentenceCount: number
  chapters: GrammarSentenceChapterWithCount[]
}

export type GrammarSentenceChapter = {
  id?: number
  categoryId: number
  name: string
  createdAt: number
  updatedAt: number
}

export type GrammarSentenceChapterWithCount = GrammarSentenceChapter & {
  id: number
  sentenceCount: number
  records: GrammarSentenceRecord[]
}

export type GrammarSentenceRecord = {
  id?: number
  categoryId: number
  chapterId: number
  chinese: string
  english: string
  usphone?: string
  ukphone?: string
  wordPhonetics?: WordPhonetic[]
  createdAt: number
  updatedAt: number
}

export type GrammarSentenceImportRow = {
  chinese: string
  english: string
  usphone?: string
  ukphone?: string
  wordPhonetics?: WordPhonetic[]
  rowNumber: number
}

export type GrammarSentenceInvalidRow = {
  rowNumber: number
  reason: string
}

export type GrammarSentenceParseResult = {
  validRows: GrammarSentenceImportRow[]
  invalidRows: GrammarSentenceInvalidRow[]
  errors: string[]
}
