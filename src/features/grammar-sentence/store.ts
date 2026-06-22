import { atomWithStorage } from 'jotai/utils'

export const currentGrammarSentenceCategoryIdAtom = atomWithStorage<number | null>('currentGrammarSentenceCategoryId', null)
export const currentGrammarSentenceChapterIdAtom = atomWithStorage<number | null>('currentGrammarSentenceChapterId', null)
