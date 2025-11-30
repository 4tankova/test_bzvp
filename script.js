// --------------------------- ПИТАННЯ ---------------------------
/*
  ЗАРАЗ тут тільки 3 питання як приклад структури.
  Ти можеш додати всі 50 з Word, просто продовживши масив.
  Для кожного питання:
    id           – порядковий номер (1..50)
    text         – формулювання питання
    options[]    – варіанти відповіді (рядки)
    correctIndex – індекс правильного варіанта (0 = перший, 1 = другий, ...)
*/

const QUESTIONS = [
  {
    id: 1,
    text: "Які умови виконуються для радіоподавлення?",
    options: [
      "а) співпадіння частот перешкод засобу РЕБ з частотами БпЛА, значна потужність засобу РЕБ, спрямування антен засобу РЕБ в бік приймача.",
      "б) співпадіння частот перешкод засобу РЕБ з частотами БпЛА, значна щільність перешкод у точці приймача, спрямування антен засобу РЕБ в бік приймача.",
      "в) значна кількість частот, які може заглушити засіб РЕБ, значна кількість засобів РЕБ, спрямування антен засобу РЕБ в бік приймача."
    ],
    correctIndex: 1 // ← приклад: правильна відповідь – «б)»
  },
  {
    id: 2,
    text: "Як веде себе дрон під впливом радіоперешкод?",
    options: [
      "а) При виконанні всіх умов подавлення БпЛА може: втратити управління і впасти, піти по раніше запрограмованій цілі, самоліквідуватися, негайно повернутися в точку вильоту.",
      "б) При виконанні всіх умов подавлення БпЛА може: втратити управління і самоліквідуватися, піти по раніше запрограмованому маршруту, перейти в режим очікування (засідки), негайно повернутися в точку вильоту.",
      "в) При виконанні всіх умов подавлення БпЛА може: втратити управління і впасти, піти по раніше запрограмованому маршруту, залишатись на місці до розряду батареї."
    ],
    correctIndex: 2
  },
  {
    id: 3,
    text: "Що таке FPV (англ. First Person View)?",
    options: [
      "а) FPV – це дрон, оснащений відеокамерою, сигнал з якої передається на окремі окуляри від першої особи, оснащений вибуховим пристроєм та котушкою з кабелем.",
      "б) FPV – це безпілотні літальні апарати, які передають відео з борту на окуляри або монітор пілота, забезпечуючи управління від першої особи.",
      "в) FPV – це будь-який квадрокоптер із камерою, що веде запис на карту пам’яті."
    ],
    correctIndex: 1
  }

  // TODO: додай сюди решту питань 4–50 у такому ж форматі
];

// --------------------------- СТАН ---------------------------
let userAnswers = new Array(QUESTIONS.length).fill(null);
let isFinished = false;
let lastResult = null;

// --------------------------- DOM ---------------------------
const startPage = document.getElementById("startPage");
const testPage = document.getElementById("testPage");
const resultPage = document.getElementById("resultPage");
const certPage = document.getElementById("certPage");

function showPage(pageEl) {
  [startPage, testPage, resultPage, certPage].forEach(p =>
    p.classList.remove("page-active")
  );
  pageEl.classList.add("page-active");
}

// поля
const fioInput = document.getElementById("fio");
const rankInput = document.getElementById("rank");
const unitInput = document.getElementById("unit");

const startBtn = document.getElementById("startBtn");
const finishBtn = document.getElementById("finishBtn");
const retryBtn = document.getElementById("retryBtn");
const backToStartBtn = document.getElementById("backToStartBtn");
const certBtn = document.getElementById("certBtn");

const userInfoSmall = document.getElementById("userInfoSmall");
const userInfoResult = document.getElementById("userInfoResult");

const questionsContainer = document.getElementById("questionsContainer");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const scorePercentEl = document.getElementById("scorePercent");
const scoreLabelEl = document.getElementById("scoreLabel");
const scoreCorrectEl = document.getElementById("scoreCorrect");
const scoreTotalEl = document.getElementById("scoreTotal");
const scoreFiveEl = document.getElementById("scoreFive");
const answersReviewEl = document.getElementById("answersReview");

// сертифікат
const certFioLargeEl = document.getElementById("certFioLarge");
const certRankUnitEl = document.getElementById("certRankUnit");
const certScoreLineEl = document.getElementById("certScoreLine");
const certDateLineEl = document.getElementById("certDateLine");
const certSerialLineEl = document.getElementById("certSerialLine");
const certVerifyLineEl = document.getElementById("certVerifyLine");
const certQrContainer = document.getElementById("certQrContainer");
const certPrintBtn = document.getElementById("certPrintBtn");
const certBackBtn = document.getElementById("certBackBtn");

// --------------------------- РЕНДЕР ПИТАНЬ ---------------------------
function renderQuestions() {
  questionsContainer.innerHTML = "";
  QUESTIONS.forEach((q, qIndex) => {
    const card = document.createElement("div");
    card.className = "question-card";

    const title = document.createElement("div");
    title.className = "question-title";
    title.textContent = `${q.id}. ${q.text}`;
    card.appendChild(title);

    const ul = document.createElement("ul");
    ul.className = "answers-list";

    q.options.forEach((opt, optIndex) => {
      const li = document.createElement("li");

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q${qIndex}`;
      radio.value = optIndex;

      const labelSpan = document.createElement("span");
      labelSpan.textContent = opt;

      // клік по всьому рядку
      li.addEventListener("click", () => {
        if (isFinished) return;
        radio.checked = true;
        userAnswers[qIndex] = optIndex;
        updateProgress();
      });

      radio.addEventListener("click", e => {
        if (isFinished) {
          e.preventDefault();
          return;
        }
        userAnswers[qIndex] = optIndex;
        updateProgress();
      });

      li.appendChild(radio);
      li.appendChild(labelSpan);
      ul.appendChild(li);
    });

    card.appendChild(ul);
    questionsContainer.appendChild(card);
  });

  updateProgress();
}

function updateProgress() {
  const answered = userAnswers.filter(v => v !== null).length;
  const total = QUESTIONS.length;
  progressText.textContent = `${answered} / ${total}`;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  progressFill.style.width = `${percent}%`;
}

// --------------------------- СТАРТ ТЕСТУ ---------------------------
startBtn.addEventListener("click", () => {
  const fio = fioInput.value.trim();
  if (!fio) {
    alert("Будь ласка, заповніть ПІБ.");
    fioInput.focus();
    return;
  }

  const rank = rankInput.value.trim();
  const unit = unitInput.value.trim();

  userInfoSmall.textContent =
    fio +
    (rank ? " • " + rank : "") +
    (unit ? " • в/ч " + unit : "");

  userAnswers = new Array(QUESTIONS.length).fill(null);
  isFinished = false;
  lastResult = null;

  renderQuestions();
  showPage(testPage);
});

// --------------------------- HASH ДЛЯ КОДУ ПЕРЕВІРКИ ---------------------------
async function computeHash(text) {
  if (window.crypto && crypto.subtle && window.TextEncoder) {
    try {
      const enc = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest("SHA-256", enc);
      return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    } catch (e) {
      console.warn("SHA-256 error:", e);
    }
  }
  // fallback простий
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8);
}

// --------------------------- ЗАВЕРШИТИ ТЕСТ ---------------------------
finishBtn.addEventListener("click", async () => {
  if (userAnswers.every(v => v === null)) {
    if (!confirm("Ви не обрали жодної відповіді. Завершити тест?")) {
      return;
    }
  }

  isFinished = true;

  let correctCount = 0;
  QUESTIONS.forEach((q, i) => {
    if (userAnswers[i] === q.correctIndex) correctCount++;
  });

  const total = QUESTIONS.length;
  const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const scoreFive = total === 0 ? 0 : Math.round((correctCount / total) * 5);

  const fio = fioInput.value.trim();
  const rank = rankInput.value.trim();
  const unit = unitInput.value.trim();
  const dateStr = new Date().toLocaleDateString("uk-UA");

  const serial = "A7015-" + Date.now().toString(36).toUpperCase();

  const hashSource = `${serial}|${fio}|${rank}|${unit}|${scoreFive}|${correctCount}|${total}|${dateStr}`;
  const fullHash = await computeHash(hashSource);
  const verifyCode = fullHash.toUpperCase().slice(0, 10); // короткий код

  userInfoResult.textContent =
    fio +
    (rank ? " • " + rank : "") +
    (unit ? " • в/ч " + unit : "") +
    " • " +
    dateStr;

  scorePercentEl.textContent = percent + "%";
  scoreCorrectEl.textContent = String(correctCount);
  scoreTotalEl.textContent = String(total);
  scoreFiveEl.textContent = String(scoreFive);

  let label = "Початковий рівень";
  if (scoreFive >= 4) label = "Високий рівень";
  else if (scoreFive >= 3) label = "Середній рівень";
  scoreLabelEl.textContent = label;

  lastResult = {
    fio,
    rank,
    unit,
    dateStr,
    correctCount,
    total,
    scoreFive,
    percent,
    serial,
    verifyCode
  };

  highlightSelectedAnswers();
  renderAnswersReview();

  showPage(resultPage);
});

function highlightSelectedAnswers() {
  const cards = questionsContainer.querySelectorAll(".question-card");
  cards.forEach((card, qIndex) => {
    const lis = card.querySelectorAll("li");
    lis.forEach((li, optIndex) => {
      const radio = li.querySelector('input[type="radio"]');
      radio.disabled = true;

      if (userAnswers[qIndex] === optIndex) {
        if (optIndex === QUESTIONS[qIndex].correctIndex) {
          li.classList.add("answer-selected-correct");
        } else {
          li.classList.add("answer-selected-wrong");
        }
      }
    });
  });
}

function renderAnswersReview() {
  answersReviewEl.innerHTML = "";
  QUESTIONS.forEach((q, i) => {
    const wrap = document.createElement("div");
    wrap.className = "review-item";

    const qEl = document.createElement("div");
    qEl.className = "review-question";
    qEl.textContent = `${q.id}. ${q.text}`;
    wrap.appendChild(qEl);

    const aEl = document.createElement("div");
    aEl.className = "review-answer";

    const chosen = userAnswers[i];

    if (chosen === null) {
      aEl.innerHTML = `<span style="color:var(--muted);">Відповідь не обрана</span>`;
    } else {
      const isCorrect = chosen === q.correctIndex;
      const color = isCorrect ? "var(--correct)" : "var(--danger)";
      aEl.innerHTML =
        `Ваша відповідь: <span style="color:${color};">` +
        q.options[chosen] +
        "</span>";
    }

    wrap.appendChild(aEl);
    answersReviewEl.appendChild(wrap);
  });
}

// --------------------------- КНОПКИ ---------------------------
retryBtn.addEventListener("click", () => {
  userAnswers = new Array(QUESTIONS.length).fill(null);
  isFinished = false;
  renderQuestions();
  showPage(testPage);
});

backToStartBtn.addEventListener("click", () => {
  showPage(startPage);
});

// --------------------------- QR + СЕРТИФІКАТ ---------------------------
certBtn.addEventListener("click", () => {
  if (!lastResult) {
    alert("Спочатку завершіть тест, щоб сформувати сертифікат.");
    return;
  }

  const {
    fio,
    rank,
    unit,
    dateStr,
    correctCount,
    total,
    scoreFive,
    percent,
    serial,
    verifyCode
  } = lastResult;

  certFioLargeEl.textContent = fio;

  const ruParts = [];
  if (rank) ruParts.push(rank);
  if (unit) ruParts.push(`в/ч ${unit}`);
  const ruText = ruParts.length ? ruParts.join(", ") : "особовий склад";

  certRankUnitEl.innerHTML = `<b>Категорія:</b> ${ruText}`;
  certScoreLineEl.innerHTML =
    `<b>Результат тесту:</b> ${correctCount} з ${total} (${percent}%), оцінка ${scoreFive}/5`;
  certDateLineEl.innerHTML = `<b>Дата проходження:</b> ${dateStr}`;
  certSerialLineEl.innerHTML = `<b>Серійний номер:</b> ${serial}`;
  certVerifyLineEl.innerHTML = `<b>Код перевірки:</b> ${verifyCode}`;

  // Мінімальний QR (QR-M2): тільки серійний + код
  const qrPayload = `SN:${serial}|CD:${verifyCode}`;

  // очищаємо контейнер перед новим QR
  certQrContainer.innerHTML = "";

  // ВАЖЛИВО: не задаємо typeNumber → бібліотека сама підбере версію
  new QRCode(certQrContainer, {
    text: qrPayload,
    width: 140,
    height: 140,
    correctLevel: QRCode.CorrectLevel.M
  });

  showPage(certPage);
});

certBackBtn.addEventListener("click", () => {
  showPage(resultPage);
});

certPrintBtn.addEventListener("click", () => {
  window.print();
});

// --------------------------- INIT ---------------------------
renderQuestions();
