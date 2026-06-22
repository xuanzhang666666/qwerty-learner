import { GRAMMAR_SENTENCE_DICT_ID } from '../constants'
import {
  createGrammarSentenceCategory,
  createGrammarSentenceChapter,
  createGrammarSentenceRecord,
  deleteGrammarSentenceCategory,
  deleteGrammarSentenceChapter,
  deleteGrammarSentenceRecord,
  listGrammarSentenceCategoriesWithChapters,
  updateGrammarSentenceCategoryName,
  updateGrammarSentenceChapterName,
  updateGrammarSentenceRecord,
} from '../db'
import { currentGrammarSentenceCategoryIdAtom, currentGrammarSentenceChapterIdAtom } from '../store'
import type { GrammarSentenceCategoryWithCount } from '../types'
import { ImportDialog } from './ImportDialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { currentChapterAtom, currentDictIdAtom } from '@/store'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function GrammarSentenceCategoryList() {
  const [categories, setCategories] = useState<GrammarSentenceCategoryWithCount[]>([])
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [chapterNames, setChapterNames] = useState<Record<number, string>>({})
  const [editingName, setEditingName] = useState<{ type: 'category' | 'chapter'; id: number; name: string } | null>(null)
  const [editingRecord, setEditingRecord] = useState<
    | { mode: 'create'; chapterId: number; english: string; chinese: string }
    | { mode: 'update'; id: number; english: string; chinese: string }
    | null
  >(null)
  const [error, setError] = useState('')
  const setCurrentDictId = useSetAtom(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)
  const setCurrentGrammarSentenceCategoryId = useSetAtom(currentGrammarSentenceCategoryIdAtom)
  const setCurrentGrammarSentenceChapterId = useSetAtom(currentGrammarSentenceChapterIdAtom)
  const navigate = useNavigate()

  const reloadCategories = useCallback(async () => {
    const nextCategories = await listGrammarSentenceCategoriesWithChapters()
    setCategories(nextCategories)
    setExpandedCategoryId((oldId) => (nextCategories.some((category) => category.id === oldId) ? oldId : nextCategories[0]?.id ?? null))
  }, [])

  useEffect(() => {
    reloadCategories()
  }, [reloadCategories])

  const onCreateCategory = async () => {
    const nextName = categoryName.trim()
    if (!nextName) {
      setError('请输入分类名称')
      return
    }

    const categoryId = await createGrammarSentenceCategory(nextName)
    setExpandedCategoryId(categoryId)
    setCategoryName('')
    setError('')
    await reloadCategories()
  }

  const onCreateChapter = async (categoryId: number) => {
    const nextName = chapterNames[categoryId]?.trim()
    if (!nextName) {
      setError('请输入章节名称')
      return
    }

    await createGrammarSentenceChapter(categoryId, nextName)
    setChapterNames((old) => ({ ...old, [categoryId]: '' }))
    setError('')
    await reloadCategories()
  }

  const onRenameCategory = async (category: GrammarSentenceCategoryWithCount) => {
    setEditingName({ type: 'category', id: category.id, name: category.name })
  }

  const onDeleteCategory = async (category: GrammarSentenceCategoryWithCount) => {
    const confirmed = window.confirm(`确定删除分类“${category.name}”吗？该分类下的章节和句子都会删除。`)
    if (!confirmed) return

    await deleteGrammarSentenceCategory(category.id)
    setCurrentGrammarSentenceCategoryId(null)
    setCurrentGrammarSentenceChapterId(null)
    await reloadCategories()
  }

  const onRenameChapter = async (chapterId: number, chapterName: string) => {
    setEditingName({ type: 'chapter', id: chapterId, name: chapterName })
  }

  const onSaveEditingName = async () => {
    const nextName = editingName?.name.trim()
    if (!editingName || !nextName) return

    if (editingName.type === 'category') {
      await updateGrammarSentenceCategoryName(editingName.id, nextName)
    } else {
      await updateGrammarSentenceChapterName(editingName.id, nextName)
    }
    setEditingName(null)
    await reloadCategories()
  }

  const onDeleteChapter = async (chapterId: number, chapterName: string) => {
    const confirmed = window.confirm(`确定删除章节“${chapterName}”吗？该章节下的句子都会删除。`)
    if (!confirmed) return

    await deleteGrammarSentenceChapter(chapterId)
    setCurrentGrammarSentenceChapterId(null)
    await reloadCategories()
  }

  const onCreateRecord = async (chapterId: number) => {
    setEditingRecord({ mode: 'create', chapterId, english: '', chinese: '' })
  }

  const onOpenUpdateRecord = (recordId: number, english: string, chinese: string) => {
    setEditingRecord({ mode: 'update', id: recordId, english, chinese })
  }

  const onSaveEditingRecord = async () => {
    const nextEnglish = editingRecord?.english.trim()
    const nextChinese = editingRecord?.chinese.trim()
    if (!editingRecord || !nextEnglish || !nextChinese) return

    if (editingRecord.mode === 'create') {
      await createGrammarSentenceRecord(editingRecord.chapterId, { english: nextEnglish, chinese: nextChinese })
    } else {
      await updateGrammarSentenceRecord(editingRecord.id, { english: nextEnglish, chinese: nextChinese })
      setCategories((oldCategories) =>
        oldCategories.map((category) => ({
          ...category,
          chapters: category.chapters.map((chapter) => ({
            ...chapter,
            records: chapter.records.map((record) =>
              record.id === editingRecord.id ? { ...record, english: nextEnglish, chinese: nextChinese, updatedAt: Date.now() } : record,
            ),
          })),
        })),
      )
    }
    setEditingRecord(null)
    await reloadCategories()
  }

  const onDeleteRecord = async (recordId: number, english: string) => {
    const confirmed = window.confirm(`确定删除句子“${english}”吗？`)
    if (!confirmed) return

    await deleteGrammarSentenceRecord(recordId)
    await reloadCategories()
  }

  const onStartPractice = (category: GrammarSentenceCategoryWithCount, chapterId: number) => {
    setCurrentGrammarSentenceCategoryId(category.id)
    setCurrentGrammarSentenceChapterId(chapterId)
    setCurrentDictId(GRAMMAR_SENTENCE_DICT_ID)
    setCurrentChapter(0)
    navigate('/')
  }

  return (
    <div className="w-[88rem] max-w-full text-slate-900">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Grammar Sentence Editor</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">语法句子练习</h1>
            <p className="mt-2 text-sm text-slate-500">按分类和章节维护中英文句子，导入后进入拼写练习。</p>
          </div>
          <div className="flex min-w-0 flex-1 gap-2 lg:max-w-xl">
            <input
              className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="新建分类，例如：方位介词"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
            />
            <Button
              type="button"
              className="h-10 rounded-lg bg-indigo-600 px-4 text-white shadow-sm hover:bg-indigo-500"
              onClick={onCreateCategory}
            >
              新建分类
            </Button>
          </div>
        </div>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-5">
        {categories.map((category) => (
          <section key={category.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl font-semibold tracking-tight text-slate-950">{category.name}</h2>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                      {category.chapters.length} 章
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                      {category.sentenceCount} 句
                    </span>
                  </div>
                  {expandedCategoryId === category.id && (
                    <div className="flex max-w-xl gap-2">
                      <input
                        className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="新建章节，例如：第 1 章 方位介词"
                        value={chapterNames[category.id] ?? ''}
                        onChange={(event) => setChapterNames((old) => ({ ...old, [category.id]: event.target.value }))}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-lg bg-indigo-600 px-3 text-white shadow-sm hover:bg-indigo-500"
                        onClick={() => onCreateChapter(category.id)}
                      >
                        新建章节
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                    onClick={() => setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)}
                  >
                    {expandedCategoryId === category.id ? '折叠' : '展开'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                    onClick={() => onRenameCategory(category)}
                  >
                    修改分类
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => onDeleteCategory(category)}
                  >
                    删除分类
                  </Button>
                </div>
              </div>
            </div>

            {expandedCategoryId === category.id && (
              <div className="space-y-4 bg-slate-50 p-4">
                {category.chapters.length > 0 ? (
                  category.chapters.map((chapter) => (
                    <article
                      key={chapter.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                    >
                      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">{chapter.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{chapter.sentenceCount} 条练习句</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <ImportDialog chapterId={chapter.id} sentenceCount={chapter.sentenceCount} onImported={reloadCategories} />
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                            onClick={() => onCreateRecord(chapter.id)}
                          >
                            新增句子
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                            onClick={() => onRenameChapter(chapter.id, chapter.name)}
                          >
                            修改章节
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                            onClick={() => onDeleteChapter(chapter.id, chapter.name)}
                          >
                            删除章节
                          </Button>
                        </div>
                      </div>

                      {chapter.records.length > 0 ? (
                        <div className="mb-4 max-h-[28rem] overflow-y-auto pr-1">
                          <div className="space-y-2">
                            {chapter.records.map((record, index) => (
                              <div
                                key={record.id ?? `${record.english}-${index}`}
                                className="grid gap-2 rounded-xl border border-slate-200 bg-white p-2 transition hover:border-slate-300 hover:shadow-sm xl:grid-cols-[1fr_1fr_7rem]"
                              >
                                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                  <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                    <span>EN</span>
                                    <span>#{index + 1}</span>
                                  </div>
                                  <p className="max-h-12 overflow-y-auto pr-1 text-sm font-semibold leading-6 text-slate-950">
                                    {record.english}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                  <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">CN</div>
                                  <p className="max-h-12 overflow-y-auto pr-1 text-sm leading-6 text-slate-600">{record.chinese}</p>
                                </div>
                                {record.id !== undefined && (
                                  <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
                                    <Button
                                      type="button"
                                      size="sm"
                                      className="h-full min-h-[2.25rem] rounded-lg bg-indigo-600 px-2 text-xs text-white shadow-sm hover:bg-indigo-500"
                                      onClick={() => onOpenUpdateRecord(record.id as number, record.english, record.chinese)}
                                    >
                                      修改
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      className="h-full min-h-[2.25rem] rounded-lg bg-red-50 px-2 text-xs text-red-600 hover:bg-red-100"
                                      onClick={() => onDeleteRecord(record.id as number, record.english)}
                                    >
                                      删除
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                          这里还没有句子，可以导入 Excel，也可以手动新增一句。
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          disabled={chapter.sentenceCount === 0}
                          type="button"
                          className="rounded-lg bg-indigo-600 px-4 text-white shadow-sm hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400"
                          onClick={() => onStartPractice(category, chapter.id)}
                        >
                          开始练习
                        </Button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                    先创建章节，再在章节下导入 Excel 或手动新增句子。
                  </div>
                )}
              </div>
            )}
          </section>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
          先新建一个分类，再开始整理语法书里的句子。
        </div>
      )}

      <Dialog open={editingName !== null} onOpenChange={(open) => !open && setEditingName(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingName?.type === 'category' ? '修改分类名称' : '修改章节名称'}</DialogTitle>
            <DialogDescription>{editingName?.type === 'category' ? '保存后会更新分类标题。' : '保存后会更新章节标题。'}</DialogDescription>
          </DialogHeader>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">名称</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              value={editingName?.name ?? ''}
              onChange={(event) => setEditingName((old) => (old ? { ...old, name: event.target.value } : old))}
            />
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              onClick={() => setEditingName(null)}
            >
              取消
            </Button>
            <Button type="button" className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-500" onClick={onSaveEditingName}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editingRecord !== null} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRecord?.mode === 'create' ? '新增句子' : '修改句子'}</DialogTitle>
            <DialogDescription>
              {editingRecord?.mode === 'create'
                ? '输入英文句和中文句，保存后会加入当前章节。'
                : '同时编辑英文句和中文句，保存后会立即更新当前列表。'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">英文句</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                value={editingRecord?.english ?? ''}
                onChange={(event) => setEditingRecord((old) => (old ? { ...old, english: event.target.value } : old))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">中文句</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                value={editingRecord?.chinese ?? ''}
                onChange={(event) => setEditingRecord((old) => (old ? { ...old, chinese: event.target.value } : old))}
              />
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              onClick={() => setEditingRecord(null)}
            >
              取消
            </Button>
            <Button type="button" className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-500" onClick={onSaveEditingRecord}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
