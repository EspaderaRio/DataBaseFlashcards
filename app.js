const API_BASE = "https://quiz-backend.espaderario.workers.dev/api";

const app = document.getElementById("app");

let editingId = null;
let loading = false;

/* =========================
   RENDER UI
========================= */
function renderApp() {
  app.innerHTML = `
    <div class="container">
      <h1>Quiz Manager</h1>

      <div class="card">
        <h2 id="formTitle">Create Quiz</h2>

        <form id="quizForm">
          <input
            type="text"
            id="title"
            placeholder="Quiz title"
            required
          />

          <div class="form-actions">
            <button type="submit" id="saveBtn">Save</button>
            <button type="button" id="cancelEdit" hidden>Cancel</button>
          </div>
        </form>
      </div>

      <div class="card">
        <h2>Quizzes</h2>
        <ul id="quizList" class="list"></ul>
      </div>
    </div>
  `;

  bindEvents();
  loadQuizzes();
}

/* =========================
   BIND EVENTS
========================= */
function bindEvents() {
  const quizForm = document.getElementById("quizForm");
  const cancelBtn = document.getElementById("cancelEdit");

  quizForm.addEventListener("submit", submitQuiz);
  cancelBtn.addEventListener("click", resetForm);

  document
    .getElementById("quizList")
    .addEventListener("click", handleListClick);
}

/* =========================
   LOAD QUIZZES
========================= */
async function loadQuizzes() {
  const list = document.getElementById("quizList");
  list.innerHTML = `<li class="muted">Loading quizzes...</li>`;

  try {
    const res = await fetch(`${API_BASE}/sets`);
    const quizzes = await res.json();

    list.innerHTML = "";

    if (!quizzes.length) {
      list.innerHTML = `<li class="muted">No quizzes yet</li>`;
      return;
    }

    quizzes.forEach(q => {
      const li = document.createElement("li");
      li.className = "quiz-item";

      li.innerHTML = `
        <span class="quiz-title">${q.title}</span>
        <div class="actions">
          <button class="edit" data-id="${q.id}" data-title="${q.title}">Edit</button>
          <button class="delete" data-id="${q.id}">Delete</button>
        </div>
      `;

      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = `<li class="error">Failed to load quizzes</li>`;
    console.error(err);
  }
}

/* =========================
   SUBMIT (CREATE / UPDATE)
========================= */
async function submitQuiz(e) {
  e.preventDefault();
  if (loading) return;

  const titleInput = document.getElementById("title");
  const title = titleInput.value.trim();
  if (!title) return;

  setLoading(true);

  const payload = {
    title,
    questions: []
  };

  const url = editingId
    ? `${API_BASE}/quizzes/${editingId}`
    : `${API_BASE}/quizzes`;

  const method = editingId ? "PUT" : "POST";

  try {
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    resetForm();
    loadQuizzes();
  } catch (err) {
    alert("Failed to save quiz");
    console.error(err);
  } finally {
    setLoading(false);
  }
}

/* =========================
   LIST ACTIONS
========================= */
function handleListClick(e) {
  const btn = e.target;

  if (btn.classList.contains("edit")) {
    startEdit(btn.dataset.id, btn.dataset.title);
  }

  if (btn.classList.contains("delete")) {
    deleteQuiz(btn.dataset.id);
  }
}

/* =========================
   EDIT MODE
========================= */
function startEdit(id, title) {
  editingId = id;
  document.getElementById("title").value = title;
  document.getElementById("formTitle").textContent = "Edit Quiz";
  document.getElementById("cancelEdit").hidden = false;
}

/* =========================
   DELETE
========================= */
async function deleteQuiz(id) {
  if (!confirm("Delete this quiz permanently?")) return;

  await fetch(`${API_BASE}/quizzes/${id}`, {
    method: "DELETE"
  });

  loadQuizzes();
}

/* =========================
   UI HELPERS
========================= */
function resetForm() {
  editingId = null;
  document.getElementById("quizForm").reset();
  document.getElementById("formTitle").textContent = "Create Quiz";
  document.getElementById("cancelEdit").hidden = true;
}

function setLoading(state) {
  loading = state;
  document.getElementById("saveBtn").disabled = state;
}

/* =========================
   INIT
========================= */
renderApp();
