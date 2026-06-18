import DropdownExport from './DropdownExport'
import ErrorRow from './ErrorRow'
import type { ISortType } from './HeadWrongNumber'
import HeadWrongNumber from './HeadWrongNumber'
import Pagination, { ITEM_PER_PAGE } from './Pagination'
import RowDetail from './RowDetail'
import { currentRowDetailAtom } from './store'
import type { groupedWordRecords } from './type'
import type { TErrorWordData } from '@/pages/Gallery-N/hooks/useErrorWords'
import { ERROR_BOOK_REVIEW_DICT_ID, idDictionaryMap } from '@/resources/dictionary'
import { currentChapterAtom, currentDictIdAtom, reviewModeInfoAtom } from '@/store'
import { db, useDeleteWordRecord } from '@/utils/db'
import type { WordRecord } from '@/utils/db/record'
import { generateNewWordReviewRecord } from '@/utils/db/review-record'
import { wordListFetcher } from '@/utils/wordListFetcher'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

export function ErrorBook() {
  const [groupedRecords, setGroupedRecords] = useState<groupedWordRecords[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = useMemo(() => Math.ceil(groupedRecords.length / ITEM_PER_PAGE), [groupedRecords.length])
  const [sortType, setSortType] = useState<ISortType>('asc')
  const navigate = useNavigate()
  const currentRowDetail = useAtomValue(currentRowDetailAtom)
  const { deleteWordRecord } = useDeleteWordRecord()
  const [reload, setReload] = useState(false)
  const [isPreparingReview, setIsPreparingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const setCurrentDictId = useSetAtom(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)
  const setReviewModeInfo = useSetAtom(reviewModeInfoAtom)

  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  const setPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return
      setCurrentPage(page)
    },
    [totalPages],
  )

  const setSort = useCallback(
    (sortType: ISortType) => {
      setSortType(sortType)
      setPage(1)
    },
    [setPage],
  )

  const sortedRecords = useMemo(() => {
    if (sortType === 'none') return groupedRecords
    return [...groupedRecords].sort((a, b) => {
      if (sortType === 'asc') {
        return a.wrongCount - b.wrongCount
      } else {
        return b.wrongCount - a.wrongCount
      }
    })
  }, [groupedRecords, sortType])

  const renderRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEM_PER_PAGE
    const end = start + ITEM_PER_PAGE
    return sortedRecords.slice(start, end)
  }, [currentPage, sortedRecords])

  useEffect(() => {
    db.wordRecords
      .where('wrongCount')
      .above(0)
      .toArray()
      .then((records) => {
        const groups: groupedWordRecords[] = []

        records.forEach((record) => {
          let group = groups.find((g) => g.word === record.word && g.dict === record.dict)
          if (!group) {
            group = { word: record.word, dict: record.dict, records: [], wrongCount: 0 }
            groups.push(group)
          }
          group.records.push(record as WordRecord)
        })

        groups.forEach((group) => {
          group.wrongCount = group.records.reduce((acc, cur) => {
            acc += cur.wrongCount
            return acc
          }, 0)
        })

        setGroupedRecords(groups)
      })
  }, [reload])

  const handleDelete = async (word: string, dict: string) => {
    await deleteWordRecord(word, dict)
    setReload((prev) => !prev)
  }

  const handleStartReview = useCallback(async () => {
    if (sortedRecords.length === 0 || isPreparingReview) return

    setIsPreparingReview(true)
    setReviewError(null)

    try {
      const wordListCache = new Map<string, Awaited<ReturnType<typeof wordListFetcher>>>()
      const errorData: TErrorWordData[] = []

      for (const record of sortedRecords) {
        const dictInfo = idDictionaryMap[record.dict]
        if (!dictInfo) continue

        let wordList = wordListCache.get(record.dict)
        if (!wordList) {
          wordList = await wordListFetcher(dictInfo.url)
          wordListCache.set(record.dict, wordList)
        }

        const word = wordList.find((item) => item.name === record.word)
        if (!word) continue

        const errorLetters: Record<string, number> = {}
        record.records.forEach((wordRecord) => {
          for (const index in wordRecord.mistakes) {
            const mistakes = wordRecord.mistakes[index]
            if (mistakes.length > 0) {
              errorLetters[index] = (errorLetters[index] ?? 0) + mistakes.length
            }
          }
        })

        errorData.push({
          word: record.word,
          originData: { ...word, sourceDict: record.dict },
          errorCount: record.wrongCount,
          errorLetters,
          errorChar: Object.entries(errorLetters)
            .sort((a, b) => b[1] - a[1])
            .map(([index]) => record.word[Number(index)]),
          latestErrorTime: record.records.reduce((acc, cur) => Math.max(acc, cur.timeStamp), 0),
        })
      }

      if (errorData.length === 0) {
        setReviewError('没有找到可复习的错词')
        return
      }

      const record = await generateNewWordReviewRecord(ERROR_BOOK_REVIEW_DICT_ID, errorData, { shuffle: true })
      setCurrentDictId(ERROR_BOOK_REVIEW_DICT_ID)
      setCurrentChapter(-1)
      setReviewModeInfo({ isReviewMode: true, reviewRecord: record })
      navigate('/')
    } catch (error) {
      console.error(error)
      setReviewError('生成复习列表失败，请稍后重试')
    } finally {
      setIsPreparingReview(false)
    }
  }, [isPreparingReview, navigate, setCurrentChapter, setCurrentDictId, setReviewModeInfo, sortedRecords])

  return (
    <>
      <div className={`relative flex h-screen w-full flex-col items-center pb-4 ease-in ${currentRowDetail && 'blur-sm'}`}>
        <div className="mr-8 mt-4 flex w-auto items-center justify-center self-end">
          <h1 className="font-lighter mr-4 w-auto self-end text-gray-500 opacity-70">Tip: 点击错误单词查看详细信息 </h1>
          <IconX className="h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        </div>

        <div className="flex w-full flex-1 select-text items-start justify-center overflow-hidden">
          <div className="flex h-full w-5/6 flex-col pt-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-red-500">{reviewError}</div>
              <button
                className="my-btn-primary h-10 px-5 text-base font-bold disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={sortedRecords.length === 0 || isPreparingReview}
                onClick={handleStartReview}
                type="button"
              >
                {isPreparingReview ? '正在生成...' : '复习全部错题'}
              </button>
            </div>
            <div className="flex w-full justify-between rounded-lg bg-white px-6 py-5 text-lg text-black shadow-lg dark:bg-gray-800 dark:text-white">
              <span className="basis-2/12">单词</span>
              <span className="basis-6/12">释义</span>
              <HeadWrongNumber className="basis-1/12" sortType={sortType} setSortType={setSort} />
              <span className="basis-1/12">词典</span>
              <DropdownExport renderRecords={sortedRecords} />
            </div>
            <ScrollArea.Root className="flex-1 overflow-y-auto pt-5">
              <ScrollArea.Viewport className="h-full  ">
                <div className="flex flex-col gap-3">
                  {renderRecords.map((record) => (
                    <ErrorRow
                      key={`${record.dict}-${record.word}`}
                      record={record}
                      onDelete={() => handleDelete(record.word, record.dict)}
                    />
                  ))}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent" orientation="vertical"></ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </div>
        </div>
        <Pagination className="pt-3" page={currentPage} setPage={setPage} totalPages={totalPages} />
      </div>
      {currentRowDetail && <RowDetail currentRowDetail={currentRowDetail} allRecords={sortedRecords} />}
    </>
  )
}
