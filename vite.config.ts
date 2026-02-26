import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

function readDevVars(): Record<string, string> {
  const devVarsPath = path.resolve('.dev.vars')
  if (!fs.existsSync(devVarsPath)) return {}
  const vars: Record<string, string> = {}
  for (const line of fs.readFileSync(devVarsPath, 'utf-8').split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) vars[match[1].trim()] = match[2].trim()
  }
  return vars
}

// Système commun : classificateur à choix forcé
const CLASSIFIER_SYSTEM = `Tu es un classificateur. On te donne un texte et une liste de mots.
Réponds avec UNIQUEMENT le mot de la liste qui correspond le mieux au texte. Un seul mot. Rien d'autre.`

// Listes avec associations sémantiques courtes — injectées dans chaque message utilisateur
const MUSIC_LIST =
  'conte-fees(magie,fées,début), foret(bois,arbres,oiseaux), mer(plage,vagues,côte), ' +
  'nuit(nuit,étoiles,lune), pluie(pluie,brume,averse), orage(tempête,foudre,vent violent), ' +
  'cheminee(château intérieur,foyer,feu,auberge), marais(étang,grenouilles,marécage), riviere(ruisseau,cascade)'

const SOUND_LIST =
  'tonnerre(coup de tonnerre,éclair), craquements(branche,escalier,porte qui craque), ' +
  'cloches(cloche,carillon,village), mouettes(cri de mouette,port), ' +
  'sons-magiques(sort,baguette,fée,enchantement), vent-fort(rafale,bourrasque), ' +
  'vent-foret(brise,feuilles qui bruissent), rien(aucun événement sonore ponctuel)'

async function callClaude(apiKey: string, systemPrompt: string, userContent: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 32,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  })
  const data = await response.json() as any
  if (!response.ok) {
    console.error('[claude] API error', response.status, JSON.stringify(data))
    throw new Error(`Claude API ${response.status}: ${data?.error?.message ?? JSON.stringify(data)}`)
  }
  const text = (data.content?.[0]?.text ?? '').trim().toLowerCase()
  console.log(`[claude] ${response.status} → "${text}"`)
  return text
}

function devApiPlugin(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      const vars = readDevVars()
      const apiKey = vars['CLAUDE_API_KEY']
      console.log('[dev-api] clé lue :', apiKey ? `${apiKey.slice(0, 20)}... (${apiKey.length} chars)` : 'MANQUANTE')

      // ── /api/music : retourne { music: MusiqueId } ──────────────────────────
      server.middlewares.use('/api/music', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const { transcript, currentMusic } = JSON.parse(body)
            const userMsg =
              `Texte : "${transcript}"\n` +
              `(musique actuelle : ${currentMusic ?? 'aucune'})\n` +
              `Liste : ${MUSIC_LIST}\n` +
              `Mot le plus proche →`
            const text = await callClaude(apiKey, CLASSIFIER_SYSTEM, userMsg)
            const music = text.split(/[\s\n,"'→]+/)[0] || null
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ music }))
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(e) }))
          }
        })
      })

      // ── /api/sound : retourne { son: SonId | 'rien' } ──────────────────────
      server.middlewares.use('/api/sound', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const { transcript } = JSON.parse(body)
            const userMsg =
              `Texte : "${transcript}"\n` +
              `Liste : ${SOUND_LIST}\n` +
              `Mot le plus proche →`
            const text = await callClaude(apiKey, CLASSIFIER_SYSTEM, userMsg)
            const son = text.split(/[\s\n,"'→]+/)[0] || 'rien'
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ son }))
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(e) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApiPlugin()],
})
