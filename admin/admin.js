// ── Supabase Config ──
const SUPABASE_URL = 'https://ulpiksmbqrkgphgfhlwz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscGlrc21icXJrZ3BoZ2ZobHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzk4OTgsImV4cCI6MjA5MDgxNTg5OH0.NqwgvqFOUvToS7QHU7JZb4v6z0FXivaCNQ1cQ6l0s80';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Dark / Light Mode Toggle ──
(function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('cbc-theme');

  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cbc-theme', next);

      toggle.style.transform = 'rotate(180deg) scale(1.15)';
      setTimeout(() => { toggle.style.transform = ''; }, 350);
    });
  }
})();

// ── DOM Elements ──
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('adminLoginForm');
const loginMessage = document.getElementById('loginMessage');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const logoutBtn = document.getElementById('logoutBtn');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

const projectsList = document.getElementById('projectsList');
const emailsList = document.getElementById('emailsList');

const csvFileInput = document.getElementById('csvFileInput');
const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
const addSingleEmailBtn = document.getElementById('addSingleEmailBtn');
const cancelAddEmailBtn = document.getElementById('cancelAddEmailBtn');
const addEmailForm = document.getElementById('addEmailForm');

// ── State ──
let isAdmin = false;
let userEmail = null;

// ── Init & Auth ──
async function initSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (session && session.user) {
    userEmail = session.user.email;
    await verifyAdminStatus(userEmail);
  } else {
    showLogin();
  }
}

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    userEmail = session.user.email;
    verifyAdminStatus(userEmail);
  } else if (event === 'SIGNED_OUT') {
    isAdmin = false;
    userEmail = null;
    showLogin();
  }
});

async function verifyAdminStatus(email) {
  // Query authorized_emails table directly
  const { data, error } = await supabaseClient
    .from('authorized_emails')
    .select('*')
    .eq('email', email)
    .single();

  if (data && data.role === 'admin') {
    // Is an admin
    isAdmin = true;
    showDashboard();
  } else {
    // Not an admin
    isAdmin = false;
    alert('Access Denied: Your email does not have admin privileges.');
    await supabaseClient.auth.signOut();
  }
}

function showLogin() {
  loginView.classList.add('active');
  dashboardView.classList.remove('active');
  logoutBtn.style.display = 'none';
}

function showDashboard() {
  loginView.classList.remove('active');
  dashboardView.classList.add('active');
  logoutBtn.style.display = 'block';
  loadProjects();
  loadEmails();
}

// ── Login Flow ──
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginMessage.style.display = 'none';
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  
  loginSubmitBtn.textContent = 'Logging in...';
  loginSubmitBtn.disabled = true;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  loginSubmitBtn.disabled = false;
  loginSubmitBtn.textContent = 'Log In';
  
  if (error) {
    loginMessage.textContent = error.message;
    loginMessage.style.color = '#D32F2F';
    loginMessage.style.display = 'block';
  } else {
    loginMessage.style.display = 'none';
    loginForm.reset();
  }
});

logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
});

// ── Tabs ──
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// ── Data Fetching & Rendering ──
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

async function loadProjects() {
  const { data, error } = await supabaseClient
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    projectsList.innerHTML = `<p style="color:red">Failed to load projects: ${error.message}</p>`;
    return;
  }

  if (data.length === 0) {
    projectsList.innerHTML = '<p style="color:var(--text-light); padding: 1rem;">No projects submitted yet.</p>';
    return;
  }

  projectsList.innerHTML = data.map(p => `
    <div class="admin-item">
      <div class="admin-item-info">
        <div class="admin-item-title">
          ${escapeHtml(p.name)}
          <span style="font-size: 0.75rem; margin-left: 8px; padding: 2px 8px; border-radius: 12px; background: ${p.approved ? '#e6f4ea' : '#fce8e6'}; color: ${p.approved ? '#137333' : '#c5221f'}; font-weight: 500;">
            ${p.approved ? 'Approved ✅' : 'Pending ⏳'}
          </span>
        </div>
        <div class="admin-item-meta">${escapeHtml(p.builder)} · ${escapeHtml(p.school)}</div>
      </div>
      <div class="admin-item-actions">
        <button class="btn-admin" style="font-size: 0.8rem; padding: 4px 10px; margin-right: 8px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; background: transparent; color: var(--text);" onclick="toggleApproval(${p.id}, ${!!p.approved})">
          ${p.approved ? 'Hide' : 'Approve'}
        </button>
        <button class="btn-admin-delete" onclick="deleteProject(${p.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

window.deleteProject = async function(id) {
  if (!confirm('Are you sure you want to delete this project? This will remove it from the showcase.')) return;
  const { error } = await supabaseClient.from('submissions').delete().eq('id', id);
  if (error) alert('Failed to delete project: ' + error.message);
  else loadProjects();
};

window.toggleApproval = async function(id, isApproved) {
  const newStatus = !isApproved;
  const { error } = await supabaseClient
    .from('submissions')
    .update({ approved: newStatus })
    .eq('id', id);
    
  if (error) {
    alert('Failed to update project status: ' + error.message);
  } else {
    loadProjects();
  }
};

async function loadEmails() {
  const { data, error } = await supabaseClient
    .from('authorized_emails')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    emailsList.innerHTML = `<p style="color:red">Failed to load emails: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    emailsList.innerHTML = '<p style="color:var(--text-light); padding: 1rem;">No authorized emails found. (Add one!)</p>';
    return;
  }

  emailsList.innerHTML = data.map(e => `
    <div class="admin-item">
      <div class="admin-item-info">
        <div class="admin-item-title">${escapeHtml(e.email)}</div>
        <div class="admin-item-meta">Role: ${escapeHtml(e.role || 'admin')}</div>
      </div>
      <div class="admin-item-actions">
        ${e.email !== userEmail ? `<button class="btn-admin-delete" onclick="deleteEmail('${e.id}')">Remove</button>` : '<span style="font-size:0.8rem; color:var(--text-light); padding:6px;">Current User</span>'}
      </div>
    </div>
  `).join('');
}

window.deleteEmail = async function(id) {
  if (!confirm('Remove this email from authorized admins?')) return;
  const { error } = await supabaseClient.from('authorized_emails').delete().eq('id', id);
  if (error) alert('Failed to remove email: ' + error.message);
  else loadEmails();
};

// ── Email Management ──
addSingleEmailBtn.addEventListener('click', () => {
  addEmailForm.style.display = 'block';
  document.getElementById('newAdminEmail').focus();
});
cancelAddEmailBtn.addEventListener('click', () => {
  addEmailForm.style.display = 'none';
  addEmailForm.reset();
  document.getElementById('newAdminPassword').style.display = 'none';
});

document.getElementById('newUserRole').addEventListener('change', (e) => {
  const passEl = document.getElementById('newAdminPassword');
  if (e.target.value === 'admin') {
    passEl.style.display = 'block';
    passEl.required = true;
  } else {
    passEl.style.display = 'none';
    passEl.required = false;
    passEl.value = '';
  }
});

addEmailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('newAdminEmail').value.trim();
  const role = document.getElementById('newUserRole').value;
  const password = document.getElementById('newAdminPassword').value;
  if (!email) return;

  const btn = addEmailForm.querySelector('button[type="submit"]');
  btn.textContent = 'Adding...';
  btn.disabled = true;

  if (role === 'admin') {
    if (!password) {
      alert("You must define a password when creating an Admin.");
      btn.textContent = 'Add'; btn.disabled = false; return;
    }
    const { error: authError } = await supabaseClient.auth.signUp({ email, password });
    if (authError) {
      alert('Error registering Supabase Auth Password: ' + authError.message);
      btn.textContent = 'Add'; btn.disabled = false; return;
    }
  }

  const { error } = await supabaseClient.from('authorized_emails').insert([{ email, role }]);
  
  if (error) {
    alert('Failed to add email reference: ' + error.message);
    btn.textContent = 'Add';
    btn.disabled = false;
  } else {
    btn.textContent = 'Add';
    btn.disabled = false;
    addEmailForm.reset();
    document.getElementById('newAdminPassword').style.display = 'none';
    addEmailForm.style.display = 'none';
    loadEmails();
  }
});

// CSV Upload
downloadTemplateBtn.addEventListener('click', () => {
  const csvContent = "data:text/csv;charset=utf-8,email,role\nadmin1@example.com,admin\nambassador1@example.com,ambassador";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "admin_template.csv");
  document.body.appendChild(link); // Required for FF
  link.click();
  document.body.removeChild(link);
});

csvFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(event) {
    const text = event.target.result;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const emailsToInsert = [];
    
    // Skip header if it exists
    const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;
    
    // Setup default fallback role via dropdown option
    const presetRole = document.getElementById('csvRoleSelect').value || 'ambassador';
    
    for (let i = startIndex; i < lines.length; i++) {
        const row = lines[i].split(',');
        const email = row[0] ? row[0].replace(/['"-]+/g, '').trim() : '';
        let role = row[1] ? row[1].replace(/['"-]+/g, '').trim().toLowerCase() : presetRole;
        if (role !== 'admin' && role !== 'ambassador') role = presetRole;

        // basic regex check
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailsToInsert.push({ email, role });
        }
    }

    if (emailsToInsert.length === 0) {
        alert("No valid emails found in the CSV.");
        csvFileInput.value = ''; // reset
        return;
    }

    if (!confirm(`Found ${emailsToInsert.length} valid emails. Add them to authorized users?`)) {
        csvFileInput.value = '';
        return;
    }

    // Insert batch
    const { error } = await supabaseClient.from('authorized_emails').insert(emailsToInsert);
    
    if (error) {
        alert('Failed to upload CSV: ' + error.message);
    } else {
        alert(`Successfully uploaded ${emailsToInsert.length} emails!`);
        loadEmails();
    }
    
    csvFileInput.value = ''; // reset
  };
  reader.readAsText(file);
});

// Boot
initSession();
