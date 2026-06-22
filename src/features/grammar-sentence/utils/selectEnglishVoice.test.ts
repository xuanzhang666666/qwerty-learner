import { selectEnglishVoice } from './selectEnglishVoice'
import { describe, expect, it } from 'vitest'

describe('selectEnglishVoice', () => {
  it('prefers a natural English voice when available', () => {
    const voice = selectEnglishVoice([
      { name: 'Compact Voice', lang: 'en-US' },
      { name: 'Samantha', lang: 'en-US' },
      { name: 'Mei-Jia', lang: 'zh-TW' },
    ] as SpeechSynthesisVoice[])

    expect(voice?.name).toBe('Samantha')
  })

  it('falls back to any English voice', () => {
    const voice = selectEnglishVoice([
      { name: 'French Voice', lang: 'fr-FR' },
      { name: 'English Voice', lang: 'en-GB' },
    ] as SpeechSynthesisVoice[])

    expect(voice?.name).toBe('English Voice')
  })
})
