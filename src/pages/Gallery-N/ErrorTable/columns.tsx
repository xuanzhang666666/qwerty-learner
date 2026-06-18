import type { TErrorWordData } from '../hooks/useErrorWords'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ColumnDef } from '@tanstack/react-table'
import PhArrowsDownUpFill from '~icons/ph/arrows-down-up-fill'
import DeleteIcon from '~icons/weui/delete-filled'

export type ErrorColumn = {
  word: string
  phonetic: string
  trans: string
  errorCount: number
  errorChar: string[]
}

export const errorColumns = (onDelete: (word: string) => Promise<void>): ColumnDef<ErrorColumn>[] => [
  {
    accessorKey: 'word',
    size: 100,
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          单词
          <PhArrowsDownUpFill className="ml-1.5 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'phonetic',
    size: 160,
    header: '音标',
  },
  {
    accessorKey: 'trans',
    size: 420,
    header: '释义',
  },
  {
    accessorKey: 'errorCount',
    size: 40,
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          错误次数
          <PhArrowsDownUpFill className="ml-1.5 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span className="flex justify-center">{row.original.errorCount} </span>
    },
  },
  {
    accessorKey: 'errorChar',
    header: '易错字母',
    size: 100,
    cell: ({ row }) => {
      return (
        <p>
          {(row.getValue('errorChar') as string[]).map((char, index) => (
            <kbd className="flex justify-center" key={`${char}-${index}`}>
              {char + ' '}
            </kbd>
          ))}
        </p>
      )
    },
  },
  {
    accessorKey: 'delete',
    header: '',
    size: 40,
    cell: ({ row }) => {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <DeleteIcon className="cursor-pointer" onClick={() => onDelete(row.original.word)} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Records</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
]

export function getRowsFromErrorWordData(data: TErrorWordData[]): ErrorColumn[] {
  return data.map((item) => {
    return {
      word: item.word,
      phonetic: [
        item.originData.usphone && item.originData.usphone.length > 1 ? `AmE: [${item.originData.usphone}]` : '',
        item.originData.ukphone && item.originData.ukphone.length > 1 ? `BrE: [${item.originData.ukphone}]` : '',
      ]
        .filter(Boolean)
        .join('  '),
      trans: item.originData.trans.join('，') ?? '',
      errorCount: item.errorCount,
      errorChar: item.errorChar,
    }
  })
}
