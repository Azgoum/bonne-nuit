import { useRef, useCallback, useState, useEffect } from 'react'
import { ALL_MUSIQUE_IDS, ALL_SON_IDS } from '../lib/soundLibrary'
import type { MusiqueId, SonId } from '../lib/soundLibrary'

const POLL_INTERVAL = 500        // ms entre chaque vérification
const MUSIC_WINDOW = 400         // chars : contexte global pour la musique
const SOUND_WORD_COUNT = 3       // mots : sujet immédiat pour le son
const SOUND_COOLDOWN = 8000      // ms avant de re-déclencher le même son

export interface LogEntry {
  time: string
  type: 'info' | 'action' | 'error' | 'req' | 'res'
  message: string
}

function timestamp() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function useStoryAnalyzer(
  onSwitchMusic: (id: MusiqueId) => void,
  onTriggerSound: (id: SonId) => void,
  currentMusic: MusiqueId | null,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inFlightRef = useRef(false)
  const transcriptRef = useRef('')
  const currentMusicRef = useRef(currentMusic)

  // Contextes envoyés lors du dernier appel — évite les doublons
  const lastMusicContextRef = useRef('')
  const lastSoundContextRef = useRef('')

  // Anti-répétition des sons ponctuels
  const lastSoundRef = useRef<string | null>(null)
  const lastSoundTimeRef = useRef(0)

  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => { currentMusicRef.current = currentMusic }, [currentMusic])

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev.slice(-49), { time: timestamp(), type, message }])
  }, [])

  const analyze = useCallback(async () => {
    if (inFlightRef.current) return

    const fullTranscript = transcriptRef.current

    // ── Contexte musique : derniers MUSIC_WINDOW caractères ──────────────────
    const musicContext = fullTranscript.slice(-MUSIC_WINDOW)
    const musicChanged = musicContext !== lastMusicContextRef.current && musicContext.trim().length >= 10

    // ── Contexte son : derniers SOUND_WORD_COUNT mots ────────────────────────
    const words = fullTranscript.trim().split(/\s+/).filter(Boolean)
    const soundContext = words.slice(-SOUND_WORD_COUNT).join(' ')
    const soundChanged = soundContext !== lastSoundContextRef.current && words.length >= 2

    if (!musicChanged && !soundChanged) return

    inFlightRef.current = true

    try {
      // ── Log des requêtes avant envoi ────────────────────────────────────────
      if (musicChanged) {
        const preview = musicContext.length > 60 ? '…' + musicContext.slice(-60) : musicContext
        addLog('req', `[music] "${preview}"  (actuel: ${currentMusicRef.current ?? '—'})`)
      }
      if (soundChanged) {
        addLog('req', `[son]   "${soundContext}"`)
      }

      // ── Lancer uniquement les appels nécessaires en parallèle ──────────────
      const [musicRes, soundRes] = await Promise.all([
        musicChanged
          ? fetch('/api/music', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transcript: musicContext, currentMusic: currentMusicRef.current }),
            })
          : Promise.resolve(null),

        soundChanged
          ? fetch('/api/sound', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transcript: soundContext }),
            })
          : Promise.resolve(null),
      ])

      if (musicChanged) lastMusicContextRef.current = musicContext
      if (soundChanged) lastSoundContextRef.current = soundContext

      // ── Résultat musique ────────────────────────────────────────────────────
      if (musicRes) {
        if (musicRes.ok) {
          const { music } = await musicRes.json() as { music: string | null }
          addLog('res', `[music] ${music ?? '(vide)'}`)
          const validMusic = music && ALL_MUSIQUE_IDS.includes(music as MusiqueId) ? music as MusiqueId : null
          if (validMusic && validMusic !== currentMusicRef.current) {
            addLog('action', `musique → ${validMusic}`)
            onSwitchMusic(validMusic)
          }
        } else {
          addLog('error', `musique API ${musicRes.status}`)
        }
      }

      // ── Résultat son ────────────────────────────────────────────────────────
      if (soundRes) {
        if (soundRes.ok) {
          const { son } = await soundRes.json() as { son: string }
          addLog('res', `[son]   ${son ?? '(vide)'}`)
          const validSon = son && ALL_SON_IDS.includes(son as SonId) ? son as SonId : null
          if (validSon) {
            const now = Date.now()
            const tooSoon = validSon === lastSoundRef.current && now - lastSoundTimeRef.current < SOUND_COOLDOWN
            if (!tooSoon) {
              addLog('action', `son : ${validSon}`)
              onTriggerSound(validSon)
              lastSoundRef.current = validSon
              lastSoundTimeRef.current = now
            } else {
              addLog('info', `son ignoré (cooldown) : ${validSon}`)
            }
          }
        } else {
          addLog('error', `son API ${soundRes.status}`)
        }
      }

    } catch (e) {
      addLog('error', `Réseau : ${e}`)
    } finally {
      inFlightRef.current = false
    }
  }, [onSwitchMusic, onTriggerSound, addLog])

  const analyzeRef = useRef(analyze)
  useEffect(() => { analyzeRef.current = analyze }, [analyze])

  const updateTranscript = useCallback((transcript: string) => {
    transcriptRef.current = transcript
  }, [])

  const start = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => analyzeRef.current(), POLL_INTERVAL)
  }, [])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    inFlightRef.current = false
    lastMusicContextRef.current = ''
    lastSoundContextRef.current = ''
    lastSoundRef.current = null
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  return { start, stop, updateTranscript, logs, clearLogs }
}
