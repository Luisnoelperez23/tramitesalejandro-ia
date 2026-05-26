export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Método no permitido' });
  }

  try {
    const { message, history = [], leadProfile = {} } = req.body || {};

    const SUPABASE_URL = 'https://fpxfehqawzhxflwmxuci.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_yiPJCpFxujIp7qs_e8RI2Q_h_Mk7kEn';

    const supabaseResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/responses?select=keyword,response`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const savedResponses = await supabaseResponse.json();

    const knowledgeText = Array.isArray(savedResponses)
      ? savedResponses.map((item, index) => `
ENTRENAMIENTO ${index + 1}
Pregunta o palabra clave:
${item.keyword}

Respuesta oficial:
${item.response}
`).join('\n')
      : '';

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `
Eres el asistente inteligente y comercial de Trámites Alejandro.

Tu prioridad absoluta es responder usando la BASE DE CONOCIMIENTO ENTRENADA POR EL ADMINISTRADOR.

BASE DE CONOCIMIENTO:
${knowledgeText}

REGLAS:
1. Si la pregunta del cliente se parece a algo de la base de conocimiento, usa esa respuesta como base principal.
2. No necesitas que la palabra sea exacta. Interpreta la intención.
3. Puedes mejorar la redacción, pero no cambies el sentido.
4. Recomienda los servicios de Trámites Alejandro.
5. No prometas aprobaciones.
6. No digas que eres abogado.
7. Si no hay información suficiente, responde de forma general e invita a WhatsApp.

WhatsApp Cuba: +53 55335822
WhatsApp España: +34 614870845
`
          },
          ...history.slice(-8),
          {
            role: 'user',
            content: `
Mensaje del cliente: ${message}

Perfil:
Urgencia: ${leadProfile.urgency || 'no definida'}
Intención: ${leadProfile.intent || 'orientación'}
Servicio probable: ${leadProfile.service || 'no definido'}
`
          }
        ]
      })
    });

    const data = await openaiResponse.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      'No pude responder en este momento. Escríbenos por WhatsApp y revisamos tu caso.';

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      reply: 'Error conectando con la IA. Escríbenos por WhatsApp para revisar tu caso.'
    });
  }
}
