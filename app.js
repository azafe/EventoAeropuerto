/* =========================
   Utilidades globales
========================= */
document.addEventListener('DOMContentLoaded', () => {
  // Marca progresiva para CSS (animaciones sólo si hay JS)
  document.documentElement.classList.add('js');

  /* =========================
     1) COUNTDOWN
  ========================= */
  const EVENT_DATE = '2025-12-14T12:00:00-03:00'; // Mediodía ARG
  const timerEl = document.getElementById('timer');

  if (timerEl) {
    const pad = n => String(n).padStart(2, '0');

    function tick() {
      const now = new Date();
      const end = new Date(EVENT_DATE);
      const diff = Math.max(0, end - now);

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      timerEl.innerHTML = `
        <div class="box"><div class="num">${pad(d)}</div><div class="lbl">días</div></div>
        <div class="box"><div class="num">${pad(h)}</div><div class="lbl">horas</div></div>
        <div class="box"><div class="num">${pad(m)}</div><div class="lbl">min</div></div>
        <div class="box"><div class="num">${pad(s)}</div><div class="lbl">seg</div></div>
      `;
    }

    tick();
    setInterval(tick, 1000);
  }

  /* =========================
     2) MÚSICA DE FONDO
     IDs esperados en el HTML:
       - botón:   #musicToggle
       - <audio>: #bgMusic  (con <source src="./audio/arch.mp3">)
  ========================= */
  (function musicController() {
    const btn = document.getElementById('musicToggle');
    const audio = document.getElementById('bgMusic');

    // Si no existen, no rompemos nada.
    if (!btn || !audio) return;

    // Setup inicial
    audio.volume = 0;
    const targetVolume = 0.6;
    const fadeInMs = 800;
    const fadeOutMs = 300;

    function fadeTo(vol, ms) {
      const start = audio.volume;
      const diff = vol - start;
      const steps = Math.max(10, Math.round(ms / 20));
      let i = 0;
      const t = setInterval(() => {
        i++;
        audio.volume = Math.min(1, Math.max(0, start + diff * (i / steps)));
        if (i >= steps) clearInterval(t);
      }, ms / steps);
    }

    async function playMusic() {
      try {
        // iOS requiere gesto previo; si no lo hubo, esto lanzará excepción.
        await audio.play();
        btn.classList.add('playing');
        fadeTo(targetVolume, fadeInMs);
        localStorage.setItem('musicState', 'on');
      } catch (e) {
        // Si el navegador bloquea autoplay, pedimos un solo tap para habilitar.
        document.addEventListener('click', playMusic, { once: true });
      }
    }

    function pauseMusic() {
      fadeTo(0, fadeOutMs);
      setTimeout(() => audio.pause(), fadeOutMs + 20);
      btn.classList.remove('playing');
      localStorage.setItem('musicState', 'off');
    }

    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      if (audio.paused) playMusic();
      else pauseMusic();
    });

    // Si el usuario había dejado la música "ON", la reactivamos con el primer tap.
    if (localStorage.getItem('musicState') === 'on') {
      document.addEventListener('click', playMusic, { once: true });
    }
  })();

  /* =========================
     3) ANIMACIÓN DE FOTOS AL SCROLL
     Soporta: .photo-grid img, .gallery img, .photo-gallery img
  ========================= */
  (function photosReveal() {
    const photos = document.querySelectorAll(
      '.photo-grid img, .gallery img, .photo-gallery img'
    );
    if (!photos.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('show');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    photos.forEach((ph) => io.observe(ph));
  })();

  /* =========================
     4) ANIMACIÓN DEL PROGRAMA (TIMELINE)
     Soporta: .timeline .t-item  o  .timeline li
  ========================= */
  (function timelineReveal() {
    const items = document.querySelectorAll('.timeline .t-item, .timeline li');
    if (!items.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('appear');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    items.forEach((it) => io.observe(it));
  })();
});