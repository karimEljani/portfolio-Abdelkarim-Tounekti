/* ===== Animations « architecture » =====
   - révélation au défilement (textes, images en « rideau »)
   - plan d'architecte dessiné trait par trait
   - titre lettre par lettre, barre de progression, réticule CAO */
document.documentElement.classList.add('js');
const $$a = (s, r = document) => [...r.querySelectorAll(s)];

// Plan d'étage décoratif (chaque trait est dessiné via stroke-dashoffset)
const PLAN = `<svg class="bp" viewBox="0 0 400 270" aria-hidden="true">
  <path pathLength="1" style="--k:0" d="M20 20H380V240H20Z"/>
  <path pathLength="1" style="--k:1" d="M170 20V150H20M170 190V240M270 20V110H380"/>
  <path pathLength="1" style="--k:2" d="M170 190A40 40 0 0 1 210 150M270 110A30 30 0 0 0 300 80"/>
  <rect pathLength="1" style="--k:3" x="40" y="40" width="90" height="60"/>
  <rect pathLength="1" style="--k:3" x="200" y="160" width="110" height="60"/>
  <circle pathLength="1" style="--k:4" cx="325" cy="60" r="26"/>
  <path class="dim" pathLength="1" style="--k:5" d="M20 256H380M20 250V262M380 250V262"/>
  <path class="dim" pathLength="1" style="--k:6" d="M394 20V240M388 20H400M388 240H400"/>
</svg>`;
const WITH_PLAN = ['s0', 's1', 's3'];
const SEL = '.num,.title,.sub,.loc,.project>h2,.hero h2,.hero p,.tags,.toc li,.skills article,.vals li,.steps li,.col>p,.col>.sign,.col>blockquote,.mark,.col>hr,.info li,.social,.cta,.quote-s,.cv>div,.cvlink,.more,.pinfo>*,.pgrid>.ph,.thumbs>.ph,.gallery .ph,.side';

const reveal = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); reveal.unobserve(e.target);
  // après l'entrée, on retire les délais pour que les survols restent instantanés
  setTimeout(() => $$a('.rv,.rvimg', e.target).forEach(el => el.style.transitionDelay = '0s'), 3000);
}), {threshold: .3});

function decorate(s) {
  if (s.dataset.d) return; s.dataset.d = 1;
  if (WITH_PLAN.includes(s.id)) s.insertAdjacentHTML('afterbegin', PLAN);
  let i = 0;
  $$a(SEL, s).forEach(el => {
    if (el.parentElement.closest('.rv,.rvimg')) return;
    el.classList.add(el.matches('.ph') ? 'rvimg' : 'rv');
    el.style.setProperty('--i', Math.min(i++, 12));
  });
  reveal.observe(s);
}
const scan = () => $$a('.slide').forEach(decorate);

// Titre d'accueil : une lettre = un <span> animé
const h1 = document.querySelector('.hero h1');
if (h1) h1.innerHTML = [...h1.textContent].map((c, i) => `<span style="--c:${i}">${c}</span>`).join('');

scan();
// Les pages projets sont créées dynamiquement : on les anime dès leur apparition
new MutationObserver(scan).observe(document.getElementById('projects'), {childList: true});

/* Barre de progression */
const bar = document.getElementById('bar');
let tick = false;
addEventListener('scroll', () => {
  if (tick) return; tick = true;
  requestAnimationFrame(() => {
    bar.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`; tick = false;
  });
}, {passive: true});

/* Réticule de dessin : suit la souris et affiche des coordonnées (souris uniquement) */
if (matchMedia('(pointer:fine)').matches) {
  const x = document.getElementById('ch-x'), y = document.getElementById('ch-y'), l = document.getElementById('ch-l');
  addEventListener('pointermove', e => {
    document.body.classList.add('ch');
    x.style.transform = `translateY(${e.clientY}px)`; y.style.transform = `translateX(${e.clientX}px)`;
    l.style.transform = `translate(${e.clientX + 12}px,${e.clientY + 12}px)`;
    l.textContent = `X ${String(Math.round(e.clientX)).padStart(4, '0')} · Y ${String(Math.round(e.clientY)).padStart(4, '0')}`;
  });
  document.addEventListener('pointerleave', () => document.body.classList.remove('ch'));
}
