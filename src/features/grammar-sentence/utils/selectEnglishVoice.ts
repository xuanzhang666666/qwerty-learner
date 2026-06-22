const preferredVoiceNames = ['samantha', 'daniel', 'karen', 'moira', 'aria', 'jenny', 'google us english', 'google uk english female']

export function selectEnglishVoice(voices: SpeechSynthesisVoice[]) {
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
  return (
    englishVoices.find((voice) => preferredVoiceNames.some((name) => voice.name.toLowerCase().includes(name))) ??
    englishVoices[0] ??
    voices[0]
  )
}
