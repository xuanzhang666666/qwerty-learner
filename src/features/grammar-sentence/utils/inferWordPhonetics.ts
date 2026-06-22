import type { Word, WordPhonetic } from '@/typings'
import { wordListFetcher } from '@/utils/wordListFetcher'

const BASIC_WORD_PHONETICS: Record<string, string> = {
  a: 'ə',
  an: 'ən',
  i: 'aɪ',
}

let dictionaryWordsPromise: Promise<Word[]> | null = null

export function inferWordPhonetics(sentence: string, dictionaryWords: Word[] = []): WordPhonetic[] {
  const dictionaryMap = new Map(dictionaryWords.map((word) => [word.name.toLowerCase(), word]))
  const tokens = sentence.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? []

  return tokens.reduce<WordPhonetic[]>((result, token) => {
    const normalizedToken = token.toLowerCase()
    const dictionaryWord = dictionaryMap.get(normalizedToken)
    const phonetic = BASIC_WORD_PHONETICS[normalizedToken] ?? dictionaryWord?.usphone ?? dictionaryWord?.ukphone

    if (phonetic) {
      result.push({ word: token, phonetic })
    }

    return result
  }, [])
}

export async function inferWordPhoneticsFromBuiltInDictionaries(sentence: string) {
  if (!dictionaryWordsPromise) {
    dictionaryWordsPromise = Promise.all([wordListFetcher('/dicts/NCE_1.json'), wordListFetcher('/dicts/Oxford5000.json')]).then(
      (wordLists) => wordLists.flat(),
    )
  }

  return inferWordPhonetics(sentence, await dictionaryWordsPromise)
}
