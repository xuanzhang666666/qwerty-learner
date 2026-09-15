import { LoadingWordUI } from './LoadingWordUI'
import useGetWord from './hooks/useGetWord'
import { currentRowDetailAtom } from './store'
import type { groupedWordRecords } from './type'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { idDictionaryMap } from '@/resources/dictionary'
import { recordErrorBookAction } from '@/utils'
import { useSetAtom } from 'jotai'
import type { FC } from 'react'
import { useCallback } from 'react'
import DeleteIcon from '~icons/weui/delete-filled'

const formatTime = (timestamp: number) => new Date(timestamp * 1000).toLocaleString('zh-CN', { hour12: false })

type IErrorRowProps = {
  record: groupedWordRecords
  onDelete: () => void
}

const ErrorRow: FC<IErrorRowProps> = ({ record, onDelete }) => {
  const setCurrentRowDetail = useSetAtom(currentRowDetailAtom)
  const dictInfo = idDictionaryMap[record.dict]
  const { word, isLoading, hasError } = useGetWord(record.word, dictInfo)

  const onClick = useCallback(() => {
    setCurrentRowDetail(record)
    recordErrorBookAction('detail')
  }, [record, setCurrentRowDetail])

  return (
    <li
      className="opacity-85 flex w-full cursor-pointer items-center rounded-lg bg-white px-6 py-3 text-left text-black shadow-md dark:bg-gray-800 dark:text-white"
      onClick={onClick}
    >
      <span className="flex basis-2/12 items-center gap-3 break-normal">
        {record.word}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label={`删除 ${record.word}`}
                className="text-gray-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                title={`删除 ${record.word}`}
                type="button"
              >
                <DeleteIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>删除此词</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
      <span className="basis-2/12 break-normal text-sm text-gray-500 dark:text-gray-400">
        {word ? (
          <>
            {word.usphone && word.usphone.length > 1 && <span>{`AmE: [${word.usphone}]`}</span>}
            {word.ukphone && word.ukphone.length > 1 && <span className="ml-3">{`BrE: [${word.ukphone}]`}</span>}
          </>
        ) : (
          <LoadingWordUI isLoading={isLoading} hasError={hasError} />
        )}
      </span>
      <span className="basis-3/12 break-normal">
        {word ? word.trans.join('；') : <LoadingWordUI isLoading={isLoading} hasError={hasError} />}
      </span>
      <span className="basis-1/12 break-normal pl-8">{record.wrongCount}</span>
      <span className="basis-1/12 break-normal pl-8">{record.correctCount}</span>
      <span className="basis-1/12 break-normal">{dictInfo?.name}</span>
      <span className="basis-1/12 break-normal text-sm text-gray-500 dark:text-gray-400">{formatTime(record.createdAt)}</span>
      <span className="basis-1/12 break-normal text-sm text-gray-500 dark:text-gray-400">{formatTime(record.updatedAt)}</span>
    </li>
  )
}

export default ErrorRow
