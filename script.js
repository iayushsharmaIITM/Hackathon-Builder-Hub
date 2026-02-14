/* ============================================
   CLAUDE BUILDER CLUB — IIT MADRAS
   Scroll reveal, navbar, mobile menu, dark mode
   ============================================ */

// ── Dark / Light Mode Toggle ──
(function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('cbc-theme');

  // Apply saved preference or respect system preference
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('cbc-theme', next);

    // Quick spin animation on toggle
    toggle.style.transform = 'rotate(180deg) scale(1.15)';
    setTimeout(() => { toggle.style.transform = ''; }, 350);
  });
})();

// ── Button Ripple / Glow Follow ──
document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--x', ((e.clientX - rect.left) / rect.width * 100) + '%');
    btn.style.setProperty('--y', ((e.clientY - rect.top) / rect.height * 100) + '%');
  });
});

// ── Scroll Reveal ──
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        const siblings = parent ? [...parent.querySelectorAll(':scope > .reveal')] : [];
        const idx = siblings.indexOf(entry.target);
        const delay = idx >= 0 ? idx * 100 : 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);
revealElements.forEach((el) => revealObserver.observe(el));

// ── Navbar scroll ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
});

// ── Mobile hamburger ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navActions = document.getElementById('navActions');

function closeMobileMenu() {
  navLinks.classList.remove('open');
  if (navActions) navActions.classList.remove('open');
  const spans = hamburger.querySelectorAll('span');
  spans[0].style.transform = '';
  spans[1].style.opacity = '';
  spans[2].style.transform = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    navLinks.classList.add('open');
    if (navActions) navActions.classList.add('open');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  }
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

// ── Smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
