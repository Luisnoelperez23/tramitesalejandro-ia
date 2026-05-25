let aiHistory = [];
let leadProfile = {
  urgency: "sin clasificar",
  intent: "orientación",
  service: "no definido"
};

function toggleAIChat() {
  document.getElementById('ai-chat').classList.toggle('show');
}

function openAIChat(message) {
  document.getElementById('ai-chat').classList.add('show');
  document.getElementById('ai-input').value = message;
  sendAIMessage();
}

function addMessage(text, type) {
  const box = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = type;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

function addTypingIndicator() {
  const box = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = 'bot typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

function typeResponse(element, text, speed = 14) {
  element.classList.remove('typing');
  element.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    element.textContent += text.charAt(i);
    i++;
    const box = document.getElementById('ai-messages');
    box.scrollTop = box.scrollHeight;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

function classifyLead(message) {
  const m = message.toLowerCase();
  if (m.includes('urgente') || m.includes('cita') || m.includes('viajo') || m.includes('rápido') || m.includes('resolución')) {
    leadProfile.urgency = 'alta';
  }
  if (m.includes('pagar') || m.includes('precio') || m.includes('asesoría') || m.includes('iniciar') || m.includes('contratar')) {
    leadProfile.intent = 'listo para asesoría';
  }
  if (m.includes('visado')) leadProfile.service = 'visados';
  if (m.includes('legaliz')) leadProfile.service = 'legalización';
  if (m.includes('extranjería') || m.includes('nie') || m.includes('tie')) leadProfile.service = 'extranjería';
  if (m.includes('vuelo') || m.includes('preboleto')) leadProfile.service = 'viajes';
}

async function sendAIMessage() {
  const input = document.getElementById('ai-input');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  classifyLead(message);
  addMessage(message, 'user');
  const typing = addTypingIndicator();

  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: aiHistory, leadProfile })
    });

    const data = await response.json();
    const reply = data.reply || 'No pude responder en este momento.';
    typeResponse(typing, reply);

    aiHistory.push({ role: 'user', content: message });
    aiHistory.push({ role: 'assistant', content: reply });
    aiHistory = aiHistory.slice(-12);
  } catch (error) {
    typeResponse(typing, 'Ahora mismo no puedo conectar con la IA. Revisa que OPENAI_API_KEY esté guardada en Netlify y que la función esté publicada.');
  }
}

function sendWhatsApp() {
  const nombre = document.getElementById('nombre')?.value || '';
  const pais = document.getElementById('pais')?.value || '';
  const tramite = document.getElementById('tramite')?.value || '';
  const urgencia = document.getElementById('urgencia')?.value || '';
  const mensaje = document.getElementById('mensaje')?.value || '';
  const text = `Hola, vengo desde la web de Trámites Alejandro.%0A%0AQuiero solicitar presupuesto.%0A%0ANombre: ${encodeURIComponent(nombre)}%0APaís donde estoy: ${encodeURIComponent(pais)}%0ATrámite: ${encodeURIComponent(tramite)}%0AUrgencia: ${encodeURIComponent(urgencia)}%0AMensaje: ${encodeURIComponent(mensaje)}`;
  window.open(`https://wa.me/5355335822?text=${text}`, '_blank');
}

// PRO scroll reveal animations
document.addEventListener('DOMContentLoaded', () => {
  const revealTargets = document.querySelectorAll(
    'section, .service-card, .agent-grid article, .testimonial-grid article, .trust-grid article, .metrics div, .identity-grid article, .lead-grid article'
  );

  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach(el => observer.observe(el));
});
