import { listCustomDictionaries } from './db'
import { toDictionary } from './types'
import type { Dictionary } from '@/typings'
import { atom } from 'jotai'

export const customDictionariesAtom = atom<Dictionary[]>([])

export async function loadCustomDictionaries(set: (dictionaries: Dictionary[]) => void) {
  const entries = await listCustomDictionaries()
  set(entries.map(({ dictionary, length }) => toDictionary(dictionary, length)))
}
