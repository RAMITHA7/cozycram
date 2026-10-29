import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  loadStudyData,
} from "../../services/studyDataService.js";

import "./calendar.css";


const WEEKDAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const PRIORITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1,
};

const formatPriority = (
  value
) => {
  const priority =
    String(
      value ?? ""
    )
      .trim()
      .toLowerCase();


  if (
    priority === "high"
  ) {
    return "High priority";
  }


  if (
    priority === "medium"
  ) {
    return "Medium priority";
  }


  if (
    priority === "low"
  ) {
    return "Low priority";
  }


  return "Priority not set";
};

const formatDuration = (
  value
) => {
  const minutes =
    Number(
      value
    );


  if (
    !Number.isFinite(
      minutes
    ) ||
    minutes <= 0
  ) {
    return "0 min";
  }


  const wholeMinutes =
    Math.floor(
      minutes
    );


  const hours =
    Math.floor(
      wholeMinutes / 60
    );


  const remainingMinutes =
    wholeMinutes % 60;


  if (
    hours > 0 &&
    remainingMinutes > 0
  ) {
    return `${hours}h ${remainingMinutes}m`;
  }


  if (
    hours > 0
  ) {
    return `${hours}h`;
  }


  return `${remainingMinutes} min`;
};

const startOfDay = (
  date
) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );


const addDays = (
  date,
  amount
) => {
  const nextDate =
    new Date(
      date
    );


  nextDate.setDate(
    nextDate.getDate() +
      amount
  );


  return startOfDay(
    nextDate
  );
};


const getStartOfMonth = (
  date
) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );


const getCalendarGridStart = (
  monthStart
) => {
  const weekday =
    monthStart.getDay();


  const mondayOffset =
    weekday === 0
      ? -6
      : 1 - weekday;


  return addDays(
    monthStart,
    mondayOffset
  );
};


const toDateKey = (
  date
) => {
  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;
};


const formatMonthHeading = (
  date
) =>
  new Intl.DateTimeFormat(
    "en",
    {
      month: "long",
      year: "numeric",
    }
  ).format(
    date
  );


const formatSelectedDate = (
  date
) =>
  new Intl.DateTimeFormat(
    "en",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    date
  );


function CalendarPage() {
  const [
    initialData,
  ] = useState(
    () =>
      loadStudyData()
  );

  const studyData =
    initialData.data;

  const loadError =
    initialData.error;


  const today =
    useMemo(
      () =>
        startOfDay(
          new Date()
        ),
      []
    );


  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    () =>
      startOfDay(
        new Date()
      )
  );


  const [
    visibleMonth,
    setVisibleMonth,
  ] = useState(
    () =>
      getStartOfMonth(
        new Date()
      )
  );


  const monthStart =
    getStartOfMonth(
      visibleMonth
    );


  const gridStart =
    getCalendarGridStart(
      monthStart
    );


  const calendarDays =
    useMemo(
      () =>
        Array.from(
          {
            length: 42,
          },
          (
            _,
            index
          ) =>
            addDays(
              gridStart,
              index
            )
        ),
      [
        gridStart,
      ]
    );


  const selectedDateKey =
    toDateKey(
      selectedDate
    );


  const todayKey =
    toDateKey(
      today
    );


  const subjects =
    Array.isArray(
      studyData?.subjects
    )
      ? studyData.subjects
      : [];


  const tasks =
    Array.isArray(
      studyData?.tasks
    )
      ? studyData.tasks
      : [];


  const openTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "todo"
    );

   const taskSubjectMap =
  new Map(
    subjects.map(
      (subject) => [
        String(
          subject.id
        ),

        subject.name,
      ]
    )
  );

   const dueCountByDate =
  openTasks.reduce(
    (
      map,
      task
    ) => {
      if (
        !task.dueDate
      ) {
        return map;
      }


      map.set(
        task.dueDate,
        (
          map.get(
            task.dueDate
          ) || 0
        ) + 1
      );


      return map;
    },
    new Map()
  );

   const selectedDateTasks =
  openTasks
    .filter(
      (task) =>
        task.dueDate ===
        selectedDateKey
    )
    .sort(
      (
        first,
        second
      ) => {
        const firstPriority =
          PRIORITY_WEIGHT[
            first.priority
          ] || 0;


        const secondPriority =
          PRIORITY_WEIGHT[
            second.priority
          ] || 0;


        if (
          secondPriority !==
          firstPriority
        ) {
          return (
            secondPriority -
            firstPriority
          );
        }


        return String(
          first.title ?? ""
        ).localeCompare(
          String(
            second.title ?? ""
          )
        );
      }
    );

    const selectedDateTaskMinutes =
  selectedDateTasks.reduce(
    (
      total,
      task
    ) =>
      total +
      (
        Number(
          task.estimatedMinutes
        ) || 0
      ),
    0
  );

  const handlePreviousMonth =
    () => {
      const previousMonth =
        new Date(
          visibleMonth.getFullYear(),
          visibleMonth.getMonth() - 1,
          1
        );


      setVisibleMonth(
        previousMonth
      );


      setSelectedDate(
        previousMonth
      );
    };


  const handleNextMonth =
    () => {
      const nextMonth =
        new Date(
          visibleMonth.getFullYear(),
          visibleMonth.getMonth() + 1,
          1
        );


      setVisibleMonth(
        nextMonth
      );


      setSelectedDate(
        nextMonth
      );
    };


  const handleToday =
    () => {
      const currentToday =
        startOfDay(
          new Date()
        );


      setVisibleMonth(
        getStartOfMonth(
          currentToday
        )
      );


      setSelectedDate(
        currentToday
      );
    };


  const handleSelectDate = (
    date
  ) => {
    setSelectedDate(
      date
    );


    if (
      date.getMonth() !==
        visibleMonth.getMonth() ||
      date.getFullYear() !==
        visibleMonth.getFullYear()
    ) {
      setVisibleMonth(
        getStartOfMonth(
          date
        )
      );
    }
  };


  if (
    loadError
  ) {
    return (
      <main className="calendar-page">
        <section
          className="calendar-state"
          role="alert"
        >
          <CalendarDays
            size={28}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <h1>
              Calendar unavailable
            </h1>

            <p>
              CozyCram could not load
              your study data safely.
            </p>
          </div>
        </section>
      </main>
    );
  }


  if (
    !studyData?.completed
  ) {
    return (
      <main className="calendar-page">
        <section className="calendar-state">
          <CalendarDays
            size={28}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <h1>
              Finish your study setup
            </h1>

            <p>
              Complete onboarding before
              using the Calendar.
            </p>

            <Link
              to="/onboarding"
              className="calendar-state__link"
            >
              Continue setup
            </Link>
          </div>
        </section>
      </main>
    );
  }


  return (
    <main className="calendar-page">
      <header className="calendar-header">
        <div>
          <p className="calendar-header__eyebrow">
            CALENDAR
          </p>

          <h1>
            See your study month
          </h1>

          <p className="calendar-header__description">
            Explore your month using the
            same real study data already
            connected to CozyCram.
          </p>
        </div>


        <div className="calendar-header__summary">
          <article>
            <span>
              Subjects
            </span>

            <strong>
              {
                subjects.length
              }
            </strong>
          </article>


          <article>
            <span>
              Open tasks
            </span>

            <strong>
              {
                openTasks.length
              }
            </strong>
          </article>
        </div>
      </header>


      <section
        className="calendar-panel"
        aria-labelledby="calendar-month-title"
      >
        <div className="calendar-toolbar">
          <div>
            <p>
              MONTH
            </p>

            <h2 id="calendar-month-title">
              {
                formatMonthHeading(
                  visibleMonth
                )
              }
            </h2>
          </div>


          <div className="calendar-toolbar__controls">
            <button
              type="button"
              className="calendar-toolbar__icon-button"
              onClick={
                handlePreviousMonth
              }
              aria-label="Previous month"
              title="Previous month"
            >
              <ChevronLeft
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>


            <button
              type="button"
              className="calendar-toolbar__today"
              onClick={
                handleToday
              }
              aria-pressed={
                selectedDateKey ===
                todayKey
              }
            >
              Today
            </button>


            <button
              type="button"
              className="calendar-toolbar__icon-button"
              onClick={
                handleNextMonth
              }
              aria-label="Next month"
              title="Next month"
            >
              <ChevronRight
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>


        <div className="calendar-weekdays">
          {WEEKDAY_LABELS.map(
            (weekday) => (
              <span
                key={
                  weekday
                }
              >
                {weekday}
              </span>
            )
          )}
        </div>


        <div className="calendar-grid">
          {calendarDays.map(
            (date) => {
              const dateKey =
                toDateKey(
                  date
                );


              const isSelected =
                dateKey ===
                selectedDateKey;


              const isToday =
                dateKey ===
                todayKey;


              const isCurrentMonth =
                date.getMonth() ===
                  visibleMonth.getMonth() &&
                date.getFullYear() ===
                  visibleMonth.getFullYear();

                const dueCount =
  dueCountByDate.get(
    dateKey
  ) || 0;

              return (
                <button
                  key={
                    dateKey
                  }
                  type="button"
                  className={`calendar-day ${
                    isSelected
                      ? "calendar-day--selected"
                      : ""
                  } ${
                    !isCurrentMonth
                      ? "calendar-day--outside"
                      : ""
                  }`}
                  onClick={
                    () =>
                      handleSelectDate(
                        date
                      )
                  }
                  aria-pressed={
                    isSelected
                  }
                  aria-label={`${formatSelectedDate(
  date
)}${
  dueCount > 0
    ? `, ${dueCount} open ${
        dueCount === 1
          ? "task"
          : "tasks"
      } due`
    : ", no open tasks due"
}`}
                >
                  <span className="calendar-day__number">
                    {
                      date.getDate()
                    }
                  </span>


                  {isToday && (
                    <span className="calendar-day__today">
                      Today
                    </span>
                  )}
                  {dueCount > 0 && (
  <span
    className="calendar-day__due"
    aria-hidden="true"
  >
    {dueCount === 1
      ? "1 due"
      : `${dueCount} due`}
  </span>
)}
                </button>
              );
            }
          )}
        </div>
      </section>


      <section
        className="calendar-selected"
        aria-labelledby="calendar-selected-title"
      >
        <div>
          <p>
            SELECTED DAY
          </p>

          <h2 id="calendar-selected-title">
            {
              formatSelectedDate(
                selectedDate
              )
            }
          </h2>
        </div>


        <div className="calendar-selected__summary">
  <article>
    <span>
      Due tasks
    </span>

    <strong>
      {
        selectedDateTasks
          .length
      }
    </strong>
  </article>


  <article>
    <span>
      Due-work estimate
    </span>

    <strong>
      {
        formatDuration(
          selectedDateTaskMinutes
        )
      }
    </strong>
  </article>
</div>
<section
  className="calendar-selected__tasks"
  aria-labelledby="calendar-selected-tasks-title"
>
  <div className="calendar-selected__tasks-heading">
    <div>
      <p>
        TASK DEADLINES
      </p>

      <h3 id="calendar-selected-tasks-title">
        Open work due this day
      </h3>
    </div>


    {selectedDateTasks.length > 0 && (
      <span>
        {
          selectedDateTasks
            .length
        }
      </span>
    )}
  </div>


  {selectedDateTasks.length === 0 ? (
    <div className="calendar-selected__empty">
      <CalendarDays
        size={22}
        strokeWidth={1.8}
        aria-hidden="true"
      />

      <div>
        <strong>
          No open task deadlines
          on this day.
        </strong>

        <p>
          Tasks without this due
          date remain available in
          your task list.
        </p>

        <Link
          to="/planner/tasks"
          className="calendar-selected__task-link"
        >
          View all tasks
        </Link>
      </div>
    </div>
  ) : (
    <div className="calendar-selected__task-list">
      {selectedDateTasks.map(
        (task) => {
          const subjectName =
            taskSubjectMap.get(
              String(
                task.subjectId
              )
            ) ||
            "Unknown subject";


          return (
            <article
              key={task.id}
              className="calendar-selected__task"
            >
              <div className="calendar-selected__task-main">
                <strong>
                  {task.title}
                </strong>


                <div className="calendar-selected__task-meta">
                  <span>
                    {subjectName}
                  </span>

                  <span>
                    {
                      formatDuration(
                        task.estimatedMinutes
                      )
                    }
                  </span>

                  <span>
                    {
                      formatPriority(
                        task.priority
                      )
                    }
                  </span>
                </div>
              </div>


              <Link
                to={`/planner/tasks/${task.id}`}
                className="calendar-selected__task-link"
              >
                View task
              </Link>
            </article>
          );
        }
      )}
    </div>
  )}
</section>
      </section>
    </main>
  );
}


export default CalendarPage;