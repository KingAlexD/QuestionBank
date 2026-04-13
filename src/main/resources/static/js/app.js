(() => {
  const KEYS = {
    USERS: "qb_users",
    CURRENT_USER: "qb_current_user",
    THEME: "qb_theme",
    QUESTIONS: "qb_question_bank"
  };

  const QUIZ_SIZE = 20;

  const el = {
    authSection: document.getElementById("authSection"),
    dashboardSection: document.getElementById("dashboardSection"),
    quizSection: document.getElementById("quizSection"),
    resultSection: document.getElementById("resultSection"),
    historySection: document.getElementById("historySection"),
    authMessage: document.getElementById("authMessage"),
    registerForm: document.getElementById("registerForm"),
    loginForm: document.getElementById("loginForm"),
    welcomeText: document.getElementById("welcomeText"),
    questionCount: document.getElementById("questionCount"),
    startQuizBtn: document.getElementById("startQuizBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    quizForm: document.getElementById("quizForm"),
    submitQuizBtn: document.getElementById("submitQuizBtn"),
    cancelQuizBtn: document.getElementById("cancelQuizBtn"),
    quizMessage: document.getElementById("quizMessage"),
    resultCard: document.getElementById("resultCard"),
    historyBody: document.getElementById("historyBody"),
    themeToggle: document.getElementById("themeToggle")
  };

  let currentQuiz = [];

  function readJson(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getUsers() {
    return readJson(KEYS.USERS, []);
  }

  function setUsers(users) {
    writeJson(KEYS.USERS, users);
  }

  function getCurrentUser() {
    return readJson(KEYS.CURRENT_USER, null);
  }

  function setCurrentUser(user) {
    writeJson(KEYS.CURRENT_USER, user);
  }

  function clearCurrentUser() {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }

  function resultKey(email) {
    return `qb_results_${email}`;
  }

  function getResults(email) {
    return readJson(resultKey(email), []);
  }

  function setResults(email, results) {
    writeJson(resultKey(email), results);
  }

  function seedQuestionBank() {
    const existing = readJson(KEYS.QUESTIONS, null);
    if (existing && existing.length >= 100) {
      return existing;
    }
    const seeded = (window.QUESTION_BANK || []).slice(0, 100);
    writeJson(KEYS.QUESTIONS, seeded);
    return seeded;
  }

  function getQuestionBank() {
    return readJson(KEYS.QUESTIONS, []);
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString();
  }

  function setMessage(node, text, ok = false) {
    node.textContent = text;
    node.classList.toggle("pass", ok);
    node.classList.toggle("fail", !ok);
  }

  function showOnlyAuth() {
    el.authSection.classList.remove("hidden");
    el.dashboardSection.classList.add("hidden");
    el.quizSection.classList.add("hidden");
    el.resultSection.classList.add("hidden");
    el.historySection.classList.add("hidden");
  }

  function showUserSections() {
    el.authSection.classList.add("hidden");
    el.dashboardSection.classList.remove("hidden");
    el.historySection.classList.remove("hidden");
  }

  function renderHistory(user) {
    const rows = getResults(user.email)
      .slice()
      .reverse()
      .map((r) => `
        <tr>
          <td>${formatDate(r.takenAt)}</td>
          <td>${r.score}</td>
          <td>${r.total}</td>
          <td>${r.percentage}%</td>
        </tr>
      `)
      .join("");

    el.historyBody.innerHTML = rows || `<tr><td colspan="4">No attempts yet.</td></tr>`;
  }

  function renderDashboard() {
    const user = getCurrentUser();
    if (!user) {
      showOnlyAuth();
      return;
    }

    showUserSections();
    const qBank = getQuestionBank();
    el.welcomeText.textContent = `Welcome, ${user.name}`;
    el.questionCount.textContent = qBank.length;
    renderHistory(user);
  }

  function selectRandomQuestions(questions, count) {
    const copy = [...questions];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  }

  function renderQuiz() {
    el.quizMessage.textContent = "";
    el.quizForm.innerHTML = currentQuiz
      .map(
        (q, idx) => `
          <article class="question-card">
            <strong>Q${idx + 1}. ${q.question}</strong>
            <div class="options">
              ${q.options
                .map(
                  (opt, optionIndex) => `
                    <label>
                      <input type="radio" name="q_${q.id}" value="${optionIndex}" />
                      ${opt}
                    </label>
                  `
                )
                .join("")}
            </div>
          </article>
        `
      )
      .join("");

    el.quizSection.classList.remove("hidden");
    el.resultSection.classList.add("hidden");
  }

  function startQuiz() {
    const qBank = getQuestionBank();
    if (qBank.length < QUIZ_SIZE) {
      setMessage(el.quizMessage, `Question bank must contain at least ${QUIZ_SIZE} questions.`);
      return;
    }
    currentQuiz = selectRandomQuestions(qBank, QUIZ_SIZE);
    renderQuiz();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitQuiz() {
    if (!currentQuiz.length) return;

    let score = 0;
    currentQuiz.forEach((q) => {
      const picked = document.querySelector(`input[name="q_${q.id}"]:checked`);
      if (picked && Number(picked.value) === q.answerIndex) {
        score += 1;
      }
    });

    const user = getCurrentUser();
    if (!user) return;

    const result = {
      score,
      total: currentQuiz.length,
      percentage: Number(((score / currentQuiz.length) * 100).toFixed(2)),
      takenAt: new Date().toISOString()
    };

    const history = getResults(user.email);
    history.push(result);
    setResults(user.email, history);

    const statusClass = result.percentage >= 50 ? "pass" : "fail";
    el.resultCard.innerHTML = `
      <p><strong>Score:</strong> ${result.score}/${result.total}</p>
      <p><strong>Percentage:</strong> <span class="${statusClass}">${result.percentage}%</span></p>
      <p><strong>Taken at:</strong> ${formatDate(result.takenAt)}</p>
    `;

    el.resultSection.classList.remove("hidden");
    renderHistory(user);
    setMessage(el.quizMessage, "Quiz submitted and result saved locally.", true);
  }

  function registerStudent(event) {
    event.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      setMessage(el.authMessage, "Email already exists. Please login instead.");
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    setUsers(users);
    setCurrentUser({ name, email });

    el.registerForm.reset();
    setMessage(el.authMessage, "Registration successful. You are now logged in.", true);
    renderDashboard();
  }

  function loginStudent(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const user = getUsers().find((u) => u.email === email && u.password === password);
    if (!user) {
      setMessage(el.authMessage, "Invalid email or password.");
      return;
    }

    setCurrentUser({ name: user.name, email: user.email });
    el.loginForm.reset();
    setMessage(el.authMessage, "Login successful.", true);
    renderDashboard();
  }

  function logoutStudent() {
    clearCurrentUser();
    currentQuiz = [];
    showOnlyAuth();
    setMessage(el.authMessage, "Logged out successfully.", true);
  }

  function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem(KEYS.THEME, theme);
    el.themeToggle.checked = theme === "dark";
  }

  function initTheme() {
    const saved = localStorage.getItem(KEYS.THEME) || "light";
    applyTheme(saved);
    el.themeToggle.addEventListener("change", () => {
      const next = el.themeToggle.checked ? "dark" : "light";
      applyTheme(next);
    });
  }

  function init() {
    seedQuestionBank();
    initTheme();

    el.registerForm.addEventListener("submit", registerStudent);
    el.loginForm.addEventListener("submit", loginStudent);
    el.startQuizBtn.addEventListener("click", startQuiz);
    el.submitQuizBtn.addEventListener("click", submitQuiz);
    el.cancelQuizBtn.addEventListener("click", () => {
      el.quizSection.classList.add("hidden");
      currentQuiz = [];
    });
    el.logoutBtn.addEventListener("click", logoutStudent);

    renderDashboard();
  }

  init();
})();
