const today = new Date();

let currentDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);

let selectedDate = formatDate(today);


let data =
  JSON.parse(
    localStorage.getItem("sleepyCalendar")
  ) || {

    events: [],

    memos: [],

    todos: [],

    periods: []

  };


function save() {

  localStorage.setItem(
    "sleepyCalendar",
    JSON.stringify(data)
  );

}


function formatDate(date) {

  const y = date.getFullYear();

  const m = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const d = String(
    date.getDate()
  ).padStart(2, "0");

  return `${y}-${m}-${d}`;

}


function createCalendar() {

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();


  document
    .getElementById("monthTitle")
    .textContent =
      `${year}年 ${month + 1}月`;


  const grid =
    document.getElementById(
      "calendarGrid"
    );

  grid.innerHTML = "";


  const firstDay =
    new Date(year, month, 1);


  const startDay =
    firstDay.getDay();


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  const previousDays =
    new Date(
      year,
      month,
      0
    ).getDate();


  for (
    let i = 0;
    i < 42;
    i++
  ) {

    let dayNumber;

    let date;

    let muted = false;


    if (i < startDay) {

      dayNumber =
        previousDays -
        startDay +
        i +
        1;

      date =
        new Date(
          year,
          month - 1,
          dayNumber
        );

      muted = true;

    }

    else if (
      i >=
      startDay +
      daysInMonth
    ) {

      dayNumber =
        i -
        startDay -
        daysInMonth +
        1;

      date =
        new Date(
          year,
          month + 1,
          dayNumber
        );

      muted = true;

    }

    else {

      dayNumber =
        i -
        startDay +
        1;

      date =
        new Date(
          year,
          month,
          dayNumber
        );

    }


    const dateString =
      formatDate(date);


    const button =
      document.createElement(
        "button"
      );


    button.className = "day";


    if (muted) {

      button.classList.add(
        "muted"
      );

    }


    if (
      dateString ===
      selectedDate
    ) {

      button.classList.add(
        "selected"
      );

    }


    if (
      dateString ===
      formatDate(today)
    ) {

      button.classList.add(
        "today"
      );

    }


    button.innerHTML =
      `<div>${dayNumber}</div>`;


    const hasEvent =
      data.events.some(
        event =>
          event.date ===
          dateString
      );


    const hasPeriod =
      data.periods.some(
        period =>
          period.start ===
          dateString
      );


    if (hasEvent) {

      button.innerHTML +=
        `<div>🔵</div>`;

    }


    if (hasPeriod) {

      button.innerHTML +=
        `<div>🌸</div>`;

    }


    button.onclick = () => {

      selectedDate =
        dateString;

      render();

    };


    grid.appendChild(
      button
    );

  }

}


function renderSelectedDay() {

  const date =
    new Date(selectedDate);


  document
    .getElementById(
      "selectedDate"
    )
    .textContent =
      `${date.getMonth() + 1}月${date.getDate()}日`;


  const container =
    document.getElementById(
      "events"
    );


  const events =
    data.events.filter(
      event =>
        event.date ===
        selectedDate
    );


  container.innerHTML = "";


  if (
    events.length === 0
  ) {

    container.innerHTML =
      `<p>予定はありません。</p>`;

  }


  events.forEach(
    event => {

      const div =
        document.createElement(
          "div"
        );

      div.className =
        "event";


      div.innerHTML =
        `${event.time || ""}
         ${event.title}`;


      container.appendChild(
        div
      );

    }
  );

}


function renderPeriod() {

  const periods =
    [...data.periods]
      .sort(
        (a, b) =>
          a.start.localeCompare(
            b.start
          )
      );


  const last =
    periods.at(-1);


  document
    .getElementById(
      "lastPeriod"
    )
    .textContent =
      last
        ? last.start
        : "未登録";


  if (
    periods.length < 2
  ) {

    document
      .getElementById(
        "averageCycle"
      )
      .textContent =
        "—";

    document
      .getElementById(
        "nextPeriod"
      )
      .textContent =
        "—";

    return;

  }


  const gaps = [];


  for (
    let i = 1;
    i < periods.length;
    i++
  ) {

    const a =
      new Date(
        periods[i - 1].start
      );

    const b =
      new Date(
        periods[i].start
      );


    const days =
      Math.round(
        (b - a) /
        86400000
      );


    gaps.push(days);

  }


  const average =
    Math.round(
      gaps.reduce(
        (a, b) =>
          a + b,
        0
      ) /
      gaps.length
    );


  document
    .getElementById(
      "averageCycle"
    )
    .textContent =
      `${average}日`;


  const next =
    new Date(last.start);


  next.setDate(
    next.getDate() +
    average
  );


  document
    .getElementById(
      "nextPeriod"
    )
    .textContent =
      formatDate(next);

}


function renderTodo() {

  const list =
    document.getElementById(
      "todoList"
    );


  list.innerHTML = "";


  data.todos.forEach(
    todo => {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "todo";


      div.innerHTML = `

        <input
          type="checkbox"
          ${todo.done ? "checked" : ""}
        >

        <span>
          ${todo.text}
        </span>

      `;


      div
        .querySelector(
          "input"
        )
        .onchange = () => {

          todo.done =
            !todo.done;

          save();

        };


      list.appendChild(
        div
      );

    }
  );

}


function render() {

  createCalendar();

  renderSelectedDay();

  renderPeriod();

  renderTodo();

}


document
  .getElementById(
    "prevMonth"
  )
  .onclick = () => {

    currentDate.setMonth(
      currentDate.getMonth() - 1
    );

    render();

  };


document
  .getElementById(
    "nextMonth"
  )
  .onclick = () => {

    currentDate.setMonth(
      currentDate.getMonth() + 1
    );

    render();

  };


document
  .getElementById(
    "todayButton"
  )
  .onclick = () => {

    currentDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

    selectedDate =
      formatDate(today);

    render();

  };


/* -----------------
   Event
----------------- */

document
  .getElementById(
    "addEvent"
  )
  .onclick = () => {

    document
      .getElementById(
        "eventDate"
      )
      .value =
        selectedDate;


    document
      .getElementById(
        "eventDialog"
      )
      .showModal();

  };


document
  .getElementById(
    "eventForm"
  )
  .onsubmit = event => {

    event.preventDefault();


    data.events.push({

      date:
        document
          .getElementById(
            "eventDate"
          ).value,

      time:
        document
          .getElementById(
            "eventTime"
          ).value,

      title:
        document
          .getElementById(
            "eventTitle"
          ).value

    });


    save();


    document
      .getElementById(
        "eventDialog"
      )
      .close();


    render();

  };


document
  .getElementById(
    "closeEvent"
  )
  .onclick = () => {

    document
      .getElementById(
        "eventDialog"
      )
      .close();

  };


/* -----------------
   Memo
----------------- */

document
  .getElementById(
    "addMemo"
  )
  .onclick = () => {

    document
      .getElementById(
        "memoDialog"
      )
      .showModal();

  };


document
  .getElementById(
    "memoForm"
  )
  .onsubmit = event => {

    event.preventDefault();


    data.memos.push({

      date:
        selectedDate,

      text:
        document
          .getElementById(
            "memoText"
          ).value

    });


    save();


    document
      .getElementById(
        "memoDialog"
      )
      .close();

  };


document
  .getElementById(
    "closeMemo"
  )
  .onclick = () => {

    document
      .getElementById(
        "memoDialog"
      )
      .close();

  };


/* -----------------
   Period
----------------- */

document
  .getElementById(
    "addPeriod"
  )
  .onclick = () => {

    data.periods.push({

      start:
        formatDate(today)

    });


    save();

    render();

  };


/* -----------------
   Todo
----------------- */

document
  .getElementById(
    "todoForm"
  )
  .onsubmit = event => {

    event.preventDefault();


    const input =
      document.getElementById(
        "todoInput"
      );


    if (
      !input.value.trim()
    ) return;


    data.todos.push({

      text:
        input.value.trim(),

      done: false

    });


    input.value = "";


    save();

    render();

  };


render();
