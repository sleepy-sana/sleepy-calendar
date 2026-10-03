// =========================
// sleepy calendar
// app.js
// =========================

// -------------------------
// Data
// -------------------------

let data = JSON.parse(localStorage.getItem("sleepyCalendar")) || {
  events: [],
  memos: [],
  todos: [],
  periods: []
};

// 古いデータにも対応
data.events = data.events || [];
data.memos = data.memos || [];
data.todos = data.todos || [];
data.periods = data.periods || [];

const EVENT_COLORS = [
  "blue",
  "pink",
  "purple",
  "yellow",
  "green"
];

function saveData() {
  localStorage.setItem("sleepyCalendar", JSON.stringify(data));
}


// -------------------------
// Calendar
// -------------------------

let currentDate = new Date();
let selectedDate = formatDate(new Date());

const monthTitle = document.getElementById("monthTitle");
const calendarGrid = document.getElementById("calendarGrid");
const selectedDateText = document.getElementById("selectedDate");

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function renderCalendar() {
  calendarGrid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthTitle.textContent =
    `${year}年 ${month + 1}月`;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 前月の空白
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day empty";
    calendarGrid.appendChild(emptyCell);
  }

  // 日付
  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(year, month, day);
    const dateString = formatDate(date);

    const cell = document.createElement("div");
    cell.className = "calendar-day";

    if (dateString === formatDate(new Date())) {
      cell.classList.add("today");
    }

    if (dateString === selectedDate) {
      cell.classList.add("selected");
    }

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = day;

    cell.appendChild(number);

    // -------------------------
    // イベント
    // -------------------------

    const dayEvents = data.events.filter(
      event => event.date === dateString
    );

    dayEvents.forEach(event => {
      const mark = document.createElement("span");

      const color = EVENT_COLORS.includes(event.color)
        ? event.color
        : "blue";

      mark.className = `event-mark event-${color}`;

      cell.appendChild(mark);
    });

    // -------------------------
    // 生理
    // -------------------------

    const period = data.periods.find(
      period => period.start === dateString
    );

    if (period) {
      const periodMark = document.createElement("span");
      periodMark.className = "period-mark";
      periodMark.textContent = "●";

      cell.appendChild(periodMark);
    }

    // -------------------------
    // Click
    // -------------------------

    cell.addEventListener("click", () => {
      selectedDate = dateString;

      renderCalendar();
      renderSelectedDate();
      renderEvents();
      renderMemos();
    });

    calendarGrid.appendChild(cell);
  }
}


// -------------------------
// Selected Date
// -------------------------

function renderSelectedDate() {
  if (!selectedDateText) return;

  selectedDateText.textContent =
    formatDisplayDate(selectedDate);
}


// -------------------------
// Event Dialog
// -------------------------

const eventDialog = document.getElementById("eventDialog");
const eventForm = document.getElementById("eventForm");

const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventTitle = document.getElementById("eventTitle");
const eventColor = document.getElementById("eventColor");

const addEventButton = document.getElementById("addEvent");
const closeEventButton = document.getElementById("closeEvent");


// 予定追加
if (addEventButton) {
  addEventButton.addEventListener("click", () => {
    eventForm.reset();

    eventDate.value = selectedDate;
    eventColor.value = "blue";

    eventDialog.dataset.editingId = "";

    eventDialog.showModal();
  });
}


// ダイアログを閉じる
if (closeEventButton) {
  closeEventButton.addEventListener("click", () => {
    eventDialog.close();
  });
}


// -------------------------
// Add / Edit Event
// -------------------------

if (eventForm) {
  eventForm.addEventListener("submit", event => {
    event.preventDefault();

    const date = eventDate.value;
    const time = eventTime.value;
    const title = eventTitle.value.trim();

    const color =
      EVENT_COLORS.includes(eventColor.value)
        ? eventColor.value
        : "blue";

    if (!date || !title) {
      return;
    }

    const editingId = eventDialog.dataset.editingId;

    // 編集
    if (editingId) {
      const target = data.events.find(
        item => String(item.id) === String(editingId)
      );

      if (target) {
        target.date = date;
        target.time = time;
        target.title = title;
        target.color = color;
      }
    }

    // 新規追加
    else {
      data.events.push({
        id: Date.now(),
        date,
        time,
        title,
        color
      });
    }

    saveData();

    eventDialog.close();

    eventDialog.dataset.editingId = "";

    renderCalendar();
    renderSelectedDate();
    renderEvents();
  });
}


// -------------------------
// Render Events
// -------------------------

function renderEvents() {
  const eventsContainer = document.getElementById("events");

  if (!eventsContainer) return;

  eventsContainer.innerHTML = "";

  const events = data.events
    .filter(event => event.date === selectedDate)
    .sort((a, b) => {
      return (a.time || "").localeCompare(b.time || "");
    });

  if (events.length === 0) {
    eventsContainer.innerHTML =
      `<p class="empty-message">予定はまだないよ 💤</p>`;

    return;
  }

  events.forEach(event => {
    const color = EVENT_COLORS.includes(event.color)
      ? event.color
      : "blue";

    const item = document.createElement("div");

    item.className =
      `event-item event-${color}`;

    item.innerHTML = `
      <div class="event-info">
        <div class="event-time">
          ${event.time || ""}
        </div>

        <div class="event-title">
          ${escapeHtml(event.title)}
        </div>
      </div>

      <div class="event-actions">
        <button
          type="button"
          class="edit-event"
          data-id="${event.id}"
        >
          ✏️
        </button>

        <button
          type="button"
          class="delete-event"
          data-id="${event.id}"
        >
          🗑️
        </button>
      </div>
    `;

    eventsContainer.appendChild(item);
  });

  // 編集
  document.querySelectorAll(".edit-event").forEach(button => {
    button.addEventListener("click", () => {
      editEvent(button.dataset.id);
    });
  });

  // 削除
  document.querySelectorAll(".delete-event").forEach(button => {
    button.addEventListener("click", () => {
      deleteEvent(button.dataset.id);
    });
  });
}


// -------------------------
// Edit Event
// -------------------------

function editEvent(id) {
  const event = data.events.find(
    item => String(item.id) === String(id)
  );

  if (!event) return;

  eventDate.value = event.date;
  eventTime.value = event.time || "";
  eventTitle.value = event.title || "";

  eventColor.value =
    EVENT_COLORS.includes(event.color)
      ? event.color
      : "blue";

  eventDialog.dataset.editingId = event.id;

  eventDialog.showModal();
}


// -------------------------
// Delete Event
// -------------------------

function deleteEvent(id) {
  const target = data.events.find(
    event => String(event.id) === String(id)
  );

  if (!target) return;

  const result = confirm(
    `「${target.title}」を削除する？`
  );

  if (!result) return;

  data.events = data.events.filter(
    event => String(event.id) !== String(id)
  );

  saveData();

  renderCalendar();
  renderEvents();
}


// -------------------------
// Memo
// -------------------------

const memoDialog = document.getElementById("memoDialog");
const memoForm = document.getElementById("memoForm");
const memoText = document.getElementById("memoText");

const addMemoButton = document.getElementById("addMemo");
const closeMemoButton = document.getElementById("closeMemo");


// メモ追加
if (addMemoButton) {
  addMemoButton.addEventListener("click", () => {
    memoForm.reset();

    memoDialog.showModal();
  });
}


// メモを閉じる
if (closeMemoButton) {
  closeMemoButton.addEventListener("click", () => {
    memoDialog.close();
  });
}


// メモ保存
if (memoForm) {
  memoForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = memoText.value.trim();

    if (!text) return;

    data.memos.push({
      id: Date.now(),
      date: selectedDate,
      text
    });

    saveData();

    memoDialog.close();

    renderMemos();
  });
}


// メモ表示
function renderMemos() {
  const memosContainer =
    document.getElementById("memos");

  if (!memosContainer) return;

  memosContainer.innerHTML = "";

  const memos = data.memos.filter(
    memo => memo.date === selectedDate
  );

  if (memos.length === 0) {
    memosContainer.innerHTML =
      `<p class="empty-message">メモはまだないよ 📝</p>`;

    return;
  }

  memos.forEach(memo => {
    const item = document.createElement("div");

    item.className = "memo-item";

    item.innerHTML = `
      <span>${escapeHtml(memo.text)}</span>

      <button
        type="button"
        class="delete-memo"
        data-id="${memo.id}"
      >
        🗑️
      </button>
    `;

    memosContainer.appendChild(item);
  });

  document.querySelectorAll(".delete-memo")
    .forEach(button => {
      button.addEventListener("click", () => {
        deleteMemo(button.dataset.id);
      });
    });
}


// メモ削除
function deleteMemo(id) {
  data.memos = data.memos.filter(
    memo => String(memo.id) !== String(id)
  );

  saveData();

  renderMemos();
}


// -------------------------
// Todo
// -------------------------

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");


if (todoForm) {
  todoForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = todoInput.value.trim();

    if (!text) return;

    data.todos.push({
      id: Date.now(),
      text,
      done: false
    });

    todoInput.value = "";

    saveData();

    renderTodos();
  });
}


// Todo表示
function renderTodos() {
  if (!todoList) return;

  todoList.innerHTML = "";

  if (data.todos.length === 0) {
    todoList.innerHTML =
      `<p class="empty-message">Todoはまだないよ 💤</p>`;

    return;
  }

  data.todos.forEach(todo => {
    const item = document.createElement("div");

    item.className =
      `todo-item ${todo.done ? "done" : ""}`;

    item.innerHTML = `
      <label class="todo-check">
        <input
          type="checkbox"
          data-id="${todo.id}"
          ${todo.done ? "checked" : ""}
        >

        <span>
          ${escapeHtml(todo.text)}
        </span>
      </label>

      <button
        type="button"
        class="delete-todo"
        data-id="${todo.id}"
      >
        🗑️
      </button>
    `;

    todoList.appendChild(item);
  });

  // 完了状態
  document.querySelectorAll(".todo-check input")
    .forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const todo = data.todos.find(
          item =>
            String(item.id) ===
            String(checkbox.dataset.id)
        );

        if (!todo) return;

        todo.done = checkbox.checked;

        saveData();

        renderTodos();
      });
    });

  // 削除
  document.querySelectorAll(".delete-todo")
    .forEach(button => {
      button.addEventListener("click", () => {
        data.todos = data.todos.filter(
          todo =>
            String(todo.id) !==
            String(button.dataset.id)
        );

        saveData();

        renderTodos();
      });
    });
}


// -------------------------
// Period
// -------------------------

const addPeriodButton =
  document.getElementById("addPeriod");


// 生理開始日追加
if (addPeriodButton) {
  addPeriodButton.addEventListener("click", () => {
    const date = prompt(
      "生理開始日を入力してね\n例：2026-10-03",
      selectedDate
    );

    if (!date) return;

    // 日付チェック
    const parsed = new Date(date + "T00:00:00");

    if (Number.isNaN(parsed.getTime())) {
      alert("日付の形式が正しくないよ");
      return;
    }

    const exists = data.periods.some(
      period => period.start === date
    );

    if (exists) {
      alert("その日はすでに登録されているよ");
      return;
    }

    data.periods.push({
      id: Date.now(),
      start: date
    });

    data.periods.sort(
      (a, b) => a.start.localeCompare(b.start)
    );

    saveData();

    renderPeriodInfo();
    renderCalendar();
  });
}


// 生理情報
function renderPeriodInfo() {
  const lastPeriod =
    document.getElementById("lastPeriod");

  const averageCycle =
    document.getElementById("averageCycle");

  const nextPeriod =
    document.getElementById("nextPeriod");

  const periodHistory =
    document.getElementById("periodHistory");

  if (!lastPeriod ||
      !averageCycle ||
      !nextPeriod ||
      !periodHistory) {
    return;
  }

  if (data.periods.length === 0) {
    lastPeriod.textContent = "未登録";
    averageCycle.textContent = "未登録";
    nextPeriod.textContent = "未登録";

    periodHistory.innerHTML =
      `<p class="empty-message">記録はまだないよ 🌙</p>`;

    return;
  }

  const sortedPeriods = [...data.periods].sort(
    (a, b) => a.start.localeCompare(b.start)
  );

  const latest =
    sortedPeriods[sortedPeriods.length - 1];

  lastPeriod.textContent =
    formatDisplayDate(latest.start);

  // -------------------------
  // 平均周期
  // -------------------------

  if (sortedPeriods.length < 2) {
    averageCycle.textContent = "データ不足";
    nextPeriod.textContent = "データ不足";
  } else {
    const differences = [];

    for (
      let i = 1;
      i < sortedPeriods.length;
      i++
    ) {
      const previous =
        new Date(
          sortedPeriods[i - 1].start +
          "T00:00:00"
        );

      const current =
        new Date(
          sortedPeriods[i].start +
          "T00:00:00"
        );

      const diff =
        Math.round(
          (current - previous) /
          (1000 * 60 * 60 * 24)
        );

      if (diff > 0) {
        differences.push(diff);
      }
    }

    if (differences.length === 0) {
      averageCycle.textContent = "計算不可";
      nextPeriod.textContent = "計算不可";
    } else {
      const average =
        Math.round(
          differences.reduce(
            (sum, value) => sum + value,
            0
          ) / differences.length
        );

      averageCycle.textContent =
        `${average}日`;

      const latestDate =
        new Date(
          latest.start + "T00:00:00"
        );

      latestDate.setDate(
        latestDate.getDate() + average
      );

      nextPeriod.textContent =
        formatDisplayDate(
          formatDate(latestDate)
        );
    }
  }

  // -------------------------
  // 履歴
  // -------------------------

  periodHistory.innerHTML = "";

  [...sortedPeriods]
    .reverse()
    .forEach(period => {
      const item = document.createElement("div");

      item.className = "period-history-item";

      item.innerHTML = `
        <span>
          ${formatDisplayDate(period.start)}
        </span>

        <button
          type="button"
          class="delete-period"
          data-id="${period.id}"
        >
          🗑️
        </button>
      `;

      periodHistory.appendChild(item);
    });

  document.querySelectorAll(".delete-period")
    .forEach(button => {
      button.addEventListener("click", () => {
        data.periods = data.periods.filter(
          period =>
            String(period.id) !==
            String(button.dataset.id)
        );

        saveData();

        renderPeriodInfo();
        renderCalendar();
      });
    });
}


// -------------------------
// Month Navigation
// -------------------------

const prevMonth =
  document.getElementById("prevMonth");

const nextMonth =
  document.getElementById("nextMonth");

const todayButton =
  document.getElementById("todayButton");


// 前月
if (prevMonth) {
  prevMonth.addEventListener("click", () => {
    currentDate.setMonth(
      currentDate.getMonth() - 1
    );

    renderCalendar();
  });
}


// 次月
if (nextMonth) {
  nextMonth.addEventListener("click", () => {
    currentDate.setMonth(
      currentDate.getMonth() + 1
    );

    renderCalendar();
  });
}


// 今日
if (todayButton) {
  todayButton.addEventListener("click", () => {
    const today = new Date();

    currentDate = new Date(today);
    selectedDate = formatDate(today);

    renderCalendar();
    renderSelectedDate();
    renderEvents();
    renderMemos();
  });
}


// -------------------------
// Escape HTML
// -------------------------

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// -------------------------
// Initial Render
// -------------------------

renderCalendar();
renderSelectedDate();
renderEvents();
renderMemos();
renderTodos();
renderPeriodInfo();
