import { useRef, useState, useCallback } from 'react'
import { Howl } from 'howler'
import { MUSIQUES, SONS } from '../lib/soundLibrary'
import type { MusiqueId, SonId } from '../lib/soundLibrary'

const FADE_DURATION = 3000 // ms

export function useAudioEngine() {
  const musicHowlRef = useRef<Howl | null>(null)
  const currentMusicIdRef = useRef<MusiqueId | null>(null)
  const [currentMusic, setCurrentMusic] = useState<MusiqueId | null>(null)
  const [masterVolume, setMasterVolume] = useState(0.7)
  const masterVolumeRef = useRef(0.7)

  const switchMusic = useCallback((id: MusiqueId) => {
    if (currentMusicIdRef.current === id) return

    const def = MUSIQUES[id]
    if (!def) return

    // Fade out and unload old music
    if (musicHowlRef.current) {
      const old = musicHowlRef.current
      old.fade(old.volume() as number, 0, FADE_DURATION)
      setTimeout(() => { old.stop(); old.unload() }, FADE_DURATION + 100)
    }

    // Fade in new music
    const howl = new Howl({
      src: [def.file],
      loop: true,
      volume: 0,
      html5: true,
    })
    howl.play()
    howl.fade(0, def.volume * masterVolumeRef.current, FADE_DURATION)

    musicHowlRef.current = howl
    currentMusicIdRef.current = id
    setCurrentMusic(id)
  }, [])

  const triggerSound = useCallback((id: SonId) => {
    const def = SONS[id]
    if (!def) return

    const howl = new Howl({
      src: [def.file],
      loop: false,
      volume: def.volume * masterVolumeRef.current,
      html5: true,
    })
    howl.play()
    howl.once('end', () => howl.unload())
  }, [])

  const stopAll = useCallback(() => {
    if (musicHowlRef.current) {
      const old = musicHowlRef.current
      old.fade(old.volume() as number, 0, 1000)
      setTimeout(() => { old.stop(); old.unload() }, 1100)
      musicHowlRef.current = null
    }
    currentMusicIdRef.current = null
    setCurrentMusic(null)
  }, [])

  const changeMasterVolume = useCallback((volume: number) => {
    masterVolumeRef.current = volume
    setMasterVolume(volume)
    if (musicHowlRef.current && currentMusicIdRef.current) {
      const def = MUSIQUES[currentMusicIdRef.current]
      musicHowlRef.current.volume(def.volume * volume)
    }
  }, [])

  return { currentMusic, masterVolume, switchMusic, triggerSound, stopAll, changeMasterVolume }
}
