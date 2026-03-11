let editingId = null;

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = "toast"; }, 3000);
}

// ─── Fetch & render all notes ─────────────────────────────────────────────────
async function fetchNotes() {
  const loading = document.getElementById("loading");
  const grid = document.getElementById("notes-grid");
  const empty = document.getElementById("empty-state");

  loading.style.display = "flex";
  grid.style.display = "none";
  empty.style.display = "none";

  try {
    const res = await fetch("/notes");
    const notes = await res.json();

    loading.style.display = "none";

    if (notes.length === 0) {
      empty.style.display = "flex";
      updateStats(0, 0);
      return;
    }

    grid.style.display = "grid";
    grid.innerHTML = notes.map(renderNote).join("");

    const subjects = new Set(notes.map(n => n.subject)).size;
    updateStats(notes.length, subjects);
  } catch {
    loading.style.display = "none";
    showToast("Failed to load notes.", "error");
  }
}

function renderNote(note) {
  const date = new Date(note.created_date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
  return `
    <div class="note-card" id="note-${note._id}">
      <div class="note-card-header">
        <span class="note-title">${escHtml(note.title)}</span>
        <span class="note-subject">${escHtml(note.subject)}</span>
      </div>
      <p class="note-description">${escHtml(note.description)}</p>
      <span class="note-date">${date}</span>
      <div class="note-actions">
        <button class="btn btn-edit" onclick="startEdit('${note._id}', ${JSON.stringify(note.title)}, ${JSON.stringify(note.subject)}, ${JSON.stringify(note.description)})">Edit</button>
        <button class="btn btn-delete" onclick="deleteNote('${note._id}')">Delete</button>
      </div>
    </div>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function updateStats(total, subjects) {
  document.getElementById("total-notes").textContent = total;
  document.getElementById("total-subjects").textContent = subjects;
}

// ─── Form submit (Add or Update) ──────────────────────────────────────────────
document.getElementById("note-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const description = document.getElementById("description").value.trim();

  if (editingId) {
    // Update
    try {
      const res = await fetch(`/notes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subject, description })
      });
      if (!res.ok) throw new Error();
      showToast("Note updated successfully!");
      cancelEdit();
      fetchNotes();
    } catch {
      showToast("Failed to update note.", "error");
    }
  } else {
    // Create
    try {
      const res = await fetch("/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subject, description })
      });
      if (!res.ok) throw new Error();
      showToast("Note added successfully!");
      e.target.reset();
      fetchNotes();
    } catch {
      showToast("Failed to add note.", "error");
    }
  }
});

// ─── Edit ─────────────────────────────────────────────────────────────────────
function startEdit(id, title, subject, description) {
  editingId = id;
  document.getElementById("title").value = title;
  document.getElementById("subject").value = subject;
  document.getElementById("description").value = description;
  document.getElementById("form-title").textContent = "Edit Note";
  document.getElementById("submit-btn").querySelector(".btn-text").textContent = "Update Note";
  document.getElementById("cancel-btn").style.display = "inline-flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  editingId = null;
  document.getElementById("note-form").reset();
  document.getElementById("form-title").textContent = "Add New Note";
  document.getElementById("submit-btn").querySelector(".btn-text").textContent = "Add Note";
  document.getElementById("cancel-btn").style.display = "none";
}

document.getElementById("cancel-btn").addEventListener("click", cancelEdit);

// ─── Delete ───────────────────────────────────────────────────────────────────
async function deleteNote(id) {
  if (!confirm("Delete this note?")) return;
  try {
    const res = await fetch(`/notes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error();
    showToast("Note deleted.");
    fetchNotes();
  } catch {
    showToast("Failed to delete note.", "error");
  }
}

// ─── Refresh ──────────────────────────────────────────────────────────────────
document.getElementById("refresh-btn").addEventListener("click", fetchNotes);

// ─── Init ─────────────────────────────────────────────────────────────────────
fetchNotes();
