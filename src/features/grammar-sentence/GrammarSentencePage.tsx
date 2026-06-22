import { GrammarSentenceCategoryList } from './components/CategoryList'
import Layout from '@/components/Layout'
import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

export default function GrammarSentencePage() {
  const navigate = useNavigate()
  const onBack = useCallback(() => {
    navigate('/gallery')
  }, [navigate])

  useHotkeys('esc', onBack, { preventDefault: true })

  return (
    <Layout>
      <div className="relative flex w-full flex-1 items-start justify-center overflow-y-auto px-20 py-12">
        <IconX className="absolute right-20 top-10 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        <GrammarSentenceCategoryList />
      </div>
    </Layout>
  )
}
