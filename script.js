/* ============================================
   CLAUDE BUILDER CLUB — IIT MADRAS
   Dark mode, scroll reveal, mobile menu, smooth scroll,
   button ripple + Hackathon Showcase (filter, form, localStorage)
   ============================================ */

// ── Dark / Light Mode Toggle ──
(function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('cbc-theme');

  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('cbc-theme', next);

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
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.01, rootMargin: '0px' }
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

// ── Smooth scroll (skip modal triggers) ──
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  if (anchor.classList.contains('open-submit-modal')) return;
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// ── Card Color Rotation ──
const CARD_COLORS = ['color-pink', 'color-olive', 'color-blue', 'color-orange', 'color-lightpink'];
const TAG_COLORS = ['tag-color-0', 'tag-color-1', 'tag-color-2', 'tag-color-3', 'tag-color-4'];

// ── Supabase Config ──
const SUPABASE_URL = 'https://ulpiksmbqrkgphgfhlwz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscGlrc21icXJrZ3BoZ2ZobHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzk4OTgsImV4cCI6MjA5MDgxNTg5OH0.NqwgvqFOUvToS7QHU7JZb4v6z0FXivaCNQ1cQ6l0s80';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth & Modal State ──
let intendedAction = null;
let currentBuilderEmail = localStorage.getItem('cbc_builder_email') || null;

// ── Auth Modal (Magic Link Verification) ──
const loginModal = document.getElementById('loginModal');
const closeLoginBtn = document.getElementById('closeLoginModal');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');

function openLoginModal() {
  loginError.style.display = 'none';
  loginModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLoginModal() {
  loginModal.classList.remove('active');
  document.body.style.overflow = '';
  intendedAction = null;
}
if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLoginModal);
loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeLoginModal(); });

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.style.display = 'none';
  const email = document.getElementById('adminEmail').value.trim();
  
  loginSubmitBtn.textContent = 'Verifying...';
  loginSubmitBtn.disabled = true;

  // Query authorized_emails
  const { data, error } = await supabaseClient
    .from('authorized_emails')
    .select('role')
    .eq('email', email)
    .single();

  loginSubmitBtn.disabled = false;
  loginSubmitBtn.textContent = 'Verify Access';

  if (!data || (data.role !== 'admin' && data.role !== 'ambassador')) {
    loginError.textContent = 'Access Denied: Email not authorized to submit builds.';
    loginError.style.display = 'block';
    loginError.style.color = '#D32F2F';
  } else {
    // Access granted
    currentBuilderEmail = email;
    localStorage.setItem('cbc_builder_email', email);
    loginError.style.display = 'none';
    loginForm.reset();
    closeLoginModal();
    
    // Automatically open submit modal because they just passed verification
    openSubmitModalOriginal();
  }
});

// ── Submit Modal ──
const submitModal = document.getElementById('submitModal');
const closeModalBtn = document.getElementById('closeSubmitModal');

async function openSubmitModal(e) {
  if (e) e.preventDefault();
  
  // Real-time synchronization check across tabs
  currentBuilderEmail = localStorage.getItem('cbc_builder_email') || null;
  
  if (!currentBuilderEmail) {
    intendedAction = 'submit';
    openLoginModal();
    return;
  }
  
  // Re-verify user role before opening submit modal as extra precaution
  const { data, error } = await supabaseClient
    .from('authorized_emails')
    .select('role')
    .eq('email', currentBuilderEmail)
    .single();

  if (!data || (data.role !== 'admin' && data.role !== 'ambassador')) {
    alert("Access Denied: Your email is not authorized to submit builds. Please use an authorized email.");
    currentBuilderEmail = null;
    localStorage.removeItem('cbc_builder_email');
    return;
  }
  
  openSubmitModalOriginal();
}
function openSubmitModalOriginal() {
  submitModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSubmitModal() {
  submitModal.classList.remove('active');
  document.body.style.overflow = '';
}

closeModalBtn.addEventListener('click', closeSubmitModal);
submitModal.addEventListener('click', (e) => { if (e.target === submitModal) closeSubmitModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && submitModal.classList.contains('active')) closeSubmitModal(); });
document.querySelectorAll('.open-submit-modal').forEach((el) => { el.addEventListener('click', openSubmitModal); });

// Admin modal logic moved to /admin/admin.js


// ── Database Fetching ──
async function fetchProjects() {
  const { data, error } = await supabaseClient
    .from('submissions')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });
    
  if (!error && data) {
    projects = data;
    renderProjects();
  }
}

// ── State ──
let projects = [];
let activeCategory = 'all';
let searchQuery = '';
let renderLimit = 9;

// ── DOM ──
const projectsGrid = document.getElementById('projectsGrid');
const emptyState = document.getElementById('emptyState');
const noProjectsYet = document.getElementById('noProjectsYet');
const searchInput = document.getElementById('searchInput');
const categoryPills = document.getElementById('categoryPills');
const submitForm = document.getElementById('submitForm');
const charCount = document.getElementById('charCount');
const charHint = document.getElementById('charHint');
const description = document.getElementById('description');
const tagOptions = document.getElementById('tagOptions');
const toast = document.getElementById('toast');

// ── HTML Escape ──
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ── Card Rendering ──
function createProjectCard(project, index) {
  const colorClass = CARD_COLORS[index % CARD_COLORS.length];
  const card = document.createElement('article');
  card.className = 'project-card reveal visible';

  const actions = [];
  if (project.videoUrl)    actions.push(`<a href="${escapeHtml(project.videoUrl)}" target="_blank" rel="noopener" class="card-action-btn">View Demo</a>`);
  if (project.githubUrl)   actions.push(`<a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener" class="card-action-btn">View Code</a>`);
  if (project.websiteUrl)  actions.push(`<a href="${escapeHtml(project.websiteUrl)}" target="_blank" rel="noopener" class="card-action-btn">View Website</a>`);
  if (project.artifactUrl) actions.push(`<a href="${escapeHtml(project.artifactUrl)}" target="_blank" rel="noopener" class="card-action-btn">View Artifact</a>`);
  if (actions.length === 0) actions.push(`<span class="card-action-btn" style="opacity:.5;cursor:default;">No links provided</span>`);

  let safeTags = project.tags || [];
  if (typeof safeTags === 'string') {
    try { safeTags = JSON.parse(safeTags); } catch(e) { safeTags = [safeTags]; }
  }

  const tagsHtml = safeTags.map((tag, i) => {
    return `<span class="card-tag ${TAG_COLORS[i % TAG_COLORS.length]}">${escapeHtml(tag)}</span>`;
  }).join('');

  card.innerHTML = `
    <div class="card-color-top ${colorClass}"></div>
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(project.name)}</h3>
      <p class="card-meta">${escapeHtml(project.builder)} · ${escapeHtml(project.school)}</p>
      <p class="card-desc">${escapeHtml(project.description)}</p>
      <div class="card-tags">${tagsHtml}</div>
      <div class="card-actions">${actions.join('')}</div>
    </div>
  `;
  return card;
}

function renderProjects() {
  const filtered = projects.filter((p) => {
    let pTags = p.tags || [];
    if (typeof pTags === 'string') {
      try { pTags = JSON.parse(pTags); } catch(e) { pTags = [pTags]; }
    }

    const matchesCat = activeCategory === 'all' || pTags.includes(activeCategory);
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.builder || '').toLowerCase().includes(q) ||
      (p.school || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      pTags.some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  projectsGrid.innerHTML = '';
  emptyState.style.display = 'none';
  noProjectsYet.style.display = 'none';

  if (projects.length === 0) {
    noProjectsYet.style.display = '';
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    return;
  }
  if (filtered.length === 0) {
    emptyState.style.display = '';
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    return;
  }

  const toRender = filtered.slice(0, renderLimit);
  toRender.forEach((project, index) => {
    projectsGrid.appendChild(createProjectCard(project, index));
  });

  const loadMoreContainer = document.getElementById('loadMoreContainer');
  if (loadMoreContainer) {
    if (filtered.length > renderLimit) {
      loadMoreContainer.style.display = 'block';
    } else {
      loadMoreContainer.style.display = 'none';
    }
  }
}

// ── Category Filtering ──
categoryPills.addEventListener('click', (e) => {
  const btn = e.target.closest('.cat-pill');
  if (!btn) return;
  categoryPills.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = btn.dataset.cat;
  renderLimit = 9;
  renderProjects();
});

// ── Search ──
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderLimit = 9;
  renderProjects();
});

// ── Load More ──
const loadMoreBtn = document.getElementById('loadMoreBtn');
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    renderLimit += 9;
    renderProjects();
  });
}

// ── Tag Selection (Form) ──
let selectedTags = new Set();
tagOptions.addEventListener('click', (e) => {
  const btn = e.target.closest('.tag-btn');
  if (!btn) return;
  const tag = btn.dataset.tag;
  if (selectedTags.has(tag)) {
    selectedTags.delete(tag);
    btn.classList.remove('selected');
  } else {
    selectedTags.add(tag);
    btn.classList.add('selected');
  }
});

// ── Character Count ──
description.addEventListener('input', () => {
  const len = description.value.length;
  charCount.textContent = `${len}/250`;
  const remaining = 50 - len;
  if (remaining > 0) {
    charHint.textContent = `${remaining} more characters needed`;
    charHint.style.color = '';
  } else {
    charHint.textContent = '✓ Minimum reached';
    charHint.style.color = '#788C5D';
  }
});

// ── Form Submission ──
submitForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('projectName').value.trim();
  const builder = document.getElementById('builderName').value.trim();
  const school = document.getElementById('schoolSelect').value;
  const githubUrl = document.getElementById('githubUrl').value.trim();
  const websiteUrl = document.getElementById('websiteUrl').value.trim();
  const artifactUrl = document.getElementById('artifactUrl').value.trim();
  const videoUrl = document.getElementById('videoUrl').value.trim();
  const desc = description.value.trim();
  const tags = [...selectedTags];

  // Validation
  let valid = true;
  const clearErr = (id) => document.getElementById(id).classList.remove('error');
  const setErr = (id) => { document.getElementById(id).classList.add('error'); valid = false; };

  name ? clearErr('projectName') : setErr('projectName');
  builder ? clearErr('builderName') : setErr('builderName');
  school ? clearErr('schoolSelect') : setErr('schoolSelect');

  if (!githubUrl && !websiteUrl && !artifactUrl) {
    ['githubUrl', 'websiteUrl', 'artifactUrl'].forEach(setErr);
  } else {
    ['githubUrl', 'websiteUrl', 'artifactUrl'].forEach(clearErr);
  }

  if (desc.length < 50) { description.classList.add('error'); valid = false; } else { description.classList.remove('error'); }
  if (tags.length === 0) valid = false;

  if (!valid) return;

  const projectData = {
    name, builder, school,
    githubUrl: githubUrl || null,
    websiteUrl: websiteUrl || null,
    artifactUrl: artifactUrl || null,
    videoUrl: videoUrl || null,
    description: desc,
    tags
  };

  const submitBtn = document.getElementById('formSubmitBtn');
  const orgBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Saving...';
  submitBtn.disabled = true;

  if (editingProjectId) {
    const { error } = await supabaseClient.from('submissions').update(projectData).eq('id', editingProjectId);
    if (!error) {
      editingProjectId = null;
      document.querySelector('#submitModal .modal-title').textContent = 'Submit Your Build';
    } else {
      console.error(error);
      alert('Error updating build. Ensure you are logged in as admin.');
    }
  } else {
    const { error } = await supabaseClient.from('submissions').insert([projectData]);
    if (error) {
      console.error(error);
      alert('Error submitting build!');
    }
  }

  submitBtn.textContent = orgBtnText;
  submitBtn.disabled = false;

  // Reset
  submitForm.reset();
  selectedTags.clear();
  tagOptions.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('selected'));
  charCount.textContent = '0/250';
  charHint.textContent = '50 more characters needed';
  charHint.style.color = '';

  showToast();
  closeSubmitModal();
  await fetchProjects();

  // Scroll to showcase
  setTimeout(() => {
    document.getElementById('showcase').scrollIntoView({ behavior: 'smooth' });
  }, 600);
});

// ── Toast ──
function showToast() {
  toast.style.display = 'flex';
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.style.display = 'none'; }, 400);
  }, 3000);
}

// Admin CRUD functions moved to /admin/admin.js

// ── Admin Session Check ──
async function checkAdminSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session && session.user) {
    const { data } = await supabaseClient
      .from('authorized_emails')
      .select('role')
      .eq('email', session.user.email)
      .single();
      
    if (data && data.role === 'admin') {
      const adminBtn = document.getElementById('adminLoginBtn');
      if (adminBtn) adminBtn.textContent = 'Admin Hub';
    }
    
    if (data && (data.role === 'admin' || data.role === 'ambassador')) {
      currentBuilderEmail = session.user.email;
      localStorage.setItem('cbc_builder_email', session.user.email);
    }
  }
}

// ── Init ──
checkAdminSession();
fetchProjects();
