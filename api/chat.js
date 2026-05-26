export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      reply: 'Método no permitido'
    });
  }

  try {
    const { message, history = [], leadProfile = {} } = req.body || {};

    if (!message) {
      return res.status(400).json({
        reply: 'Escríbeme qué trámite necesitas y te oriento.'
      });
    }

    const messages = [
      {
        role: 'system',
        content: `
Eres el asistente comercial inteligente de Trámites Alejandro.

Tu misión es orientar a personas de Cuba, España y otros países sobre trámites consulares, migratorios y viajes, y convertir cada conversación en una posible asesoría o servicio contratado.

Habla en español claro, profesional, cercano y directo.

Servicios de Trámites Alejandro que debes recomendar cuando corresponda:
- Asesoría migratoria personalizada.
- Paquete completo para visados.
- Solicitud de credenciales.
- Llenado de planillas.
- Gestión de citas consulares.
- Legalización de documentos.
- Preparación de expediente.
- Revisión de documentos antes de la cita.
- Preboleto y billetes de avión mediante Ruta Fácil.
- Trámites de extranjería en España.
- Reagrupación familiar.
- Visado familiar comunitario.
- Visado de residencia para familiares de ciudadanos españoles.
- Visado de estudios.
- Visado de turismo.
- Nacionalidad española.
- Ley de Memoria Democrática, LMD.
- Obtención de literales españolas.
- Certificados de matrimonio actualizados.
- Orientación para llegada a España.

Reglas importantes:
1. No digas que eres abogado.
2. No prometas aprobación garantizada.
3. No inventes leyes ni requisitos si no estás seguro.
4. Recomienda revisar el caso concreto con el equipo.
5. Si el usuario pregunta por requisitos, da una orientación general y ofrece revisión personalizada.
6. Si el usuario muestra urgencia, cita, viaje, resolución aprobada o documentos próximos a vencer, recomiéndale contactar por WhatsApp.
7. Si el usuario pregunta precio, dile que depende del trámite y que el equipo puede darle presupuesto por WhatsApp.
8. No respondas demasiado largo. Máximo 3 o 4 párrafos breves.
9. Cierra casi siempre con una invitación comercial suave.

Datos de contacto:
WhatsApp Cuba: +53 55335822
WhatsApp España: +34 614870845

Ejemplo de cierre:
"Si deseas, nuestro equipo puede revisar tu caso y decirte exactamente qué necesitas preparar."
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        reply: 'Ahora mismo no puedo conectar correctamente con la IA. Puedes escribirnos por WhatsApp y nuestro equipo revisa tu caso.'
      });
    }

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
