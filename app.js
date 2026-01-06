const API_BASE = "https://quiz-backend.espaderario.workers.dev/api";
const app = document.getElementById("app");

let editingQuiz = null;
let quizzesCache = [];

/* =========================
   RENDER APP
========================= */
function renderApp() {
  app.innerHTML = `
    <div class="container">
      <h1>Quiz Builder</h1>

      <div class="card">
        <h2 id="formTitle">Create Quiz</h2>

        <form id="quizForm">
          <input id="title" placeholder="Quiz title" required />

          <div id="questions"></div>

          <button type="button" id="addQuestion">+ Add Question</button>

          <div class="form-actions">
            <button type="submit">Save Quiz</button>
            <button type="button" id="cancelEdit" hidden>Cancel</button>
          </div>
        </form>
      </div>

      <div class="card">
        <h2>All Quizzes</h2>
        <ul id="quizList"></ul>
      </div>
    </div>
  `;

  bindEvents();
  loadQuizzes();
}

/* =========================
   EVENTS
========================= */
function bindEvents() {
  document.getElementById("quizForm").addEventListener("submit", saveQuiz);
  document.getElementById("addQuestion").addEventListener("click", addQuestion);
  document.getElementById("cancelEdit").addEventListener("click", resetForm);
  document.getElementById("quizList").addEventListener("click", handleListClick);
}

/* =========================
   LOAD QUIZZES
========================= */
async function loadQuizzes() {
  const list = document.getElementById("quizList");
  list.innerHTML = `<li class="muted">Loading quizzes...</li>`;

  try {
    const res = await fetch(`${API_BASE}/sets`);
    const data = await res.json();

    // Handle backend error response
    if (!Array.isArray(data)) {
      console.error("Unexpected response:", data);
      list.innerHTML = `<li class="error">Invalid server response</li>`;
      return;
    }

    quizzesCache = data;
    list.innerHTML = "";

    if (quizzesCache.length === 0) {
      list.innerHTML = `<li class="muted">No quizzes yet</li>`;
      return;
    }

    quizzesCache.forEach(q => {
      const cards = Array.isArray(q.cards) ? q.cards : [];

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${q.title}</strong>
        <span>(${cards.length} questions)</span>
        <div class="actions">
          <button data-edit="${q.id}">Edit</button>
          <button data-delete="${q.id}">Delete</button>
        </div>
      `;

      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = `<li class="error">Failed to load quizzes</li>`;
  }
}

/* =========================
   QUIZ FORM
========================= */
function addQuestion(data = {}) {
  const container = document.getElementById("questions");
  const qIndex = container.children.length;

  const div = document.createElement("div");
  div.className = "question-card";

  div.innerHTML = `
    <input placeholder="Question" value="${data.question || ""}" class="q-text"/>

    <input placeholder="Option A" value="${data.options?.[0] || ""}" />
    <input placeholder="Option B" value="${data.options?.[1] || ""}" />
    <input placeholder="Option C" value="${data.options?.[2] || ""}" />
    <input placeholder="Option D" value="${data.options?.[3] || ""}" />

    <input placeholder="Correct answer" value="${data.correct || ""}" />

    <button type="button" class="remove">Remove</button>
  `;

  div.querySelector(".remove").onclick = () => div.remove();
  container.appendChild(div);
}

/* =========================
   SAVE QUIZ
========================= */
async function saveQuiz(e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const questionEls = document.querySelectorAll(".question-card");

  const questions = [...questionEls].map(card => {
    const inputs = card.querySelectorAll("input");
    const options = [...inputs].slice(1, 5).map(i => i.value).filter(Boolean);

    return {
      question: inputs[0].value,
      options,
      correct: inputs[5].value
    };
  });

  const payload = { title, questions };

  const url = editingQuiz
    ? `${API_BASE}/quizzes/${editingQuiz}`
    : `${API_BASE}/quizzes`;

  const method = editingQuiz ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  resetForm();
  loadQuizzes();
}

/* =========================
   LIST ACTIONS
========================= */
function handleListClick(e) {
  const id = e.target.dataset.edit || e.target.dataset.delete;
  if (!id) return;

  if (e.target.dataset.edit) startEdit(id);
  if (e.target.dataset.delete) deleteQuiz(id);
}

/* =========================
   EDIT QUIZ
========================= */
function startEdit(id) {
  const quiz = quizzesCache.find(q => q.id === id);
  if (!quiz) return;

  editingQuiz = id;
  document.getElementById("title").value = quiz.title;
  document.getElementById("questions").innerHTML = "";
  document.getElementById("formTitle").textContent = "Edit Quiz";
  document.getElementById("cancelEdit").hidden = false;

const cards = Array.isArray(quiz.cards) ? quiz.cards : [];

cards.forEach(card =>
  addQuestion({
    question: card.question,
    options: [card.answer],
    correct: card.answer
  })
);
}

/* =========================
   DELETE
========================= */
async function deleteQuiz(id) {
  if (!confirm("Delete this quiz?")) return;

  await fetch(`${API_BASE}/quizzes/${id}`, { method: "DELETE" });
  loadQuizzes();
}

/* =========================
   RESET
========================= */
function resetForm() {
  editingQuiz = null;
  document.getElementById("quizForm").reset();
  document.getElementById("questions").innerHTML = "";
  document.getElementById("formTitle").textContent = "Create Quiz";
  document.getElementById("cancelEdit").hidden = true;
}

/* =========================
   INIT
========================= */
renderApp();
