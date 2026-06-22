import { getGrammarSentenceRecordByEnglish, getGrammarSentenceRecordsByChapter } from './db'
import { toGrammarSentenceWord } from './utils/toWord'

export async function getGrammarSentenceWordsByChapter(chapterId: number) {
  const records = await getGrammarSentenceRecordsByChapter(chapterId)
  return records.map(toGrammarSentenceWord)
}

export async function getGrammarSentenceWordByEnglish(english: string) {
  const record = await getGrammarSentenceRecordByEnglish(english)
  return record ? toGrammarSentenceWord(record) : undefined
}
