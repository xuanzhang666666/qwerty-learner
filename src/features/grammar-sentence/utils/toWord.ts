import type { GrammarSentenceRecord } from '../types'
import type { Word } from '@/typings'

export function toGrammarSentenceWord(record: GrammarSentenceRecord): Word {
  return {
    name: record.english,
    trans: [record.chinese],
    usphone: record.usphone ?? '',
    ukphone: record.ukphone ?? '',
    wordPhonetics: record.wordPhonetics,
  }
}
