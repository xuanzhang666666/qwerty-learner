import { importGrammarSentenceRows } from '../db'
import { parseGrammarSentenceWorkbook } from '../import/parseExcel'
import type { GrammarSentenceImportMode, GrammarSentenceParseResult } from '../types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type React from 'react'
import { useState } from 'react'
import * as XLSX from 'xlsx'

type ImportDialogProps = {
  chapterId: number
  sentenceCount: number
  onImported: () => void
}

export function ImportDialog({ chapterId, sentenceCount, onImported }: ImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<GrammarSentenceImportMode>('append')
  const [parseResult, setParseResult] = useState<GrammarSentenceParseResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    setParseResult(parseGrammarSentenceWorkbook(workbook))
  }

  const onConfirm = async () => {
    if (!parseResult || parseResult.validRows.length === 0) return

    if (mode === 'replace' && sentenceCount > 0) {
      const confirmed = window.confirm(`将删除当前分类下已有 ${sentenceCount} 条句子，确定覆盖吗？`)
      if (!confirmed) return
    }

    setIsImporting(true)
    setError('')
    try {
      await importGrammarSentenceRows(chapterId, parseResult.validRows, mode)
      onImported()
      setParseResult(null)
      setOpen(false)
    } catch {
      setError('导入失败，请检查 Excel 文件后重试')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-500">
          导入 Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>导入语法句子</DialogTitle>
          <DialogDescription>Excel 需要包含“中文句”和“英文句”两列表头。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
          <label className="block">
            <span className="mb-1 block">导入模式</span>
            <select
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              value={mode}
              onChange={(event) => setMode(event.target.value as GrammarSentenceImportMode)}
            >
              <option value="append">新增</option>
              <option value="replace">覆盖</option>
            </select>
          </label>

          <input accept=".xlsx,.xls,.csv" className="block w-full" type="file" onChange={onFileChange} />

          {parseResult && (
            <div className="rounded bg-gray-100 p-3 dark:bg-gray-800">
              <p>有效行：{parseResult.validRows.length}</p>
              <p>无效行：{parseResult.invalidRows.length}</p>
              {parseResult.errors.map((item) => (
                <p key={item} className="text-red-500">
                  {item}
                </p>
              ))}
              {parseResult.invalidRows.slice(0, 5).map((row) => (
                <p key={`${row.rowNumber}-${row.reason}`} className="text-red-500">
                  第 {row.rowNumber} 行：{row.reason}
                </p>
              ))}
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex justify-end">
            <Button disabled={!parseResult || parseResult.validRows.length === 0 || isImporting} type="button" onClick={onConfirm}>
              {isImporting ? '导入中...' : '确认导入'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
