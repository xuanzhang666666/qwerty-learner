import { parseCustomDictionaryWorkbook } from './parseExcel'
import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'

describe('parseCustomDictionaryWorkbook', () => {
  it('parses required fields and skips duplicate or invalid rows', () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['单词', '释义', '美式音标', '英式音标'],
      ['secret', '秘密；保密的', "'si:krət", "'si:krɪt"],
      ['SECRET', '重复', '', ''],
      ['', '缺少单词', '', ''],
      ['empty-phonetic', '音标可为空', '', ''],
    ])
    const result = parseCustomDictionaryWorkbook({ SheetNames: ['Sheet1'], Sheets: { Sheet1: sheet } } as XLSX.WorkBook)
    expect(result.validRows).toEqual([
      { name: 'secret', trans: ['秘密', '保密的'], usphone: "'si:krət", ukphone: "'si:krɪt", rowNumber: 2 },
      { name: 'empty-phonetic', trans: ['音标可为空'], usphone: '', ukphone: '', rowNumber: 5 },
    ])
    expect(result.invalidRows).toHaveLength(2)
  })
})
