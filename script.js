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
  const email = document.getElementById('adminEmail').value;
  
  loginSubmitBtn.textContent = 'Sending Magic Link...';
  loginSubmitBtn.disabled = true;

  const { error } = await supabaseClient.auth.signInWithOtp({ email });

  loginSubmitBtn.disabled = false;
  loginSubmitBtn.textContent = 'Send Magic Link';

  if (error) {
    loginError.textContent = error.message;
    loginError.style.display = 'block';
    loginError.style.color = '#D32F2F';
  } else {
    loginError.textContent = 'Check your email for the magic link!';
    loginError.style.display = 'block';
    loginError.style.color = '#788C5D';
    loginForm.reset();
  }
});

// ── Submit Modal ──
const submitModal = document.getElementById('submitModal');
const closeModalBtn = document.getElementById('closeSubmitModal');

async function openSubmitModal(e) {
  if (e) e.preventDefault();
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    intendedAction = 'submit';
    openLoginModal();
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

// ── Admin Modal ──
const adminModal = document.getElementById('adminModal');
const closeAdminBtn = document.getElementById('closeAdminModal');
const openAdminBtn = document.getElementById('openAdminModal');
const adminList = document.getElementById('adminList');
let editingProjectId = null;

async function openAdminModal(e) {
  if (e) e.preventDefault();
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    intendedAction = 'admin';
    openLoginModal();
    return;
  }
  openAdminModalOriginal();
}
function openAdminModalOriginal() {
  adminModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderAdminProjects();
}
function closeAdminModal() {
  adminModal.classList.remove('active');
  document.body.style.overflow = '';
}

if (openAdminBtn) openAdminBtn.addEventListener('click', openAdminModal);
if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdminModal);
adminModal.addEventListener('click', (e) => { if (e.target === adminModal) closeAdminModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminModal.classList.contains('active')) closeAdminModal(); });

// ── Global Auth Listener ──
supabaseClient.auth.onAuthStateChange((event, session) => {
  // If session logic is needed later, handle it here.
  // For now, magic link auth retains the session globally.
});


// ── Database Fetching ──
async function fetchProjects() {
  const { data, error } = await supabaseClient
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (!error && data) {
    projects = data;
    renderProjects();
    renderAdminProjects();
  }
}

// ── State ──
let projects = [];
let activeCategory = 'all';
let searchQuery = '';

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

  const tagsHtml = (project.tags || []).map((tag, i) => {
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
    const matchesCat = activeCategory === 'all' || (p.tags || []).includes(activeCategory);
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.builder || '').toLowerCase().includes(q) ||
      (p.school || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  projectsGrid.innerHTML = '';
  emptyState.style.display = 'none';
  noProjectsYet.style.display = 'none';

  if (projects.length === 0) {
    noProjectsYet.style.display = '';
    return;
  }
  if (filtered.length === 0) {
    emptyState.style.display = '';
    return;
  }

  filtered.forEach((project, index) => {
    projectsGrid.appendChild(createProjectCard(project, index));
  });
}

// ── Category Filtering ──
categoryPills.addEventListener('click', (e) => {
  const btn = e.target.closest('.cat-pill');
  if (!btn) return;
  categoryPills.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = btn.dataset.cat;
  renderProjects();
});

// ── Search ──
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderProjects();
});

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

// ── Admin Functions ──
function renderAdminProjects() {
  if (!adminList) return;
  
  if (projects.length === 0) {
    adminList.innerHTML = '<p style="color: var(--text-light); padding: 16px;">No projects submitted yet.</p>';
    return;
  }

  adminList.innerHTML = projects.map(p => `
    <div class="admin-item">
      <div class="admin-item-info">
        <div class="admin-item-title">${escapeHtml(p.name)}</div>
        <div class="admin-item-meta">${escapeHtml(p.builder)} · ${escapeHtml(p.school)}</div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-admin-edit" onclick="editProject(${p.id})">Edit</button>
        <button class="btn-admin-delete" onclick="deleteProject(${p.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

window.deleteProject = async function(id) {
  if (!confirm('Are you sure you want to delete this build?')) return;
  const { error } = await supabaseClient.from('submissions').delete().eq('id', id);
  if (error) {
    alert('Failed to delete. Ensure you are logged in as admin.');
    console.error(error);
  } else {
    await fetchProjects();
  }
};

window.editProject = function(id) {
  const p = projects.find(pro => pro.id === id);
  if (!p) return;
  
  editingProjectId = p.id;
  
  // Close admin, open submit
  closeAdminModal();
  openSubmitModal();
  document.querySelector('#submitModal .modal-title').textContent = 'Edit Your Build';
  
  // Populate form
  document.getElementById('projectName').value = p.name;
  document.getElementById('builderName').value = p.builder;
  document.getElementById('schoolSelect').value = p.school;
  document.getElementById('githubUrl').value = p.githubUrl || '';
  document.getElementById('websiteUrl').value = p.websiteUrl || '';
  document.getElementById('artifactUrl').value = p.artifactUrl || '';
  document.getElementById('videoUrl').value = p.videoUrl || '';
  description.value = p.description;
  
  // Tags
  selectedTags.clear();
  tagOptions.querySelectorAll('.tag-btn').forEach(btn => {
    btn.classList.remove('selected');
    if (p.tags && p.tags.includes(btn.dataset.tag)) {
      selectedTags.add(btn.dataset.tag);
      btn.classList.add('selected');
    }
  });
  
  // Update character count
  charCount.textContent = `${p.description.length}/250`;
  const remaining = 50 - p.description.length;
  if (remaining > 0) {
    charHint.textContent = `${remaining} more characters needed`;
    charHint.style.color = '';
  } else {
    charHint.textContent = '✓ Minimum reached';
    charHint.style.color = '#788C5D';
  }
};

// ── Init ──
fetchProjects();
