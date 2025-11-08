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