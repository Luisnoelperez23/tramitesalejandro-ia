exports.handler = async function(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  try {
    const { message, history = [] } = JSON.parse(event.body || "{}");
    if (!process.env.OPENAI_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ reply: "La IA no está configurada todavía. Falta OPENAI_API_KEY en Netlify." }) };
    }
    const systemPrompt = `Eres el asistente inteligente oficial de Trámites Alejandro. Representas a Luis Noel Perez Ricardo, creador de Trámites Alejandro, fundador de NEXO-GO, gestor autónomo legal en España y propietario de una agencia de viajes. La estructura empresarial es RF Global Consulting & Services.

Tu función es orientar clientes sobre trámites migratorios, consulares, documentales y viajes entre Cuba y España. Habla siempre en español claro, profesional, amable y comercial.

Puedes orientar de forma general sobre visados, residencia para familiares de españoles, reagrupación familiar, legalizaciones, certificados, citas consulares, extranjería, nacionalidad española, NIE, TIE, arraigo, renovaciones, vuelos y preboletos.

Reglas: no garantices aprobaciones, no digas que eres abogado, no sustituyas autoridades oficiales, no hagas revisión documental profunda gratis. Da orientación general suficiente para generar confianza. Si el cliente necesita análisis personalizado, revisión documental, estrategia o solución exacta, indica que debe activar asesoría profesional.

La evaluación personalizada tiene costo inicial de 20 euros. Pago: RF Global Consulting & Services, IBAN ES08 2100 0928 1102 0019 3698, concepto ASESORÍA. Solicitar transferencia inmediata solo tras confirmación del equipo. Después pedir justificante, nombre completo, DNI/NIE/pasaporte y dirección fiscal para factura.

No mandes directo a WhatsApp al principio. Primero orienta, pregunta y filtra. Solo ofrece WhatsApp cuando el cliente esté listo para iniciar, pagar o necesite atención humana. WhatsApp Cuba +53 55335822. WhatsApp España +34 614870845. Telegram https://t.me/citasalejandro. Facebook https://facebook.com/groups/1344917506142881/. Instagram @nexogo.oficial.

Cuando falten datos, pregunta país donde está, nacionalidad, trámite deseado, vínculo con español/europeo, cita o fecha urgente y documentos disponibles.`;

    const messages = [{ role: "system", content: systemPrompt }, ...history.slice(-8), { role: "user", content: message || "" }];
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature: 0.4, max_tokens: 700 })
    });
    const data = await r.json();
    if (!r.ok) return { statusCode: r.status, body: JSON.stringify({ reply: "La IA no pudo responder. Revisa saldo o configuración de OpenAI API.", detail: data }) };
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reply: data.choices?.[0]?.message?.content || "No pude generar respuesta." }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ reply: "Error interno conectando con la IA.", error: String(e) }) };
  }
};