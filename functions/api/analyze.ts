interface Env {
  CLAUDE_API_KEY: string
}

interface AnalyzeRequest {
  transcript: string
  currentMusic: string | null
}

const SYSTEM_PROMPT = `Tu es le moteur sonore d'une application d'ambiance pour histoires du soir pour enfants.
Tu reçois un extrait d'histoire racontée à voix haute et la musique de fond actuellement jouée.
Ta mission : adapter l'ambiance sonore en choisissant la musique la plus appropriée et en déclenchant des sons ponctuels si l'histoire l'évoque.

MUSIQUES disponibles (une seule joue en boucle à la fois) :
- conte-fees : musique douce et neutre de conte de fées (défaut)
- foret : chants d'oiseaux, forêt ensoleillée de jour
- mer : bruit de vagues, bord de mer, plage
- nuit : grillons, nuit d'été calme
- pluie : pluie douce et apaisante
- orage : pluie battante, tempête violente
- cheminee : feu qui crépite, intérieur chaleureux (château, auberge, maison)
- marais : grenouilles, étang, marécage
- riviere : ruisseau, eau qui coule, nature

SONS PONCTUELS disponibles (courts, joués une seule fois quand un événement précis se produit) :
- tonnerre : coup de tonnerre, éclair, foudre
- craquements : branche qui craque, escalier, plancher
- cloches : cloches de village, église, château, arrivée quelque part
- mouettes : cri de mouettes, port, bord de mer
- sons-magiques : sons féeriques, magie, enchantement, sortilège, fée
- vent-fort : rafale de vent violent, tempête
- vent-foret : frémissement de feuilles dans le vent

Règles IMPORTANTES :
1. Réponds UNIQUEMENT avec un objet JSON : {"music":"id_ou_null","sons":["id1","id2"]}
2. "music" = null si la musique actuelle convient déjà, sinon l'ID de la nouvelle musique à jouer
3. "sons" = tableau des sons ponctuels à déclencher maintenant ([] si aucun)
4. Déclenche un son ponctuel SEULEMENT si l'histoire évoque clairement cet événement dans l'extrait reçu
5. Change de musique dès qu'un nouveau décor est clairement établi dans l'histoire
6. Ne répète pas le même son ponctuel si l'extrait ne contient pas un nouvel événement

Exemples :
- "ils marchaient dans la forêt" avec conte-fees actif → {"music":"foret","sons":[]}
- "le tonnerre gronda" avec foret actif → {"music":"orage","sons":["tonnerre"]}
- "ils arrivèrent au château" → {"music":"cheminee","sons":["cloches"]}
- "la fée agita sa baguette" → {"music":null,"sons":["sons-magiques"]}
- "il était une fois" → {"music":"conte-fees","sons":[]}
- rien de particulier → {"music":null,"sons":[]}`

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const apiKey = env.CLAUDE_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: AnalyzeRequest
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const userMessage = `Histoire : "${body.transcript}"\nMusique actuelle : ${body.currentMusic ?? 'aucune'}\nQue faire ?`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 128,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Claude API error', status: response.status }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const data = await response.json() as any
  const text: string = data.content?.[0]?.text ?? '{}'

  const match = text.match(/\{[\s\S]*\}/)
  let music: string | null = null
  let sons: string[] = []
  if (match) {
    try {
      const parsed = JSON.parse(match[0])
      music = parsed.music ?? null
      sons = Array.isArray(parsed.sons) ? parsed.sons : []
    } catch {}
  }

  return new Response(JSON.stringify({ music, sons }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
