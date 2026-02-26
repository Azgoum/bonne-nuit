import { useEffect, useRef, useState, useCallback } from 'react'

interface UseSpeechRecognitionReturn {
  transcript: string
  isListening: boolean
  isSupported: boolean
  start: () => void
  stop: () => void
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef('')

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null

  const isSupported = !!SpeechRecognitionAPI

  const start = useCallback(() => {
    if (!SpeechRecognitionAPI || isListening) return

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      let interim = ''
      let newFinal = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          newFinal += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }

      if (newFinal) {
        finalTranscriptRef.current += newFinal
        // Keep only last ~200 chars to avoid sending huge context
        if (finalTranscriptRef.current.length > 500) {
          finalTranscriptRef.current = finalTranscriptRef.current.slice(-500)
        }
      }

      setTranscript(finalTranscriptRef.current + interim)
    }

    recognition.onend = () => {
      // Auto-restart to keep listening continuously
      if (recognitionRef.current) {
        try { recognition.start() } catch {}
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setIsListening(false)
        recognitionRef.current = null
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [SpeechRecognitionAPI, isListening])

  const stop = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.onend = null
    recognitionRef.current.stop()
    recognitionRef.current = null
    setIsListening(false)
    finalTranscriptRef.current = ''
    setTranscript('')
  }, [])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      }
    }
  }, [])

  return { transcript, isListening, isSupported, start, stop }
}
