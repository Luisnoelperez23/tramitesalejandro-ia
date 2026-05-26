function limpiar(texto = '') {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export default async function handler(req, res) {
  try {
    const { message } = req.body || {};

    const SUPABASE_URL = 'https://fpxfehqawzhxflwmxuci.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_yiPJCpFxujIp7qs_e8RI2Q_h_Mk7kEn';

    const consulta = await fetch(
      `${SUPABASE_URL}/rest/v1/responses?select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const respuestas = await consulta.json();

    const mensajeCliente = limpiar(message);

    const encontrada = respuestas.find(item => {
      const palabras = limpiar(item.keyword)
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

      return palabras.some(palabra => mensajeCliente.includes(palabra));
    });

    if (encontrada) {
      return res.status(200).json({
        reply: encontrada.response
      });
    }

    return res.status(200).json({
      reply: `Puedo orientarte sobre ese trámite. Para darte una respuesta exacta, nuestro equipo puede revisar tu caso por WhatsApp.

🇨🇺 Cuba: +53 55335822
🇪🇸 España: +34 614870845`
    });

  } catch (error) {
    return res.status(500).json({
      reply: 'Error conectando con la base de conocimiento.'
    });
  }
}
