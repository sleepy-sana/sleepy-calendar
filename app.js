// ==============================
// sleepy calendar
// app.js
// ==============================


// ==============================
// 保存データ
// ==============================

let data = {};

try {
  const savedData = localStorage.getItem("sleepyCalendar");

  if (savedData) {
    data = JSON.parse(savedData);
  }
} catch (error) {
  console.warn(
    "保存データを読み込めなかったため、初期化します。",
    error
  );

  data = {};
}


// ==============================
// データを安全な形にする
// ==============================

data.events = Array.isArray(data.events)
  ? data.events
  : [];

data.memos = Array.isArray(data.memos)
  ? data.memos
  : [];

data.todos = Array.isArray(data.todos)
  ? data.todos
  : [];

data.periods = Array.isArray(data.periods)
  ? data.periods
  : [];


// ==============================
// 基本設定
// ==============================

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
// データ保存
// ==============================

function saveData() {
  try {
    localStorage.setItem(
      "sleepyCalendar",
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn(
      "データを保存できませんでした。",
      error
    );
  }
}


// ==============================
// 日付
// ==============================

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatJapaneseDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(
    dateString + "T00:00:00"
  );

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
// 予定カラー
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
// カレンダー表示
// ==============================

function renderCalendar() {
  if (!calendarGrid) {
    return;
  }

  calendarGrid.innerHTML = "";

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  if (monthTitle) {
    monthTitle.textContent =
      `${year}年 ${month + 1}月`;
  }


  // 月初の曜日
  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();


  // 月末の日付
  const lastDate =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  // 今日
  const today =
    formatDate(new Date());


  // ============================
  // 前月の空白
  // ============================

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {
    const empty =
      document.createElement("div");

    empty.className =
      "calendar-day empty";

    calendarGrid.appendChild(empty);
  }


  // ============================
  // 日付
  // ============================

  for (
    let day = 1;
    day <= lastDate;
    day++
  ) {
    const date =
      new Date(
        year,
        month,
        day
      );

    const dateString =
      formatDate(date);


    // 日付セル
    const cell =
      document.createElement("div");

    cell.className =
      "calendar-day";


    // 今日
    if (dateString === today) {
      cell.classList.add("today");
    }


    // 選択中
    if (
      dateString === selectedDate
    ) {
      cell.classList.add("selected");
    }


    // 日付番号
    const number =
      document.createElement("div");

    number.className =
      "day-number";

    number.textContent =
      day;

    cell.appendChild(number);


    // ==========================
    // 予定マーク
    // ==========================

    const dayEvents =
      data.events.filter(
        event =>
          event.date === dateString
      );


    if (dayEvents.length > 0) {
      const marks =
        document.createElement("div");

      marks.className =
        "event-marks";


      dayEvents.forEach(event => {
        const mark =
          document.createElement("span");

        const color =
          EVENT_COLORS.includes(
            event.color
          )
            ? event.color
            : "blue";

        mark.className =
          `event-mark event-${color}`;

        marks.appendChild(mark);
      });


      cell.appendChild(marks);
    }


    // ==========================
    // 生理マーク
    // ==========================

    const hasPeriod =
      data.periods.some(
        period =>
          period.date === dateString
      );


    if (hasPeriod) {
      const periodMark =
        document.createElement("span");

      periodMark.className =
        "period-mark";

      periodMark.textContent =
        "🌷";

      cell.appendChild(periodMark);
    }


    // ==========================
    // 日付クリック
    // ==========================

    cell.addEventListener(
      "click",
      () => {
        selectedDate =
          dateString;

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
// 選択日表示
// ==============================

function renderSelectedDate() {
  if (!selectedDateElement) {
    return;
  }

  selectedDateElement.textContent =
    formatJapaneseDate(
      selectedDate
    );
}


// ==============================
// 予定表示
// ==============================

function renderEvents() {
  if (!eventsElement) {
    return;
  }

  eventsElement.innerHTML = "";


  const events =
    data.events
      .filter(
        event =>
          event.date === selectedDate
      )
      .sort(
        (a, b) =>
          (a.time || "").localeCompare(
            b.time || ""
          )
      );


  // 予定なし
  if (events.length === 0) {
    eventsElement.innerHTML =
      `
      <div class="empty-message">
        予定はまだないよ 💤
      </div>
      `;

    return;
  }


  // 予定一覧
  events.forEach(event => {

    const item =
      document.createElement("div");

    const color =
      EVENT_COLORS.includes(
        event.color
      )
        ? event.color
        : "blue";

    item.className =
      `event-item event-${color}`;


    // 情報
    const info =
      document.createElement("div");

    info.className =
      "event-info";


    // タイトル
    const title =
      document.createElement("div");

    title.className =
      "event-title";

    title.textContent =
      event.title;


    // 時間
    const time =
      document.createElement("div");

    time.className =
      "event-time";

    time.textContent =
      event.time || "時間なし";


    info.appendChild(title);
    info.appendChild(time);


    // ==========================
    // ボタン
    // ==========================

    const buttons =
      document.createElement("div");

    buttons.className =
      "event-actions";


    // 編集
    const editButton =
      document.createElement("button");

    editButton.type =
      "button";

    editButton.textContent =
      "編集";

    editButton.className =
      "edit-button";

    editButton.addEventListener(
      "click",
      () => {
        editEvent(event.id);
      }
    );


    // 削除
    const deleteButton =
      document.createElement("button");

    deleteButton.type =
      "button";

    deleteButton.textContent =
      "削除";

    deleteButton.className =
      "delete-button";

    deleteButton.addEventListener(
      "click",
      () => {
        deleteEvent(event.id);
      }
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

      if (!eventDialog) {
        alert(
          "予定入力画面が見つかりません 💤"
        );

        return;
      }


      // フォームをリセット
      if (eventForm) {
        eventForm.reset();
      }


      // 日付
      if (eventDate) {
        eventDate.value =
          selectedDate;
      }


      // 時間
      if (eventTime) {
        eventTime.value = "";
      }


      // タイトル
      if (eventTitle) {
        eventTitle.value = "";
      }


      // カラー
      setSelectedEventColor(
        "blue"
      );


      // 編集状態を解除
      eventDialog.dataset.editingId =
        "";


      // ダイアログ表示
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


      // 日付チェック
      if (!date) {
        alert(
          "日付を選んでね 🌙"
        );

        return;
      }


      // タイトルチェック
      if (!title) {
        alert(
          "予定の名前を入力してね 💤"
        );

        return;
      }


      // 編集中か確認
      const editingId =
        eventDialog?.dataset.editingId ||
        "";


      // ==========================
      // 編集
      // ==========================

      if (editingId) {

        const target =
          data.events.find(
            item =>
              String(item.id) ===
              String(editingId)
          );


        if (target) {
          target.date =
            date;

          target.time =
            time;

          target.title =
            title;

          target.color =
            color;
        }


      // ==========================
      // 新規追加
      // ==========================

      } else {

        data.events.push({
          id: Date.now(),
          date,
          time,
          title,
          color
        });
      }


      // 保存
      saveData();


      // ダイアログを閉じる
      if (eventDialog) {

        if (
          typeof eventDialog.close ===
          "function"
        ) {
          eventDialog.close();
        }

        eventDialog.dataset.editingId =
          "";
      }


      // 選択日を変更
      selectedDate =
        date;


      // 再描画
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


  if (
    !target ||
    !eventDialog
  ) {
    return;
  }


  if (eventDate) {
    eventDate.value =
      target.date;
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


// ==============================
// 予定削除
// ==============================

function deleteEvent(id) {

  const confirmed =
    confirm(
      "この予定を削除する？ 💤"
    );


  if (!confirmed) {
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

      if (eventDialog) {

        if (
          typeof eventDialog.close ===
          "function"
        ) {
          eventDialog.close();
        } else {
          eventDialog.removeAttribute(
            "open"
          );
        }
      }
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
// メモ追加
// ==============================

if (addMemoButton) {

  addMemoButton.addEventListener(
    "click",
    () => {

      if (memoForm) {
        memoForm.reset();
      }


      if (memoDialog) {

        if (
          typeof memoDialog.showModal ===
          "function"
        ) {
          memoDialog.showModal();
        } else {
          memoDialog.setAttribute(
            "open",
            ""
          );
        }
      }
    }
  );
}


// ==============================
// メモを閉じる
// ==============================

if (closeMemoButton) {

  closeMemoButton.addEventListener(
    "click",
    () => {

      if (memoDialog) {

        if (
          typeof memoDialog.close ===
          "function"
        ) {
          memoDialog.close();
        } else {
          memoDialog.removeAttribute(
            "open"
          );
        }
      }
    }
  );
}


// ==============================
// メモ保存
// ==============================

if (memoForm) {

  memoForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const text =
        memoText?.value.trim() || "";


      if (!text) {
        return;
      }


      data.memos.push({
        id: Date.now(),
        date: selectedDate,
        text
      });


      saveData();


      if (memoDialog) {

        if (
          typeof memoDialog.close ===
          "function"
        ) {
          memoDialog.close();
        } else {
          memoDialog.removeAttribute(
            "open"
          );
        }
      }


      renderMemos();
    }
  );
}


// ==============================
// メモ表示
// ==============================

function renderMemos() {

  if (!memosElement) {
    return;
  }


  memosElement.innerHTML = "";


  const memos =
    data.memos.filter(
      memo =>
        memo.date === selectedDate
    );


  // メモなし
  if (memos.length === 0) {

    memosElement.innerHTML =
      `
      <div class="empty-message">
        メモはまだないよ 📝
      </div>
      `;

    return;
  }


  // メモ一覧
  memos.forEach(memo => {

    const item =
      document.createElement("div");

    item.className =
      "memo-item";


    const text =
      document.createElement("div");

    text.textContent =
      memo.text;


    const button =
      document.createElement("button");

    button.type =
      "button";

    button.textContent =
      "×";


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
// TODO追加
// ==============================

if (todoForm) {

  todoForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const text =
        todoInput?.value.trim() || "";


      if (!text) {
        return;
      }


      data.todos.push({
        id: Date.now(),
        text,
        completed: false
      });


      saveData();


      if (todoInput) {
        todoInput.value = "";
      }


      renderTodos();
    }
  );
}


// ==============================
// TODO表示
// ==============================

function renderTodos() {

  if (!todoList) {
    return;
  }


  todoList.innerHTML = "";


  data.todos.forEach(todo => {

    const item =
      document.createElement("div");

    item.className =
      "todo-item";


    if (todo.completed) {
      item.classList.add(
        "completed"
      );
    }


    // チェックボックス
    const checkbox =
      document.createElement("input");

    checkbox.type =
      "checkbox";

    checkbox.checked =
      Boolean(todo.completed);


    checkbox.addEventListener(
      "change",
      () => {

        todo.completed =
          checkbox.checked;

        saveData();

        renderTodos();
      }
    );


    // テキスト
    const text =
      document.createElement("span");

    text.textContent =
      todo.text;


    // 削除
    const deleteButton =
      document.createElement("button");

    deleteButton.type =
      "button";

    deleteButton.textContent =
      "×";


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


    item.appendChild(
      checkbox
    );

    item.appendChild(
      text
    );

    item.appendChild(
      deleteButton
    );


    todoList.appendChild(
      item
    );
  });
}


// ==============================
// 生理記録追加
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


      if (!date) {
        return;
      }


      // 日付形式チェック
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          date
        )
      ) {
        alert(
          "YYYY-MM-DD形式で入力してね 🌷"
        );

        return;
      }


      // 同じ日付がある場合
      const alreadyExists =
        data.periods.some(
          period =>
            period.date === date
        );


      if (alreadyExists) {

        alert(
          "その日はすでに記録されているよ 🌷"
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


// ==============================
// 生理記録表示
// ==============================

function renderPeriod() {

  if (!lastPeriod) {
    return;
  }


  const sorted =
    [...data.periods].sort(
      (a, b) =>
        b.date.localeCompare(
          a.date
        )
    );


  // 記録なし
  if (sorted.length === 0) {

    lastPeriod.textContent =
      "未登録";


    if (averageCycle) {
      averageCycle.textContent =
        "未登録";
    }


    if (nextPeriod) {
      nextPeriod.textContent =
        "未登録";
    }


    if (periodHistory) {
      periodHistory.innerHTML =
        "";
    }


    return;
  }


  // 最終生理日
  lastPeriod.textContent =
    formatJapaneseDate(
      sorted[0].date
    );


  // ==========================
  // 平均周期
  // ==========================

  const intervals = [];


  for (
    let i = 0;
    i < sorted.length - 1;
    i++
  ) {

    const current =
      new Date(
        sorted[i].date +
        "T00:00:00"
      );


    const previous =
      new Date(
        sorted[i + 1].date +
        "T00:00:00"
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
          (sum, value) =>
            sum + value,
          0
        ) /
        intervals.length
      );


    if (averageCycle) {
      averageCycle.textContent =
        `${cycle}日`;
    }


    // 次回予定日
    const next =
      new Date(
        sorted[0].date +
        "T00:00:00"
      );


    next.setDate(
      next.getDate() + cycle
    );


    if (nextPeriod) {
      nextPeriod.textContent =
        formatJapaneseDate(
          formatDate(next)
        );
    }

  } else {

    if (averageCycle) {
      averageCycle.textContent =
        "データ不足";
    }


    if (nextPeriod) {
      nextPeriod.textContent =
        "データ不足";
    }
  }


  // ==========================
  // 生理履歴
  // ==========================

  if (periodHistory) {

    periodHistory.innerHTML =
      "";


    sorted.forEach(period => {

      const item =
        document.createElement("div");

      item.className =
        "period-history-item";


      // 日付
      const date =
        document.createElement("span");

      date.textContent =
        formatJapaneseDate(
          period.date
        );


      // 削除
      const button =
        document.createElement("button");

      button.type =
        "button";

      button.textContent =
        "×";


      button.addEventListener(
        "click",
        () => {

          data.periods =
            data.periods.filter(
              item =>
                item.id !==
                period.id
            );


          saveData();

          renderPeriod();
          renderCalendar();
        }
      );


      item.appendChild(date);
      item.appendChild(button);


      periodHistory.appendChild(
        item
      );
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


// ==============================
// 起動確認
// ==============================

console.log(
  "🌙 sleepy calendar loaded!"
);
