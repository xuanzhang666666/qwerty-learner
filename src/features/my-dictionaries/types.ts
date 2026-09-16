import type { Dictionary, Word } from '@/typings'

export type CustomDictionary = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export type CustomDictionaryWord = Word & {
  id?: number
  dictionaryId: string
  normalizedName: string
  createdAt: number
  updatedAt: number
}

export type CustomDictionaryImportRow = { name: string; trans: string[]; usphone: string; ukphone: string; rowNumber: number }
export type CustomDictionaryImportResult = {
  validRows: CustomDictionaryImportRow[]
  invalidRows: { rowNumber: number; reason: string }[]
  errors: string[]
}

export const CUSTOM_DICTIONARY_PREFIX = 'my-dictionary-'
export const isCustomDictionaryId = (id: string) => id.startsWith(CUSTOM_DICTIONARY_PREFIX)

export function toDictionary(record: CustomDictionary, length: number): Dictionary {
  return {
    id: record.id,
    name: record.name,
    description: '我的词典',
    category: '我的词典',
    tags: ['自定义'],
    url: '',
    length,
    language: 'en',
    languageCategory: 'en',
    chapterCount: Math.max(1, Math.ceil(length / 20)),
  }
}
