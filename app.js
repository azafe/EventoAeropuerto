// Fecha del evento (mediodía ARG)
const EVENT_DATE = '2025-12-14T12:00:00-03:00';

// Countdown
const el = document.getElementById('timer');
const pad = n => String(n).padStart(2,'0');
function tick(){
  const now = new Date(), end = new Date(EVENT_DATE);
  const diff = Math.max(0, end - now);
  const d = Math.floor(diff/86400000);
  const h = Math.floor(diff%86400000/3600000);
  const m = Math.floor(diff%3600000/60000);
  const s = Math.floor(diff%60000/1000);
  el.innerHTML = `
    <div class="box"><div class="num">${pad(d)}</div><div class="lbl">días</div></div>
    <div class="box"><div class="num">${pad(h)}</div><div class="lbl">horas</div></div>
    <div class="box"><div class="num">${pad(m)}</div><div class="lbl">min</div></div>
    <div class="box"><div class="num">${pad(s)}</div><div class="lbl">seg</div></div>`;
}
setInterval(tick, 1000); tick();

// Música (opcional)
const btn = document.getElementById('musicBtn');
const audio = document.getElementById('bgm');
let playing = false;
btn.addEventListener('click', async () => {
  try{
    if(!playing){ await audio.play(); playing = true; btn.textContent = '❚❚'; }
    else{ audio.pause(); playing = false; btn.textContent = '♪'; }
  }catch(e){ console.log(e); }
});

// ==== ANIMACIÓN DE FOTOS AL HACER SCROLL ====

document.addEventListener("DOMContentLoaded", () => {
  const fotos = document.querySelectorAll(".photo-gallery img");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target); // para evitar reanimar al volver
      }
    });
  }, {
    threshold: 0.2, // activa cuando el 20% del elemento es visible
  });

  fotos.forEach((foto) => observer.observe(foto));
});

// Aparecer del timeline al hacer scroll
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.timeline .t-item');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('appear');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  items.forEach(i => obs.observe(i));
});

// ===== CONTROL DE MÚSICA DE FONDO =====
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bgMusic");
  const btn = document.getElementById("musicToggle");

  // Si no existe alguno de los elementos, salir
  if (!audio || !btn) {
    console.warn("No se encontró el elemento de audio o el botón de música.");
    return;
  }

  // Configuración inicial
  audio.volume = 0;
  const targetVolume = 0.6;
  const fadeTime = 800;

  // Función para hacer fundido de volumen
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

  // Reproducir música
  async function playMusic() {
    try {
      // Algunos navegadores (iOS) requieren interacción previa
      await audio.play();
      btn.classList.add("playing");
      fadeTo(targetVolume, fadeTime);
      localStorage.setItem("musicState", "on");
    } catch (e) {
      console.warn("El navegador bloqueó el autoplay. Se activará al primer tap.");
      document.addEventListener("click", playMusic, { once: true });
    }
  }

  // Pausar música
  function pauseMusic() {
    fadeTo(0, 300);
    setTimeout(() => audio.pause(), 320);
    btn.classList.remove("playing");
    localStorage.setItem("musicState", "off");
  }

  // Alternar estado
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (audio.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  });

  // Restaurar estado anterior (si el usuario ya la había activado antes)
  const lastState = localStorage.getItem("musicState");
  if (lastState === "on") {
    document.addEventListener("click", playMusic, { once: true });
  }
});