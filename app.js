const API_BASE = "https://quiz-backend.espaderario.workers.dev/api";

const quizList = document.getElementById("quizList");
const quizForm = document.getElementById("quizForm");
const titleInput = document.getElementById("title");

let editingId = null;

/* =========================
   LOAD ALL QUIZZES (GET /api/sets)
========================= */
async function loadQuizzes() {
  quizList.innerHTML = "<li>Loading...</li>";

  try {
    const res = await fetch(`${API_BASE}/sets`);
    const quizzes = await res.json();

    quizList.innerHTML = "";

    quizzes.forEach(q => {
      const li = document.createElement("li");

      li.innerHTML = `
        <span>${q.title}</span>
        <div class="actions">
          <button onclick="editQuiz('${q.id}', '${q.title}')">Edit</button>
          <button class="delete" onclick="deleteQuiz('${q.id}')">Delete</button>
        </div>
      `;

      quizList.appendChild(li);
    });

  } catch (err) {
    quizList.innerHTML = "<li>Failed to load quizzes</li>";
    console.error(err);
  }
}

/* =========================
   CREATE / UPDATE QUIZ
========================= */
quizForm.addEventListener("submit", async e => {
  e.preventDefault();

  const payload = {
    title: titleInput.value,
    questions: []
  };

  const url = editingId
    ? `${API_BASE}/quizzes/${editingId}`
    : `${API_BASE}/quizzes`;

  const method = editingId ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  editingId = null;
  quizForm.reset();
  loadQuizzes();
});

/* =========================
   EDIT
========================= */
function editQuiz(id, title) {
  editingId = id;
  titleInput.value = title;
}

/* =========================
   DELETE
========================= */
async function deleteQuiz(id) {
  if (!confirm("Delete this quiz?")) return;

  await fetch(`${API_BASE}/quizzes/${id}`, {
    method: "DELETE"
  });

  loadQuizzes();
}

loadQuizzes();
