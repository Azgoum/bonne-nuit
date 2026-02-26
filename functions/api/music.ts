interface Env {
  CLAUDE_API_KEY: string
}

const CLASSIFIER_SYSTEM = `Tu es un classificateur. On te donne un texte et une liste de mots.
Réponds avec UNIQUEMENT le mot de la liste qui correspond le mieux au texte. Un seul mot. Rien d'autre.`

const MUSIC_LIST =
  'conte-fees(magie,fées,début), foret(bois,arbres,oiseaux), mer(plage,vagues,côte), ' +
  'nuit(nuit,étoiles,lune), pluie(pluie,brume,averse), orage(tempête,foudre,vent violent), ' +
  'cheminee(château intérieur,foyer,feu,auberge), marais(étang,grenouilles,marécage), riviere(ruisseau,cascade)'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const apiKey = env.CLAUDE_API_KEY
  if (!apiKey) return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 })

  const { transcript, currentMusic } = await request.json() as { transcript: string; currentMusic: string | null }

  const userMsg =
    `Texte : "${transcript}"\n` +
    `(musique actuelle : ${currentMusic ?? 'aucune'})\n` +
    `Liste : ${MUSIC_LIST}\n` +
    `Mot le plus proche →`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 32,
      system: CLASSIFIER_SYSTEM,
      messages: [{ role: 'user', content: userMsg }],
    }),
  })

  const data = await response.json() as any
  const text: string = (data.content?.[0]?.text ?? '').trim().toLowerCase()
  const music = text.split(/[\s\n,"'→]+/)[0] || null

  return new Response(JSON.stringify({ music }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}

export const onRequestOptions: PagesFunction = async () => new Response(null, {
  headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
})
