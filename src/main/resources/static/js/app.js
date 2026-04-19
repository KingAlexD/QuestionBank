(() => {
  const KEYS = {
    USERS: "qb_users",
    CURRENT_USER: "qb_current_user",
    THEME: "qb_theme",
    QUESTIONS: "qb_question_bank"
  };

  const CATEGORIES = ["Core Java", "OOP", "Collections", "Multithreading"];
  const DIFFICULTIES = ["easy", "medium", "hard"];

  const el = {
    authHero: document.getElementById("authHero"),
    authSection: document.getElementById("authSection"),
    appSection: document.getElementById("appSection"),
    appHomeSection: document.getElementById("appHomeSection"),
    quizPageSection: document.getElementById("quizPageSection"),

    authMessage: document.getElementById("authMessage"),
    authSliderWrap: document.getElementById("authSliderWrap"),
    showRegisterBtn: document.getElementById("showRegisterBtn"),
    showLoginBtn: document.getElementById("showLoginBtn"),
    switchToLoginInline: document.getElementById("switchToLoginInline"),
    switchToRegisterInline: document.getElementById("switchToRegisterInline"),
    registerForm: document.getElementById("registerForm"),
    loginForm: document.getElementById("loginForm"),
    logoutBtn: document.getElementById("logoutBtn"),
    themeToggle: document.getElementById("themeToggle"),

    welcomeText: document.getElementById("welcomeText"),
    statTotal: document.getElementById("statTotal"),
    statHighest: document.getElementById("statHighest"),
    statAverage: document.getElementById("statAverage"),
    statQuestions: document.getElementById("statQuestions"),

    categorySelect: document.getElementById("categorySelect"),
    difficultySelect: document.getElementById("difficultySelect"),
    modeSelect: document.getElementById("modeSelect"),
    countSelect: document.getElementById("countSelect"),
    timerMinutes: document.getElementById("timerMinutes"),
    startQuizBtn: document.getElementById("startQuizBtn"),
    setupMessage: document.getElementById("setupMessage"),

    quizMeta: document.getElementById("quizMeta"),
    timerText: document.getElementById("timerText"),
    progressBar: document.getElementById("progressBar"),
    progressText: document.getElementById("progressText"),
    questionCard: document.getElementById("questionCard"),
    backDashboardBtn: document.getElementById("backDashboardBtn"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    submitQuizBtn: document.getElementById("submitQuizBtn"),
    quizMessage: document.getElementById("quizMessage"),

    historyBody: document.getElementById("historyBody"),
    leaderboardBody: document.getElementById("leaderboardBody"),

    adminSection: document.getElementById("adminSection"),
    adminQuestionForm: document.getElementById("adminQuestionForm"),
    adminMessage: document.getElementById("adminMessage"),
    adminQuestionsBody: document.getElementById("adminQuestionsBody"),

    adminQuestion: document.getElementById("adminQuestion"),
    optA: document.getElementById("optA"),
    optB: document.getElementById("optB"),
    optC: document.getElementById("optC"),
    optD: document.getElementById("optD"),
    adminCorrect: document.getElementById("adminCorrect"),
    adminCategory: document.getElementById("adminCategory"),
    adminDifficulty: document.getElementById("adminDifficulty"),
    adminExplanation: document.getElementById("adminExplanation")
  };

  const state = { quiz: null, timerHandle: null };

  function readJson(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (_) { return fallback; }
  }

  function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function getUsers() { return readJson(KEYS.USERS, []); }
  function setUsers(users) { writeJson(KEYS.USERS, users); }
  function getCurrentUser() { return readJson(KEYS.CURRENT_USER, null); }
  function setCurrentUser(user) { writeJson(KEYS.CURRENT_USER, user); }
  function clearCurrentUser() { localStorage.removeItem(KEYS.CURRENT_USER); }
  function getQuestions() { return readJson(KEYS.QUESTIONS, []); }
  function setQuestions(questions) { writeJson(KEYS.QUESTIONS, questions); }
  function getResults(email) { return readJson(`qb_results_${email}`, []); }
  function setResults(email, data) { writeJson(`qb_results_${email}`, data); }
  function getLastQuestionIds(email) { return readJson(`qb_last_ids_${email}`, []); }
  function setLastQuestionIds(email, ids) { writeJson(`qb_last_ids_${email}`, ids); }

  function setMessage(node, text, good = false) {
    node.textContent = text;
    node.classList.toggle("pass", good);
    node.classList.toggle("fail", !good);
  }

  function formatDate(iso) { return new Date(iso).toLocaleString(); }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function normalizeQuestion(q, index) {
    const options = Array.isArray(q.options) ? q.options.slice(0, 4) : ["Option A", "Option B", "Option C", "Option D"];
    const answerFromIndex = Number.isInteger(q.answerIndex) ? options[q.answerIndex] : null;
    const answer = q.answer || answerFromIndex || options[0];
    return {
      id: Number.isInteger(q.id) ? q.id : index + 1,
      question: q.question || `Question ${index + 1}`,
      options,
      answer,
      category: q.category || CATEGORIES[index % CATEGORIES.length],
      difficulty: q.difficulty || DIFFICULTIES[index % DIFFICULTIES.length],
      explanation: q.explanation || `The correct answer is ${answer}.`
    };
  }

  function migrateStoredResults() {
    getUsers().forEach((u) => {
      const history = getResults(u.email);
      if (!history.length) return;
      setResults(u.email, history.map((r) => ({ ...r, category: r.category || "General", difficulty: r.difficulty || "mixed" })));
    });
  }

  function seedDefaults() {
    const users = getUsers();
    if (!users.some((u) => u.email === "admin@qb.local")) {
      users.push({ name: "Admin", email: "admin@qb.local", password: "admin123", role: "admin" });
      setUsers(users);
    }
    const source = getQuestions().length ? getQuestions() : (window.QUESTION_BANK || []).slice(0, 100);
    setQuestions(source.slice(0, 100).map(normalizeQuestion));
    migrateStoredResults();
  }

  function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem(KEYS.THEME, theme);
    if (el.themeToggle) el.themeToggle.checked = theme === "dark";
  }

  function initTheme() {
    applyTheme(localStorage.getItem(KEYS.THEME) || "light");
    if (el.themeToggle) {
      el.themeToggle.addEventListener("change", () => applyTheme(el.themeToggle.checked ? "dark" : "light"));
    }
  }

  function setAuthMode(mode) {
    const isLogin = mode === "login";
    el.authSliderWrap.classList.toggle("mode-login", isLogin);
    el.authSliderWrap.classList.toggle("mode-register", !isLogin);
    if (el.showLoginBtn) el.showLoginBtn.classList.toggle("active", isLogin);
    if (el.showRegisterBtn) el.showRegisterBtn.classList.toggle("active", !isLogin);
    syncAuthSliderHeight();
  }

  function syncAuthSliderHeight() {
    if (!el.authSliderWrap || !el.registerForm || !el.loginForm) return;
    const activeForm = el.authSliderWrap.classList.contains("mode-login") ? el.loginForm : el.registerForm;
    el.authSliderWrap.style.height = `${activeForm.offsetHeight}px`;
  }

  function showAuth() {
    document.body.classList.add("auth-view");
    el.authHero.classList.remove("hidden");
    el.authSection.classList.remove("hidden");
    el.appSection.classList.add("hidden");
  }

  function showApp() {
    document.body.classList.remove("auth-view");
    el.authHero.classList.add("hidden");
    el.authSection.classList.add("hidden");
    el.appSection.classList.remove("hidden");
    el.appHomeSection.classList.remove("hidden");
    el.quizPageSection.classList.add("hidden");
  }

  function renderHistory() {
    const user = getCurrentUser();
    if (!user) return;
    const rows = getResults(user.email).slice().reverse().slice(0, 10).map((r) => `
      <tr>
        <td>${formatDate(r.takenAt)}</td>
        <td>${r.category || "General"}</td>
        <td>${r.difficulty || "mixed"}</td>
        <td>${r.score}/${r.total}</td>
        <td>${r.percentage}%</td>
      </tr>
    `).join("");
    el.historyBody.innerHTML = rows || `<tr><td colspan="5">No attempts yet.</td></tr>`;
  }

  function getAllAttempts() {
    return getUsers().flatMap((u) => getResults(u.email).map((r) => ({ ...r, student: u.name })));
  }

  function renderLeaderboard() {
    const rows = getAllAttempts().sort((a, b) => b.percentage - a.percentage || b.score - a.score).slice(0, 10).map((r, i) => `
      <tr>
        <td>#${i + 1}</td>
        <td>${r.student}</td>
        <td>${r.category || "General"}</td>
        <td>${r.score}/${r.total}</td>
        <td>${r.percentage}%</td>
      </tr>
    `).join("");
    el.leaderboardBody.innerHTML = rows || `<tr><td colspan="5">No leaderboard data yet.</td></tr>`;
  }

  function renderAdminSection() {
    const user = getCurrentUser();
    const isAdmin = user && user.role === "admin";
    el.adminSection.classList.toggle("hidden", !isAdmin);
    if (!isAdmin) return;
    el.adminQuestionsBody.innerHTML = getQuestions().slice(0, 30).map((q) => `
      <tr>
        <td>${q.id}</td>
        <td>${q.question}</td>
        <td>${q.category}</td>
        <td>${q.difficulty}</td>
        <td>
          <button class="btn mini" data-action="edit" data-id="${q.id}">Edit</button>
          <button class="btn mini danger" data-action="delete" data-id="${q.id}">Delete</button>
        </td>
      </tr>
    `).join("");
  }

  function renderDashboard() {
    const user = getCurrentUser();
    if (!user) return showAuth();
    const my = getResults(user.email);
    const total = my.length;
    const highest = total ? Math.max(...my.map((r) => r.percentage)) : 0;
    const avg = total ? my.reduce((a, b) => a + b.percentage, 0) / total : 0;

    showApp();
    el.welcomeText.textContent = `Welcome, ${user.name}`;
    el.statTotal.textContent = String(total);
    el.statHighest.textContent = `${highest.toFixed(2)}%`;
    el.statAverage.textContent = `${avg.toFixed(2)}%`;
    el.statQuestions.textContent = String(getQuestions().length);
    renderHistory();
    renderLeaderboard();
    renderAdminSection();
  }

  function filterQuestions(category, difficulty) {
    return getQuestions().filter((q) => (category === "all" || q.category === category) && (difficulty === "all" || q.difficulty === difficulty));
  }

  function pickWithoutRepeating(pool, count) {
    const user = getCurrentUser();
    const lastIds = new Set(getLastQuestionIds(user.email));
    const fresh = pool.filter((q) => !lastIds.has(q.id));
    const primary = shuffle(fresh).slice(0, count);
    if (primary.length < count) {
      primary.push(...shuffle(pool.filter((q) => !primary.some((p) => p.id === q.id))).slice(0, count - primary.length));
    }
    setLastQuestionIds(user.email, primary.map((p) => p.id));
    return primary;
  }

  function adaptivePick(pool, count) {
    const easy = pool.filter((q) => q.difficulty === "easy");
    const medium = pool.filter((q) => q.difficulty === "medium");
    const hard = pool.filter((q) => q.difficulty === "hard");
    const e = Math.ceil(count * 0.4);
    const m = Math.ceil(count * 0.35);
    const h = Math.max(count - e - m, 0);
    return shuffle([
      ...pickWithoutRepeating(easy.length ? easy : pool, e),
      ...pickWithoutRepeating(medium.length ? medium : pool, m),
      ...pickWithoutRepeating(hard.length ? hard : pool, h)
    ]).slice(0, count);
  }

  function withShuffledOptions(q) {
    const options = shuffle(q.options);
    return { ...q, options, correctIndex: options.indexOf(q.answer) };
  }

  function startQuiz() {
    const category = el.categorySelect.value;
    const difficulty = el.difficultySelect.value;
    const mode = el.modeSelect.value;
    const count = Number(el.countSelect.value);
    const minutes = Math.max(1, Math.min(60, Number(el.timerMinutes.value) || 10));

    const pool = filterQuestions(category, difficulty);
    if (pool.length < count) return setMessage(el.setupMessage, `Only ${pool.length} questions match this filter. Reduce question count.`);

    const picked = mode === "adaptive" ? adaptivePick(pool, count) : pickWithoutRepeating(pool, count);
    state.quiz = {
      config: { category, difficulty, mode, count, minutes },
      items: picked.map(withShuffledOptions),
      answers: Array(count).fill(null),
      currentIndex: 0,
      endAt: Date.now() + minutes * 60000
    };

    el.appHomeSection.classList.add("hidden");
    el.quizPageSection.classList.remove("hidden");
    setMessage(el.setupMessage, "", true);
    renderQuizQuestion();
    startTimer();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startTimer() {
    stopTimer();
    tickTimer();
    state.timerHandle = setInterval(tickTimer, 1000);
  }

  function stopTimer() {
    if (state.timerHandle) clearInterval(state.timerHandle);
    state.timerHandle = null;
  }

  function tickTimer() {
    if (!state.quiz) return;
    const left = Math.max(0, Math.floor((state.quiz.endAt - Date.now()) / 1000));
    const mm = String(Math.floor(left / 60)).padStart(2, "0");
    const ss = String(left % 60).padStart(2, "0");
    el.timerText.textContent = `${mm}:${ss}`;
    if (left <= 0) submitQuiz(true);
  }

  function renderQuizQuestion() {
    if (!state.quiz) return;
    const qz = state.quiz;
    const i = qz.currentIndex;
    const item = qz.items[i];

    el.quizMeta.textContent = "Quiz In Progress";
    el.progressText.textContent = `Question ${i + 1}/${qz.items.length}`;
    el.progressBar.style.width = `${((i + 1) / qz.items.length) * 100}%`;
    el.questionCard.innerHTML = `
      <h4>${i + 1}. ${item.question}</h4>
      <div class="options">
        ${item.options.map((opt, idx) => `
          <label class="option-item ${qz.answers[i] === idx ? "selected" : ""}">
            <input type="radio" name="currentOption" value="${idx}" ${qz.answers[i] === idx ? "checked" : ""} />
            <span>${opt}</span>
          </label>
        `).join("")}
      </div>
    `;
    el.questionCard.querySelectorAll("input[name='currentOption']").forEach((radio) => radio.addEventListener("change", () => {
      qz.answers[i] = Number(radio.value);
      renderQuizQuestion();
    }));

    el.prevBtn.disabled = i === 0;
    el.nextBtn.disabled = i === qz.items.length - 1;
  }

  function changeQuestion(delta) {
    if (!state.quiz) return;
    state.quiz.currentIndex = Math.max(0, Math.min(state.quiz.items.length - 1, state.quiz.currentIndex + delta));
    renderQuizQuestion();
  }

  function feedbackFor(p) {
    if (p >= 80) return "Excellent!";
    if (p >= 50) return "Good effort!";
    return "Needs improvement.";
  }

  function finishQuizView() {
    stopTimer();
    state.quiz = null;
    el.quizPageSection.classList.add("hidden");
    el.appHomeSection.classList.remove("hidden");
  }

  function submitQuiz(auto = false) {
    if (!state.quiz) return;
    const qz = state.quiz;
    let score = 0;
    qz.items.forEach((item, idx) => { if (qz.answers[idx] === item.correctIndex) score += 1; });
    const percentage = Number(((score / qz.items.length) * 100).toFixed(2));

    const result = {
      score,
      total: qz.items.length,
      percentage,
      takenAt: new Date().toISOString(),
      category: qz.config.category,
      difficulty: qz.config.difficulty,
      mode: qz.config.mode,
      minutes: qz.config.minutes,
      autoSubmitted: auto
    };

    const user = getCurrentUser();
    const history = getResults(user.email);
    history.push(result);
    setResults(user.email, history);

    const feedback = feedbackFor(percentage);
    finishQuizView();
    renderDashboard();
    setMessage(el.setupMessage, `Submitted: ${score}/${qz.items.length} (${percentage}%). ${feedback}${auto ? " Auto-submitted." : ""}`, true);
  }

  function registerStudent(event) {
    event.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;
    if (password !== confirmPassword) return setMessage(el.authMessage, "Passwords do not match.");
    const users = getUsers();
    if (users.some((u) => u.email === email)) return setMessage(el.authMessage, "Email already registered.");
    users.push({ name, email, password, role: "student" });
    setUsers(users);
    setCurrentUser({ name, email, role: "student" });
    el.registerForm.reset();
    renderDashboard();
  }

  function loginStudent(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const user = getUsers().find((u) => u.email === email && u.password === password);
    if (!user) return setMessage(el.authMessage, "Invalid credentials.");
    setCurrentUser({ name: user.name, email: user.email, role: user.role || "student" });
    el.loginForm.reset();
    renderDashboard();
  }

  function logout() {
    finishQuizView();
    clearCurrentUser();
    showAuth();
    setMessage(el.authMessage, "Logged out.", true);
  }

  function addAdminQuestion(event) {
    event.preventDefault();
    const all = getQuestions();
    const nextId = all.length ? Math.max(...all.map((q) => q.id)) + 1 : 1;
    const newQuestion = {
      id: nextId,
      question: el.adminQuestion.value.trim(),
      options: [el.optA.value.trim(), el.optB.value.trim(), el.optC.value.trim(), el.optD.value.trim()],
      answer: el.adminCorrect.value.trim(),
      category: el.adminCategory.value,
      difficulty: el.adminDifficulty.value,
      explanation: el.adminExplanation.value.trim()
    };
    if (!newQuestion.options.includes(newQuestion.answer)) return setMessage(el.adminMessage, "Correct answer must match one of the 4 options.");
    all.push(newQuestion);
    setQuestions(all);
    el.adminQuestionForm.reset();
    renderDashboard();
    setMessage(el.adminMessage, "Question added.", true);
  }

  function handleAdminTableClick(event) {
    const t = event.target;
    if (!(t instanceof HTMLElement)) return;
    const action = t.dataset.action;
    const id = Number(t.dataset.id);
    if (!action || !id) return;

    let all = getQuestions();
    const item = all.find((q) => q.id === id);
    if (!item) return;

    if (action === "delete") {
      setQuestions(all.filter((q) => q.id !== id));
      renderDashboard();
      return;
    }

    if (action === "edit") {
      const newText = prompt("Edit question:", item.question);
      if (!newText) return;
      const newOptions = prompt("Options separated by |", item.options.join("|"));
      if (!newOptions) return;
      const opts = newOptions.split("|").map((s) => s.trim()).filter(Boolean);
      if (opts.length !== 4) return alert("Provide exactly 4 options.");
      const ans = prompt("Correct answer:", item.answer);
      if (!ans || !opts.includes(ans.trim())) return alert("Correct answer must match one option.");
      item.question = newText.trim();
      item.options = opts;
      item.answer = ans.trim();
      item.explanation = prompt("Explanation:", item.explanation) || item.explanation;
      setQuestions(all);
      renderDashboard();
    }
  }

  function initEvents() {
    if (el.showRegisterBtn) el.showRegisterBtn.addEventListener("click", () => setAuthMode("register"));
    if (el.showLoginBtn) el.showLoginBtn.addEventListener("click", () => setAuthMode("login"));
    el.switchToLoginInline.addEventListener("click", () => setAuthMode("login"));
    el.switchToRegisterInline.addEventListener("click", () => setAuthMode("register"));

    el.registerForm.addEventListener("submit", registerStudent);
    el.loginForm.addEventListener("submit", loginStudent);
    el.logoutBtn.addEventListener("click", logout);
    el.startQuizBtn.addEventListener("click", startQuiz);
    el.backDashboardBtn.addEventListener("click", () => { finishQuizView(); setMessage(el.setupMessage, "Quiz cancelled."); });
    el.prevBtn.addEventListener("click", () => changeQuestion(-1));
    el.nextBtn.addEventListener("click", () => changeQuestion(1));
    el.submitQuizBtn.addEventListener("click", () => submitQuiz(false));
    el.adminQuestionForm.addEventListener("submit", addAdminQuestion);
    el.adminQuestionsBody.addEventListener("click", handleAdminTableClick);
    window.addEventListener("resize", syncAuthSliderHeight);
  }

  function init() {
    seedDefaults();
    initTheme();
    setAuthMode("register");
    requestAnimationFrame(syncAuthSliderHeight);
    initEvents();
    renderDashboard();
  }

  init();
})();
