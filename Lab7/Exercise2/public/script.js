let currentPage = 1;
let currentMode = "all"; // "all" | "search" | "category" | "sort" | "top"
let currentParam = "";

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = "toast"; }, 3000);
}

// ─── Show / hide states ───────────────────────────────────────────────────────
function setLoading(loading) {
  document.getElementById("loading").style.display = loading ? "flex" : "none";
  document.getElementById("books-grid").style.display = loading ? "none" : "grid";
  document.getElementById("empty-state").style.display = "none";
  document.getElementById("pagination").style.display = "none";
}

function showEmpty() {
  document.getElementById("books-grid").style.display = "none";
  document.getElementById("empty-state").style.display = "flex";
  document.getElementById("pagination").style.display = "none";
  updateStats(0);
}

// ─── Render books ─────────────────────────────────────────────────────────────
function renderBooks(books) {
  const grid = document.getElementById("books-grid");
  if (!books.length) { showEmpty(); return; }
  grid.innerHTML = books.map(renderBook).join("");
  grid.style.display = "grid";
  document.getElementById("empty-state").style.display = "none";
  updateStats(books.length);
}

function renderBook(b) {
  const stars = "★".repeat(Math.round(b.rating)) + "☆".repeat(5 - Math.round(b.rating));
  return `
    <div class="book-card">
      <div class="book-title">${escHtml(b.title)}</div>
      <div class="book-author">by ${escHtml(b.author)}</div>
      <div class="book-meta">
        <span class="book-category">${escHtml(b.category)}</span>
        <span class="book-price">₹${b.price}</span>
      </div>
      <div class="book-footer">
        <span class="book-rating">${stars} ${b.rating}</span>
        <span>Year: ${b.year}</span>
      </div>
    </div>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function updateStats(count) {
  document.getElementById("result-count").textContent = count;
  document.getElementById("mode-label").textContent =
    currentMode === "all" ? "All" :
    currentMode === "search" ? "Search" :
    currentMode === "category" ? "Category" :
    currentMode === "sort" ? "Sorted" : "Top Rated";
}

// ─── Load all books (paginated) ───────────────────────────────────────────────
async function loadAll(page = 1) {
  currentMode = "all";
  currentPage = page;
  setLoading(true);
  document.getElementById("results-title").textContent = "All Books";
  try {
    const res = await fetch(`/books?page=${page}`);
    const { books, total, pages } = await res.json();
    setLoading(false);
    renderBooks(books);
    renderPagination(page, pages, total);
  } catch {
    setLoading(false);
    showToast("Failed to load books.", "error");
  }
}

function renderPagination(page, pages, total) {
  const pg = document.getElementById("pagination");
  if (pages <= 1) { pg.style.display = "none"; return; }
  pg.style.display = "flex";
  document.getElementById("page-info").textContent = `Page ${page} of ${pages} (${total} books)`;
  document.getElementById("prev-btn").disabled = page <= 1;
  document.getElementById("next-btn").disabled = page >= pages;
}

function changePage(delta) {
  if (currentMode !== "all") return;
  loadAll(currentPage + delta);
}

// ─── Search ───────────────────────────────────────────────────────────────────
async function searchBooks() {
  const title = document.getElementById("search-input").value.trim();
  currentMode = "search";
  currentParam = title;
  setLoading(true);
  document.getElementById("results-title").textContent = title ? `Results for "${title}"` : "All Books (search)";
  try {
    const res = await fetch(`/books/search?title=${encodeURIComponent(title)}`);
    const books = await res.json();
    setLoading(false);
    renderBooks(books);
  } catch {
    setLoading(false);
    showToast("Search failed.", "error");
  }
}

// ─── Filter by category ───────────────────────────────────────────────────────
async function filterByCategory() {
  const cat = document.getElementById("category-select").value;
  if (!cat) { loadAll(); return; }
  currentMode = "category";
  currentParam = cat;
  setLoading(true);
  document.getElementById("results-title").textContent = `Category: ${cat}`;
  try {
    const res = await fetch(`/books/category/${encodeURIComponent(cat)}`);
    const books = await res.json();
    setLoading(false);
    renderBooks(books);
  } catch {
    setLoading(false);
    showToast("Filter failed.", "error");
  }
}

// ─── Sort ─────────────────────────────────────────────────────────────────────
async function sortBooks(field) {
  currentMode = "sort";
  currentParam = field;
  setLoading(true);
  const label = field === "price" ? "Price (Lowest First)" : "Rating (Highest First)";
  document.getElementById("results-title").textContent = `Sorted by ${label}`;
  try {
    const res = await fetch(`/books/sort/${field}`);
    const books = await res.json();
    setLoading(false);
    renderBooks(books);
  } catch {
    setLoading(false);
    showToast("Sort failed.", "error");
  }
}

// ─── Top rated ────────────────────────────────────────────────────────────────
async function loadTopRated() {
  currentMode = "top";
  setLoading(true);
  document.getElementById("results-title").textContent = "Top Rated Books (Rating ≥ 4)";
  try {
    const res = await fetch("/books/top");
    const books = await res.json();
    setLoading(false);
    renderBooks(books);
  } catch {
    setLoading(false);
    showToast("Failed to load top rated books.", "error");
  }
}

// ─── Populate categories dropdown ────────────────────────────────────────────
async function loadCategories() {
  try {
    const res = await fetch("/categories");
    const cats = await res.json();
    const select = document.getElementById("category-select");
    cats.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });
  } catch { /* non-critical */ }
}

// ─── Enter key on search ──────────────────────────────────────────────────────
document.getElementById("search-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBooks();
});

// ─── Init ─────────────────────────────────────────────────────────────────────
loadCategories();
loadAll();
