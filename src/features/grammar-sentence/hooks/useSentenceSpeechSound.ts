import { selectEnglishVoice } from '../utils/selectEnglishVoice'
import { pronunciationConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'

function loadEnglishVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const voices = synth.getVoices()
  if (voices.length > 0) return Promise.resolve(voices)

  // Chrome 首次同步调用 getVoices() 常返回空，需要等待 voiceschanged 事件
  return new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      synth.removeEventListener('voiceschanged', finish)
      resolve(synth.getVoices())
    }
    synth.addEventListener('voiceschanged', finish)
    setTimeout(finish, 1000)
  })
}

export function useSentenceSpeechSound(text: string) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const [isPlaying, setIsPlaying] = useState(false)
  const keepAliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearKeepAlive = useCallback(() => {
    if (keepAliveTimerRef.current !== null) {
      clearInterval(keepAliveTimerRef.current)
      keepAliveTimerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearKeepAlive()
    window.speechSynthesis?.cancel()
    setIsPlaying(false)
  }, [clearKeepAlive])

  const play = useCallback(async () => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return

    const synth = window.speechSynthesis
    clearKeepAlive()
    synth.cancel()

    const voices = await loadEnglishVoices(synth)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = pronunciationConfig.type === 'uk' ? 'en-GB' : 'en-US'
    utterance.volume = pronunciationConfig.volume
    utterance.rate = pronunciationConfig.rate
    const voice = selectEnglishVoice(voices)
    if (voice) utterance.voice = voice

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => {
      clearKeepAlive()
      setIsPlaying(false)
    }
    utterance.onerror = () => {
      clearKeepAlive()
      setIsPlaying(false)
    }

    // Chrome bug：cancel() 后同步 speak() 可能不发声；放到下一个任务里再 speak 可规避竞态
    setTimeout(() => {
      synth.speak(utterance)
      // Chrome bug：cancel() 会让引擎进入 paused 状态，需要 resume() 才会真正发声
      synth.resume()

      // Chrome bug：超过约 15s 的语音会被截断，定期 resume 保活
      clearKeepAlive()
      keepAliveTimerRef.current = setInterval(() => {
        if (!synth.speaking) {
          clearKeepAlive()
          return
        }
        synth.pause()
        synth.resume()
      }, 10000)
    }, 0)
  }, [clearKeepAlive, pronunciationConfig.rate, pronunciationConfig.type, pronunciationConfig.volume, text])

  useEffect(() => clearKeepAlive, [clearKeepAlive])

  return { play, stop, isPlaying }
}
