// ================= CONFIG =================
const CONFIG = {
  fechaEvento: '2025-12-14T12:00:00-03:00',
  googleFormURL: 'https://forms.gle/tu-link-aqui'
};

// Insertar link de formulario
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('linkForm').href = CONFIG.googleFormURL;
});

// ============== COUNTDOWN ==============
const timerEl = document.getElementById('timer');
function pad(n){return String(n).padStart(2,'0')}
function tick(){
  const now = new Date();
  const end = new Date(CONFIG.fechaEvento);
  const diff = Math.max(0, end - now);
  const d = Math.floor(diff/86400000);
  const h = Math.floor(diff%86400000/3600000);
  const m = Math.floor(diff%3600000/60000);
  const s = Math.floor(diff%60000/1000);
  timerEl.innerHTML = `
    <div class="box"><div class="num">${pad(d)}</div><div class="lbl">días</div></div>
    <div class="box"><div class="num">${pad(h)}</div><div class="lbl">horas</div></div>
    <div class="box"><div class="num">${pad(m)}</div><div class="lbl">min</div></div>
    <div class="box"><div class="num">${pad(s)}</div><div class="lbl">seg</div></div>`;
}
setInterval(tick, 1000);
tick();