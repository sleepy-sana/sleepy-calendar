// ==============================
// sleepy calendar - app.js
// ==============================

const today = new Date();

let currentDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);

let selectedDate = formatDate(today);

// ==============================
// データ
// ==============================

let data = JSON.parse(
  localStorage.getItem("sleepyCalendar")
) || {
  events: [],
  memos: [],
  todos: [],
  periods: []
};

// ==============================
// 保存
// ==============================

function save() {
  localStorage.setItem(
    "sleepyCalendar",
    JSON.stringify(data)
  );
}

// ==============================
// 日付を YYYY-MM-DD にする
// ==============================

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

// ==============================
// 日付表示
// ==============================

function formatJapaneseDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });
}

// ==============================
// カレンダー作成
// ==============================

function createCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById("monthTitle").textContent =
    `${year}年 ${month + 1}月`;

  const grid = document.getElementById("calendarGrid");

  grid.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 前月の空白
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }

  // 日付
  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(year, month, day);
    const dateString = formatDate(date);

    const cell = document.createElement("div");
    cell.className = "calendar-day";

    if (dateString === selectedDate) {
      cell.classList.add("selected");
    }

    if (dateString === formatDate(today)) {
      cell.classList.add("today");
    }

    // 日付番号
    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = day;

    cell.appendChild(number);

    // 予定があるか
    const dayEvents = data.events.filter(
      event => event.date === dateString
    );

    if (dayEvents.length > 0) {
      const eventMark = document.createElement("div");
      eventMark.className = "event-mark";
      eventMark.textContent = "●";
      cell.appendChild(eventMark);
    }

    // 生理
    if (data.periods.some(p => p.start === dateString)) {
      const periodMark = document.createElement("div");
      periodMark.className = "period-mark";
      periodMark.textContent = "♡";
      cell.appendChild(periodMark);
    }

    cell.addEventListener("click", () => {
      selectedDate = dateString;

      createCalendar();
      renderSelectedDay();
    });

    grid.appendChild(cell);
  }
}

// ==============================
// 選択した日の表示
// ==============================

function renderSelectedDay() {
  const title = document.getElementById("selectedDate");

  if (title) {
    title.textContent =
      formatJapaneseDate(selectedDate);
  }

  renderEvents();
  renderMemos();
}

// ==============================
// 予定表示
// ==============================

function renderEvents() {
  const container = document.getElementById("events");

  if (!container) return;

  container.innerHTML = "";

  const events = data.events
    .filter(event => event.date === selectedDate)
    .sort((a, b) =>
      (a.time || "").localeCompare(b.time || "")
    );

  if (events.length === 0) {
    container.innerHTML =
      `<p class="empty-message">予定はありません 🌙</p>`;

    return;
  }

  events.forEach(event => {
    const item = document.createElement("div");

    item.className = "event-item";

    item.innerHTML = `
      <div class="event-info">
        <div class="event-time">
          ${event.time || ""}
        </div>

        <div class="event-title">
          ${escapeHTML(event.title)}
        </div>
      </div>

      <div class="event-actions">
        <button
          class="edit-event"
          data-id="${event.id}">
          ✏️
        </button>

        <button
          class="delete-event"
          data-id="${event.id}">
          🗑️
        </button>
      </div>
    `;

    container.appendChild(item);
  });

  // 編集
  document.querySelectorAll(".edit-event")
    .forEach(button => {
      button.addEventListener("click", () => {
        editEvent(button.dataset.id);
      });
    });

  // 削除
  document.querySelectorAll(".delete-event")
    .forEach(button => {
      button.addEventListener("click", () => {
        deleteEvent(button.dataset.id);
      });
    });
}

// ==============================
// HTML文字対策
// ==============================

function escapeHTML(text) {
  if (!text) return "";

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ==============================
// 予定を編集
// ==============================

function editEvent(id) {
  const event = data.events.find(
    event => String(event.id) === String(id)
  );

  if (!event) return;

  document.getElementById("eventDate").value =
    event.date;

  document.getElementById("eventTime").value =
    event.time || "";

  document.getElementById("eventTitle").value =
    event.title || "";

  const dialog =
    document.getElementById("eventDialog");

  dialog.dataset.editingId = event.id;

  dialog.showModal();
}

// ==============================
// 予定を削除
// ==============================

function deleteEvent(id) {
  const event = data.events.find(
    event => String(event.id) === String(id)
  );

  if (!event) return;

  const ok = confirm(
    `「${event.title}」を削除しますか？`
  );

  if (!ok) return;

  data.events = data.events.filter(
    event => String(event.id) !== String(id)
  );

  save();

  createCalendar();
  renderSelectedDay();
}

// ==============================
// 予定追加ボタン
// ==============================

const addEventButton =
  document.getElementById("addEvent");

if (addEventButton) {
  addEventButton.addEventListener("click", () => {
    const dialog =
      document.getElementById("eventDialog");

    // 新規作成
    dialog.dataset.editingId = "";

    document.getElementById("eventDate").value =
      selectedDate;

    document.getElementById("eventTime").value = "";

    document.getElementById("eventTitle").value = "";

    dialog.showModal();
  });
}

// ==============================
// 予定保存
// ==============================

const eventForm =
  document.getElementById("eventForm");

if (eventForm) {
  eventForm.addEventListener("submit", event => {
    event.preventDefault();

    const dialog =
      document.getElementById("eventDialog");

    const date =
      document.getElementById("eventDate").value;

    const time =
      document.getElementById("eventTime").value;

    const title =
      document.getElementById("eventTitle").value.trim();

    if (!title) {
      alert("予定のタイトルを入力してください");
      return;
    }

    const editingId =
      dialog.dataset.editingId;

    // ==========================
    // 編集
    // ==========================

    if (editingId) {
      const target = data.events.find(
        event =>
          String(event.id) === String(editingId)
      );

      if (target) {
        target.date = date;
        target.time = time;
        target.title = title;
      }
    }

    // ==========================
    // 新規追加
    // ==========================

    else {
      data.events.push({
  id: Date.now(),
  date,
  time,
  title,
  color: document.getElementById("eventColor").value
});
    }

    save();

    dialog.close();

    selectedDate = date;

    createCalendar();
    renderSelectedDay();

    eventForm.reset();
  });
}

// ==============================
// イベントダイアログ閉じる
// ==============================

const closeEvent =
  document.getElementById("closeEvent");

if (closeEvent) {
  closeEvent.addEventListener("click", () => {
    document
      .getElementById("eventDialog")
      .close();
  });
}

// ==============================
// メモ表示
// ==============================

function renderMemos() {
  const container =
    document.getElementById("memos");

  if (!container) return;

  container.innerHTML = "";

  const memos = data.memos.filter(
    memo => memo.date === selectedDate
  );

  if (memos.length === 0) {
    container.innerHTML =
      `<p class="empty-message">メモはありません 🐾</p>`;

    return;
  }

  memos.forEach(memo => {
    const item =
      document.createElement("div");

    item.className = "memo-item";

    item.innerHTML = `
      <div>${escapeHTML(memo.text)}</div>

      <button
        class="delete-memo"
        data-id="${memo.id}">
        🗑️
      </button>
    `;

    container.appendChild(item);
  });

  document.querySelectorAll(".delete-memo")
    .forEach(button => {
      button.addEventListener("click", () => {
        data.memos = data.memos.filter(
          memo =>
            String(memo.id) !==
            String(button.dataset.id)
        );

        save();
        renderMemos();
      });
    });
}

// ==============================
// メモ追加
// ==============================

const addMemoButton =
  document.getElementById("addMemo");

if (addMemoButton) {
  addMemoButton.addEventListener("click", () => {
    document
      .getElementById("memoDialog")
      .showModal();
  });
}

const memoForm =
  document.getElementById("memoForm");

if (memoForm) {
  memoForm.addEventListener("submit", event => {
    event.preventDefault();

    const text =
      document
        .getElementById("memoText")
        .value
        .trim();

    if (!text) return;

    data.memos.push({
      id: Date.now(),
      date: selectedDate,
      text: text
    });

    save();

    document
      .getElementById("memoDialog")
      .close();

    document.getElementById("memoText").value = "";

    renderMemos();
  });
}

// ==============================
// メモダイアログ閉じる
// ==============================

const closeMemo =
  document.getElementById("closeMemo");

if (closeMemo) {
  closeMemo.addEventListener("click", () => {
    document
      .getElementById("memoDialog")
      .close();
  });
}

// ==============================
// ToDo
// ==============================

function renderTodo() {
  const list =
    document.getElementById("todoList");

  if (!list) return;

  list.innerHTML = "";

  data.todos.forEach(todo => {
    const li =
      document.createElement("li");

    li.innerHTML = `
      <label>
        <input
          type="checkbox"
          ${todo.done ? "checked" : ""}
          data-id="${todo.id}"
        >

        <span class="${todo.done ? "done" : ""}">
          ${escapeHTML(todo.text)}
        </span>
      </label>

      <button
        class="delete-todo"
        data-id="${todo.id}">
        🗑️
      </button>
    `;

    list.appendChild(li);
  });

  // 完了チェック
  list.querySelectorAll(
    'input[type="checkbox"]'
  ).forEach(check => {
    check.addEventListener("change", () => {
      const todo = data.todos.find(
        todo =>
          String(todo.id) ===
          String(check.dataset.id)
      );

      if (todo) {
        todo.done = check.checked;
        save();
        renderTodo();
      }
    });
  });

  // 削除
  list.querySelectorAll(
    ".delete-todo"
  ).forEach(button => {
    button.addEventListener("click", () => {
      data.todos = data.todos.filter(
        todo =>
          String(todo.id) !==
          String(button.dataset.id)
      );

      save();
      renderTodo();
    });
  });
}

// ==============================
// ToDo追加
// ==============================

const todoForm =
  document.getElementById("todoForm");

if (todoForm) {
  todoForm.addEventListener("submit", event => {
    event.preventDefault();

    const input =
      document.getElementById("todoInput");

    const text = input.value.trim();

    if (!text) return;

    data.todos.push({
      id: Date.now(),
      text: text,
      done: false
    });

    save();

    input.value = "";

    renderTodo();
  });
}

// ==============================
// 生理記録
// ==============================

function renderPeriod() {
  const lastPeriod =
    document.getElementById("lastPeriod");

  const averageCycle =
    document.getElementById("averageCycle");

  const nextPeriod =
    document.getElementById("nextPeriod");

  const history =
    document.getElementById("periodHistory");

  if (!lastPeriod) return;

  if (data.periods.length === 0) {
    lastPeriod.textContent = "未登録";
    averageCycle.textContent = "—";
    nextPeriod.textContent = "—";

    if (history) {
      history.innerHTML = "";
    }

    return;
  }

  const sorted = [...data.periods]
    .sort((a, b) =>
      a.start.localeCompare(b.start)
    );

  const latest =
    sorted[sorted.length - 1];

  lastPeriod.textContent =
    latest.start;

  // 周期計算
  let cycles = [];

  for (let i = 1; i < sorted.length; i++) {
    const previous =
      new Date(sorted[i - 1].start);

    const current =
      new Date(sorted[i].start);

    const diff =
      Math.round(
        (current - previous) /
        (1000 * 60 * 60 * 24)
      );

    if (diff > 0) {
      cycles.push(diff);
    }
  }

  let average = null;

  if (cycles.length > 0) {
    average =
      Math.round(
        cycles.reduce(
          (sum, value) => sum + value,
          0
        ) / cycles.length
      );
  }

  averageCycle.textContent =
    average ? `${average}日` : "データ不足";

  // 次回予測
  if (average) {
    const next =
      new Date(latest.start);

    next.setDate(
      next.getDate() + average
    );

    nextPeriod.textContent =
      formatDate(next);
  } else {
    nextPeriod.textContent =
      "データ不足";
  }

  // 履歴
  if (history) {
    history.innerHTML = "";

    [...sorted]
      .reverse()
      .forEach(period => {
        const item =
          document.createElement("div");

        item.className = "period-history-item";

        item.innerHTML = `
          <span>${period.start}</span>

          <button
            class="delete-period"
            data-id="${period.id}">
            🗑️
          </button>
        `;

        history.appendChild(item);
      });

    history
      .querySelectorAll(".delete-period")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            data.periods =
              data.periods.filter(
                period =>
                  String(period.id) !==
                  String(button.dataset.id)
              );

            save();

            renderPeriod();
            createCalendar();
          }
        );
      });
  }
}

// ==============================
// 生理開始日を追加
// ==============================

const addPeriodButton =
  document.getElementById("addPeriod");

if (addPeriodButton) {
  addPeriodButton.addEventListener("click", () => {
    const exists =
      data.periods.some(
        period =>
          period.start === selectedDate
      );

    if (exists) {
      alert("この日はすでに登録されています");
      return;
    }

    data.periods.push({
      id: Date.now(),
      start: selectedDate
    });

    save();

    renderPeriod();
    createCalendar();
  });
}

// ==============================
// 今日へ
// ==============================

const todayButton =
  document.getElementById("todayButton");

if (todayButton) {
  todayButton.addEventListener("click", () => {
    currentDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

    selectedDate =
      formatDate(today);

    createCalendar();
    renderSelectedDay();
  });
}

// ==============================
// 前月
// ==============================

const prevMonth =
  document.getElementById("prevMonth");

if (prevMonth) {
  prevMonth.addEventListener("click", () => {
    currentDate.setMonth(
      currentDate.getMonth() - 1
    );

    createCalendar();
  });
}

// ==============================
// 次月
// ==============================

const nextMonth =
  document.getElementById("nextMonth");

if (nextMonth) {
  nextMonth.addEventListener("click", () => {
    currentDate.setMonth(
      currentDate.getMonth() + 1
    );

    createCalendar();
  });
}

// ==============================
// 初期表示
// ==============================

function render() {
  createCalendar();
  renderSelectedDay();
  renderPeriod();
  renderTodo();
}

render();
