import { createCustomDictionary, deleteCustomDictionary, importCustomDictionaryWords, renameCustomDictionary } from './db'
import { parseCustomDictionaryWorkbook } from './parseExcel'
import { customDictionariesAtom, loadCustomDictionaries } from './store'
import { Button } from '@/components/ui/button'
import { currentChapterAtom, currentDictIdAtom, reviewModeInfoAtom } from '@/store'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'

export default function MyDictionariesPage() {
  const [dictionaries, setDictionaries] = useState<{ id: string; name: string; length: number }[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const setCustomDictionaries = useSetAtom(customDictionariesAtom)
  const setCurrentDict = useSetAtom(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)
  const setReview = useSetAtom(reviewModeInfoAtom)
  const navigate = useNavigate()
  const reload = useCallback(async () => {
    await loadCustomDictionaries(setCustomDictionaries)
    const { listCustomDictionaries } = await import('./db')
    const entries = await listCustomDictionaries()
    setDictionaries(entries.map(({ dictionary, length }) => ({ ...dictionary, length })))
  }, [setCustomDictionaries])
  useEffect(() => {
    void reload()
  }, [reload])
  const create = async () => {
    const nextName = name.trim()
    if (!nextName) return setMessage('请输入词典名称')
    await createCustomDictionary(nextName)
    setName('')
    setMessage('词典已创建')
    await reload()
  }
  const upload = async (id: string, file: File, mode: 'append' | 'replace') => {
    const workbook = XLSX.read(await file.arrayBuffer())
    const result = parseCustomDictionaryWorkbook(workbook)
    if (result.errors.length || !result.validRows.length) return setMessage(result.errors[0] ?? '没有可导入的有效单词')
    if (mode === 'replace' && !window.confirm('覆盖将清空该词典现有单词，确定继续吗？')) return
    await importCustomDictionaryWords(id, result.validRows, mode)
    setMessage(`已导入 ${result.validRows.length} 个单词${result.invalidRows.length ? `，跳过 ${result.invalidRows.length} 行` : ''}`)
    await reload()
  }
  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl p-10 text-slate-900 dark:text-slate-100">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">我的词典</h1>
          <p className="mt-2 text-sm text-slate-500">导入单词、释义、美式音标和英式音标，按每 20 词自动分章。</p>
        </div>
        <Button onClick={() => navigate('/gallery')}>返回词典选择</Button>
      </div>
      <div className="mb-6 flex gap-3 rounded-xl border p-4">
        <input
          className="flex-1 rounded border bg-transparent px-3"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="词典名称，例如：雅思核心词汇"
        />
        <Button onClick={create}>新建词典</Button>
      </div>
      <div className="mb-6 flex items-center justify-between gap-4 text-sm text-slate-500">
        <p>支持 .xlsx、.xls、.csv；表头必须包含“单词”“释义”“美式音标”“英式音标”，两种音标的内容可留空。重复单词会自动跳过。</p>
        <a className="shrink-0 text-indigo-600 hover:underline" download href={`${import.meta.env.BASE_URL}my-dictionary-template.xlsx`}>
          下载导入模板
        </a>
      </div>
      {message && <p className="mb-4 text-sm text-indigo-500">{message}</p>}
      <div className="space-y-4">
        {dictionaries.map((dictionary) => (
          <div className="rounded-xl border p-5" key={dictionary.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium">{dictionary.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{dictionary.length} 词</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    const next = window.prompt('词典名称', dictionary.name)?.trim()
                    if (next) {
                      await renameCustomDictionary(dictionary.id, next)
                      await reload()
                    }
                  }}
                >
                  改名
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentDict(dictionary.id)
                    setCurrentChapter(0)
                    setReview((old) => ({ ...old, isReviewMode: false }))
                    navigate('/')
                  }}
                >
                  练习
                </Button>
                <label className="cursor-pointer rounded border px-3 py-2 text-sm">
                  新增导入
                  <input
                    hidden
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void upload(dictionary.id, file, 'append')
                    }}
                  />
                </label>
                <label className="cursor-pointer rounded border px-3 py-2 text-sm">
                  覆盖导入
                  <input
                    hidden
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void upload(dictionary.id, file, 'replace')
                    }}
                  />
                </label>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (window.confirm(`删除“${dictionary.name}”及其全部记录？`)) {
                      await deleteCustomDictionary(dictionary.id)
                      await reload()
                    }
                  }}
                >
                  删除
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
