// ==============================
// sleepy calendar
// app.js
// ==============================

let data = JSON.parse(
  localStorage.getItem("sleepyCalendar")
) || {
  events: [],
  memos: [],
  todos: [],
  periods: []
};

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

let currentDate = new Date();
let selectedDate = formatDate(new Date());


// ==============================
// 基本
// ==============================

function saveData() {
  localStorage.setItem(
    "sleepyCalendar",
    JSON.stringify(data)
  );
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function formatJapaneseDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString + "T00:00:00");

  return `${date.getFullYear()}年${
    date.getMonth() + 1
  }月${date.getDate()}日`;
}


// ==============================
// DOM
// ==============================

const todayButton =
  document.getElementById("todayButton");

const prevMonth =
  document.getElementById("prevMonth");

const nextMonth =
  document.getElementById("nextMonth");

const monthTitle =
  document.getElementById("monthTitle");

const calendarGrid =
  document.getElementById("calendarGrid");

const selectedDateElement =
  document.getElementById("selectedDate");

const addEventButton =
  document.getElementById("addEvent");

const eventsElement =
  document.getElementById("events");

const eventDialog =
  document.getElementById("eventDialog");

const eventForm =
  document.getElementById("eventForm");

const eventDate =
  document.getElementById("eventDate");

const eventTime =
  document.getElementById("eventTime");

const eventTitle =
  document.getElementById("eventTitle");

const closeEventButton =
  document.getElementById("closeEvent");

const addMemoButton =
  document.getElementById("addMemo");

const memosElement =
  document.getElementById("memos");

const memoDialog =
  document.getElementById("memoDialog");

const memoForm =
  document.getElementById("memoForm");

const memoText =
  document.getElementById("memoText");

const closeMemoButton =
  document.getElementById("closeMemo");

const todoForm =
  document.getElementById("todoForm");

const todoInput =
  document.getElementById("todoInput");

const todoList =
  document.getElementById("todoList");

const addPeriodButton =
  document.getElementById("addPeriod");

const lastPeriod =
  document.getElementById("lastPeriod");

const averageCycle =
  document.getElementById("averageCycle");

const nextPeriod =
  document.getElementById("nextPeriod");

const periodHistory =
  document.getElementById("periodHistory");


// ==============================
// 色
// ==============================

function getSelectedEventColor() {
  const radio = document.querySelector(
    'input[name="eventColor"]:checked'
  );

  if (
    radio &&
    EVENT_COLORS.includes(radio.value)
  ) {
    return radio.value;
  }

  return "blue";
}

function setSelectedEventColor(color) {
  if (!EVENT_COLORS.includes(color)) {
    color = "blue";
  }

  const radio = document.querySelector(
    `input[name="eventColor"][value="${color}"]`
  );

  if (radio) {
    radio.checked = true;
  }
}


// ==============================
// カレンダー
// ==============================

function renderCalendar() {
  if (!calendarGrid) return;

  calendarGrid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  if (monthTitle) {
    monthTitle.textContent =
      `${year}年 ${month + 1}月`;
  }

  const firstDay =
    new Date(year, month, 1).getDay();

  const lastDate =
    new Date(year, month + 1, 0).getDate();

  const today = formatDate(new Date());

  // 前月の空白
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    calendarGrid.appendChild(empty);
  }

  // 日付
  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(year, month, day);
    const dateString = formatDate(date);

    const cell = document.createElement("div");
    cell.className = "calendar-day";

    if (dateString === today) {
      cell.classList.add("today");
    }

    if (dateString === selectedDate) {
      cell.classList.add("selected");
    }

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = day;

    cell.appendChild(number);

    // 予定マーク
    const dayEvents =
      data.events.filter(
        event => event.date === dateString
      );

    if (dayEvents.length > 0) {
      const marks = document.createElement("div");
      marks.className = "event-marks";

      dayEvents.forEach(event => {
        const mark = document.createElement("span");

        mark.className =
          `event-mark event-${event.color || "blue"}`;

        marks.appendChild(mark);
      });

      cell.appendChild(marks);
    }

    // 生理マーク
    if (
      data.periods.some(
        period => period.date === dateString
      )
    ) {
      const periodMark =
        document.createElement("span");

      periodMark.className =
        "period-mark";

      periodMark.textContent = "🌷";

      cell.appendChild(periodMark);
    }

    cell.addEventListener(
      "click",
      () => {
        selectedDate = dateString;

        renderCalendar();
        renderSelectedDate();
        renderEvents();
        renderMemos();
      }
    );

    calendarGrid.appendChild(cell);
  }
}


// ==============================
// 選択日
// ==============================

function renderSelectedDate() {
  if (!selectedDateElement) return;

  selectedDateElement.textContent =
    formatJapaneseDate(selectedDate);
}


// ==============================
// 予定
// ==============================

function renderEvents() {
  if (!eventsElement) return;

  eventsElement.innerHTML = "";

  const events =
    data.events
      .filter(
        event => event.date === selectedDate
      )
      .sort((a, b) =>
        (a.time || "").localeCompare(
          b.time || ""
        )
      );

  if (events.length === 0) {
    eventsElement.innerHTML =
      `<div class="empty-message">
        予定はまだないよ 💤
      </div>`;

    return;
  }

  events.forEach(event => {
    const item = document.createElement("div");

    item.className =
      `event-item event-${event.color || "blue"}`;

    const info = document.createElement("div");
    info.className = "event-info";

    const title = document.createElement("div");
    title.className = "event-title";
    title.textContent = event.title;

    const time = document.createElement("div");
    time.className = "event-time";
    time.textContent =
      event.time || "時間なし";

    info.appendChild(title);
    info.appendChild(time);

    const buttons =
      document.createElement("div");

    buttons.className = "event-actions";

    const editButton =
      document.createElement("button");

    editButton.type = "button";
    editButton.textContent = "編集";
    editButton.className = "edit-button";

    editButton.addEventListener(
      "click",
      () => editEvent(event.id)
    );

    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";
    deleteButton.textContent = "削除";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener(
      "click",
      () => deleteEvent(event.id)
    );

    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);

    item.appendChild(info);
    item.appendChild(buttons);

    eventsElement.appendChild(item);
  });
}


// ==============================
// 予定追加
// ==============================

if (addEventButton) {
  addEventButton.addEventListener(
    "click",
    () => {

      console.log("予定＋をクリック");

      if (!eventDialog) {
        alert(
          "予定入力画面が見つかりません 💤"
        );
        return;
      }

      if (eventForm) {
        eventForm.reset();
      }

      if (eventDate) {
        eventDate.value = selectedDate;
      }

      if (eventTime) {
        eventTime.value = "";
      }

      if (eventTitle) {
        eventTitle.value = "";
      }

      setSelectedEventColor("blue");

      eventDialog.dataset.editingId = "";

      if (
        typeof eventDialog.showModal ===
        "function"
      ) {
        eventDialog.showModal();
      } else {
        eventDialog.setAttribute(
          "open",
          ""
        );
      }
    }
  );
}


// ==============================
// 予定保存
// ==============================

if (eventForm) {
  eventForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const date =
        eventDate?.value || "";

      const time =
        eventTime?.value || "";

      const title =
        eventTitle?.value.trim() || "";

      const color =
        getSelectedEventColor();

      if (!date) {
        alert("日付を選んでね 🌙");
        return;
      }

      if (!title) {
        alert(
          "予定の名前を入力してね 💤"
        );
        return;
      }

      const editingId =
        eventDialog?.dataset.editingId;

      if (editingId) {

        const target =
          data.events.find(
            item =>
              String(item.id) ===
              String(editingId)
          );

        if (target) {
          target.date = date;
          target.time = time;
          target.title = title;
          target.color = color;
        }

      } else {

        data.events.push({
          id: Date.now(),
          date,
          time,
          title,
          color
        });

      }

      saveData();

      if (eventDialog) {
        eventDialog.close();
        eventDialog.dataset.editingId = "";
      }

      selectedDate = date;

      renderCalendar();
      renderSelectedDate();
      renderEvents();
    }
  );
}


// ==============================
// 予定編集
// ==============================

function editEvent(id) {

  const target =
    data.events.find(
      event =>
        String(event.id) ===
        String(id)
    );

  if (!target || !eventDialog) {
    return;
  }

  if (eventDate) {
    eventDate.value = target.date;
  }

  if (eventTime) {
    eventTime.value =
      target.time || "";
  }

  if (eventTitle) {
    eventTitle.value =
      target.title || "";
  }

  setSelectedEventColor(
    target.color || "blue"
  );

  eventDialog.dataset.editingId =
    target.id;

  eventDialog.showModal();
}


// ==============================
// 予定削除
// ==============================

function deleteEvent(id) {

  if (
    !confirm(
      "この予定を削除する？ 💤"
    )
  ) {
    return;
  }

  data.events =
    data.events.filter(
      event =>
        String(event.id) !==
        String(id)
    );

  saveData();

  renderCalendar();
  renderEvents();
}


// ==============================
// 予定ダイアログを閉じる
// ==============================

if (closeEventButton) {
  closeEventButton.addEventListener(
    "click",
    () => {
      eventDialog?.close();
    }
  );
}


// ==============================
// 月移動
// ==============================

if (prevMonth) {
  prevMonth.addEventListener(
    "click",
    () => {
      currentDate.setMonth(
        currentDate.getMonth() - 1
      );

      renderCalendar();
    }
  );
}

if (nextMonth) {
  nextMonth.addEventListener(
    "click",
    () => {
      currentDate.setMonth(
        currentDate.getMonth() + 1
      );

      renderCalendar();
    }
  );
}


// ==============================
// 今日
// ==============================

if (todayButton) {
  todayButton.addEventListener(
    "click",
    () => {

      const today =
        new Date();

      currentDate =
        new Date(today);

      selectedDate =
        formatDate(today);

      renderCalendar();
      renderSelectedDate();
      renderEvents();
      renderMemos();
    }
  );
}


// ==============================
// メモ
// ==============================

if (addMemoButton) {
  addMemoButton.addEventListener(
    "click",
    () => {

      memoForm?.reset();

      memoDialog?.showModal();
    }
  );
}

if (closeMemoButton) {
  closeMemoButton.addEventListener(
    "click",
    () => {
      memoDialog?.close();
    }
  );
}

if (memoForm) {
  memoForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const text =
        memoText?.value.trim();

      if (!text) return;

      data.memos.push({
        id: Date.now(),
        date: selectedDate,
        text
      });

      saveData();

      memoDialog?.close();

      renderMemos();
    }
  );
}

function renderMemos() {

  if (!memosElement) return;

  memosElement.innerHTML = "";

  const memos =
    data.memos.filter(
      memo =>
        memo.date === selectedDate
    );

  if (memos.length === 0) {

    memosElement.innerHTML =
      `<div class="empty-message">
        メモはまだないよ 📝
      </div>`;

    return;
  }

  memos.forEach(memo => {

    const item =
      document.createElement("div");

    item.className = "memo-item";

    const text =
      document.createElement("div");

    text.textContent = memo.text;

    const button =
      document.createElement("button");

    button.type = "button";
    button.textContent = "×";

    button.addEventListener(
      "click",
      () => {

        data.memos =
          data.memos.filter(
            item =>
              item.id !== memo.id
          );

        saveData();

        renderMemos();
      }
    );

    item.appendChild(text);
    item.appendChild(button);

    memosElement.appendChild(item);
  });
}


// ==============================
// TODO
// ==============================

if (todoForm) {
  todoForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const text =
        todoInput?.value.trim();

      if (!text) return;

      data.todos.push({
        id: Date.now(),
        text,
        completed: false
      });

      saveData();

      todoInput.value = "";

      renderTodos();
    }
  );
}

function renderTodos() {

  if (!todoList) return;

  todoList.innerHTML = "";

  data.todos.forEach(todo => {

    const item =
      document.createElement("div");

    item.className =
      "todo-item";

    if (todo.completed) {
      item.classList.add("completed");
    }

    const checkbox =
      document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked =
      todo.completed;

    checkbox.addEventListener(
      "change",
      () => {

        todo.completed =
          checkbox.checked;

        saveData();
        renderTodos();
      }
    );

    const text =
      document.createElement("span");

    text.textContent = todo.text;

    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";
    deleteButton.textContent = "×";

    deleteButton.addEventListener(
      "click",
      () => {

        data.todos =
          data.todos.filter(
            item =>
              item.id !== todo.id
          );

        saveData();

        renderTodos();
      }
    );

    item.appendChild(checkbox);
    item.appendChild(text);
    item.appendChild(deleteButton);

    todoList.appendChild(item);
  });
}


// ==============================
// 生理記録
// ==============================

if (addPeriodButton) {

  addPeriodButton.addEventListener(
    "click",
    () => {

      const date =
        prompt(
          "生理開始日を入力してね\n例：2026-10-03",
          selectedDate
        );

      if (!date) return;

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
      ) {
        alert(
          "YYYY-MM-DD形式で入力してね 🌷"
        );
        return;
      }

      data.periods.push({
        id: Date.now(),
        date
      });

      saveData();

      renderPeriod();
      renderCalendar();
    }
  );
}

function renderPeriod() {

  if (!lastPeriod) return;

  const sorted =
    [...data.periods].sort(
      (a, b) =>
        b.date.localeCompare(a.date)
    );

  if (sorted.length === 0) {

    lastPeriod.textContent =
      "未登録";

    averageCycle.textContent =
      "未登録";

    nextPeriod.textContent =
      "未登録";

    if (periodHistory) {
      periodHistory.innerHTML = "";
    }

    return;
  }

  lastPeriod.textContent =
    formatJapaneseDate(
      sorted[0].date
    );

  // 平均周期
  const intervals = [];

  for (
    let i = 0;
    i < sorted.length - 1;
    i++
  ) {

    const current =
      new Date(
        sorted[i].date + "T00:00:00"
      );

    const previous =
      new Date(
        sorted[i + 1].date + "T00:00:00"
      );

    const diff =
      Math.round(
        (
          current - previous
        ) /
        (
          1000 *
          60 *
          60 *
          24
        )
      );

    if (diff > 0) {
      intervals.push(diff);
    }
  }

  let cycle = null;

  if (intervals.length > 0) {

    cycle =
      Math.round(
        intervals.reduce(
          (a, b) => a + b,
          0
        ) /
        intervals.length
      );

    averageCycle.textContent =
      `${cycle}日`;

    const next =
      new Date(
        sorted[0].date + "T00:00:00"
      );

    next.setDate(
      next.getDate() + cycle
    );

    nextPeriod.textContent =
      formatJapaneseDate(
        formatDate(next)
      );

  } else {

    averageCycle.textContent =
      "データ不足";

    nextPeriod.textContent =
      "データ不足";
  }

  if (periodHistory) {

    periodHistory.innerHTML = "";

    sorted.forEach(period => {

      const item =
        document.createElement("div");

      item.className =
        "period-history-item";

      const date =
        document.createElement("span");

      date.textContent =
        formatJapaneseDate(
          period.date
        );

      const button =
        document.createElement("button");

      button.type = "button";
      button.textContent = "×";

      button.addEventListener(
        "click",
        () => {

          data.periods =
            data.periods.filter(
              item =>
                item.id !== period.id
            );

          saveData();

          renderPeriod();
          renderCalendar();
        }
      );

      item.appendChild(date);
      item.appendChild(button);

      periodHistory.appendChild(item);
    });
  }
}


// ==============================
// 初期表示
// ==============================

renderCalendar();
renderSelectedDate();
renderEvents();
renderMemos();
renderTodos();
renderPeriod();

console.log(
  "🌙 sleepy calendar loaded!"
);
