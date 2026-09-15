import classNames from 'classnames'
import type { FC } from 'react'
import { useCallback } from 'react'
import DownIcon from '~icons/fa/sort-down'
import UPIcon from '~icons/fa/sort-up'

type IHeadWrongNumberProps = {
  className?: string
  sortType: ISortType
  setSortType: (sortType: ISortType) => void
  label?: string
}

export type ISortType = 'asc' | 'desc' | 'none'

const HeadWrongNumber: FC<IHeadWrongNumberProps> = ({ className, sortType, setSortType, label = '错误次数' }) => {
  const onClick = useCallback(() => {
    const sortTypes: Record<ISortType, ISortType> = {
      asc: 'desc',
      desc: 'none',
      none: 'asc',
    }
    setSortType(sortTypes[sortType])
  }, [setSortType, sortType])

  return (
    <span className={`inline-flex cursor-pointer items-center gap-1 ${className}`} onClick={onClick}>
      <span>{label}</span>
      <span className="flex flex-col items-center justify-center text-[12px] leading-none">
        <UPIcon
          className={classNames('-mb-2 ', {
            'text-indigo-500': sortType === 'asc',
            'text-gray-400': sortType !== 'asc',
          })}
        />
        <DownIcon
          className={classNames({
            'text-indigo-500': sortType === 'desc',
            'text-gray-400': sortType !== 'desc',
          })}
        />
      </span>
    </span>
  )
}

export default HeadWrongNumber
