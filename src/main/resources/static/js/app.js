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
    appHeader: document.querySelector("#appSection .app-header"),
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
    leaderboardVisibilityToggle: document.getElementById("leaderboardVisibilityToggle"),
    menuToggleBtn: document.getElementById("menuToggleBtn"),
    headerMenuPanel: document.getElementById("headerMenuPanel"),
    settingsOverlay: document.getElementById("settingsOverlay"),
    settingsAvatar: document.getElementById("settingsAvatar"),
    settingsName: document.getElementById("settingsName"),
    settingsRole: document.getElementById("settingsRole"),

    welcomeText: document.getElementById("welcomeText"),
    welcomeRole: document.getElementById("welcomeRole"),
    userAvatar: document.querySelector(".avatar"),
    statTotal: document.getElementById("statTotal"),
    statHighest: document.getElementById("statHighest"),
    statAverage: document.getElementById("statAverage"),
    statSolved: document.getElementById("statSolved"),
    statTrend: document.getElementById("statTrend"),
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
    quizActions: document.querySelector(".quiz-actions"),
    quizMainActions: document.querySelector(".quiz-main-actions"),
    backDashboardBtn: document.getElementById("backDashboardBtn"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    submitQuizBtn: document.getElementById("submitQuizBtn"),
    quizCancelModal: document.getElementById("quizCancelModal"),
    quizCancelBackdrop: document.getElementById("quizCancelBackdrop"),
    quizCancelYesBtn: document.getElementById("quizCancelYesBtn"),
    quizCancelNoBtn: document.getElementById("quizCancelNoBtn"),

    historyBody: document.getElementById("historyBody"),
    leaderboardBody: document.getElementById("leaderboardBody"),
    leaderboardTableWrap: document.getElementById("leaderboardTableWrap"),
    leaderboardEmptyState: document.getElementById("leaderboardEmptyState"),

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
  function canShowOnLeaderboard(user) { return Boolean(user && user.leaderboardVisible); }

  function setMessage(node, text, good = false) {
    if (!node) return;
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
    let addedAdmin = false;
    if (!users.some((u) => u.email === "admin@qb.local")) {
      users.push({ name: "Admin", email: "admin@qb.local", password: "admin123", role: "admin", leaderboardVisible: false });
      addedAdmin = true;
    }
    let changed = false;
    users.forEach((user) => {
      if (typeof user.leaderboardVisible !== "boolean") {
        user.leaderboardVisible = false;
        changed = true;
      }
    });
    if (changed || addedAdmin) setUsers(users);
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
    setHeaderMenuOpen(false);
    document.body.classList.add("auth-view");
    el.authHero.classList.remove("hidden");
    el.authSection.classList.remove("hidden");
    el.appSection.classList.add("hidden");
  }

  function showApp() {
    setHeaderMenuOpen(false);
    document.body.classList.remove("auth-view");
    el.authHero.classList.add("hidden");
    el.authSection.classList.add("hidden");
    el.appSection.classList.remove("hidden");
    if (el.appHeader) el.appHeader.classList.remove("hidden");
    el.appHomeSection.classList.remove("hidden");
    el.quizPageSection.classList.add("hidden");
  }

  function renderHistory() {
    const user = getCurrentUser();
    if (!user) return;
    const formatAttemptDateParts = (iso) => {
      const d = new Date(iso);
      return {
        date: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
        time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      };
    };
    const difficultyLabel = (value) => {
      const v = String(value || "mixed").toLowerCase();
      if (v === "all") return "All";
      if (v === "mixed") return "Mixed";
      return v.charAt(0).toUpperCase() + v.slice(1);
    };
    const categoryLabel = (value) => {
      const v = String(value || "general").toLowerCase();
      if (v === "all") return "All";
      if (v === "general") return "General";
      return value;
    };
    const scoreTone = (p) => {
      if (p <= 30) return "low";
      if (p <= 54) return "mid";
      return "high";
    };
    const statusLabel = (p) => (p >= 55 ? "Pass" : "Low score");
    const rows = getResults(user.email).slice().reverse().slice(0, 10).map((r) => `
      <tr>
        <td class="attempt-date-cell">
          <div class="attempt-ring ${scoreTone(Number(r.percentage) || 0)}" style="--ring-angle:${Math.max(0, Math.min(360, Math.round((Number(r.percentage) || 0) * 3.6)))}deg;"><span>${r.percentage}%</span></div>
          <div class="attempt-meta">
            <strong>${formatAttemptDateParts(r.takenAt).date}</strong>
            <span>${formatAttemptDateParts(r.takenAt).time}</span>
            <span class="attempt-status ${scoreTone(Number(r.percentage) || 0)}"><i></i>${statusLabel(Number(r.percentage) || 0)}</span>
          </div>
        </td>
        <td>${categoryLabel(r.category)}</td>
        <td>${difficultyLabel(r.difficulty)}</td>
        <td>${r.score}/${r.total}</td>
        <td>${r.percentage}%</td>
      </tr>
    `).join("");
    el.historyBody.innerHTML = rows || `<tr><td colspan="5">No attempts yet.</td></tr>`;
  }

  function getAllAttempts() {
    return getUsers()
      .filter(canShowOnLeaderboard)
      .flatMap((u) => getResults(u.email).map((r) => ({ ...r, student: u.name })));
  }

  function setLeaderboardVisibility(enabled) {
    const user = getCurrentUser();
    if (!user) return;
    const users = getUsers();
    const target = users.find((u) => u.email === user.email);
    if (!target) return;
    target.leaderboardVisible = enabled;
    setUsers(users);
    setCurrentUser({ ...user, leaderboardVisible: enabled });
    if (el.leaderboardVisibilityToggle) el.leaderboardVisibilityToggle.checked = enabled;
    renderLeaderboard();
  }

  function renderLeaderboard() {
    const current = getCurrentUser();
    const canViewLiveBoard = canShowOnLeaderboard(current);
    const attempts = canViewLiveBoard ? getAllAttempts() : [];
    const rows = attempts.sort((a, b) => b.percentage - a.percentage || b.score - a.score).slice(0, 10).map((r, i) => `
      <tr>
        <td>#${i + 1}</td>
        <td>${r.student}</td>
        <td>${r.category || "General"}</td>
        <td>${r.score}/${r.total}</td>
        <td>${r.percentage}%</td>
      </tr>
    `).join("");
    const hasRows = Boolean(rows);
    if (el.leaderboardTableWrap) el.leaderboardTableWrap.classList.toggle("hidden", !hasRows);
    if (el.leaderboardEmptyState) el.leaderboardEmptyState.classList.toggle("hidden", hasRows);
    el.leaderboardBody.innerHTML = rows;
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
    const solved = my.reduce((sum, r) => sum + (r.total || 0), 0);

    showApp();
    el.welcomeText.textContent = user.name;
    if (el.leaderboardVisibilityToggle) {
      el.leaderboardVisibilityToggle.checked = canShowOnLeaderboard(user);
    }
    if (el.welcomeRole) el.welcomeRole.textContent = user.role === "admin" ? "Administrator" : "Student";
    if (el.userAvatar) {
      const initials = (user.name || "User").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
      el.userAvatar.textContent = initials || "U";
      if (el.settingsAvatar) el.settingsAvatar.textContent = initials || "U";
    }
    if (el.settingsName) el.settingsName.textContent = user.name;
    if (el.settingsRole) el.settingsRole.textContent = user.role === "admin" ? "Administrator" : "Student";
    el.statTotal.textContent = String(total);
    el.statHighest.textContent = `${highest.toFixed(2)}%`;
    el.statAverage.textContent = `${avg.toFixed(2)}%`;
    if (el.statSolved) el.statSolved.textContent = String(solved);
    if (el.statTrend) {
      const trend = total > 0 ? (avg - highest * 0.2) : 0;
      el.statTrend.textContent = `${trend >= 0 ? "+" : ""}${trend.toFixed(1)}% this month`;
    }
    if (el.statQuestions) el.statQuestions.textContent = String(getQuestions().length);
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
    if (el.appHeader) el.appHeader.classList.add("hidden");
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

    if (el.quizActions) el.quizActions.classList.remove("hidden");
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

  function feedbackFor(percentage) {
    if (percentage < 40) {
      return {
        tone: "low",
        title: "Oof 😅",
        message: "That was a tough one. Ready for a comeback?",
        helper: "Don’t worry, every expert starts somewhere."
      };
    }
    if (percentage < 70) {
      return {
        tone: "mid",
        title: "Not bad! 🎯",
        message: "You're getting there.",
        helper: "A few more attempts and this will feel easy."
      };
    }
    return {
      tone: "high",
      title: "Legend! 🏆",
      message: "You crushed it!",
      helper: "That was a strong performance."
    };
  }

  function formatDuration(totalSeconds) {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const mm = String(Math.floor(safe / 60)).padStart(2, "0");
    const ss = String(safe % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function getResultBadges({ firstAttempt, speedRunner }) {
    const badges = [];
    if (firstAttempt) badges.push("🏅 First Attempt");
    if (speedRunner) badges.push("⚡ Speed Runner");
    return badges;
  }

  function animateCount(elm, target, suffix = "", duration = 900) {
    if (!elm) return;
    const start = performance.now();
    const endValue = Math.max(0, Number(target) || 0);
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(endValue * eased);
      elm.textContent = `${value}${suffix}`;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function animateRing(ringEl, percentage, duration = 1000) {
    if (!ringEl) return;
    const endAngle = Math.max(0, Math.min(360, (Number(percentage) || 0) * 3.6));
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const angle = Math.round(endAngle * eased);
      ringEl.style.setProperty("--score-angle", `${angle}deg`);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function launchConfetti(container) {
    if (!container) return;
    const burst = document.createElement("div");
    burst.className = "confetti-burst";
    const colors = ["#1dd1a1", "#10ac84", "#feca57", "#48dbfb", "#ffffff"];
    for (let i = 0; i < 72; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * 0.25}s`;
      piece.style.animationDuration = `${1.6 + Math.random() * 1.1}s`;
      piece.style.transform = `translateY(-18px) rotate(${Math.random() * 360}deg)`;
      burst.appendChild(piece);
    }
    container.appendChild(burst);
    setTimeout(() => burst.remove(), 3200);
  }

  function finishQuizView() {
    stopTimer();
    state.quiz = null;
    el.quizPageSection.classList.add("hidden");
    if (el.appHeader) el.appHeader.classList.remove("hidden");
    el.appHomeSection.classList.remove("hidden");
    if (el.quizActions) el.quizActions.classList.remove("hidden");
  }

  function setQuizCancelModalOpen(open) {
    if (!el.quizCancelModal) return;
    el.quizCancelModal.hidden = !open;
    document.body.classList.toggle("modal-open", open);
  }

  function confirmCancelQuiz() {
    finishQuizView();
    renderDashboard();
    setQuizCancelModalOpen(false);
    setMessage(el.setupMessage, "Quiz cancelled.", true);
  }

  function cancelQuizWithConfirmation() {
    if (!state.quiz) return;
    setQuizCancelModalOpen(true);
  }

  function showQuizResult({
    score,
    total,
    percentage,
    feedback,
    auto,
    config,
    elapsedSeconds,
    firstAttempt
  }) {
    stopTimer();
    el.quizMeta.textContent = "Quiz Completed";
    el.progressText.textContent = "Completed";
    el.progressBar.style.width = "0%";
    requestAnimationFrame(() => { el.progressBar.style.width = "100%"; });
    if (el.quizActions) el.quizActions.classList.add("hidden");
    const wrong = Math.max(0, total - score);
    const speedRunner = !auto && elapsedSeconds <= (config.minutes * 60) * 0.7;
    const badges = getResultBadges({ firstAttempt, speedRunner });
    const answerPercent = total ? Math.round((score / total) * 100) : 0;
    el.questionCard.innerHTML = `
      <div class="quiz-result ${feedback.tone}">
        <div class="quiz-result-header">
          <p class="quiz-result-kicker">🏁 Quiz Completed!</p>
          <div class="quiz-badge-row">
            ${badges.map((badge) => `<span class="quiz-badge">${badge}</span>`).join("")}
          </div>
        </div>

        <div class="quiz-result-main">
          <div class="quiz-score-ring" id="resultRing" style="--score-angle: 0deg;">
            <div class="ring-inner">
              <strong id="resultPercentValue">0%</strong>
            </div>
          </div>

          <div class="quiz-result-copy">
            <h4>${feedback.title}</h4>
            <p class="quiz-score-line">🎯 Score: <strong id="resultScoreValue">0</strong>/${total}</p>
            <p class="quiz-feedback-line">${feedback.message}${auto ? " (Auto-submitted)" : ""}</p>
            <p class="quiz-helper-line">💬 ${feedback.helper}</p>
            <p class="quiz-time-line">⏱ Time: ${formatDuration(elapsedSeconds)} / ${formatDuration(config.minutes * 60)}</p>
          </div>

        </div>

        <div class="quiz-result-stats">
          <div class="quiz-stat"><span>✅ Correct</span><strong>${score}</strong></div>
          <div class="quiz-stat"><span>❌ Wrong</span><strong>${wrong}</strong></div>
          <div class="quiz-answer-track">
            <div class="quiz-answer-correct" style="width:${answerPercent}%"></div>
          </div>
        </div>

        <div class="quiz-result-actions">
          <button id="resultRetryBtn" class="btn result-primary" type="button">Try Again</button>
          <button id="resultDoneBtn" class="btn secondary" type="button">Back to Dashboard</button>
        </div>
      </div>
    `;
    const scoreValue = document.getElementById("resultScoreValue");
    const percentValue = document.getElementById("resultPercentValue");
    const ring = document.getElementById("resultRing");
    animateCount(scoreValue, score);
    animateCount(percentValue, Math.round(percentage), "%");
    animateRing(ring, percentage);
    if (percentage >= 70) {
      launchConfetti(el.questionCard.querySelector(".quiz-result"));
    }
    const retryBtn = document.getElementById("resultRetryBtn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        el.categorySelect.value = config.category;
        el.difficultySelect.value = config.difficulty;
        el.modeSelect.value = config.mode;
        el.countSelect.value = String(config.count);
        el.timerMinutes.value = String(config.minutes);
        startQuiz();
      });
    }
    const doneBtn = document.getElementById("resultDoneBtn");
    if (doneBtn) {
      doneBtn.addEventListener("click", () => {
        finishQuizView();
        renderDashboard();
      });
    }
  }

  function submitQuiz(auto = false) {
    if (!state.quiz) return;
    const qz = state.quiz;
    let score = 0;
    qz.items.forEach((item, idx) => { if (qz.answers[idx] === item.correctIndex) score += 1; });
    const percentage = Number(((score / qz.items.length) * 100).toFixed(2));
    const timeLeftSeconds = Math.max(0, Math.floor((qz.endAt - Date.now()) / 1000));
    const elapsedSeconds = Math.max(0, qz.config.minutes * 60 - timeLeftSeconds);

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
    const firstAttempt = history.length === 0;
    history.push(result);
    setResults(user.email, history);

    const feedback = feedbackFor(percentage);
    showQuizResult({
      score,
      total: qz.items.length,
      percentage,
      feedback,
      auto,
      config: qz.config,
      elapsedSeconds,
      firstAttempt
    });
    state.quiz = null;
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
    users.push({ name, email, password, role: "student", leaderboardVisible: false });
    setUsers(users);
    setCurrentUser({ name, email, role: "student", leaderboardVisible: false });
    el.registerForm.reset();
    renderDashboard();
  }

  function loginStudent(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const user = getUsers().find((u) => u.email === email && u.password === password);
    if (!user) return setMessage(el.authMessage, "Invalid credentials.");
    setCurrentUser({
      name: user.name,
      email: user.email,
      role: user.role || "student",
      leaderboardVisible: canShowOnLeaderboard(user)
    });
    el.loginForm.reset();
    renderDashboard();
  }

  function logout() {
    finishQuizView();
    clearCurrentUser();
    setHeaderMenuOpen(false);
    showAuth();
    setMessage(el.authMessage, "Logged out.", true);
  }

  function setHeaderMenuOpen(open) {
    if (!el.menuToggleBtn || !el.headerMenuPanel) return;
    el.menuToggleBtn.setAttribute("aria-expanded", String(open));
    el.headerMenuPanel.classList.toggle("open", open);
    el.headerMenuPanel.setAttribute("aria-hidden", String(!open));
    if (el.settingsOverlay) el.settingsOverlay.classList.toggle("open", open);
    document.body.classList.toggle("settings-open", open);
  }

  function toggleHeaderMenu(event) {
    event.stopPropagation();
    if (!el.menuToggleBtn || !el.headerMenuPanel) return;
    const open = el.menuToggleBtn.getAttribute("aria-expanded") === "true";
    setHeaderMenuOpen(!open);
  }

  function handleDocumentClick(event) {
    if (!el.menuToggleBtn || !el.headerMenuPanel) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (el.menuToggleBtn.contains(target) || el.headerMenuPanel.contains(target)) return;
    setHeaderMenuOpen(false);
  }

  function handleHeaderMenuEscape(event) {
    if (event.key !== "Escape") return;
    setHeaderMenuOpen(false);
    setQuizCancelModalOpen(false);
  }

  function handleSocialLoginClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-social-provider]");
    if (!(button instanceof HTMLElement)) return;
    const provider = button.dataset.socialProvider || "Social";
    setMessage(el.authMessage, `${provider} sign in will be available soon.`);
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
    el.loginForm.addEventListener("click", handleSocialLoginClick);
    el.logoutBtn.addEventListener("click", logout);
    if (el.menuToggleBtn) el.menuToggleBtn.addEventListener("click", toggleHeaderMenu);
    if (el.leaderboardVisibilityToggle) {
      el.leaderboardVisibilityToggle.addEventListener("change", () => {
        setLeaderboardVisibility(el.leaderboardVisibilityToggle.checked);
      });
    }
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleHeaderMenuEscape);
    el.startQuizBtn.addEventListener("click", startQuiz);
    if (el.backDashboardBtn) el.backDashboardBtn.addEventListener("click", cancelQuizWithConfirmation);
    if (el.quizCancelBackdrop) el.quizCancelBackdrop.addEventListener("click", () => setQuizCancelModalOpen(false));
    if (el.quizCancelNoBtn) el.quizCancelNoBtn.addEventListener("click", () => setQuizCancelModalOpen(false));
    if (el.quizCancelYesBtn) el.quizCancelYesBtn.addEventListener("click", confirmCancelQuiz);
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
    setAuthMode("login");
    requestAnimationFrame(syncAuthSliderHeight);
    initEvents();
    renderDashboard();
  }

  init();
})();
