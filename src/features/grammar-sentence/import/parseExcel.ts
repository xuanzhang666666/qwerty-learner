import type { GrammarSentenceParseResult } from '../types'
import * as XLSX from 'xlsx'

export function parseGrammarSentenceWorkbook(workbook: XLSX.WorkBook): GrammarSentenceParseResult {
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: '' })
  const headerRowIndex = sheetRows.findIndex((row) => {
    const normalizedHeaders = row.map(normalizeHeader)
    return normalizedHeaders.includes('中文句') && normalizedHeaders.includes('英文句')
  })

  if (headerRowIndex === -1) {
    return { validRows: [], invalidRows: [], errors: ['Excel 必须包含“中文句”和“英文句”两列表头'] }
  }

  const headerRow = sheetRows[headerRowIndex].map(normalizeHeader)
  const chineseColumnIndex = headerRow.indexOf('中文句')
  const englishColumnIndex = headerRow.indexOf('英文句')
  const phoneticColumnIndex = headerRow.indexOf('音标')
  const usphoneColumnIndex = headerRow.indexOf('美式音标')
  const ukphoneColumnIndex = headerRow.indexOf('英式音标')
  const wordPhoneticsColumnIndex = headerRow.indexOf('单词音标')
  const dataRows = sheetRows.slice(headerRowIndex + 1)

  return dataRows.reduce<GrammarSentenceParseResult>(
    (result, row, index) => {
      const chinese = String(row[chineseColumnIndex] ?? '').trim()
      const english = String(row[englishColumnIndex] ?? '').trim()
      const phonetic = phoneticColumnIndex >= 0 ? String(row[phoneticColumnIndex] ?? '').trim() : ''
      const usphone = usphoneColumnIndex >= 0 ? String(row[usphoneColumnIndex] ?? '').trim() : phonetic
      const ukphone = ukphoneColumnIndex >= 0 ? String(row[ukphoneColumnIndex] ?? '').trim() : phonetic
      const wordPhoneticsText = wordPhoneticsColumnIndex >= 0 ? String(row[wordPhoneticsColumnIndex] ?? '').trim() : ''
      const wordPhonetics = parseWordPhonetics(wordPhoneticsText)
      const rowNumber = headerRowIndex + index + 2

      if (!chinese && !english) return result

      if (!chinese) {
        result.invalidRows.push({ rowNumber, reason: '缺少中文句' })
        return result
      }

      if (!english) {
        result.invalidRows.push({ rowNumber, reason: '缺少英文句' })
        return result
      }

      result.validRows.push({
        chinese,
        english,
        ...(usphone ? { usphone } : {}),
        ...(ukphone ? { ukphone } : {}),
        ...(wordPhonetics.length > 0 ? { wordPhonetics } : {}),
        rowNumber,
      })

      return result
    },
    { validRows: [], invalidRows: [], errors: [] },
  )
}

function parseWordPhonetics(value: string) {
  if (!value) return []

  return value
    .split(/[;；]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const separatorIndex = item.indexOf('/')
      if (separatorIndex === -1) return null

      const word = item.slice(0, separatorIndex).trim()
      const phonetic = item.slice(separatorIndex + 1).trim()
      if (!word || !phonetic) return null

      return { word, phonetic }
    })
    .filter((item): item is { word: string; phonetic: string } => item !== null)
}

function normalizeHeader(value: unknown) {
  return String(value ?? '')
    .replace(/^\uFEFF/, '')
    .trim()
}
