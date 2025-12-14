// CyberSafe — games.js
// Игры сделаны без библиотек, но "похоже на настоящий сайт": вкладки, прогресс, объяснения.

(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  // =========================
  // Tabs (вкладки) на странице "Игры"
  // =========================
  function initTabs() {
    var tabs = document.querySelectorAll(".tab");
    var panels = document.querySelectorAll(".tabpanel");
    if (!tabs.length || !panels.length) return;

    function setTab(name) {
      for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        var is = t.getAttribute("data-tab") === name;
        t.classList.toggle("active", is);
        t.setAttribute("aria-selected", String(is));
      }
      for (var j = 0; j < panels.length; j++) {
        var p = panels[j];
        var isP = p.getAttribute("data-panel") === name;
        p.classList.toggle("hidden", !isP);
      }
    }

    for (var k = 0; k < tabs.length; k++) {
      tabs[k].addEventListener("click", function (e) {
        setTab(e.currentTarget.getAttribute("data-tab"));
        // чтобы игрок сразу видел начало выбранной игры
        var wrap = document.querySelector(".tabs");
        if (wrap) wrap.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    setTab("inbox");
  }

  // =========================
  // Игра 1: Инбокс‑защитник
  // =========================
  var inboxRoot = $("inboxGame");

  // Примеры вымышленные
  var EMAILS = [
    {
      from: "support@vk-security.example",
      subject: "СРОЧНО: подтвердите вход",
      time: "10:12",
      snippet: "Мы заметили подозрительный вход. Отправьте код из SMS…",
      body:
        "Здравствуйте!\n\nМы заметили подозрительный вход. Чтобы защитить аккаунт — пришлите код из SMS прямо в ответ на это письмо.\n\nСпасибо, служба поддержки.",
      correct: "phish",
      why: "Поддержка не просит коды из SMS/2FA. Это социальная инженерия."
    },
    {
      from: "teacher.chat@class.example",
      subject: "Домашнее задание (ссылка на документ)",
      time: "12:05",
      snippet: "Откройте документ и посмотрите задание…",
      body:
        "Ребята, задание в документе.\n\nВажно: входите через школьный аккаунт ТОЛЬКО на официальном домене школы. Если сайт выглядит странно — не вводите пароль и напишите мне.",
      correct: "ok",
      why: "Похоже на нормальное сообщение, но всё равно проверяем домен и не вводим пароль на подозрительных страницах."
    },
    {
      from: "prizes@free-gifts.example",
      subject: "🎁 Вы выиграли AirPods!",
      time: "18:22",
      snippet: "Заберите приз по ссылке, осталось 30 минут…",
      body:
        "Поздравляем! Вы выиграли приз.\n\nСсылка для получения: http://airpods-win.example\n\nОсталось 30 минут, потом приз сгорит.",
      correct: "phish",
      why: "Давят на срочность + слишком выгодно + непонятный адрес — типичный фишинг."
    },
    {
      from: "no-reply@service.example",
      subject: "Вход с нового устройства",
      time: "08:41",
      snippet: "Если это были не вы — проверьте безопасность в приложении…",
      body:
        "Мы заметили вход с нового устройства.\n\nЕсли это не вы — зайдите в приложение и откройте раздел «Безопасность», чтобы завершить сессию и сменить пароль.",
      correct: "ok",
      why: "Сообщение не просит коды и предлагает зайти в приложение вручную — это хороший признак."
    },
    {
      from: "friend@messenger.example",
      subject: "Посмотри фотки",
      time: "21:09",
      snippet: "Скачай архив, там фотки с прогулки…",
      body:
        "Скачай файл: photos_2025.zip\n\nПароль: 1234\n\nЕсли не откроется — запусти installer.exe внутри архива.",
      correct: "phish",
      why: "Просьба запускать .exe — красный флаг. Даже если пишет «друг», аккаунт могли взломать."
    },
    {
      from: "bank-alert@payments.example",
      subject: "Ошибка оплаты",
      time: "14:37",
      snippet: "Подтвердите карту, иначе платеж не пройдёт…",
      body:
        "Платёж не прошёл.\n\nЧтобы подтвердить карту, перейдите по ссылке и введите данные карты + код из SMS.\n\nСсылка: http://secure-payments-check.example",
      correct: "phish",
      why: "Просят данные карты и код из SMS — это крайне опасно. Настоящие сервисы так не делают."
    },
    {
      from: "steam@example",
      subject: "Ваш код подтверждения",
      time: "09:55",
      snippet: "Код: 482193. Никому не сообщайте.",
      body:
        "Код подтверждения: 482193\n\nНикому не сообщайте. Если код запросили не вы — смените пароль.",
      correct: "ok",
      why: "Само письмо с кодом может быть настоящим, но важное правило: код никому не пересылать."
    },
    {
      from: "admin@school.example",
      subject: "Обновление пароля",
      time: "16:10",
      snippet: "Пароль истёк. Обновите его на школьном портале…",
      body:
        "Пароль школьного аккаунта истёк.\n\nЗайдите на школьный портал через закладку или вручную и обновите пароль.\n\n(Никаких кодов и паролей в ответ не присылайте.)",
      correct: "ok",
      why: "Просят выполнить действие через официальный портал и не требуют кодов/паролей в письме."
    }
  ];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function renderInboxGame() {
    if (!inboxRoot) return;

    var deck = shuffle(EMAILS);
    var idx = 0;
    var score = 0;
    var streak = 0;
    var bestStreak = 0;

    inboxRoot.innerHTML =
      "<div class='ghead'>" +
        "<div>" +
          "<div class='gtitle'>Раунд: <b id='inboxRound'>1</b> / " + deck.length + "</div>" +
          "<div class='muted'>Открой письмо и реши: <b>фишинг</b> или <b>безопасно</b>.</div>" +
        "</div>" +
        "<div class='gstats'>" +
          "<span class='pill'>Очки: <b id='inboxScore'>0</b></span>" +
          "<span class='pill'>Серия: <b id='inboxStreak'>0</b></span>" +
        "</div>" +
      "</div>" +

      "<div class='inbox'>" +
        "<div class='mail-list' id='inboxList' aria-label='Список писем'></div>" +
        "<div class='mail-view inbox-read'>" +
          "<div class='mail-head'>" +
            "<div class='mail-subject' id='mailSubject'>—</div>" +
            "<div class='mail-meta muted' id='mailMeta'>—</div>" +
          "</div>" +
          "<pre class='mail-body' id='mailBody'></pre>" +

          "<div class='gactions'>" +
            "<button class='btn' id='btnPhish' type='button'>🎣 Фишинг</button>" +
            "<button class='btn' id='btnOk' type='button'>✅ Безопасно</button>" +
            "<button class='btn' id='btnSkip' type='button' title='Пропустить без очков'>⏭️ Пропустить</button>" +
          "</div>" +

          "<div class='gresult' id='mailResult' aria-live='polite'></div>" +
        "</div>" +
      "</div>";

    var inboxList = $("inboxList");
    var mailSubject = $("mailSubject");
    var mailMeta = $("mailMeta");
    var mailBody = $("mailBody");
    var mailResult = $("mailResult");
    var btnPhish = $("btnPhish");
    var btnOk = $("btnOk");
    var btnSkip = $("btnSkip");

    function updateStats() {
      $("inboxRound").textContent = String(Math.min(idx + 1, deck.length));
      $("inboxScore").textContent = String(score);
      $("inboxStreak").textContent = String(streak);
    }

    function renderList(activeIndex) {
      if (!inboxList) return;
      inboxList.innerHTML = "";

      for (var i = 0; i < deck.length; i++) {
        var m = deck[i];
        var item = document.createElement("button");
        item.type = "button";
        item.className = "mail-item" + (i === activeIndex ? " active" : "");
        item.innerHTML =
          "<div class='mi-top'>" +
            "<div class='mi-from'>" + m.from + "</div>" +
            "<div class='mi-time muted'>" + m.time + "</div>" +
          "</div>" +
          "<div class='mi-subject'>" + m.subject + "</div>" +
          "<div class='mi-snippet muted'>" + m.snippet + "</div>";
        (function (n) {
          item.addEventListener("click", function () {
            // текущий раунд можно отвечать, предыдущие — только читать
            showMail(n, n !== idx);
          });
        })(i);
        inboxList.appendChild(item);
      }
    }

    var locked = false;

    function showMail(n, readonly) {
      var m = deck[n];
      mailSubject.textContent = m.subject;
      mailMeta.textContent = "От: " + m.from + " • " + m.time;
      mailBody.textContent = m.body;
      mailResult.innerHTML = readonly ? "<span class='muted'>Это письмо можно только прочитать. Продолжай раунд справа.</span>" : "";

      // кнопки доступны только для текущего раунда
      var canAnswer = !readonly;
      btnPhish.disabled = !canAnswer || locked;
      btnOk.disabled = !canAnswer || locked;
      btnSkip.disabled = !canAnswer || locked;
      renderList(n);
    }

    function finishGame() {
      var title = "Итог: " + score + " / " + deck.length;
      var badge = "";
      if (score === deck.length) badge = "🏆 идеальный результат";
      else if (score >= deck.length - 2) badge = "🔥 почти идеально";
      else if (score >= Math.ceil(deck.length * 0.6)) badge = "👍 хорошо";
      else badge = "💡 потренируйся ещё";

      mailResult.className = "gresult ok";
      mailResult.innerHTML =
        "<b>" + title + "</b><br>" +
        "Лучшая серия: <b>" + bestStreak + "</b> • " + badge +
        "<div class='gactions' style='margin-top:10px'>" +
          "<button class='btn primary' id='restartInbox' type='button'>🔁 Играть ещё раз</button>" +
        "</div>";

      var r = $("restartInbox");
      if (r) r.addEventListener("click", renderInboxGame);
      btnPhish.disabled = true;
      btnOk.disabled = true;
      btnSkip.disabled = true;
    }

    function answer(user) {
      if (locked) return;
      locked = true;

      var m = deck[idx];
      var right = (user === m.correct);
      if (right) {
        score++;
        streak++;
        bestStreak = Math.max(bestStreak, streak);
      } else {
        streak = 0;
      }
      updateStats();

      mailResult.className = "gresult " + (right ? "ok" : "bad");
      mailResult.innerHTML =
        (right ? "✅ Верно!" : "❌ Ошибка") +
        " <span class='muted'>(" + (m.correct === "phish" ? "это фишинг" : "скорее безопасно") + ")</span>" +
        "<div style='margin-top:6px'>" + m.why + "</div>" +
        "<div class='gactions' style='margin-top:10px'>" +
          "<button class='btn primary' id='nextMail' type='button'>Дальше →</button>" +
        "</div>";

      var nextBtn = $("nextMail");
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          locked = false;
          idx++;
          if (idx >= deck.length) {
            finishGame();
            return;
          }
          updateStats();
          showMail(idx, false);
        });
      }
    }

    function skip() {
      if (locked) return;
      locked = true;
      streak = 0;
      updateStats();
      mailResult.className = "gresult warn";
      mailResult.innerHTML =
        "⏭️ Пропуск без очков. <span class='muted'>В реальности лучше спросить взрослого.</span>" +
        "<div class='gactions' style='margin-top:10px'>" +
          "<button class='btn primary' id='nextMail2' type='button'>Дальше →</button>" +
        "</div>";
      var next2 = $("nextMail2");
      if (next2) next2.addEventListener("click", function () {
        locked = false;
        idx++;
        if (idx >= deck.length) { finishGame(); return; }
        updateStats();
        showMail(idx, false);
      });
    }

    btnPhish.addEventListener("click", function () { answer("phish"); });
    btnOk.addEventListener("click", function () { answer("ok"); });
    btnSkip.addEventListener("click", skip);

    updateStats();
    renderList(0);
    showMail(0, false);
  }

  // =========================
  // Игра 2: Приватность‑квест (выбор из 3 вариантов)
  // =========================
  var privacyRoot = $("privacyQuest");

  var QUEST = [
    {
      title: "Сторис после школы",
      text: "Ты хочешь выложить сторис. В кадре видно здание школы и табличку с номером.",
      choices: [
        { t: "Выложить как есть", ok: false, why: "Так можно вычислить школу и маршруты." },
        { t: "Размыть табличку/не показывать школу", ok: true, why: "Лучше убрать привязку к месту." },
        { t: "Добавить геометку «школа»", ok: false, why: "Геометка делает тебя " + "легче для поиска." }
      ]
    },
    {
      title: "Скрин переписки",
      text: "Хочешь показать смешной диалог. На скрине видны аватарки и номера телефонов.",
      choices: [
        { t: "Замазать телефоны и имена", ok: true, why: "Личные данные лучше скрыть." },
        { t: "Выложить полностью", ok: false, why: "Телефоны — персональные данные." },
        { t: "Спросить разрешение и всё равно выложить телефоны", ok: false, why: "Даже с разрешением — риск утечки." }
      ]
    },
    {
      title: "Фото билета/проездного",
      text: "На фото видны ФИО и штрих‑код/номер.",
      choices: [
        { t: "Выложить, это же просто билет", ok: false, why: "Номер и ФИО могут использоваться для мошенничества." },
        { t: "Закрыть ФИО и номер пальцем/стикером", ok: true, why: "Так безопаснее." },
        { t: "Выложить и написать «не звонить»", ok: false, why: "Просьбы не защищают от злоумышленников." }
      ]
    },
    {
      title: "Селфи дома",
      text: "Хочешь выложить селфи. На фоне видно подъезд и номер квартиры/домофон.",
      choices: [
        { t: "Выложить, никто не заметит", ok: false, why: "Люди замечают детали. Лучше не рисковать." },
        { t: "Сделать кадр без адресных деталей", ok: true, why: "Убираем всё, что указывает на адрес." },
        { t: "Поставить геометку «дом»", ok: false, why: "Геометка + фон = легко вычислить адрес." }
      ]
    },
    {
      title: "Новый аккаунт",
      text: "Настройка профиля: что поставить в описании?",
      choices: [
        { t: "Имя + номер школы + класс", ok: false, why: "Это слишком точная информация." },
        { t: "Ник и интересы без личных данных", ok: true, why: "Оставляем только безопасные данные." },
        { t: "Телефон для связи", ok: false, why: "Телефон лучше не публиковать." }
      ]
    },
    {
      title: "Куда едешь?",
      text: "Хочешь написать пост: «Я уезжаю на неделю, дома никого нет!»",
      choices: [
        { t: "Написать до поездки", ok: false, why: "Это может подсказать злоумышленникам, что дома пусто." },
        { t: "Написать после поездки", ok: true, why: "Публикуем с задержкой." },
        { t: "Отметить точный адрес отъезда", ok: false, why: "Чем точнее геоданные, тем выше риск." }
      ]
    }
  ];

  function renderPrivacyQuest() {
    if (!privacyRoot) return;

    var deck = shuffle(QUEST);
    var i = 0;
    var points = 0;
    var badges = {
      careful: false,
      perfect: false
    };

    privacyRoot.innerHTML =
      "<div class='ghead'>" +
        "<div>" +
          "<div class='gtitle'>Ситуация: <b id='qNum'>1</b> / " + deck.length + "</div>" +
          "<div class='muted'>Выбирай самый безопасный вариант.</div>" +
        "</div>" +
        "<div class='gstats'>" +
          "<span class='pill'>Очки: <b id='qPts'>0</b></span>" +
          "<span class='pill'>Достижения: <b id='qBadges'>0</b></span>" +
        "</div>" +
      "</div>" +
      "<div class='quest'>" +
        "<div class='quest-title' id='qTitle'>—</div>" +
        "<div class='quest-text' id='qText'>—</div>" +
        "<div class='quest-choices' id='qChoices'></div>" +
        "<div class='gresult' id='qResult' aria-live='polite'></div>" +
      "</div>";

    var qNum = $("qNum");
    var qPts = $("qPts");
    var qBadges = $("qBadges");
    var qTitle = $("qTitle");
    var qText = $("qText");
    var qChoices = $("qChoices");
    var qResult = $("qResult");

    function countBadges() {
      var n = 0;
      for (var k in badges) if (badges[k]) n++;
      return n;
    }

    function updateHead() {
      qNum.textContent = String(Math.min(i + 1, deck.length));
      qPts.textContent = String(points);
      qBadges.textContent = String(countBadges());
    }

    var locked = false;

    function renderCurrent() {
      locked = false;
      updateHead();
      qResult.className = "gresult";
      qResult.textContent = "";

      var s = deck[i];
      qTitle.textContent = "🕵️ " + s.title;
      qText.textContent = s.text;
      qChoices.innerHTML = "";

      for (var c = 0; c < s.choices.length; c++) {
        (function (choiceIdx) {
          var ch = s.choices[choiceIdx];
          var b = document.createElement("button");
          b.type = "button";
          b.className = "choice";
          b.textContent = ch.t;
          b.addEventListener("click", function () {
            if (locked) return;
            locked = true;

            var ok = !!ch.ok;
            if (ok) points += 2; // правильный — 2 очка
            else points += 0;

            // достижения
            if (ok && points >= 6) badges.careful = true;

            updateHead();
            qResult.className = "gresult " + (ok ? "ok" : "bad");
            qResult.innerHTML =
              (ok ? "✅ Отлично!" : "❌ Рискованный вариант") +
              "<div style='margin-top:6px'>" + ch.why + "</div>" +
              "<div class='gactions' style='margin-top:10px'>" +
                "<button class='btn primary' id='qNext' type='button'>Дальше →</button>" +
              "</div>";

            var qNext = $("qNext");
            if (qNext) qNext.addEventListener("click", function () {
              i++;
              if (i >= deck.length) {
                finish();
                return;
              }
              renderCurrent();
            });
          });
          qChoices.appendChild(b);
        })(c);
      }
    }

    function finish() {
      // идеальный — все ответы верные: points == deck.length*2
      if (points === deck.length * 2) badges.perfect = true;
      updateHead();

      var label = "";
      if (badges.perfect) label = "🏆 Легенда приватности";
      else if (points >= deck.length * 1.6) label = "🔥 Очень осторожно";
      else if (points >= deck.length) label = "👍 Неплохо";
      else label = "💡 Есть что улучшить";

      qResult.className = "gresult ok";
      qResult.innerHTML =
        "<b>Итог:</b> " + points + " очков" +
        "<br><span class='muted'>" + label + " • Достижения: " + countBadges() + "</span>" +
        "<div class='gactions' style='margin-top:10px'>" +
          "<button class='btn primary' id='qRestart' type='button'>🔁 Играть ещё раз</button>" +
        "</div>";

      var rr = $("qRestart");
      if (rr) rr.addEventListener("click", renderPrivacyQuest);
      qChoices.innerHTML = "";
    }

    renderCurrent();
  }

  // Старт
  initTabs();
  renderInboxGame();
  renderPrivacyQuest();

})();
