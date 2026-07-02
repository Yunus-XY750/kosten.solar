// ═══════════════════════════════════════════
// kosten.solar — Shared Utilities
// ═══════════════════════════════════════════

// PLZ → Bundesland + Solar-Einstrahlungsdaten
const PLZ_DATA = [
  { von:1000, bis:1999, land:'Berlin', betrag:300, solar:1030 },
  { von:2000, bis:2999, land:'Hamburg', betrag:400, solar:975 },
  { von:3000, bis:3999, land:'Niedersachsen', betrag:350, solar:1000 },
  { von:4000, bis:5999, land:'Nordrhein-Westfalen', betrag:400, solar:1010 },
  { von:6000, bis:6999, land:'Hessen', betrag:350, solar:1050 },
  { von:7000, bis:7999, land:'Baden-Württemberg', betrag:500, solar:1080 },
  { von:8000, bis:8999, land:'Bayern', betrag:750, solar:1110 },
  { von:9000, bis:9999, land:'Bayern', betrag:750, solar:1100 },
  { von:10000, bis:12999, land:'Berlin', betrag:300, solar:1030 },
  { von:13000, bis:16999, land:'Brandenburg', betrag:300, solar:1035 },
  { von:17000, bis:19999, land:'Mecklenburg-Vorpommern', betrag:250, solar:990 },
  { von:20000, bis:22999, land:'Hamburg', betrag:400, solar:975 },
  { von:23000, bis:25999, land:'Schleswig-Holstein', betrag:300, solar:970 },
  { von:26000, bis:29999, land:'Niedersachsen', betrag:350, solar:995 },
  { von:30000, bis:33999, land:'Niedersachsen', betrag:350, solar:1000 },
  { von:34000, bis:36999, land:'Hessen', betrag:350, solar:1040 },
  { von:37000, bis:39999, land:'Niedersachsen/Sachsen-Anhalt', betrag:325, solar:1020 },
  { von:40000, bis:53999, land:'Nordrhein-Westfalen', betrag:400, solar:1012 },
  { von:54000, bis:57999, land:'Rheinland-Pfalz', betrag:400, solar:1050 },
  { von:58000, bis:59999, land:'Nordrhein-Westfalen', betrag:400, solar:1010 },
  { von:60000, bis:65999, land:'Hessen', betrag:350, solar:1055 },
  { von:66000, bis:66999, land:'Saarland', betrag:300, solar:1055 },
  { von:67000, bis:69999, land:'Rheinland-Pfalz/Baden-Württemberg', betrag:450, solar:1065 },
  { von:70000, bis:79999, land:'Baden-Württemberg', betrag:500, solar:1087 },
  { von:80000, bis:89999, land:'Bayern', betrag:750, solar:1115 },
  { von:90000, bis:99999, land:'Bayern', betrag:750, solar:1095 },
];

function getPLZ(plz) {
  const n = parseInt((plz||'').replace(/\D/g,''), 10);
  if (isNaN(n)) return { land:'Deutschland', betrag:300, solar:1050 };
  return PLZ_DATA.find(r => n >= r.von && n <= r.bis) || { land:'Deutschland', betrag:300, solar:1050 };
}

function v(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function n(id) { return parseFloat(v(id)) || 0; }

const MONTHS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const M_FACTORS = [0.04,0.06,0.09,0.11,0.13,0.13,0.12,0.11,0.09,0.07,0.04,0.03];

function showResults(containerId, kpis, chart) {
  const kpiHtml = kpis.map((k,i) =>
    `<div class="kpi-card ${i===0?'full':''}">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-unit">${k.unit||''}</div>
    </div>`).join('');
  let chartHtml = '';
  if (chart) {
    chartHtml = `<div class="mini-chart"><div class="mini-chart-title">${chart.title}</div>
      ${chart.bars.map(b=>`<div class="bar-row"><div class="bar-lbl">${b.label}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${b.pct}%;background:${b.color||'var(--amber)'}"><span>${b.text}</span></div></div></div>`).join('')}
    </div>`;
  }
  const el = document.getElementById(containerId);
  el.innerHTML = `<div class="kpi-grid">${kpiHtml}</div>${chartHtml}`;
  el.classList.add('show');
}

// Modal
function openModal() { document.getElementById('modal').classList.add('open'); }
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.getElementById('modal-form').style.display = '';
  document.getElementById('modal-success').style.display = 'none';
}
// TODO: Formspree-Konto anlegen auf formspree.io → neues Formular erstellen → ID hier eintragen
const FORMSPREE_ID = 'XXXXXXXX';

function submitLead() {
  if (!v('m-name')||!v('m-email')||!v('m-plz')) { alert('Bitte alle Pflichtfelder ausfüllen.'); return; }
  const btn = document.querySelector('.modal-submit');
  if (btn) btn.disabled = true;

  fetch('https://formspree.io/f/' + FORMSPREE_ID, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      name:    v('m-name'),
      email:   v('m-email'),
      telefon: v('m-tel'),
      plz:     v('m-plz'),
      quelle:  window.location.pathname
    })
  })
  .finally(() => {
    document.getElementById('modal-form').style.display = 'none';
    document.getElementById('modal-success').style.display = 'block';
    if (btn) btn.disabled = false;
    // fbq('track', 'Lead'); // Meta Pixel — nach Installation aktivieren
  });
}

// FAQ toggle
document.addEventListener('click', function(e) {
  const item = e.target.closest('.faq-item');
  if (item) item.classList.toggle('open');
  if (e.target.id === 'modal') closeModal();
});

// ═══════════════════════════════════════════
// 3D Tilt Engine — perspective tilt + cursor glare
// on .calc-card / .related-card / .rechner-card / .tilt-3d
// ═══════════════════════════════════════════
function initTilt(selector, max, scale) {
  document.querySelectorAll(selector).forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * max;
      const ry = (px - 0.5) * max;
      card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) scale3d(' + scale + ',' + scale + ',' + scale + ')';
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.style.transform = '';
    });
  });
}
(function () {
  const fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;
  initTilt('.calc-card', 3, 1.005);
  initTilt('.rechner-card', 6, 1.02);
  initTilt('.related-card', 8, 1.03);
  initTilt('.tilt-3d', 8, 1.02);
})();
