export const EXPLICIT_SPACE = '␣'

export const CHAPTER_LENGTH = 20

export const DISMISS_START_CARD_DATE_KEY = 'dismissStartCardDate'

export const DONATE_DATE = 'donateDate'

export const CONFETTI_DEFAULTS = {
  colors: ['#5D8C7B', '#F2D091', '#F2A679', '#D9695F', '#8C4646'],
  shapes: ['square'],
  ticks: 500,
} as confetti.Options

export const defaultFontSizeConfig = {
  foreignFont: 48,
  translateFont: 18,
  foreignFontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  translateFontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
}

export const foreignFontFamilyOptions = [
  {
    name: '等宽字体',
    value: defaultFontSizeConfig.foreignFontFamily,
  },
  {
    name: 'Menlo',
    value: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  {
    name: 'Consolas',
    value: 'Consolas, "Liberation Mono", "Courier New", monospace',
  },
  {
    name: 'Courier New',
    value: '"Courier New", Courier, monospace',
  },
  {
    name: '系统无衬线',
    value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  },
  {
    name: 'Arial',
    value: 'Arial, Helvetica, sans-serif',
  },
  {
    name: 'Helvetica',
    value: 'Helvetica, Arial, sans-serif',
  },
  {
    name: '衬线字体',
    value: 'Georgia, "Times New Roman", Times, serif',
  },
  {
    name: 'Georgia',
    value: 'Georgia, "Times New Roman", Times, serif',
  },
  {
    name: 'Times New Roman',
    value: '"Times New Roman", Times, serif',
  },
]

export const translateFontFamilyOptions = [
  {
    name: '系统默认',
    value: defaultFontSizeConfig.translateFontFamily,
  },
  {
    name: '黑体',
    value: '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
  },
  {
    name: '宋体',
    value: 'SimSun, "Songti SC", serif',
  },
  {
    name: '楷体',
    value: 'KaiTi, "Kaiti SC", serif',
  },
]
