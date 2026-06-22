import { parseGrammarSentenceWorkbook } from './parseExcel'
import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'

function createWorkbook(rows: Array<Record<string, string>>) {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  return workbook
}

function createWorkbookFromRows(rows: string[][]) {
  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  return workbook
}

describe('parseGrammarSentenceWorkbook', () => {
  it('parses rows with Chinese and English sentence columns', () => {
    const workbook = createWorkbook([{ 中文句: '我的房子在公园旁边。', 英文句: 'My house is beside the park.' }])

    const result = parseGrammarSentenceWorkbook(workbook)

    expect(result.validRows).toEqual([{ chinese: '我的房子在公园旁边。', english: 'My house is beside the park.', rowNumber: 2 }])
    expect(result.invalidRows).toEqual([])
  })

  it('reports missing required headers', () => {
    const workbook = createWorkbook([{ 中文: '我的房子在公园旁边。', 英文: 'My house is beside the park.' }])

    const result = parseGrammarSentenceWorkbook(workbook)

    expect(result.validRows).toEqual([])
    expect(result.errors).toEqual(['Excel 必须包含“中文句”和“英文句”两列表头'])
  })

  it('skips empty rows and reports rows missing required values', () => {
    const workbook = createWorkbook([
      { 中文句: '', 英文句: '' },
      { 中文句: '那只猫在树上吗？', 英文句: '' },
      { 中文句: '', 英文句: 'No, it is not.' },
      { 中文句: '那只猫在树上。', 英文句: 'The cat is in the tree.' },
    ])

    const result = parseGrammarSentenceWorkbook(workbook)

    expect(result.validRows).toEqual([{ chinese: '那只猫在树上。', english: 'The cat is in the tree.', rowNumber: 5 }])
    expect(result.invalidRows).toEqual([
      { rowNumber: 3, reason: '缺少英文句' },
      { rowNumber: 4, reason: '缺少中文句' },
    ])
  })

  it('accepts required headers with extra whitespace', () => {
    const workbook = createWorkbookFromRows([
      [' 中文句 ', ' 英文句 '],
      ['我是一个男孩。', 'I am a boy.'],
    ])

    const result = parseGrammarSentenceWorkbook(workbook)

    expect(result.validRows).toEqual([{ chinese: '我是一个男孩。', english: 'I am a boy.', rowNumber: 2 }])
    expect(result.errors).toEqual([])
  })

  it('parses optional phonetic columns', () => {
    const workbook = createWorkbookFromRows([
      ['中文句', '英文句', '美式音标', '英式音标'],
      ['我是一个男孩。', 'I am a boy.', 'aɪ æm ə bɔɪ', 'aɪ æm ə bɔɪ'],
    ])

    const result = parseGrammarSentenceWorkbook(workbook)

    expect(result.validRows).toEqual([
      {
        chinese: '我是一个男孩。',
        english: 'I am a boy.',
        usphone: 'aɪ æm ə bɔɪ',
        ukphone: 'aɪ æm ə bɔɪ',
        rowNumber: 2,
      },
    ])
  })

  it('parses optional per-word phonetics', () => {
    const workbook = createWorkbookFromRows([
      ['中文句', '英文句', '单词音标'],
      ['他是一名学生。', 'He is a student.', 'He/hiː; is/ɪz; a/ə; student/ˈstuːdnt'],
    ])

    const result = parseGrammarSentenceWorkbook(workbook)

    expect(result.validRows).toEqual([
      {
        chinese: '他是一名学生。',
        english: 'He is a student.',
        wordPhonetics: [
          { word: 'He', phonetic: 'hiː' },
          { word: 'is', phonetic: 'ɪz' },
          { word: 'a', phonetic: 'ə' },
          { word: 'student', phonetic: 'ˈstuːdnt' },
        ],
        rowNumber: 2,
      },
    ])
  })
})
