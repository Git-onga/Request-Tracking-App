/**
 * RequestBoard — app.js
 *
 * All state lives in localStorage under the key "rb_submissions".
 * No build tools, no frameworks — just plain HTML/CSS/JS.
 */

// ============================================================
// STATE
// ============================================================

const STORAGE_KEY = "rb_submissions";

/** @type {Submission[]} */
let submissions = load();

/** @typedef {{ id:string, name:string, email:string, type:string, priority:string, title:string, description:string, status:string, createdAt:string }} Submission */

// Active filter state
const filters = {
  type:   "all",
  status: "all",
  search: "",
  sort:   "newest",
};

// ============================================================
// PERSISTENCE
// ============================================================

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

// ============================================================
// HELPERS
// ============================================================

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Escape HTML to prevent XSS */
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================
// NAVIGATION
// ============================================================

const views   = document.querySelectorAll(".view");
const navBtns = document.querySelectorAll(".nav-btn");

function showView(name) {
  views.forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  navBtns.forEach(b => b.classList.toggle("active", b.dataset.view === name));
  if (name === "dashboard") renderDashboard();
}

// Nav button clicks
navBtns.forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));

// Empty-state "make first submission" button
document.addEventListener("click", e => {
  const target = e.target.closest("[data-view]");
  if (target && !target.classList.contains("nav-btn")) {
    showView(target.dataset.view);
  }
});

// ============================================================
// FORM — SUBMIT VIEW
// ============================================================

const form       = document.getElementById("submit-form");
const fName      = document.getElementById("field-name");
const fEmail     = document.getElementById("field-email");
const fType      = document.getElementById("field-type");
const fPriority  = document.getElementById("field-priority");
const fTitle     = document.getElementById("field-title");
const fDesc      = document.getElementById("field-description");
const charCount  = document.getElementById("char-count");
const clearBtn   = document.getElementById("clear-btn");

// Live character counter
fTitle.addEventListener("input", () => {
  charCount.textContent = `${fTitle.value.length} / 120`;
});

// Clear button
clearBtn.addEventListener("click", () => {
  form.reset();
  charCount.textContent = "0 / 120";
  clearErrors();
});

// Form submission
form.addEventListener("submit", e => {
  e.preventDefault();
  if (!validateForm()) return;

  const sub = {
    id:          uid(),
    name:        fName.value.trim(),
    email:       fEmail.value.trim(),
    type:        fType.value,
    priority:    fPriority.value,
    title:       fTitle.value.trim(),
    description: fDesc.value.trim(),
    status:      "new",
    createdAt:   new Date().toISOString(),
  };

  submissions.unshift(sub);
  save();

  form.reset();
  charCount.textContent = "0 / 120";
  clearErrors();
  showToast("✅  Submission received! You can view it in the Dashboard.");
});

// ============================================================
// VALIDATION
// ============================================================

function validateForm() {
  clearErrors();
  let valid = true;

  if (!fName.value.trim()) {
    setError("name", "Name is required.");
    valid = false;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!fEmail.value.trim()) {
    setError("email", "Email is required.");
    valid = false;
  } else if (!emailRe.test(fEmail.value.trim())) {
    setError("email", "Enter a valid email address.");
    valid = false;
  }

  if (!fType.value) {
    setError("type", "Please choose a type.");
    valid = false;
  }

  if (!fTitle.value.trim()) {
    setError("title", "Title is required.");
    valid = false;
  }

  if (!fDesc.value.trim()) {
    setError("description", "Description is required.");
    valid = false;
  }

  return valid;
}

function setError(field, msg) {
  document.getElementById(`error-${field}`).textContent = msg;
  const input = document.getElementById(`field-${field}`);
  if (input) input.classList.add("invalid");
}

function clearErrors() {
  ["name", "email", "type", "title", "description"].forEach(f => {
    const el = document.getElementById(`error-${f}`);
    if (el) el.textContent = "";
    const input = document.getElementById(`field-${f}`);
    if (input) input.classList.remove("invalid");
  });
}

// Remove error styling on user input
[fName, fEmail, fType, fTitle, fDesc].forEach(el => {
  el.addEventListener("input", () => {
    el.classList.remove("invalid");
    const id = el.id.replace("field-", "");
    const errEl = document.getElementById(`error-${id}`);
    if (errEl) errEl.textContent = "";
  });
});

// ============================================================
// TOAST
// ============================================================

let toastTimer;
const toast = document.getElementById("toast");

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

// ============================================================
// DASHBOARD
// ============================================================

function getFiltered() {
  let list = [...submissions];

  if (filters.type   !== "all") list = list.filter(s => s.type   === filters.type);
  if (filters.status !== "all") list = list.filter(s => s.status === filters.status);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
    );
  }

  const priorityOrder = { high: 0, normal: 1, low: 2 };
  if (filters.sort === "newest") {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (filters.sort === "oldest") {
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (filters.sort === "priority") {
    list.sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));
  }

  return list;
}

function renderDashboard() {
  renderSummary();
  renderList();
}

// ---- Summary chips ----
function renderSummary() {
  const el = document.getElementById("summary-chips");
  const total    = submissions.length;
  const byType   = countBy(submissions, "type");
  const byStatus = countBy(submissions, "status");

  el.innerHTML = [
    chip(`${total} total`, "#e2e8f0"),
    chip(`${byStatus.new || 0} new`, "#f1f5f9"),
    chip(`${byStatus["in-progress"] || 0} in progress`, "#fef3c7"),
    chip(`${byStatus.resolved || 0} resolved`, "#dcfce7"),
  ].join("");
}

function chip(label, bg) {
  return `<span class="summary-chip" style="background:${bg}">${esc(label)}</span>`;
}

function countBy(arr, key) {
  return arr.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

// ---- Submission list ----
function renderList() {
  const list      = getFiltered();
  const container = document.getElementById("submission-list");
  const empty     = document.getElementById("empty-state");

  if (!list.length) {
    container.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  container.innerHTML = list.map(renderCard).join("");

  // Attach click handlers
  container.querySelectorAll(".submission-card").forEach(card => {
    card.addEventListener("click", () => openModal(card.dataset.id));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") openModal(card.dataset.id);
    });
  });
}

function renderCard(sub) {
  const typeColors = {
    request: "#3b82f6", feedback: "#f59e0b", issue: "#ef4444", idea: "#8b5cf6"
  };
  const dotColor = typeColors[sub.type] || "#94a3b8";

  return `
    <article
      class="submission-card"
      data-id="${esc(sub.id)}"
      tabindex="0"
      aria-label="${esc(sub.title)}"
      role="button"
    >
      <span class="type-dot" style="background:${dotColor};"></span>

      <div class="card-body">
        <div class="card-meta">
          <span class="badge badge-${esc(sub.type)}">${esc(sub.type)}</span>
          <span class="badge badge-${esc(sub.status)}">${esc(sub.status)}</span>
          ${sub.priority !== "normal"
            ? `<span class="badge badge-${esc(sub.priority)}">${esc(sub.priority)}</span>`
            : ""}
        </div>
        <div class="card-title-text">${esc(sub.title)}</div>
        <div class="card-desc-preview">${esc(sub.description)}</div>
        <div class="card-footer-info">by ${esc(sub.name)}</div>
      </div>

      <div class="card-side">
        <span class="card-date">${formatDate(sub.createdAt)}</span>
      </div>
    </article>`;
}

// ============================================================
// FILTERS — wire up
// ============================================================

// Type chips
document.getElementById("filter-type").addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  filters.type = chip.dataset.value;
  setActiveChip("filter-type", chip.dataset.value);
  renderList();
});

// Status chips
document.getElementById("filter-status").addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  filters.status = chip.dataset.value;
  setActiveChip("filter-status", chip.dataset.value);
  renderList();
});

// Search
document.getElementById("search-input").addEventListener("input", e => {
  filters.search = e.target.value.trim();
  renderList();
});

// Sort
document.getElementById("sort-select").addEventListener("change", e => {
  filters.sort = e.target.value;
  renderList();
});

function setActiveChip(groupId, value) {
  document.querySelectorAll(`#${groupId} .chip`).forEach(c => {
    c.classList.toggle("active", c.dataset.value === value);
  });
}

// ============================================================
// MODAL — detail + management
// ============================================================

const overlay   = document.getElementById("modal-overlay");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

let currentSubId = null;

function openModal(id) {
  const sub = submissions.find(s => s.id === id);
  if (!sub) return;
  currentSubId = id;
  modalBody.innerHTML = buildModalHTML(sub);

  // Wire up delete button
  document.getElementById("modal-delete-btn").addEventListener("click", () => {
    if (confirm("Delete this submission? This cannot be undone.")) {
      submissions = submissions.filter(s => s.id !== id);
      save();
      closeModal();
      renderDashboard();
      showToast("🗑️  Submission deleted.");
    }
  });

  // Wire up status change
  document.getElementById("modal-status-select").addEventListener("change", e => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;
    sub.status = e.target.value;
    save();
    renderDashboard();
    // Update badge in modal without closing it
    document.getElementById("modal-status-badge").outerHTML =
      `<span id="modal-status-badge" class="badge badge-${esc(sub.status)}">${esc(sub.status)}</span>`;
  });

  overlay.classList.remove("hidden");
  overlay.focus();
}

function buildModalHTML(sub) {
  return `
    <div class="modal-type-row">
      <span class="badge badge-${esc(sub.type)}">${esc(sub.type)}</span>
      <span id="modal-status-badge" class="badge badge-${esc(sub.status)}">${esc(sub.status)}</span>
      <span class="badge badge-${esc(sub.priority)}">${esc(sub.priority)} priority</span>
    </div>

    <h2 id="modal-title">${esc(sub.title)}</h2>

    <div class="modal-meta-grid">
      <div class="modal-meta-item">
        <strong>Submitted by</strong>
        ${esc(sub.name)}
      </div>
      <div class="modal-meta-item">
        <strong>Email</strong>
        <a href="mailto:${esc(sub.email)}">${esc(sub.email)}</a>
      </div>
      <div class="modal-meta-item">
        <strong>Submitted on</strong>
        ${formatDateTime(sub.createdAt)}
      </div>
      <div class="modal-meta-item">
        <strong>ID</strong>
        <code style="font-size:.8rem;color:var(--color-text-muted)">${esc(sub.id)}</code>
      </div>
    </div>

    <div class="modal-section">
      <div class="modal-section-label">Description</div>
      <div class="modal-description">${esc(sub.description)}</div>
    </div>

    <div class="modal-actions">
      <label for="modal-status-select">Change status:</label>
      <select id="modal-status-select">
        ${["new","in-progress","resolved","closed"].map(s =>
          `<option value="${s}" ${sub.status === s ? "selected" : ""}>${capitalize(s.replace("-", " "))}</option>`
        ).join("")}
      </select>
      <span class="spacer"></span>
      <button class="btn btn-danger" id="modal-delete-btn">Delete</button>
    </div>
  `;
}

function closeModal() {
  overlay.classList.add("hidden");
  currentSubId = null;
}

// Close on X button
modalClose.addEventListener("click", closeModal);

// Close on backdrop click
overlay.addEventListener("click", e => {
  if (e.target === overlay) closeModal();
});

// Close on Escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !overlay.classList.contains("hidden")) closeModal();
});

// ============================================================
// SEED DATA  (so the dashboard isn't empty on first load)
// ============================================================

function seedIfEmpty() {
  if (submissions.length > 0) return;

  const seed = [
    {
      id: uid(), name: "Alice Mensah", email: "alice@example.com",
      type: "issue", priority: "high",
      title: "Login page throws 500 error on mobile",
      description: "When I try to log in on my phone (iPhone 14, Safari), the page just shows a white screen with a 500 error. I have tried clearing the cache but it still happens.\n\nSteps to reproduce:\n1. Open the login page on Safari iOS\n2. Enter valid credentials\n3. Tap \"Log in\"\n4. White screen appears",
      status: "new", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uid(), name: "Brian Osei", email: "brian@example.com",
      type: "feedback", priority: "normal",
      title: "Dashboard loads really fast — great job!",
      description: "Just wanted to say the new dashboard update is noticeably faster. The filters are snappy and the overall experience feels polished. Keep it up!",
      status: "resolved", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uid(), name: "Clara Diallo", email: "clara@example.com",
      type: "idea", priority: "normal",
      title: "Add dark mode support",
      description: "It would be really nice to have a dark mode option. I work late at night and the bright white background is hard on my eyes. A simple toggle in the header would be perfect.",
      status: "in-progress", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uid(), name: "David Asante", email: "david@example.com",
      type: "request", priority: "high",
      title: "Export submissions to CSV",
      description: "Could you add a way to export all submissions (or filtered ones) to a CSV file? We need this for our monthly reporting to management. Even a basic export would help a lot.",
      status: "new", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uid(), name: "Esi Boateng", email: "esi@example.com",
      type: "issue", priority: "normal",
      title: "Email notifications are arriving with wrong time zone",
      description: "The timestamps in the notification emails show UTC time, but I am in GMT+3. It is confusing because the time shown is 3 hours behind my local time. Please use the user's local time zone.",
      status: "closed", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
  ];

  submissions = seed;
  save();
}

// ============================================================
// INIT
// ============================================================

seedIfEmpty();
// The default view on load is Submit; dashboard renders when user navigates there.
