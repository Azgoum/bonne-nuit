export type MusiqueId =
  | 'conte-fees'
  | 'foret'
  | 'mer'
  | 'nuit'
  | 'pluie'
  | 'orage'
  | 'cheminee'
  | 'marais'
  | 'riviere'

export type SonId =
  | 'tonnerre'
  | 'craquements'
  | 'cloches'
  | 'mouettes'
  | 'sons-magiques'
  | 'vent-fort'
  | 'vent-foret'

export interface MusiqueDef {
  id: MusiqueId
  label: string
  file: string
  volume: number
}

export interface SonDef {
  id: SonId
  label: string
  file: string
  volume: number
}

export const MUSIQUES: Record<MusiqueId, MusiqueDef> = {
  'conte-fees': { id: 'conte-fees', label: 'Conte de fées',  file: '/sounds/conte-fees.mp3',   volume: 0.5 },
  'foret':      { id: 'foret',      label: 'Forêt',          file: '/sounds/oiseaux.mp3',       volume: 0.6 },
  'mer':        { id: 'mer',        label: 'Bord de mer',    file: '/sounds/vagues.mp3',        volume: 0.6 },
  'nuit':       { id: 'nuit',       label: 'Nuit',           file: '/sounds/grillons.mp3',      volume: 0.5 },
  'pluie':      { id: 'pluie',      label: 'Pluie',          file: '/sounds/pluie-douce.mp3',   volume: 0.5 },
  'orage':      { id: 'orage',      label: 'Orage',          file: '/sounds/pluie-forte.mp3',   volume: 0.6 },
  'cheminee':   { id: 'cheminee',   label: 'Cheminée',       file: '/sounds/feu-cheminee.mp3',  volume: 0.5 },
  'marais':     { id: 'marais',     label: 'Marais',         file: '/sounds/grenouilles.mp3',   volume: 0.4 },
  'riviere':    { id: 'riviere',    label: 'Rivière',        file: '/sounds/riviere.mp3',       volume: 0.5 },
}

export const SONS: Record<SonId, SonDef> = {
  'tonnerre':      { id: 'tonnerre',      label: 'Tonnerre',    file: '/sounds/tonnerre.mp3',      volume: 0.8 },
  'craquements':   { id: 'craquements',   label: 'Craquements', file: '/sounds/craquements.mp3',   volume: 0.7 },
  'cloches':       { id: 'cloches',       label: 'Cloches',     file: '/sounds/cloches.mp3',       volume: 0.5 },
  'mouettes':      { id: 'mouettes',      label: 'Mouettes',    file: '/sounds/mouettes.mp3',      volume: 0.5 },
  'sons-magiques': { id: 'sons-magiques', label: 'Magie',       file: '/sounds/sons-magiques.mp3', volume: 0.6 },
  'vent-fort':     { id: 'vent-fort',     label: 'Vent fort',   file: '/sounds/vent-fort.mp3',     volume: 0.5 },
  'vent-foret':    { id: 'vent-foret',    label: 'Vent forêt',  file: '/sounds/vent-foret.mp3',    volume: 0.4 },
}

export const DEFAULT_MUSIC: MusiqueId = 'conte-fees'

export const ALL_MUSIQUE_IDS = Object.keys(MUSIQUES) as MusiqueId[]
export const ALL_SON_IDS = Object.keys(SONS) as SonId[]
