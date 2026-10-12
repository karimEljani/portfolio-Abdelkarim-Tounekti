/* ===== Portfolio Tounekti Abdelkarim – gestion des projets et des photos =====
   Visiteurs : lecture seule (données dans data/projects.js).
   Propriétaire : ouvrir la page avec ?admin  → bouton « Gérer les projets ».
   • Avec PHP (api.php) : mot de passe, enregistrement direct sur le serveur.
   • Sans PHP : brouillon local + export de data/projects.js. */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CATS = {
  res: {title: 'Residential project', toc: 'Residential projects', theme: 'light'},
  com: {title: 'Commercial project',  toc: 'Commercial projects',  theme: 'dark'},
  bur: {title: 'Office project',      toc: 'Office projects',      theme: 'light'},
  hot: {title: 'Hospitality project', toc: 'Hospitality projects',   theme: 'dark'}
};
const SLOTS = ['Main photo', 'Thumbnail 1', 'Thumbnail 2', 'Plan'];
const FIELDS = ['id', 'cat', 'title', 'loc', 'client', 'concept', 'description', 'surface', 'style', 'year', 'duration', 'role', 'materials'];
// Images des autres pages (remplacez les fichiers du dossier img/ par vos photos)
const PAGE_IMG = {'#s0>.ph': 'hero', '#s2>.side': 'portrait.jpg', '#s8>.side': 'approach.jpg', '#s10>.side': 'quote', '#s11>.ph': 'contact.jpg',
  '.g1': 'gallery-1.jpg', '.g2': 'gallery-2.jpg', '.g3': 'gallery-3.jpg', '.g4': 'gallery-4.jpg',
  '.g5': 'gallery-5.jpg', '.g6': 'gallery-6.jpg', '.g7': 'gallery-7.jpg', '.g8': 'gallery-8.jpg'};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bg = u => u ? `background-image:url('${esc(u)}')` : '';

let projects = structuredClone(window.PORTFOLIO || []);
let mode = 'local', logged = false, cur = null, io;
const admin = /[?&]admin/.test(location.search);
// Mot de passe du MODE LOCAL (sans PHP). En ligne avec PHP, c'est le mot de passe de api.php qui compte. CHANGEZ-LE.
const LOCAL_PASSWORD = 'changeme';

/* ---------- Serveur PHP ---------- */
const api = (a, o = {}) => fetch('api.php?action=' + a, {credentials: 'same-origin', ...o});
async function detect() {
  try { const j = await (await api('ping')).json(); if (j.ok) { mode = 'server'; logged = false; } } catch {}
}
async function auth(force) {
  if (mode === 'server' && logged && !force) return true;
  const password = prompt('Administrator password:');
  if (password === null) return false;
  if (mode === 'server') {
    const r = await api('login', {method: 'POST', body: JSON.stringify({password})});
    logged = r.ok; if (!r.ok) alert('Incorrect password.');
    return logged;
  }
  if (password !== LOCAL_PASSWORD) { alert('Incorrect password.'); return false; }
  return true;
}
const logout = () => { if (mode === 'server') { logged = false; return api('logout').catch(() => {}); } };

/* ---------- Brouillon local (IndexedDB) ---------- */
const kv = (m, fn) => new Promise((ok, ko) => {
  const r = indexedDB.open('portfolio-karim', 2);
  r.onupgradeneeded = () => r.result.createObjectStore('kv');
  r.onerror = () => ko(r.error);
  r.onsuccess = () => { const q = fn(r.result.transaction('kv', m).objectStore('kv')); q.onsuccess = () => ok(q.result); q.onerror = () => ko(q.error); };
});

/* ---------- Enregistrement ---------- */
async function save() {
  try {
    if (mode === 'server') {
      if (!await auth()) return false;
      const r = await api('save', {method: 'POST', body: JSON.stringify(projects)});
      if (!r.ok) throw 0;
    } else await kv('readwrite', s => s.put(projects, 'draft'));
    return true;
  } catch { alert("Unable to save (write permissions on the data/ folder or browser storage)."); return false; }
}
const shrink = f => new Promise((ok, ko) => {
  const r = new FileReader(); r.onerror = ko;
  r.onload = () => { const i = new Image(); i.onerror = ko; i.onload = () => {
    const k = Math.min(1, 1600 / Math.max(i.width, i.height)), c = document.createElement('canvas');
    c.width = i.width * k; c.height = i.height * k;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(i, 0, 0, c.width, c.height);
    ok(c.toDataURL('image/jpeg', .82)); }; i.src = r.result; };
  r.readAsDataURL(f);
});
async function upload(f) {
  const d = await shrink(f);
  if (mode !== 'server') return d;
  if (!await auth()) throw 0;
  const fd = new FormData(); fd.append('file', await (await fetch(d)).blob(), 'p.jpg');
  const j = await (await api('upload', {method: 'POST', body: fd})).json();
  if (!j.url) throw 0; return j.url;
}

/* ---------- Pages projets ---------- */
function render() {
  const box = $('#projects'); box.innerHTML = '';
  Object.keys(CATS).forEach(k => projects.filter(p => p.cat === k).forEach(p => {
    const c = CATS[k], s = document.createElement('section'), im = p.images || [];
    s.className = `slide ${c.theme} project`; s.id = 'p-' + p.id; s.dataset.cat = k;
    const rows = [['Area', p.surface], ['Style', p.style], ['Year', p.year], ['Client', p.client], ['Duration', p.duration], ['Materials', p.materials]]
      .filter(r => r[1]).map(r => `<li>${r[0]} : ${esc(r[1])}</li>`).join('');
    s.innerHTML = `
      <h2>${c.title}</h2><p class="loc">${esc(p.title)}${p.loc ? ' – ' + esc(p.loc) : ''}</p>
      <div class="pgrid">
        <div class="ph" role="img" aria-label="${esc(p.title)}" data-tone="2" style="${bg(im[0])}"></div>
        <div class="pinfo">
          ${p.concept ? `<h4>Concept</h4><p>${esc(p.concept)}</p>` : ''}
          <h4>Details</h4><ul>${rows}</ul>
          <button class="more" data-id="${esc(p.id)}">View project details</button>
        </div>
      </div>
      <div class="thumbs"><div class="ph" data-tone="3" style="${bg(im[1])}"></div><div class="ph" data-tone="4" style="${bg(im[2])}"></div>
        <div class="ph plan ${im[3] ? 'has' : ''}" style="${bg(im[3])}"></div></div>
      <p class="quote-s foot"></p>`;
    box.appendChild(s);
  }));
  nav();
}
function nav() {
  const slides = $$('.slide'), dots = $('#dots'); dots.innerHTML = '';
  slides.forEach((s, i) => { const a = document.createElement('a'); a.href = '#' + s.id; a.setAttribute('aria-label', 'Page ' + (i + 1)); dots.appendChild(a); });
  $$('.foot').forEach(f => { const s = f.closest('.slide'); f.textContent = `${String(slides.indexOf(s) + 1).padStart(2, '0')} — ${CATS[s.dataset.cat].toc}`; });
  $$('.toc li').forEach(li => {
    const t = li.dataset.t, s = CATS[t] ? $(`.slide[data-cat="${t}"]`) : document.getElementById(t);
    li.hidden = !s;
    if (s) { $('a', li).href = '#' + s.id; $('i', li).textContent = String(slides.indexOf(s) + 1).padStart(2, '0'); }
  });
  io && io.disconnect();
  io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && [...dots.children].forEach((d, k) => d.classList.toggle('on', k === slides.indexOf(e.target)))), {threshold: .55});
  slides.forEach(s => io.observe(s));
}
addEventListener('keydown', e => {
  if ($('dialog[open]')) return;
  const sl = $$('.slide'), cur = [...$('#dots').children].findIndex(d => d.classList.contains('on'));
  if (['ArrowDown', 'PageDown'].includes(e.key)) sl[Math.min(cur + 1, sl.length - 1)].scrollIntoView();
  if (['ArrowUp', 'PageUp'].includes(e.key)) sl[Math.max(cur - 1, 0)].scrollIntoView();
});

/* ---------- Fiche détaillée d'un projet ---------- */
$('#projects').addEventListener('click', e => { const b = e.target.closest('.more'); if (b) detail(b.dataset.id); });
function detail(id) {
  const p = projects.find(x => x.id === id), im = p.images || [];
  const all = [im[0], im[1], im[2], ...(p.gallery || []), im[3]].filter(Boolean);
  const rows = [['Location', p.loc], ['Client', p.client], ['Area', p.surface], ['Style', p.style], ['Year', p.year], ['Duration', p.duration], ['My role', p.role], ['Materials', p.materials]]
    .filter(r => r[1]).map(r => `<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join('');
  $('#dbody').innerHTML = `<img id="dbig" src="${esc(all[0] || '')}" alt="${esc(p.title)}">
    <div class="dth">${all.map((u, i) => `<img src="${esc(u)}" alt="View ${i + 1}" class="${i ? '' : 'on'}">`).join('')}</div>
    <div class="dtxt"><h2>${esc(p.title)}</h2>${p.concept ? `<p><b>${esc(p.concept)}</b></p>` : ''}
    ${(p.description || '').split('\n').filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('')}<dl>${rows}</dl></div>`;
  $('#det').showModal();
}
$('#dbody').addEventListener('click', e => {
  if (e.target.matches('.dth img')) { $('#dbig').src = e.target.src; $$('.dth img').forEach(i => i.classList.toggle('on', i === e.target)); }
});
$('#dclose').onclick = () => $('#det').close();
$('#det').addEventListener('click', e => e.target.id === 'det' && e.target.close());

/* ---------- Éditeur ---------- */
const dlg = $('#dlg'), form = $('#form');
const commit = async () => { if (await save()) { render(); list(); return true; } return false; };
function list() {
  const ul = $('#plist'); ul.innerHTML = projects.length ? '' : '<li>Aucun projet pour le moment.</li>';
  projects.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `<div class="t" style="${bg(p.images?.[0])}"></div><span>${esc(p.title)}<small>${CATS[p.cat].toc}</small></span>
      <button data-a="u" title="Move up">↑</button><button data-a="e">Edit</button><button data-a="d">Delete</button>`;
    li.onclick = async e => {
      const a = e.target.dataset.a;
      if (a === 'e') fill(p);
      if (a === 'd' && confirm(`Delete “${p.title}”?`)) { projects = projects.filter(x => x !== p); commit(); }
      if (a === 'u') { const i = projects.indexOf(p); if (i) { [projects[i - 1], projects[i]] = [projects[i], projects[i - 1]]; commit(); } }
    };
    ul.appendChild(li);
  });
}
function fill(p) {
  form.reset();
  cur = p ? structuredClone(p) : {images: ['', '', '', ''], gallery: []};
  cur.images = [0, 1, 2, 3].map(i => cur.images?.[i] || ''); cur.gallery ||= [];
  FIELDS.forEach(n => form.elements[n].value = p?.[n] ?? (n === 'cat' ? 'res' : ''));
  $('#ftitle').textContent = p ? 'Edit project' : 'New project';
  media();
}
function media() {
  $('#media').innerHTML = SLOTS.map((l, i) => `<div class="slot"><div class="thumb" style="${bg(cur.images[i])}"></div><b>${l}</b>
    <label class="btn">Choose<input type="file" accept="image/*" data-s="${i}" hidden></label>${cur.images[i] ? `<button type="button" data-x="${i}">Remove</button>` : ''}</div>`).join('');
  $('#gal').innerHTML = cur.gallery.map((g, i) => `<div class="slot"><div class="thumb" style="${bg(g)}"></div><button type="button" data-g="${i}">Remove</button></div>`).join('') || '<p class="hint">No additional photos.</p>';
}
async function pick(files, fn) {
  try { for (const f of files) fn(await upload(f)); media(); } catch { alert("Image not uploaded (invalid file, connection or password)."); }
}
$('#media').onchange = e => { const i = e.target.dataset.s; if (i !== undefined) pick([e.target.files[0]], u => cur.images[i] = u); };
$('#media').onclick = e => { if (e.target.dataset.x) { cur.images[e.target.dataset.x] = ''; media(); } };
$('#gal').onclick = e => { if (e.target.dataset.g) { cur.gallery.splice(e.target.dataset.g, 1); media(); } };
$('#gadd').onchange = e => { pick([...e.target.files], u => cur.gallery.push(u)); e.target.value = ''; };

form.onsubmit = async e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form)), old = projects.find(p => p.id === d.id);
  const p = {...d, id: old ? old.id : 'p' + Date.now(), images: cur.images, gallery: cur.gallery};
  old ? projects[projects.indexOf(old)] = p : projects.push(p);
  if (await commit()) { fill(null); document.getElementById('p-' + p.id)?.scrollIntoView(); }
};
// Le mot de passe est redemandé à CHAQUE clic sur « Gérer les projets »
$('#edit').onclick = async () => {
  await logout();
  if (!await auth(true)) return;
  list(); fill(null); dlg.showModal();
};
dlg.addEventListener('close', logout);   // session fermée dès que la fenêtre est fermée
$('#close').onclick = () => dlg.close();
$('#cancel').onclick = () => fill(null);
$('#reset').onclick = async () => {
  if (!confirm('Delete the local draft and reload the published projects?')) return;
  await kv('readwrite', s => s.delete('draft')).catch(() => {}); location.reload();
};
$('#exp').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['window.PORTFOLIO=' + JSON.stringify(projects) + ';'], {type: 'text/javascript'}));
  a.download = 'projects.js'; a.click(); URL.revokeObjectURL(a.href);
};
$('#imp').onchange = async e => {
  try {
    const t = (await e.target.files[0].text()).replace(/^\s*window\.PORTFOLIO\s*=/, '').replace(/;\s*$/, '');
    const data = JSON.parse(t);
    if (!Array.isArray(data) || !data.every(p => CATS[p.cat] && p.title)) throw 0;
    projects = data.map(p => ({...p, id: String(p.id || Date.now() + Math.random())}));
    await commit();
  } catch { alert('Invalid file: choose a projects.js or .json file exported from this portfolio.'); }
  e.target.value = '';
};

/* ---------- Démarrage ---------- */
(async () => {
  $$('.ph').forEach(el => { for (const [sel, n] of Object.entries(PAGE_IMG)) if (el.matches(sel)) el.style.backgroundImage = `url(img/${n.includes('.') ? n : n + '.svg'})`; });
  if (admin) {
    await detect();
    if (mode === 'local') { try { const d = await kv('readonly', s => s.get('draft')); if (Array.isArray(d)) projects = d; } catch {} }
    $('#edit').hidden = false;
    $('#modeinfo').textContent = mode === 'server'
      ? 'Online mode: every save is published to the site immediately.'
      : 'Local mode: your changes are kept in this browser. Click “Export” then replace data/projects.js on your hosting.';
  }
  render();
})();
