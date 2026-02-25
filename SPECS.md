# Bonne Nuit — Spécifications du projet

## Vision

**Bonne Nuit** est une application web qui génère une ambiance sonore en temps réel,
synchronisée avec l'histoire que raconte un parent à son enfant.

Quand le parent dit _"il était une fois une fille qui se balade dans la forêt"_,
l'application joue automatiquement des sons de forêt : oiseaux, vent dans les feuilles,
craquements de branches. Quand l'histoire bascule vers un château, des vagues, ou une
tempête, l'ambiance sonore évolue en douceur.

---

## Utilisateurs cibles

- Parents qui racontent des histoires à leurs enfants le soir
- Enfants de 2 à 10 ans
- Contexte : chambre d'enfant, lumière tamisée, heure du coucher

---

## Fonctionnalités — V1 (prototype)

### 1. Reconnaissance vocale en continu
- Capture du microphone en temps réel via Web Speech API
- Transcription affichée à l'écran pour feedback visuel
- Langue par défaut : français

### 2. Analyse contextuelle par IA
- Envoi du transcript à Claude API à chaque pause naturelle (>1.5s de silence)
- Claude retourne un objet JSON avec :
  - `scene` : décor principal (forêt, château, océan, ville, désert, ciel, maison...)
  - `mood` : ambiance émotionnelle (paisible, aventure, mystère, danger, tristesse, joie)
  - `sounds` : liste de sons à jouer (ex. ["oiseaux", "vent", "craquements"])

### 3. Moteur audio
- Bibliothèque de 15-20 pistes sonores ambiantes (boucles seamless)
- Crossfade progressif (3-4 secondes) entre les ambiances
- Plusieurs sons superposés simultanément (ex. pluie + tonnerre + feu de cheminée)
- Volume ajustable

### 4. Interface
- Design épuré, sombre, adapté au contexte nocturne
- Bouton start/stop microphone
- Indicateur visuel de la scène en cours
- Contrôle du volume global

---

## Architecture technique

```
[Microphone]
     ↓
[Web Speech API] — transcription continue
     ↓
[Détection de pause vocale] — 1.5s de silence = déclencheur
     ↓
[Claude API] — analyse du contexte narratif
     ↓ JSON { scene, mood, sounds }
[Moteur audio Howler.js] — crossfade vers nouvelle ambiance
```

---

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript |
| Reconnaissance vocale | Web Speech API (natif navigateur) |
| IA contextuelle | Claude API (claude-haiku-4-5 pour rapidité) |
| Audio | Howler.js |
| Style | Tailwind CSS |
| Déploiement | Vercel |

---

## Bibliothèque sonore — V1

Ambiances à couvrir en priorité (décors les plus fréquents dans les contes) :

| ID | Scène | Sons inclus |
|----|-------|-------------|
| `foret` | Forêt | oiseaux, vent, feuilles, craquements |
| `chateau` | Château | écho pierre, vent couloir, flammes |
| `ocean` | Océan / Plage | vagues, mouettes, vent marin |
| `nuit` | Nuit / Campagne | grillons, grenouilles, vent doux |
| `tempete` | Tempête | pluie forte, tonnerre, vent violent |
| `maison` | Maison / Intérieur | feu cheminée, horloge, pluie fenêtre |
| `village` | Village / Marché | foule lointaine, cloches, animation |
| `montagne` | Montagne | vent fort, aigle, silence |
| `magie` | Magie / Mystère | sons cristallins, bourdonnement doux |
| `calme` | Neutre / Pause | silence avec légère réverb |

---

## Contraintes UX

- **Pas de transition brusque** : crossfade minimum de 3 secondes
- **Pas de son pendant une pause** : l'ambiance continue en boucle discrète
- **Volume doux par défaut** : ne pas couvrir la voix du parent
- **Mode nuit** : interface sombre, aucun élément lumineux perturbant
- **Pas de compte requis** : aucune inscription, usage immédiat

---

## Phases de développement

### Phase 1 — Prototype web (en cours)
- [ ] Setup Next.js + Tailwind
- [ ] Hook Web Speech API
- [ ] Intégration Claude API
- [ ] Moteur audio Howler.js avec 5 ambiances
- [ ] UI minimale
- [ ] Déploiement Vercel

### Phase 2 — Affinement
- [ ] 15-20 ambiances sonores
- [ ] Meilleure détection des transitions narratives
- [ ] Mode hors-ligne partiel (sons en cache)
- [ ] PWA (installable sur iPhone)

### Phase 3 — Application native (optionnel)
- [ ] React Native / Expo
- [ ] Accès micro natif iOS (meilleure qualité STT)
- [ ] Publication App Store

---

## Ce que ce projet n'est pas (V1)

- Pas un générateur d'histoires (le parent invente, l'app accompagne)
- Pas un lecteur de livres audio
- Pas une application avec compte utilisateur
- Pas un service de streaming musical

---

*Projet démarré le 25 février 2026*
