function openAIChat(message) {
  if (window.botpress) {
    window.botpress.open();
    
    setTimeout(() => {
      window.botpress.sendEvent({
        type: 'message',
        text: message
      });
    }, 1000);
  } else {
    alert('La IA está cargando. Intenta nuevamente en unos segundos.');
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
