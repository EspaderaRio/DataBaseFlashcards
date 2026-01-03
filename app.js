const API_BASE = "https://quiz-backend.espaderario.workers.dev/api";

const quizList = document.getElementById("quizList");
const quizForm = document.getElementById("quizForm");
const titleInput = document.getElementById("title");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEdit");

let editingId = null;

/* =========================
   Load Quizzes (READ)
========================= */
async function loadQuizzes() {
  quizList.innerHTML = "<li>Loading...</li>";

  try {
    const res = await fetch(`${API_BASE}/quizzes`);
    const quizzes = await res.json();

    quizList.innerHTML = "";

    quizzes.forEach(q => {
      const li = document.createElement("li");

      li.innerHTML = `
        <span>${q.title}</span>
        <div class="actions">
          <button onclick="startEdit('${q.id}', '${q.title}')">Edit</button>
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
   Create / Update
========================= */
quizForm.addEventListener("submit", async e => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) return;

  const method = editingId ? "PUT" : "POST";
  const url = editingId
    ? `${API_BASE}/quizzes/${editingId}`
    : `${API_BASE}/quizzes`;

  try {
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });

    resetForm();
    loadQuizzes();

  } catch (err) {
    console.error(err);
    alert("Failed to save quiz");
  }
});

/* =========================
   Edit
========================= */
window.startEdit = (id, title) => {
  editingId = id;
  titleInput.value = title;
  formTitle.textContent = "Edit Quiz";
  cancelEditBtn.hidden = false;
};

/* =========================
   Delete
========================= */
window.deleteQuiz = async id => {
  if (!confirm("Delete this quiz?")) return;

  try {
    await fetch(`${API_BASE}/quizzes/${id}`, {
      method: "DELETE"
    });
    loadQuizzes();
  } catch (err) {
    console.error(err);
    alert("Failed to delete quiz");
  }
};

/* =========================
   Helpers
========================= */
function resetForm() {
  editingId = null;
  quizForm.reset();
  formTitle.textContent = "Add Quiz";
  cancelEditBtn.hidden = true;
}

cancelEditBtn.addEventListener("click", resetForm);

loadQuizzes();
