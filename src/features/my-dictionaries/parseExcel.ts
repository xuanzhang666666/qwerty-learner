import type { CustomDictionaryImportResult } from './types'
import * as XLSX from 'xlsx'

export function parseCustomDictionaryWorkbook(workbook: XLSX.WorkBook): CustomDictionaryImportResult {
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })
  const headerIndex = rows.findIndex(
    (row) => row.map((value) => String(value).trim()).includes('单词') && row.map((value) => String(value).trim()).includes('释义'),
  )
  if (headerIndex < 0) return { validRows: [], invalidRows: [], errors: ['文件必须包含“单词”和“释义”列表头'] }
  const header = rows[headerIndex].map((value) => String(value).trim())
  const wordIndex = header.indexOf('单词')
  const translationIndex = header.indexOf('释义')
  const usphoneIndex = header.indexOf('美式音标')
  const ukphoneIndex = header.indexOf('英式音标')
  if (usphoneIndex < 0 || ukphoneIndex < 0) return { validRows: [], invalidRows: [], errors: ['文件必须包含“美式音标”和“英式音标”列表头'] }
  const names = new Set<string>()
  return rows.slice(headerIndex + 1).reduce<CustomDictionaryImportResult>(
    (result, row, index) => {
      const name = String(row[wordIndex] ?? '').trim()
      const translation = String(row[translationIndex] ?? '').trim()
      const usphone = String(row[usphoneIndex] ?? '').trim()
      const ukphone = String(row[ukphoneIndex] ?? '').trim()
      const rowNumber = headerIndex + index + 2
      if (!name && !translation) return result
      const normalizedName = name.toLowerCase()
      if (!name) result.invalidRows.push({ rowNumber, reason: '缺少单词' })
      else if (!translation) result.invalidRows.push({ rowNumber, reason: '缺少释义' })
      else if (names.has(normalizedName)) result.invalidRows.push({ rowNumber, reason: '重复单词' })
      else {
        names.add(normalizedName)
        result.validRows.push({
          name,
          trans: translation
            .split(/[；;]/)
            .map((item) => item.trim())
            .filter(Boolean),
          usphone,
          ukphone,
          rowNumber,
        })
      }
      return result
    },
    { validRows: [], invalidRows: [], errors: [] },
  )
}
