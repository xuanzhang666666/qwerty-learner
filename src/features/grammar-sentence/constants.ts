import type { Dictionary } from '@/typings'

export const GRAMMAR_SENTENCE_DICT_ID = 'grammar-sentence-import'
export const DEFAULT_GRAMMAR_SENTENCE_CATEGORY_NAME = '默认分类'
export const CHINESE_SENTENCE_HEADER = '中文句'
export const ENGLISH_SENTENCE_HEADER = '英文句'

export const grammarSentenceDictionary: Dictionary = {
  id: GRAMMAR_SENTENCE_DICT_ID,
  name: '语法句子练习',
  description: '导入中文句和英文句，按分类练习英文整句拼写',
  category: '语法句子',
  tags: ['语法句子'],
  url: '',
  length: 1,
  language: 'en',
  languageCategory: 'en',
  chapterCount: 1,
}
