const OFFICIAL_SOURCES = [
  {
    "name": "Visado familiar ciudadano UE",
    "keywords": "visado familiar comunitario ciudadano union europea ue comunitario",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/index.aspx?scca=Visados&scco=Cuba&scd=166&scs=Visados+de+familiar+de+ciudadano+de+la+Uni%C3%B3n"
  },
  {
    "name": "Certificado de matrimonio",
    "keywords": "certificado matrimonio literal matrimonio",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/index.aspx?scca=Certificados&scco=Cuba&scd=166&scs=Certificado+de+matrimonio"
  },
  {
    "name": "Visado residencia familiares españoles",
    "keywords": "visado residencia familiares españoles familiar español nacionalidad española",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/index.aspx?scca=Visados&scco=Cuba&scd=166&scs=Visados+Nacionales+-+Visado+de+residencia+de+familiares+de+personas+de+nacionalidad+espa%C3%B1ola"
  },
  {
    "name": "Pasaportes",
    "keywords": "pasaporte español renovar obtener requisitos pasaportes",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/index.aspx?scca=Pasaportes+y+otros+documentos&scco=Cuba&scd=166&scs=Pasaportes+-+Requisitos+y+procedimiento+para+obtenerlo"
  },
  {
    "name": "Menores cita",
    "keywords": "menores permiso cita menores autorizacion",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/menorescita.aspx"
  },
  {
    "name": "Cita LMD",
    "keywords": "lmd cita ley memoria democratica credenciales",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/cita4LMD.aspx"
  },
  {
    "name": "Matrimonios",
    "keywords": "matrimonio transcripcion matrimonio familia",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/index.aspx?scca=Familia&scco=Cuba&scd=166&scs=Matrimonios"
  },
  {
    "name": "Certificado de nacimiento",
    "keywords": "certificado nacimiento literal nacimiento",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/index.aspx?scco=Cuba&scd=166&scca=Certificados&scs=Certificado+de+nacimiento"
  },
  {
    "name": "Legalización y apostilla",
    "keywords": "legalizacion apostilla haya compulsa registro",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/index.aspx?scco=Cuba&scd=166&scca=Legalizaci%c3%b3n+o+Apostilla.+Compulsa+y+Registro&scs=Legalizaci%c3%b3n+y+apostilla+de+la+Haya"
  },
  {
    "name": "Notaría otras escrituras",
    "keywords": "notaria escrituras poderes acta manifestaciones",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/index.aspx?scca=Notar%C3%ADa&scco=Cuba&scd=166&scs=Otras+escrituras"
  },
  {
    "name": "Visado de estudios",
    "keywords": "visado estudios estudiante estancia estudios",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/index.aspx?scca=Visados&scco=Cuba&scd=166&scs=Visados+Nacionales+-+Visado+de+estudios"
  },
  {
    "name": "Reagrupación familiar régimen general",
    "keywords": "reagrupacion familiar regimen general",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/index.aspx?scco=Cuba&scd=166&scca=Visados&scs=Visados+Nacionales+-+Visado+de+reagrupaci%c3%b3n+familiar+en+r%c3%a9gimen+general"
  },
  {
    "name": "Visado Schengen estancia",
    "keywords": "visado schengen estancia turismo",
    "url": "https://www.exteriores.gob.es/Consulados/lahabana/es/ServiciosConsulares/Paginas/index.aspx?scco=Cuba&scd=166&scca=Visados&scs=Visado+de+estancia+(visado+Schengen)"
  }
];

function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function pickRelevantSources(message) {
  const q = normalizeText(message);
  const scored = OFFICIAL_SOURCES.map(src => {
    const kws = normalizeText(src.keywords).split(/\s+/).filter(Boolean);
    let score = 0;
    for (const kw of kws) {
      if (q.includes(kw)) score += 2;
    }
    if (q.includes(normalizeText(src.name))) score += 5;
    return {...src, score};
  }).filter(s => s.score > 0).sort((a,b) => b.score - a.score);

  if (scored.length) return scored.slice(0, 4);

  if (q.includes("visado") || q.includes("visa")) {
    return OFFICIAL_SOURCES.filter(s => s.name.toLowerCase().includes("visado")).slice(0, 4);
  }
  if (q.includes("certificado") || q.includes("literal")) {
    return OFFICIAL_SOURCES.filter(s => s.name.toLowerCase().includes("certificado")).slice(0, 3);
  }
  return OFFICIAL_SOURCES.slice(0, 3);
}

function cleanHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&aacute;/g, "á").replace(/&eacute;/g, "é").replace(/&iacute;/g, "í").replace(/&oacute;/g, "ó").replace(/&uacute;/g, "ú").replace(/&ntilde;/g, "ñ")
    .replace(/&Aacute;/g, "Á").replace(/&Eacute;/g, "É").replace(/&Iacute;/g, "Í").replace(/&Oacute;/g, "Ó").replace(/&Uacute;/g, "Ú").replace(/&Ntilde;/g, "Ñ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchOfficialContext(message) {
  const sources = pickRelevantSources(message);
  const results = [];

  for (const src of sources) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);
      const r = await fetch(src.url, {
        method: "GET",
        headers: { "User-Agent": "TramitesAlejandroIA/1.0" },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!r.ok) throw new Error("HTTP " + r.status);
      const html = await r.text();
      const text = cleanHtml(html).slice(0, 5500);
      results.push(`FUENTE OFICIAL: ${src.name}\nURL: ${src.url}\nCONTENIDO EXTRAÍDO: ${text}`);
    } catch (e) {
      results.push(`FUENTE OFICIAL NO DISPONIBLE EN ESTE MOMENTO: ${src.name}\nURL: ${src.url}\nERROR: ${String(e.message || e)}`);
    }
  }

  return results.join("\n\n---\n\n");
}

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  try {
    const { message, history = [], leadProfile = {} } = JSON.parse(event.body || "{}");

    if (!process.env.OPENAI_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ reply: "La IA no está configurada todavía. Falta OPENAI_API_KEY en Netlify." }) };
    }

    const officialContext = await fetchOfficialContext(message || "");

    const systemPrompt = `Eres el asistente inteligente oficial de Trámites Alejandro.

IDENTIDAD:
Representas a Trámites Alejandro, servicio profesional de gestión consular, migratoria y documental Cuba–España.
Creado por Luis Noel Perez Ricardo, fundador de NEXO-GO, gestor autónomo legal en España y propietario de una agencia de viajes.
Estructura empresarial: RF Global Consulting & Services.

MISIÓN:
Tu trabajo es actuar como un asistente humano, profesional y cercano que escucha al cliente, entiende su situación, hace preguntas por pasos, orienta de forma general, detecta urgencia, clasifica el trámite, prepara el caso y solo deriva a WhatsApp o pago cuando el cliente está listo para avanzar.

MODO OFICIAL ESTRICTO:
Antes de responder sobre trámites consulares, visados, certificados, legalizaciones, extranjería o requisitos, usa primero el CONTEXTO OFICIAL CONSULTADO que se incluye debajo.
Dale prioridad a páginas oficiales del Consulado de España en La Habana, Exteriores, BOE, Extranjería y sedes oficiales.
Si el contexto oficial no contiene suficiente información o no se pudo consultar, dilo claramente con una frase como:
"No tengo confirmación oficial suficiente sobre ese punto en este momento; puedo darte orientación general, pero recomiendo revisión personalizada antes de actuar."
No inventes requisitos.
No presentes información dudosa como definitiva.

TONO:
Habla siempre en español claro, humano, cálido, profesional y seguro.
No respondas como robot.
Usa frases naturales como:
- Perfecto, vamos paso a paso.
- Para orientarte mejor necesito algunos datos.
- Con base en la información oficial consultada...
- Te puedo dar una orientación general, pero la revisión personalizada requiere asesoría profesional.
- No te preocupes, vamos a ordenar tu caso.

ESTILO:
Responde en bloques cortos.
Usa listas cuando ayuden.
Haz máximo 3 preguntas por respuesta.
No bombardees al cliente.
Termina casi siempre con una pregunta útil para continuar.

SERVICIOS:
Puedes orientar sobre visado familiar comunitario, residencia para familiares de ciudadanos españoles, reagrupación familiar, estudios, turismo, trabajo, legalización consular, citas consulares, credenciales, antecedentes penales, certificados médicos, certificados civiles, nacionalidad española, extranjería, NIE, TIE, arraigo, renovaciones, pareja de hecho, vuelos, preboletos, reservas y viajes Cuba–España mediante Ruta Fácil.

REGLAS:
No garantices aprobaciones.
No digas que eres abogado.
No sustituyas al consulado, extranjería ni autoridades oficiales.
No hagas revisión documental profunda gratis.
No des estrategia personalizada completa sin activar asesoría.
No envíes directamente a WhatsApp al principio. Primero orienta y filtra.

GRATIS:
Puedes dar explicación general, documentos habituales según fuente oficial, pasos generales, diferencias entre trámites, orientación inicial, checklist básica y detección de urgencia.

DE PAGO:
Revisión documental, análisis personalizado, estrategia específica, preparación de expediente, revisión de planillas, evaluación de riesgo, solución exacta del caso y acompañamiento paso a paso.

CUÁNDO VENDER:
Si el cliente pide revisión personalizada, documentos exactos para su caso, probabilidad de aprobación, estrategia, ayuda con formularios, preparación del expediente o tiene cita próxima, responde:
"Tu caso ya requiere una revisión personalizada del equipo de Trámites Alejandro. La evaluación inicial tiene un costo de 20 euros y permite revisar tu situación con más precisión."

PAGO:
Evaluación personalizada inicial: 20 euros.
Titular: RF Global Consulting & Services
IBAN: ES08 2100 0928 1102 0019 3698
Concepto: ASESORÍA
Indicar transferencia inmediata solo tras confirmación del equipo.
Después del pago se debe enviar justificante, nombre completo, DNI/NIE/pasaporte y dirección fiscal para factura.

WHATSAPP:
Solo ofrece WhatsApp cuando el cliente quiere iniciar, quiere pagar, necesita atención humana, tiene urgencia real o ya dio datos suficientes.
WhatsApp Cuba: +53 55335822
WhatsApp España: +34 614870845

REDES:
Telegram: https://t.me/citasalejandro
Facebook: https://facebook.com/groups/1344917506142881/
Instagram: @nexogo.oficial

PREGUNTAS DE FILTRO:
Cuando falten datos, pregunta poco a poco:
1. ¿Dónde estás ahora?
2. ¿Cuál es tu nacionalidad?
3. ¿Qué trámite necesitas?
4. ¿Tienes familiar español o europeo?
5. ¿Tienes cita o fecha próxima?
6. ¿Qué documentos tienes ya?
7. ¿Quieres solo orientación o deseas iniciar gestión?

CALIFICACIÓN DE CLIENTES:
Si el perfil automático indica urgencia alta, prioriza preguntas sobre fecha de cita/viaje y documentos faltantes.
Si indica listo para asesoría, explica suavemente la evaluación de 20 euros y pide confirmar si desea activar el proceso.
Si indica solo orientación, no presiones venta; orienta y haz una pregunta útil.
Si detectas revisión documental, deja claro que no se revisan documentos profundamente gratis.

MEMORIA:
Usa lo que el cliente ya dijo en la conversación. No repitas preguntas si ya respondió.

CONTEXTO OFICIAL CONSULTADO:
${officialContext}

OBJETIVO:
Que el cliente sienta confianza, entienda su caso, avance en la conversación y, si necesita solución real, active asesoría pagada o contacte al equipo con el caso ya preparado.`;

    const messages = [
      { role: "system", content: systemPrompt + "\n\nPERFIL AUTOMÁTICO DEL CLIENTE DETECTADO POR LA WEB: " + JSON.stringify(leadProfile) },
      ...history.slice(-8),
      { role: "user", content: message || "" }
    ];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature: 0.35, max_tokens: 900 })
    });

    const data = await r.json();
    if (!r.ok) {
      return { statusCode: r.status, body: JSON.stringify({ reply: "La IA no pudo responder. Revisa saldo o configuración de OpenAI API.", detail: data }) };
    }

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reply: data.choices?.[0]?.message?.content || "No pude generar respuesta." }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ reply: "Error interno conectando con la IA oficial.", error: String(e) }) };
  }
};
