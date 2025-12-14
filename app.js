// CyberSafe — app.js
// В проекте специально простой JS без библиотек (чтобы было понятно уровню 10 класса).

(function () {
  "use strict";

  // ====== маленькие помощники ======
  function $(id) { return document.getElementById(id); }

  function canUseLocalStorage() {
    try {
      var k = "__test__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  function save(key, value) {
    if (!canUseLocalStorage()) return;
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function load(key) {
    if (!canUseLocalStorage()) return null;
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  // ====== навигация без длинного скролла (простая SPA по #hash) ======
  var VIEWS = ["home", "theory", "tools", "games", "quiz", "help"];

  function getRouteFromHash() {
    var h = (location.hash || "#home").replace(/^#/, "");
    // поддержим случаи типа #theory#privacy-theory — берём первый кусок
    var first = h.split("#")[0].split("?")[0].trim();
    if (VIEWS.indexOf(first) === -1) return "home";
    return first;
  }

  function setActiveLinks(route) {
    var all = document.querySelectorAll(".nav-item, .bn");
    for (var i = 0; i < all.length; i++) {
      var a = all[i];
      var href = a.getAttribute("href") || "";
      var r = href.replace(/^#/, "");
      a.classList.toggle("active", r === route);
    }
  }

  function showView(route) {
    for (var i = 0; i < VIEWS.length; i++) {
      var id = "view-" + VIEWS[i];
      var el = document.getElementById(id);
      if (!el) continue;
      el.classList.toggle("active", VIEWS[i] === route);
    }
    setActiveLinks(route);
    var main = document.getElementById("main");
    if (main) main.focus();
  }

  function handleHashChange() {
    var route = getRouteFromHash();
    showView(route);

    // если в hash есть второй якорь (пример #theory#phishing-theory) — скроллим внутри view
    var parts = (location.hash || "").split("#").filter(Boolean);
    if (parts.length >= 2) {
      var innerId = parts[1];
      var target = document.getElementById(innerId);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // ====== тема (светлая/тёмная) ======
  var themeBtn = $("themeBtn");

  function applyTheme(mode) {
  // По умолчанию сайт тёмный. Светлая тема включается классом html.light.
  if (mode === "light") {
    document.documentElement.classList.add("light");
    if (themeBtn) themeBtn.textContent = "Тема: Светлая";
  } else {
    document.documentElement.classList.remove("light");
    if (themeBtn) themeBtn.textContent = "Тема: Тёмная";
  }
}

applyTheme(load("theme_mode") || "dark");


  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var isLight = document.documentElement.classList.contains("light");
      var next = isLight ? "dark" : "light";
      applyTheme(next);
      save("theme_mode", next);
    });
  }

  // ====== размер текста (только на широких экранах) ======
  var minSize = 13, maxSize = 18;
  var fontMinus = $("fontMinus");
  var fontPlus = $("fontPlus");

  function setBaseSize(px) {
    px = Math.max(minSize, Math.min(maxSize, px));
    document.documentElement.style.setProperty("--base", px + "px");
    save("base_size_px", String(px));
  }

  var storedSize = parseInt(load("base_size_px") || "", 10);
  if (!isNaN(storedSize)) setBaseSize(storedSize);

  if (fontMinus) {
    fontMinus.addEventListener("click", function () {
      var cur = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--base"), 10) || 16;
      setBaseSize(cur - 1);
    });
  }

  if (fontPlus) {
    fontPlus.addEventListener("click", function () {
      var cur = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--base"), 10) || 16;
      setBaseSize(cur + 1);
    });
  }

  // ====== проверка пароля ======
  var pwd = $("pwd");
  var barFill = $("barFill");
  var barText = $("barText");
  var eyeBtn = $("eyeBtn");

  function passwordScore(p) {
    // 0..4 (максимум 4 пункта)
    var s = 0;
    if (!p) return 0;
    if (p.length >= 12) s++;
    if (/[A-ZА-Я]/.test(p) && /[a-zа-я]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-zА-Яа-я0-9]/.test(p)) s++;
    return s;
  }

  function updateStrength(p) {
    var s = passwordScore(p);
    var pct = (s / 4) * 100;
    if (barFill) barFill.style.width = pct + "%";
    var labels = ["Очень слабый", "Слабый", "Средний", "Хороший", "Сильный"];
    if (barText) barText.textContent = labels[s] || "—";
  }

  if (pwd) {
    pwd.addEventListener("input", function () { updateStrength(pwd.value || ""); });
    updateStrength("");
  }

  if (eyeBtn && pwd) {
    eyeBtn.addEventListener("click", function () {
      var isPwd = pwd.getAttribute("type") === "password";
      pwd.setAttribute("type", isPwd ? "text" : "password");
      eyeBtn.setAttribute("aria-pressed", String(isPwd));
      eyeBtn.querySelector(".eye-ico").textContent = isPwd ? "🙈" : "👁️";
      eyeBtn.querySelector(".eye-txt").textContent = isPwd ? "Скрыть" : "Показать";
    });
  }

  // ====== генератор пароля (для учёбы) ======
  var pwLen = $("pwLen");
  var genBtn = $("genBtn");
  var useBtn = $("useBtn");
  var pwOut = $("pwOut");

  function rndChoice(str) {
    return str[Math.floor(Math.random() * str.length)];
  }

  function genPassword(len) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_+=[]{};:,.<>?";
    var out = "";
    for (var i = 0; i < len; i++) out += rndChoice(chars);
    return out;
  }

  function toast(text) {
    var el = document.createElement("div");
    el.textContent = text;
    el.style.position = "fixed";
    el.style.right = "16px";
    el.style.bottom = "70px";
    el.style.padding = "8px 10px";
    el.style.borderRadius = "12px";
    el.style.border = "1px solid var(--border)";
    el.style.background = "var(--card)";
    el.style.color = "var(--text)";
    el.style.boxShadow = "0 8px 20px rgba(0,0,0,.18)";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1600);
  }

  if (genBtn && pwLen && pwOut) {
    genBtn.addEventListener("click", function () {
      var l = Math.max(6, Math.min(30, Number(pwLen.value) || 14));
      var p = genPassword(l);
      pwOut.textContent = p;

      // попробуем скопировать (если браузер разрешит)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(p).then(
          function () { toast("Скопировано в буфер"); },
          function () {}
        );
      }
    });
  }

  if (useBtn && pwOut && pwd) {
    useBtn.addEventListener("click", function () {
      var p = pwOut.textContent || "";
      if (!p) { toast("Сначала сгенерируй пароль"); return; }
      pwd.value = p;
      pwd.dispatchEvent(new Event("input", { bubbles: true }));
      toast("Вставлено в поле");
    });
  }

  // ====== тест: рисуем вопросы из массива ======
  var quizData = [
    { q: "Что такое 2FA?", a: ["Второй аккаунт", "Двухфакторная аутентификация", "Шифрование"], correct: 2,
      explain: "2FA — второй фактор входа (код/приложение/ключ), который добавляется к паролю." },
    { q: "Какой пароль самый надёжный?", a: ["12345678", "Qwerty2025", "Длинная пароль‑фраза со знаками"], correct: 3,
      explain: "Пароль‑фраза из нескольких слов + цифры/символы сложнее для подбора." },
    { q: "Зачем нужен менеджер паролей?", a: ["Чтобы показывать пароли друзьям", "Чтобы хранить длинные уникальные пароли", "Чтобы ускорять интернет"], correct: 2,
      explain: "Менеджер запоминает длинные уникальные пароли и помогает безопасно авторизоваться." },
    { q: "Где безопаснее вводить пароль из письма?", a: ["По ссылке из письма", "Зайдя на сайт вручную", "В любом месте одинаково"], correct: 2,
      explain: "Ссылка из письма может вести на фишинговый сайт. Лучше вводить адрес вручную." },
    { q: "Что относится к личным данным?", a: ["Никнейм и цвет аватарки", "Адрес, школа, телефон", "Количество подписчиков"], correct: 2,
      explain: "Адрес, учебное место и телефон — персональные данные, их нельзя публиковать свободно." },
    { q: "Метаданные (EXIF) в фото — это…", a: ["Только размер файла", "Скрытые данные: геолокация, модель камеры", "Качество снимка"], correct: 2,
      explain: "EXIF может содержать геометку и модель устройства — лучше очищать перед публикацией." },
    { q: "Как правильно действовать при кибербуллинге?", a: ["Ответить тем же", "Игнорировать и стереть всё", "Сохранить доказательства, пожаловаться, рассказать взрослым"], correct: 3,
      explain: "Важно не вступать в перепалку: скрины → жалоба/блок → взрослые." },
    { q: "«СРОЧНО! пришлите код из SMS» пришло «от поддержки». Что делать?", a: ["Прислать код", "Никогда не отправлять коды 2FA", "Сначала перевести деньги"], correct: 2,
      explain: "Поддержка не просит коды 2FA. Это классический фишинг/социнжиниринг." },
    { q: "Безопасное восстановление доступа — это…", a: ["Через случайный сайт из поиска", "Через официальный сайт/приложение", "Написать другому пользователю"], correct: 2,
      explain: "Восстанавливай доступ только на официальном сайте/в приложении сервиса." },
    { q: "Что сделать после взлома страницы?", a: ["Ничего", "Сменить пароль, выйти с чужих устройств, включить 2FA", "Удалить аккаунт сразу"], correct: 2,
      explain: "После взлома: смена пароля, завершение сессий, включение 2FA и проверка восстановления." },
    { q: "Как уменьшить цифровой след?", a: ["Публиковать меньше личной инфы, закрыть профиль", "Ставить больше лайков", "Ежедневно менять аватарку"], correct: 1,
      explain: "Ограничь доступ к профилю и не публикуй чувствительные данные." },
    { q: "Где безопаснее проверять ссылку?", a: ["В проверяющем сервисе/песочнице", "Открыть и посмотреть", "Сразу отправить всем друзьям"], correct: 1,
      explain: "Сомнительные ссылки лучше проверять безопасно, а не открывать сразу." }
  ];

  var quizList = $("quizList");
  var checkBtn = $("checkBtn");
  var resetBtn = $("resetBtn");
  var result = $("result");
  var progText = $("progText");
  var progFill = $("progFill");

  function renderQuiz() {
    if (!quizList) return;
    quizList.innerHTML = "";

    for (var i = 0; i < quizData.length; i++) {
      var item = quizData[i];

      var li = document.createElement("li");
      li.id = "q" + (i + 1);

      var h = document.createElement("h3");
      h.innerHTML = "<strong>" + (i + 1) + ".</strong> " + item.q;
      li.appendChild(h);

      for (var j = 0; j < item.a.length; j++) {
        var label = document.createElement("label");
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "q" + (i + 1);
        input.value = String(j + 1);
        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + item.a[j]));
        li.appendChild(label);
      }

      quizList.appendChild(li);
    }
  }

  function updateProgress() {
    var total = quizData.length;
    var answered = 0;

    for (var i = 0; i < total; i++) {
      var chosen = document.querySelector('input[name="q' + (i + 1) + '"]:checked');
      if (chosen) answered++;
    }

    var pct = Math.round((answered / total) * 100);
    if (progText) progText.textContent = answered + " / " + total;
    if (progFill) progFill.style.width = pct + "%";
  }

  function gradeQuiz() {
    var total = quizData.length;
    var score = 0;
    var lines = [];

    for (var i = 0; i < total; i++) {
      var chosen = document.querySelector('input[name="q' + (i + 1) + '"]:checked');
      var val = chosen ? parseInt(chosen.value, 10) : -1;
      var correct = quizData[i].correct;

      if (val === correct) score++;

      lines.push(
        "<div><b>Вопрос " + (i + 1) + ":</b> " +
        (val === correct ? "✅ верно" : "❌ ошибка") +
        "<br><span class=\"muted\">" + quizData[i].explain + "</span></div>"
      );
    }

    var percent = Math.round((score / total) * 100);
    var cls = (percent >= 80) ? "ok" : (percent >= 50) ? "warn" : "bad";

    if (result) {
      result.className = "result " + cls;
      result.innerHTML = "<b>Баллы:</b> " + score + " / " + total + " (" + percent + "%)<hr>" + lines.join("");
    }

    location.hash = "#quiz#result";
  }

  function resetQuiz() {
    var inputs = document.querySelectorAll('#quizList input[type="radio"]');
    for (var i = 0; i < inputs.length; i++) inputs[i].checked = false;
    if (result) { result.className = "result"; result.innerHTML = ""; }
    updateProgress();
    location.hash = "#quiz";
  }

  renderQuiz();
  updateProgress();

  if (quizList) quizList.addEventListener("change", updateProgress);
  if (checkBtn) checkBtn.addEventListener("click", gradeQuiz);
  if (resetBtn) resetBtn.addEventListener("click", resetQuiz);

  // ====== поиск по теории (фильтр карточек) ======
  var theorySearch = $("theorySearch");
  var theoryCards = document.querySelectorAll(".topic");

  function norm(s) {
    return String(s || "").toLowerCase().replace(/ё/g, "е").trim();
  }

  function applyTheoryFilter(q) {
    var qq = norm(q);
    for (var i = 0; i < theoryCards.length; i++) {
      var card = theoryCards[i];
      // берём и текст, и ключи (data-keys), чтобы находило быстрее
      var text = norm(card.textContent + " " + (card.getAttribute("data-keys") || ""));
      var ok = !qq || text.indexOf(qq) !== -1;
      card.style.display = ok ? "" : "none";
    }
  }

  if (theorySearch) {
    theorySearch.addEventListener("input", function () {
      applyTheoryFilter(theorySearch.value);
    });
  }

  // ====== запускаем роутер ======
  window.addEventListener("hashchange", handleHashChange);
  // если hash пустой — поставим #home
  if (!location.hash) location.hash = "#home";
  handleHashChange();

})();
