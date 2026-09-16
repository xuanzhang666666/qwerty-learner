import { CUSTOM_DICTIONARY_PREFIX, type CustomDictionary, type CustomDictionaryImportRow, type CustomDictionaryWord } from './types'
import { db as recordDb } from '@/utils/db'
import Dexie from 'dexie'
import type { Table } from 'dexie'

class CustomDictionaryDB extends Dexie {
  dictionaries!: Table<CustomDictionary, string>
  words!: Table<CustomDictionaryWord, number>
  constructor() {
    super('CustomDictionaryDB')
    this.version(1).stores({
      dictionaries: 'id,name,createdAt,updatedAt',
      words: '++id,dictionaryId,normalizedName,[dictionaryId+normalizedName]',
    })
  }
}

export const customDictionaryDb = new CustomDictionaryDB()
const now = () => Date.now()

export async function listCustomDictionaries() {
  const dictionaries = await customDictionaryDb.dictionaries.toArray()
  const counts = await Promise.all(
    dictionaries.map((dictionary) => customDictionaryDb.words.where('dictionaryId').equals(dictionary.id).count()),
  )
  return dictionaries.map((dictionary, index) => ({ dictionary, length: counts[index] }))
}

export async function createCustomDictionary(name: string) {
  const timestamp = now()
  const dictionary: CustomDictionary = {
    id: `${CUSTOM_DICTIONARY_PREFIX}${crypto.randomUUID()}`,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  await customDictionaryDb.dictionaries.add(dictionary)
  return dictionary
}

export function renameCustomDictionary(id: string, name: string) {
  return customDictionaryDb.dictionaries.update(id, { name, updatedAt: now() })
}

export async function deleteCustomDictionary(id: string) {
  await customDictionaryDb.transaction('rw', customDictionaryDb.dictionaries, customDictionaryDb.words, async () => {
    await customDictionaryDb.words.where('dictionaryId').equals(id).delete()
    await customDictionaryDb.dictionaries.delete(id)
  })
  await recordDb.wordRecords.where('dict').equals(id).delete()
  await recordDb.chapterRecords.where('dict').equals(id).delete()
  await recordDb.reviewRecords.where('dict').equals(id).delete()
}

export async function importCustomDictionaryWords(dictionaryId: string, rows: CustomDictionaryImportRow[], mode: 'append' | 'replace') {
  const dictionary = await customDictionaryDb.dictionaries.get(dictionaryId)
  if (!dictionary) throw new Error('词典不存在')
  const timestamp = now()
  await customDictionaryDb.transaction('rw', customDictionaryDb.words, customDictionaryDb.dictionaries, async () => {
    if (mode === 'replace') await customDictionaryDb.words.where('dictionaryId').equals(dictionaryId).delete()
    const existing = new Set(
      (await customDictionaryDb.words.where('dictionaryId').equals(dictionaryId).toArray()).map((word) => word.normalizedName),
    )
    const words = rows
      .filter((row) => !existing.has(row.name.toLowerCase()))
      .map((row) => ({
        dictionaryId,
        normalizedName: row.name.toLowerCase(),
        name: row.name,
        trans: row.trans,
        usphone: row.usphone,
        ukphone: row.ukphone,
        createdAt: timestamp,
        updatedAt: timestamp,
      }))
    if (words.length) await customDictionaryDb.words.bulkAdd(words)
    await customDictionaryDb.dictionaries.update(dictionaryId, { updatedAt: timestamp })
  })
}

export function getCustomDictionaryWords(dictionaryId: string) {
  return customDictionaryDb.words.where('dictionaryId').equals(dictionaryId).toArray()
}

export async function getCustomDictionaryWord(dictionaryId: string, name: string) {
  return customDictionaryDb.words.where('[dictionaryId+normalizedName]').equals([dictionaryId, name.toLowerCase()]).first()
}
