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
    const userText = message.toLowerCase();

    const match = Array.isArray(savedResponses)
      ? savedResponses.find(item =>
          item.keyword &&
          userText.includes(item.keyword.toLowerCase())
        )
      : null;

    if (match) {
      return res.status(200).json({
        reply: match.response
      });
    }

    const messages = [
      {
        role: 'system',
        content: `
Eres el asistente comercial inteligente de Trámites Alejandro.

Recomienda los servicios de Trámites Alejandro cuando corresponda:
asesoría migratoria, visados, credenciales, citas, legalizaciones, planillas, expedientes, extranjería y vuelos con Ruta Fácil.

No prometas aprobaciones. No digas que eres abogado.
Cierra invitando a WhatsApp:
Cuba +53 55335822
España +34 614870845
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
        temperature: 0.6,
        max_tokens: 350
      })
    });

    const data = await openaiResponse.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      'No pude responder en este momento. Puedes escribirnos por WhatsApp y revisamos tu caso.';

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      reply: 'Error interno conectando con la IA. Escríbenos por WhatsApp para revisar tu caso.'
    });
  }
}
