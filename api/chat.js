export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      reply: 'Método no permitido'
    });
  }

  try {
    const { message, history, leadProfile } = req.body;

    const messages = [
      {
        role: 'system',
        content: `
Eres el asistente inteligente de Trámites Alejandro.

Ayudas sobre:
- Visados España
- Nacionalidad española
- LMD
- Extranjería
- Reagrupación familiar
- Legalizaciones
- Citas consulares
- Viajes Cuba-España

Responde profesional, claro y breve.
Intenta convertir usuarios en clientes.
`
      },
      ...(history || []),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7
      })
    });

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      'No pude responder en este momento.';

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      reply: 'Error interno conectando con la IA.'
    });
  }
}
