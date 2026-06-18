import type { IChapterRecord, IReviewRecord, IRevisionDictRecord, IWordRecord, LetterMistakes } from './record'
import { ChapterRecord, ReviewRecord, WordRecord } from './record'
import { TypingContext, TypingStateActionType } from '@/pages/Typing/store'
import type { TypingState } from '@/pages/Typing/store/type'
import { currentChapterAtom, currentDictIdAtom, isReviewModeAtom } from '@/store'
import type { Table } from 'dexie'
import Dexie from 'dexie'
import { useAtomValue } from 'jotai'
import { useCallback, useContext } from 'react'

class RecordDB extends Dexie {
  wordRecords!: Table<IWordRecord, number>
  chapterRecords!: Table<IChapterRecord, number>
  reviewRecords!: Table<IReviewRecord, number>

  revisionDictRecords!: Table<IRevisionDictRecord, number>
  revisionWordRecords!: Table<IWordRecord, number>

  constructor() {
    super('RecordDB')
    this.version(1).stores({
      wordRecords: '++id,word,timeStamp,dict,chapter,errorCount,[dict+chapter]',
      chapterRecords: '++id,timeStamp,dict,chapter,time,[dict+chapter]',
    })
    this.version(2).stores({
      wordRecords: '++id,word,timeStamp,dict,chapter,wrongCount,[dict+chapter]',
      chapterRecords: '++id,timeStamp,dict,chapter,time,[dict+chapter]',
    })
    this.version(3).stores({
      wordRecords: '++id,word,timeStamp,dict,chapter,wrongCount,[dict+chapter]',
      chapterRecords: '++id,timeStamp,dict,chapter,time,[dict+chapter]',
      reviewRecords: '++id,dict,createTime,isFinished',
    })
  }
}

export const db = new RecordDB()

db.wordRecords.mapToClass(WordRecord)
db.chapterRecords.mapToClass(ChapterRecord)
db.reviewRecords.mapToClass(ReviewRecord)

export function useSaveChapterRecord() {
  const currentChapter = useAtomValue(currentChapterAtom)
  const isRevision = useAtomValue(isReviewModeAtom)
  const dictID = useAtomValue(currentDictIdAtom)

  const saveChapterRecord = useCallback(
    (typingState: TypingState) => {
      const {
        chapterData: { correctCount, wrongCount, userInputLogs, wordCount, words, wordRecordIds },
        timerData: { time },
      } = typingState
      const correctWordIndexes = userInputLogs.filter((log) => log.correctCount > 0 && log.wrongCount === 0).map((log) => log.index)

      const chapterRecord = new ChapterRecord(
        dictID,
        isRevision ? -1 : currentChapter,
        time,
        correctCount,
        wrongCount,
        wordCount,
        correctWordIndexes,
        words.length,
        wordRecordIds ?? [],
      )
      db.chapterRecords.add(chapterRecord)
    },
    [currentChapter, dictID, isRevision],
  )

  return saveChapterRecord
}

export type WordKeyLogger = {
  letterTimeArray: number[]
  letterMistake: LetterMistakes
}

export function useSaveWordRecord() {
  const isRevision = useAtomValue(isReviewModeAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const dictID = useAtomValue(currentDictIdAtom)

  const { dispatch } = useContext(TypingContext) ?? {}

  const saveWordRecord = useCallback(
    async ({
      word,
      wrongCount,
      letterTimeArray,
      letterMistake,
    }: {
      word: string
      wrongCount: number
      letterTimeArray: number[]
      letterMistake: LetterMistakes
    }) => {
      const timing = []
      for (let i = 1; i < letterTimeArray.length; i++) {
        const diff = letterTimeArray[i] - letterTimeArray[i - 1]
        timing.push(diff)
      }

      const wordRecord = new WordRecord(word, dictID, isRevision ? -1 : currentChapter, timing, wrongCount, letterMistake)

      let dbID = -1
      try {
        dbID = await db.wordRecords.add(wordRecord)
      } catch (e) {
        console.error(e)
      }
      if (dispatch) {
        dbID > 0 && dispatch({ type: TypingStateActionType.ADD_WORD_RECORD_ID, payload: dbID })
        dispatch({ type: TypingStateActionType.SET_IS_SAVING_RECORD, payload: false })
      }
    },
    [currentChapter, dictID, dispatch, isRevision],
  )

  return saveWordRecord
}

export function useAddWordToErrorBook() {
  const isRevision = useAtomValue(isReviewModeAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const dictID = useAtomValue(currentDictIdAtom)

  const addWordToErrorBook = useCallback(
    async (word: string) => {
      const wordRecord = new WordRecord(word, dictID, isRevision ? -1 : currentChapter, [], 1, {})
      return db.wordRecords.add(wordRecord)
    },
    [currentChapter, dictID, isRevision],
  )

  return addWordToErrorBook
}

export function useDeleteWordRecord() {
  const deleteWordRecord = useCallback(async (word: string, dict: string) => {
    try {
      const deletedCount = await db.wordRecords.where({ word, dict }).delete()
      return deletedCount
    } catch (error) {
      console.error(`删除单词记录时出错：`, error)
    }
  }, [])

  return { deleteWordRecord }
}

export type ErrorBookWordIdentity = {
  word: string
  dict: string
}

export function useRecordErrorBookCorrectAnswers() {
  const recordErrorBookCorrectAnswers = useCallback(async (words: ErrorBookWordIdentity[]) => {
    const wordCorrectCountMap = words.reduce((acc, word) => {
      const key = `${word.dict}-${word.word}`
      const existing = acc.get(key)
      acc.set(key, { ...word, correctCount: (existing?.correctCount ?? 0) + 1 })
      return acc
    }, new Map<string, ErrorBookWordIdentity & { correctCount: number }>())
    const wordsWithCorrectCount = Array.from(wordCorrectCountMap.values())
    let removedCount = 0

    await Promise.all(
      wordsWithCorrectCount.map(async ({ word, dict, correctCount: currentCorrectCount }) => {
        const correctRecord = new WordRecord(word, dict, -1, [], 0, {}, currentCorrectCount)
        await db.wordRecords.add(correctRecord)

        const records = await db.wordRecords.where({ word, dict }).toArray()
        const correctCount = records.reduce((acc, record) => acc + (record.correctCount ?? 0), 0)

        if (correctCount > 20) {
          await db.wordRecords.where({ word, dict }).delete()
          removedCount += 1
        }
      }),
    )

    return { updatedCount: words.length, removedCount }
  }, [])

  return { recordErrorBookCorrectAnswers }
}
