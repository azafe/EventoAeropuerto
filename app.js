/* =========================
   Utilidades globales
========================= */
document.addEventListener('DOMContentLoaded', () => {
  // Marca progresiva para CSS
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
  ========================= */
  (function musicController() {
    const btn = document.getElementById('musicToggle');
    const audio = document.getElementById('bgMusic');

    if (!btn || !audio) return;

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
        await audio.play();
        btn.classList.add('playing');
        fadeTo(targetVolume, fadeInMs);
        localStorage.setItem('musicState', 'on');
      } catch (_) {
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

    if (localStorage.getItem('musicState') === 'on') {
      document.addEventListener('click', playMusic, { once: true });
    }
  })();

  /* =========================
     3) ANIMACIÓN DE FOTOS
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
     4) ANIMACIÓN DEL PROGRAMA
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

  /* =========================
     5) PERSONAS QUE VAN
     Fuente: Hoja "Invitados" de Google Sheets (CSV público)
  ========================= */

  initAsistentes();
});

/* Scroll de flecha al bloque #info */
document.getElementById('goInfo')?.addEventListener('click', () => {
  const target = document.querySelector('#info') || document.body;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ====== ASISTENTES: lectura desde Google Sheets ====== */

// Hoja Invitados (misma que usás en el panel interno)
const INVITADOS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0rZ8Ja0766QxpTGYCCWu0dz07Oz5YUqj9dS9bxhD8Snl7WPyRSfj6gsq0mozaoaUtuC_gCtbiTSvA/pub?gid=82462936&single=true&output=csv";

// Hoja Costos (la que me pasaste - por ahora solo la dejamos preparada)
const COSTOS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0rZ8Ja0766QxpTGYCCWu0dz07Oz5YUqj9dS9bxhD8Snl7WPyRSfj6gsq0mozaoaUtuC_gCtbiTSvA/pub?gid=2076354311&single=true&output=csv";

// Parser simple de CSV con comillas
function parseCSV(text) {
  const rows = [];
  let current = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      current.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (value !== "" || current.length) {
        current.push(value);
        rows.push(current);
        current = [];
        value = "";
      }
      continue;
    }

    value += char;
  }

  if (value !== "" || current.length) {
    current.push(value);
    rows.push(current);
  }

  return rows;
}

// Normaliza encabezados: "Todo el día" -> "todoeldia"
function normalizeHeader(header) {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function csvToObjects(text) {
  const rawRows = parseCSV(text);
  if (!rawRows.length) return [];

  const headers = rawRows[0].map((h) => normalizeHeader(h || ""));
  const dataRows = rawRows.slice(1);

  return dataRows
    .filter((r) => r.some((cell) => String(cell).trim() !== ""))
    .map((cells) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cells[idx] !== undefined ? cells[idx] : "";
      });
      return obj;
    });
}

// Helper: limpia número simple (ej: "1", "2", "")
function toNumberOrZero(val) {
  const n = Number(String(val).replace(",", "."));
  return isNaN(n) ? 0 : n;
}

// Inicializa bloque de asistentes
async function initAsistentes() {
  const wall = document.getElementById("attendees-wall");
  const totalEl = document.getElementById("att-total");
  const fullEl = document.getElementById("att-full");
  const cenaEl = document.getElementById("att-cena");

  if (!wall || !totalEl || !fullEl || !cenaEl) return;

  try {
    const res = await fetch(INVITADOS_CSV_URL + "&t=" + Date.now());
    if (!res.ok) throw new Error("No se pudo leer la hoja de invitados.");
    const text = await res.text();
    const rows = csvToObjects(text);

    // Mapeo según headers actuales de la hoja:
    // nombre, sector, cena, todoeldia, debepagar, montopagado, faltapagar, observaciones...
    const invitados = rows.map((r) => ({
      nombre: r.nombre || "",
      sector: r.sector || "",
      cena: toNumberOrZero(r.cena),
      todoeldia: toNumberOrZero(r.todoeldia),
    }));

    // Calculamos totales de personas
    let totalPersonas = 0;
    let totalFull = 0;
    let totalCena = 0;

    invitados.forEach((inv) => {
      totalPersonas += inv.cena + inv.todoeldia;
      totalFull += inv.todoeldia;
      totalCena += inv.cena;
    });

    totalEl.textContent = totalPersonas.toString();
    fullEl.textContent = totalFull.toString();
    cenaEl.textContent = totalCena.toString();

    // Armamos chips por persona. Para no mostrar la misma persona duplicada por tipo,
    // tomamos el máximo entre cena / todoeldia como "conteo de personas".
    const chips = [];

    invitados.forEach((inv) => {
      const personas = Math.max(inv.cena + inv.todoeldia, 1);
      for (let i = 0; i < personas; i++) {
        // definimos tipo de pase para el chip:
        let tipo = "";
        if (inv.todoeldia > 0 && inv.cena === 0) tipo = "full";
        else if (inv.cena > 0 && inv.todoeldia === 0) tipo = "cena";
        else if (inv.cena > 0 && inv.todoeldia > 0) tipo = "full"; // preferimos full si tiene ambos

        chips.push({
          nombre: inv.nombre || "Invitado",
          tipo,
          sector: inv.sector || ""
        });
      }
    });

    // Orden simple: por nombre
    chips.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    wall.innerHTML = "";
    chips.forEach((chip) => {
      const div = document.createElement("div");
      div.className = "att-chip";

      const avatar = document.createElement("span");
      avatar.className = "att-avatar";
      avatar.textContent = getInitials(chip.nombre);

      const nameSpan = document.createElement("span");
      nameSpan.textContent = chip.nombre;

      div.appendChild(avatar);
      div.appendChild(nameSpan);

      if (chip.tipo) {
        const badge = document.createElement("span");
        badge.className =
          "att-type-badge " +
          (chip.tipo === "full" ? "att-type-full" : "att-type-cena");
        badge.textContent = chip.tipo === "full" ? "Full Pass" : "Solo cena";
        div.appendChild(badge);
      }

      wall.appendChild(div);
    });
  } catch (err) {
    console.error("Error cargando asistentes:", err);
  }
}

// Iniciales a partir del nombre
function getInitials(nombre) {
  if (!nombre) return "?";
  const parts = nombre.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}