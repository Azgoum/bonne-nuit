import { useEffect, useCallback, useRef } from 'react'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { useAudioEngine } from './hooks/useAudioEngine'
import { useStoryAnalyzer } from './hooks/useStoryAnalyzer'
import { MUSIQUES, SONS, DEFAULT_MUSIC } from './lib/soundLibrary'

export default function App() {
  const { transcript, isListening, isSupported, start: startSpeech, stop: stopSpeech } =
    useSpeechRecognition()

  const { currentMusic, masterVolume, switchMusic, triggerSound, stopAll, changeMasterVolume } =
    useAudioEngine()

  const { start: startAnalyzer, stop: stopAnalyzer, updateTranscript, logs, clearLogs } =
    useStoryAnalyzer(switchMusic, triggerSound, currentMusic)

  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    updateTranscript(transcript)
  }, [transcript, updateTranscript])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleStart = useCallback(() => {
    clearLogs()
    switchMusic(DEFAULT_MUSIC)
    startSpeech()
    startAnalyzer()
  }, [clearLogs, switchMusic, startSpeech, startAnalyzer])

  const handleStop = useCallback(() => {
    stopSpeech()
    stopAnalyzer()
    stopAll()
  }, [stopSpeech, stopAnalyzer, stopAll])

  if (!isSupported) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', color: 'white', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280', textAlign: 'center' }}>Reconnaissance vocale non supportée.<br />Utilise Chrome ou Edge.</p>
      </div>
    )
  }

  const musicLabel = currentMusic ? MUSIQUES[currentMusic]?.label : null

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: 'white', fontFamily: 'system-ui, sans-serif', maxWidth: '640px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      <div style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.3em', color: '#e2e8f0', margin: 0 }}>BONNE NUIT</h1>
        <p style={{ color: '#4b5563', fontSize: '0.7rem', letterSpacing: '0.15em', marginTop: '0.25rem' }}>ambiance sonore · histoires du soir</p>
      </div>

      {/* Controls */}
      <div style={{ background: '#111827', borderRadius: '1rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={isListening ? handleStop : handleStart}
            style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', flexShrink: 0, border: `2px solid ${isListening ? '#7f1d1d' : '#4b5563'}`, background: isListening ? '#1c0a0a' : '#1f2937', color: isListening ? '#f87171' : '#d1d5db', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            {isListening ? '⏹' : '🎙'}
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: isListening ? '#4ade80' : '#374151' }} />
              <span style={{ fontSize: '0.875rem', color: '#d1d5db' }}>{isListening ? 'En écoute…' : 'Arrêté'}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: 0 }}>{isListening ? 'Raconte ton histoire' : 'Appuie sur le micro pour commencer'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#4b5563', fontSize: '0.75rem' }}>🔈</span>
          <input type="range" min={0} max={1} step={0.05} value={masterVolume} onChange={e => changeMasterVolume(Number(e.target.value))} style={{ flex: 1, accentColor: '#9ca3af' }} />
          <span style={{ color: '#4b5563', fontSize: '0.75rem' }}>🔊</span>
          <span style={{ color: '#6b7280', fontSize: '0.75rem', minWidth: '2.5rem', textAlign: 'right' }}>{Math.round(masterVolume * 100)}%</span>
        </div>
      </div>

      {/* Current music */}
      <div style={{ background: '#111827', borderRadius: '1rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#4b5563', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Musique</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: currentMusic ? '#818cf8' : '#374151', flexShrink: 0 }} />
          {musicLabel
            ? <span style={{ color: '#a5b4fc', fontSize: '0.875rem' }}>{musicLabel}</span>
            : <span style={{ color: '#374151', fontStyle: 'italic', fontSize: '0.875rem' }}>—</span>
          }
        </div>
        {/* Music grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
          {Object.values(MUSIQUES).map(m => (
            <span
              key={m.id}
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: currentMusic === m.id ? '#312e81' : '#1f2937',
                border: `1px solid ${currentMusic === m.id ? '#4338ca' : '#374151'}`,
                color: currentMusic === m.id ? '#c7d2fe' : '#6b7280',
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
              onClick={() => switchMusic(m.id)}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Sons ponctuels */}
      <div style={{ background: '#111827', borderRadius: '1rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#4b5563', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Sons ponctuels</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {Object.values(SONS).map(s => (
            <span
              key={s.id}
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: '#1f2937',
                border: '1px solid #374151',
                color: '#9ca3af',
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
              onClick={() => triggerSound(s.id)}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Transcript */}
      <div style={{ background: '#111827', borderRadius: '1rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#4b5563', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Transcription</div>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, minHeight: '2.5rem' }}>
          {transcript || <span style={{ color: '#374151', fontStyle: 'italic' }}>En attente…</span>}
        </p>
      </div>

      {/* Log */}
      <div style={{ background: '#111827', borderRadius: '1rem', padding: '1.25rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#4b5563', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Journal</div>
          {logs.length > 0 && <button onClick={clearLogs} style={{ fontSize: '0.7rem', color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer' }}>Effacer</button>}
        </div>
        <div style={{ height: '12rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {logs.length === 0
            ? <span style={{ color: '#374151', fontStyle: 'italic' }}>Les événements apparaîtront ici…</span>
            : logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                  <span style={{ color: '#374151', flexShrink: 0 }}>{log.time}</span>
                  <span style={{
                    color: log.type === 'action' ? '#4ade80'
                         : log.type === 'error'  ? '#f87171'
                         : log.type === 'req'    ? '#60a5fa'
                         : log.type === 'res'    ? '#f59e0b'
                         : '#6b7280'
                  }}>
                    {log.type === 'action' ? '▶ '
                   : log.type === 'error'  ? '✗ '
                   : log.type === 'req'    ? '→ '
                   : log.type === 'res'    ? '← '
                   : '· '}{log.message}
                  </span>
                </div>
              ))
          }
          <div ref={logsEndRef} />
        </div>
      </div>

    </div>
  )
}
