function normalizeText(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function findBestMatch(message, savedResponses) {
  const userText = normalizeText(message);

  if (!Array.isArray(savedResponses)) return null;

  return savedResponses.find(item => {
    const keyword = normalizeText(item.keyword || '');
    if (!keyword) return false;

    const keywords = keyword
      .split(',')
      .map(k => normalizeText(k))
      .filter(Boolean);

    return keywords.some(k => userText.includes(k));
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Método no permitido' });
  }

  try {
    const { message, history = [], leadProfile = {} } = req.body || {};

    if (!message) {
      return res.status(400).json({
        reply: 'Escríbeme qué trámite necesitas y te oriento.'
      });
    }

    const SUPABASE_URL = 'https://fpxfehqawzhxflwmxuci.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_yiPJCpFxujIp7qs_e8RI2Q_h_Mk7kEn';

    const supabaseResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/responses?select=keyword,response`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const savedResponses = await supabaseResponse.json();
    const matched = findBestMatch(message, savedResponses);

    const trainedKnowledge = matched
      ? `
INFORMACIÓN ENSEÑADA POR TRÁMITES ALEJANDRO:
Pregunta o palabra clave: ${matched.keyword}
Respuesta oficial que debes usar como base:
${matched.response}
`
      : '';

    const messages = [
      {
        role: 'system',
        content: `
Eres el asistente comercial inteligente de Trámites Alejandro.

Tu prioridad es responder usando la información enseñada por el administrador cuando exista coincidencia.

Si existe INFORMACIÓN ENSEÑADA POR TRÁMITES ALEJANDRO:
- Respóndela de forma clara.
- Puedes mejorar la redacción, pero NO cambies el sentido.
- No contradigas esa información.
- Recomienda los servicios de Trámites Alejandro al final.

Servicios:
- Asesoría migratoria personalizada.
- Paquete completo de visados.
- Credenciales.
- Citas consulares.
- Legalizaciones.
- Llenado de planillas.
- Preparación de expediente.
- Extranjería en España.
- Preboleto y billetes con Ruta Fácil.

Reglas:
- No digas que eres abogado.
- No prometas aprobaciones.
- No inventes requisitos.
- Responde breve y comercial.
- Cierra invitando a WhatsApp.

WhatsApp Cuba: +53 55335822
WhatsApp España: +34 614870845

${trainedKnowledge}
`
      },
      ...history.slice(-10),
      {
        role: 'user',
        content: `
Mensaje del cliente: ${message}

Perfil detectado:
Urgencia: ${leadProfile.urgency || 'no definida'}
Intención: ${leadProfile.intent || 'orientación'}
Servicio probable: ${leadProfile.service || 'no definido'}
`
      }
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: matched ? 0.2 : 0.6,
        max_tokens: 400
      })
    });

    const data = await openaiResponse.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      'No pude responder en este momento. Escríbenos por WhatsApp y revisamos tu caso.';

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      reply: 'Error interno conectando con la IA. Escríbenos por WhatsApp para revisar tu caso.'
    });
  }
}
