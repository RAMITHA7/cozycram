import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListTodo,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  loadStudyData,
} from "../../services/studyDataService.js";

import "./planner.css";


const formatDuration = (
  minutes
) => {
  const numericMinutes =
    Number(minutes) || 0;


  const hours =
    Math.floor(
      numericMinutes / 60
    );


  const remainingMinutes =
    numericMinutes % 60;


  if (
    hours > 0 &&
    remainingMinutes > 0
  ) {
    return `${hours}h ${remainingMinutes}m`;
  }


  if (hours > 0) {
    return `${hours}h`;
  }


  return `${remainingMinutes} min`;
};


const getDaysUntilDate = (
  dateValue
) => {
  if (!dateValue) {
    return null;
  }


  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const targetDate =
    new Date(
      `${dateValue}T00:00:00`
    );


  return Math.round(
    (
      targetDate.getTime() -
      today.getTime()
    ) /
      86400000
  );
};


const formatDateDistance = (
  dateValue
) => {
  const days =
    getDaysUntilDate(
      dateValue
    );


  if (days === null) {
    return "";
  }


  if (days < 0) {
    const absoluteDays =
      Math.abs(days);


    return absoluteDays === 1
      ? "1 day overdue"
      : `${absoluteDays} days overdue`;
  }


  if (days === 0) {
    return "Due today";
  }


  if (days === 1) {
    return "Due tomorrow";
  }


  return `Due in ${days} days`;
};

const formatPriority = (
  priority
) => {
  if (priority === "high") {
    return "High";
  }


  if (priority === "low") {
    return "Low";
  }


  return "Medium";
};


const startOfDay = (
  date
) => {
  const nextDate =
    new Date(date);

  nextDate.setHours(
    0,
    0,
    0,
    0
  );

  return nextDate;
};


const addDays = (
  date,
  amount
) => {
  const nextDate =
    new Date(date);

  nextDate.setDate(
    nextDate.getDate() +
      amount
  );

  return startOfDay(
    nextDate
  );
};


const getStartOfWeek = (
  date
) => {
  const current =
    startOfDay(
      date
    );


  const day =
    current.getDay();


  const mondayOffset =
    day === 0
      ? -6
      : 1 - day;


  return addDays(
    current,
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

const isDateWithinRange = (
  dateValue,
  rangeStart,
  rangeEnd
) => {
  if (!dateValue) {
    return false;
  }


  const target =
    startOfDay(
      new Date(
        `${dateValue}T00:00:00`
      )
    );


  return (
    target.getTime() >=
      rangeStart.getTime() &&
    target.getTime() <=
      rangeEnd.getTime()
  );
};

const formatWeekRange = (
  weekStart
) => {
  const weekEnd =
    addDays(
      weekStart,
      6
    );


  const startMonth =
    new Intl.DateTimeFormat(
      undefined,
      {
        month: "short",
      }
    ).format(
      weekStart
    );


  const endMonth =
    new Intl.DateTimeFormat(
      undefined,
      {
        month: "short",
      }
    ).format(
      weekEnd
    );


  const startYear =
    weekStart.getFullYear();


  const endYear =
    weekEnd.getFullYear();


  if (
    startYear !==
    endYear
  ) {
    return `${startMonth} ${weekStart.getDate()}, ${startYear} – ${endMonth} ${weekEnd.getDate()}, ${endYear}`;
  }


  if (
    weekStart.getMonth() !==
    weekEnd.getMonth()
  ) {
    return `${startMonth} ${weekStart.getDate()} – ${endMonth} ${weekEnd.getDate()}, ${endYear}`;
  }


  return `${startMonth} ${weekStart.getDate()}–${weekEnd.getDate()}, ${endYear}`;
};


const formatSelectedDate = (
  date
) =>
  new Intl.DateTimeFormat(
    undefined,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    date
  );

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];


const normalizeDayKey = (
  value
) =>
  String(
    value ?? ""
  )
    .trim()
    .toLowerCase();


const getWeekdayKey = (
  date
) =>
  WEEKDAY_KEYS[
    date.getDay()
  ];


const getAvailabilityForDate = (
  availability,
  date
) => {
  const weekdayKey =
    getWeekdayKey(
      date
    );


  return (
    availability.find(
      (day) =>
        normalizeDayKey(
          day.id
        ) ===
          weekdayKey ||
        normalizeDayKey(
          day.label
        ) ===
          weekdayKey
    ) || null
  );
};


const getMinutesBetweenTimes = (
  start,
  end
) => {
  if (
    !start ||
    !end
  ) {
    return 0;
  }


  const [
    startHour,
    startMinute,
  ] =
    start
      .split(":")
      .map(Number);


  const [
    endHour,
    endMinute,
  ] =
    end
      .split(":")
      .map(Number);


  const startTotal =
    startHour * 60 +
    startMinute;


  const endTotal =
    endHour * 60 +
    endMinute;


  return Math.max(
    0,
    endTotal -
      startTotal
  );
};

function PlannerPage() {
  const [initialData] =
    useState(
      loadStudyData
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
  const studyData =
    initialData.data;


  const loadError =
    initialData.error;


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


  const availability =
    Array.isArray(
      studyData?.availability
    )
      ? studyData.availability
      : [];


  const openTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "todo"
    );


  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "done"
    );


  const availableDays =
    availability.filter(
      (day) =>
        day.enabled
    );

  const weeklyAvailableMinutes =
  availableDays.reduce(
    (total, day) =>
      total +
      getMinutesBetweenTimes(
        day.start,
        day.end
      ),
    0
  );

  const weeklyHours =
    subjects.reduce(
      (total, subject) =>
        total +
        (
          Number(
            subject.weeklyHours
          ) || 0
        ),
      0
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


  const attentionOpenTasks =
  openTasks
    .filter(
      (task) =>
        Boolean(
          task.dueDate
        )
    )
    .sort(
      (first, second) =>
        getDaysUntilDate(
          first.dueDate
        ) -
        getDaysUntilDate(
          second.dueDate
        )
    )
    .slice(
      0,
      3
    );

  const today =
  startOfDay(
    new Date()
  );


const todayKey =
  toDateKey(
    today
  );


const selectedDateKey =
  toDateKey(
    selectedDate
  );


const weekStart =
  getStartOfWeek(
    selectedDate
  );

const weekEnd =
  addDays(
    weekStart,
    6
  );

const weekDays =
  Array.from(
    {
      length: 7,
    },
    (
      _,
      index
    ) =>
      addDays(
        weekStart,
        index
      )
  );


const selectedDayLabel =
  formatSelectedDate(
    selectedDate
  );

const selectedAvailability =
  getAvailabilityForDate(
    availability,
    selectedDate
  );


const selectedDayIsAvailable =
  Boolean(
    selectedAvailability?.enabled &&
    selectedAvailability?.start &&
    selectedAvailability?.end
  );


const selectedAvailableMinutes =
  selectedDayIsAvailable
    ? getMinutesBetweenTimes(
        selectedAvailability.start,
        selectedAvailability.end
      )
    : 0;

const tasksDueThisWeek =
  openTasks.filter(
    (task) =>
      isDateWithinRange(
        task.dueDate,
        weekStart,
        weekEnd
      )
  );


const tasksDueThisWeekMinutes =
  tasksDueThisWeek.reduce(
    (total, task) =>
      total +
      (
        Number(
          task.estimatedMinutes
        ) || 0
      ),
    0
  );


const overdueOpenTasks =
  openTasks.filter(
    (task) => {
      const days =
        getDaysUntilDate(
          task.dueDate
        );


      return (
        days !== null &&
        days < 0
      );
    }
  );


const undatedOpenTasks =
  openTasks.filter(
    (task) =>
      !task.dueDate
  );


const selectedDateTasks =
  openTasks
    .filter(
      (task) =>
        task.dueDate ===
        selectedDateKey
    )
    .sort(
      (first, second) => {
        const priorityWeight = {
          high: 3,
          medium: 2,
          low: 1,
        };


        return (
          priorityWeight[
            second.priority
          ] -
          priorityWeight[
            first.priority
          ]
        );
      }
    );

    const selectedDateTaskMinutes =
  selectedDateTasks.reduce(
    (total, task) =>
      total +
      (
        Number(
          task.estimatedMinutes
        ) || 0
      ),
    0
  );

const dueCountByDate =
  openTasks.reduce(
    (
      map,
      task
    ) => {
      if (!task.dueDate) {
        return map;
      }


      const currentCount =
        map.get(
          task.dueDate
        ) || 0;


      map.set(
        task.dueDate,
        currentCount + 1
      );


      return map;
    },
    new Map()
  );

const hasSubjects =
  subjects.length > 0;


const hasOpenTasks =
  openTasks.length > 0;


const hasStudyAvailability =
  weeklyAvailableMinutes > 0;


const isSchedulingReady =
  hasSubjects &&
  hasOpenTasks &&
  hasStudyAvailability;

const schedulingStatus =
  !hasSubjects
    ? {
        title:
          "Add subjects to continue",

        message:
          "The Planner needs at least one subject before study work can be organized.",
      }
    : !hasOpenTasks
      ? {
          title:
            "Nothing to schedule yet",

          message:
            "You have no open tasks right now. Add a task when you have specific work to plan.",
        }
      : !hasStudyAvailability
        ? {
            title:
              "Add study availability",

            message:
              "You have open work, but CozyCram has no available study time in your saved weekly setup.",
          }
        : {
            title:
              "Ready for scheduling",

            message:
              "Your subjects, open tasks and study availability are connected. Day 11 will use these inputs to generate real study blocks.",
          };

const readinessAction =
  !hasSubjects
    ? {
        label:
          "Manage subjects",

        to:
          "/planner/subjects",
      }
    : !hasOpenTasks
      ? {
          label:
            "Manage tasks",

          to:
            "/planner/tasks",
        }
      : !hasStudyAvailability
        ? {
            label:
              "Review availability",

            to:
              "/planner/availability",
          }
        : {
            label:
              "Review tasks",

            to:
              "/planner/tasks",
          };


const handlePreviousWeek =
  () => {
    setSelectedDate(
      (currentDate) =>
        addDays(
          currentDate,
          -7
        )
    );
  };


const handleNextWeek =
  () => {
    setSelectedDate(
      (currentDate) =>
        addDays(
          currentDate,
          7
        )
    );
  };


const handleToday =
  () => {
    setSelectedDate(
      startOfDay(
        new Date()
      )
    );
  };


  return (
    <section
      className="planner-page"
      aria-labelledby="planner-page-title"
    >
      <header className="planner-header">
        <div>
          <p className="planner-header__eyebrow">
            PLANNER
          </p>

          <h1 id="planner-page-title">
            Your study plan
          </h1>

          <p className="planner-header__intro">
            Keep your subjects, tasks,
            deadlines and available study
            time in one place before
            CozyCram builds your schedule.
          </p>
        </div>
      </header>


      {loadError ? (
        <section
          className="planner-state"
          role="alert"
        >
          <div
            className="planner-state__icon"
            aria-hidden="true"
          >
            <CalendarDays
              size={24}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2>
              We couldn't load your planner.
            </h2>

            <p>
              {loadError}
            </p>
          </div>
        </section>
      ) : !studyData?.completed ? (
        <section className="planner-state">
          <div
            className="planner-state__icon"
            aria-hidden="true"
          >
            <CalendarDays
              size={24}
              strokeWidth={1.8}
            />
          </div>

          <div className="planner-state__content">
            <h2>
              Complete your study setup first.
            </h2>

            <p>
              CozyCram needs your subjects,
              workload, availability and study
              preferences before the Planner
              can prepare for scheduling.
            </p>
          </div>

          <Link
            to="/onboarding"
            className="planner-primary-link"
          >
            Complete setup
          </Link>
        </section>
      ) : (
        <>
          {/* =========================================
              PLANNER SUMMARY
              ========================================= */}

          <section
            className="planner-summary"
            aria-label="Planner summary"
          >
            <article className="planner-summary-card">
              <BookOpen
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <div>
                <span>
                  Subjects
                </span>

                <strong>
                  {subjects.length}
                </strong>
              </div>
            </article>


            <article className="planner-summary-card">
              <ListTodo
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <div>
                <span>
                  Open tasks
                </span>

                <strong>
                  {openTasks.length}
                </strong>
              </div>
            </article>


            <article className="planner-summary-card">
              <Clock3
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <div>
                <span>
                  Weekly workload
                </span>

                <strong>
                  {weeklyHours}
                  {" "}
                  h
                </strong>
              </div>
            </article>


            <article className="planner-summary-card">
              <CalendarDays
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <div>
                <span>
                  Study days
                </span>

                <strong>
                  {availableDays.length}
                </strong>
              </div>
            </article>
          </section>

           {/* =========================================
    WEEK STRUCTURE
    ========================================= */}

<section
  className="planner-week"
  aria-labelledby="planner-week-title"
>
  <div className="planner-week__header">
    <div>
      <p className="planner-week__eyebrow">
        WEEK
      </p>

      <h2 id="planner-week-title">
        Plan your week
      </h2>

      <span>
        {
          formatWeekRange(
            weekStart
          )
        }
      </span>
    </div>


    <div
      className="planner-week__controls"
      aria-label="Week navigation"
    >
      <button
  type="button"
  className="planner-week__control"
  onClick={
    handlePreviousWeek
  }
  aria-label="Previous week"
  title="Previous week"
>
        <ChevronLeft
          size={18}
          aria-hidden="true"
        />
      </button>


      <button
        type="button"
        className="planner-week__today"
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
  className="planner-week__control"
  onClick={
    handleNextWeek
  }
  aria-label="Next week"
  title="Next week"
>
        <ChevronRight
          size={18}
          aria-hidden="true"
        />
      </button>
    </div>
  </div>

  <div
  className="planner-week-context"
  aria-label="Displayed week task context"
>
  <article className="planner-week-context__card">
    <ListTodo
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <div>
      <span>
        Due this week
      </span>

      <strong>
        {
          tasksDueThisWeek.length
        }
      </strong>
    </div>
  </article>


  <article className="planner-week-context__card">
    <Clock3
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <div>
      <span>
        Due-work estimate
      </span>

      <strong>
        {
          formatDuration(
            tasksDueThisWeekMinutes
          )
        }
      </strong>
    </div>
  </article>


  <article className="planner-week-context__card">
    <CalendarDays
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <div>
      <span>
        Overdue
      </span>

      <strong>
        {
          overdueOpenTasks.length
        }
      </strong>
    </div>
  </article>


  <article className="planner-week-context__card">
    <ListTodo
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <div>
      <span>
        No due date
      </span>

      <strong>
        {
          undatedOpenTasks.length
        }
      </strong>
    </div>
  </article>
</div>

  <div
    className="planner-week__days"
    aria-label="Choose a day"
  >
    {weekDays.map(
      (day) => {
        const dayKey =
          toDateKey(
            day
          );

        const dueCount =
  dueCountByDate.get(
    dayKey
  ) || 0;
        const dayAvailability =
  getAvailabilityForDate(
    availability,
    day
  );


const dayIsAvailable =
  Boolean(
    dayAvailability?.enabled
  );

        const isSelected =
          dayKey ===
          selectedDateKey;


        const isToday =
          dayKey ===
          todayKey;


        return (
          <button
  key={dayKey}
  type="button"
  className={`planner-day ${
    isSelected
      ? "planner-day--selected"
      : "planner-day--idle"
  }`}
  onClick={() =>
    setSelectedDate(
      day
    )
  }
  aria-pressed={
    isSelected
  }
>
            <span className="planner-day__weekday">
              {
                new Intl.DateTimeFormat(
                  undefined,
                  {
                    weekday:
                      "short",
                  }
                ).format(
                  day
                )
              }
            </span>


            <strong className="planner-day__number">
              {day.getDate()}
            </strong>


            <span className="planner-day__month">
              {
                new Intl.DateTimeFormat(
                  undefined,
                  {
                    month:
                      "short",
                  }
                ).format(
                  day
                )
              }
            </span>

            {dueCount > 0 && (
  <span className="planner-day__due">
    {dueCount} due
  </span>
)}

{dayIsAvailable && (
  <span className="planner-day__availability">
    Available
  </span>
)}

            {isToday && (
              <span className="planner-day__today-label">
                Today
              </span>
            )}
          </button>
        );
      }
    )}
  </div>


  <section
    className="planner-selected-day"
    aria-labelledby="planner-selected-day-title"
  >
    <div className="planner-selected-day__header">
      <div>
        <p>
          SELECTED DAY
        </p>

        <h3 id="planner-selected-day-title">
          {selectedDayLabel}
        </h3>
      </div>


      {selectedDateKey ===
        todayKey && (
        <span className="planner-selected-day__badge">
          Today
        </span>
      )}
    </div>

    <div
  className="planner-selected-day__summary"
  aria-label="Selected day summary"
>
  <div>
    <span>
      Due tasks
    </span>

    <strong>
      {
        selectedDateTasks.length
      }
    </strong>
  </div>


  <div>
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
  </div>


  <div>
    <span>
      Study time
    </span>

    <strong>
      {selectedDayIsAvailable
        ? formatDuration(
            selectedAvailableMinutes
          )
        : "Unavailable"}
    </strong>
  </div>
</div>

    <div className="planner-selected-day__content">

    <section
  className="planner-selected-availability"
  aria-labelledby="planner-selected-availability-title"
>
  <div className="planner-selected-day__section-heading">
    <div>
      <p>
        STUDY AVAILABILITY
      </p>

      <h4 id="planner-selected-availability-title">
        Available study time
      </h4>
    </div>
  </div>


  {selectedDayIsAvailable ? (
    <div className="planner-selected-availability__active">
      <Link
  to="/planner/availability"
  className="planner-context-link"
>
  Review availability

  <ArrowRight
    size={17}
    aria-hidden="true"
  />
</Link>
      <Clock3
        size={21}
        strokeWidth={1.8}
        aria-hidden="true"
      />

      <div>
        <strong>
          {
            selectedAvailability.start
          }
          {" – "}
          {
            selectedAvailability.end
          }
        </strong>

        <span>
          {
            formatDuration(
              selectedAvailableMinutes
            )
          }
          {" "}
          available
        </span>

        <p>
          This study window comes from
          your saved availability setup.
        </p>
      </div>
    </div>
  ) : (
    <div className="planner-selected-availability__inactive">
      <CalendarDays
        size={21}
        strokeWidth={1.8}
        aria-hidden="true"
      />

      <div>
        <strong>
          No study availability saved
          for this day.
        </strong>

        <p>
          CozyCram will not place study
          sessions on this day unless
          your availability is changed.
        </p>
      </div>
    </div>
  )}
</section>

  <section
    className="planner-selected-day__tasks"
    aria-labelledby="planner-selected-tasks-title"
  >
    <div className="planner-selected-day__section-heading">
      <div>
        <p>
          TASK DEADLINES
        </p>

        <h4 id="planner-selected-tasks-title">
          Due on this day
        </h4>
      </div>

      <span>
        {
          selectedDateTasks.length
        }
      </span>
    </div>


    {selectedDateTasks.length > 0 ? (
      <div className="planner-selected-task-list">
        {selectedDateTasks.map(
          (task) => (
            <article
              key={task.id}
              className="planner-selected-task"
            >
              <div className="planner-selected-task__main">
                <strong>
                  {task.title}
                </strong>

                <span>
                  {
                    taskSubjectMap.get(
                      String(
                        task.subjectId
                      )
                    ) ||
                    "Unknown subject"
                  }
                  {" · "}
                  {
                    formatDuration(
                      task.estimatedMinutes
                    )
                  }
                  {" · "}
                  {
                    formatPriority(
                      task.priority
                    )
                  }
                </span>
              </div>


              <Link
                to={`/planner/tasks/${task.id}`}
                className="planner-selected-task__link"
              >
                View task
              </Link>
            </article>
          )
        )}
      </div>
    ) : (
      <div className="planner-selected-day__no-tasks">
        <ListTodo
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <div>
          <strong>
            No task deadlines on this day.
          </strong>

          <p>
  {openTasks.length > 0
    ? (
        <>
          None of your current open tasks
          are due on this date.
        </>
      )
    : (
        <>
          You currently have no open tasks
          to show here.
        </>
      )}
</p>
       <Link
  to="/planner/tasks"
  className="planner-context-link"
>
  View all tasks

  <ArrowRight
    size={17}
    aria-hidden="true"
  />
</Link>
        </div>
      </div>
    )}
  </section>


  <div className="planner-selected-day__empty">
    <CalendarDays
      size={22}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <div>
      <strong>
        No generated study blocks yet.
      </strong>

      <p>
  {selectedDayIsAvailable
    ? (
        <>
          This day has saved study
          availability. CozyCram's
          scheduling engine will decide
          how real tasks fit inside that
          window in the next scheduling
          stage.
        </>
      )
    : (
        <>
          No study window is currently
          available on this day, so the
          future scheduling engine should
          not place study blocks here.
        </>
      )}
</p>
    </div>
  </div>
</div>
  </section>
</section>

    <section
  className="planner-workload"
  aria-labelledby="planner-workload-title"
>
  <div className="planner-section-heading planner-section-heading--row">
    <div>
      <p>
        WORKLOAD
      </p>

      <h2 id="planner-workload-title">
        Weekly workload by subject
      </h2>

      <span>
        Your saved weekly targets and
        current open-task counts.
      </span>
    </div>


    <Link
      to="/planner/subjects"
      className="planner-section-link"
    >
      Manage subjects
    </Link>
  </div>


  {subjects.length > 0 ? (
    <div className="planner-workload__list">
      {subjects.map(
        (subject) => {
          const subjectOpenTasks =
            openTasks.filter(
              (task) =>
                String(
                  task.subjectId
                ) ===
                String(
                  subject.id
                )
            );


          return (
            <Link
              key={subject.id}
              to={`/planner/subjects/${subject.id}`}
              className="planner-workload-item"
            >
              <div>
                <strong>
                  {subject.name}
                </strong>

                <span>
                  {
                    subjectOpenTasks.length
                  }
                  {" "}
                  {subjectOpenTasks.length === 1
                    ? "open task"
                    : "open tasks"}
                </span>
              </div>


              <div className="planner-workload-item__hours">
                <strong>
                  {
                    subject.weeklyHours
                  }
                  {" "}
                  h
                </strong>

                <span>
                  per week
                </span>
              </div>


              <ArrowRight
                size={18}
                aria-hidden="true"
              />
            </Link>
          );
        }
      )}
    </div>
  ) : (
    <div className="planner-upcoming__empty">
      <BookOpen
        size={22}
        aria-hidden="true"
      />

      <div>
        <strong>
          No subjects added yet.
        </strong>

        <p>
          Add subjects to give the Planner
          real workload information.
        </p>
      </div>
    </div>
  )}
</section>


          {/* =========================================
              PLANNER SECTIONS
              ========================================= */}

          <section
            className="planner-tools"
            aria-labelledby="planner-tools-title"
          >
            <div className="planner-section-heading">
              <div>
                <p>
                  PLAN INPUTS
                </p>

                <h2 id="planner-tools-title">
                  Build your study setup
                </h2>

                <span>
                  These are the inputs CozyCram
                  will use when generating your
                  schedule.
                </span>
              </div>
            </div>


            <div className="planner-tools__grid">
              <Link
                to="/planner/tasks"
                className="planner-tool-card"
              >
                <div className="planner-tool-card__top">
                  <div
                    className="planner-tool-card__icon"
                    aria-hidden="true"
                  >
                    <ListTodo
                      size={22}
                      strokeWidth={1.8}
                    />
                  </div>

                  <ArrowRight
                    size={19}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h3>
                    Tasks
                  </h3>

                  <p>
                    Manage the specific work
                    you need to complete.
                  </p>
                </div>

                <strong>
                  {openTasks.length}
                  {" "}
                  {openTasks.length === 1
                    ? "open task"
                    : "open tasks"}
                </strong>
              </Link>


              <Link
                to="/planner/subjects"
                className="planner-tool-card"
              >
                <div className="planner-tool-card__top">
                  <div
                    className="planner-tool-card__icon"
                    aria-hidden="true"
                  >
                    <BookOpen
                      size={22}
                      strokeWidth={1.8}
                    />
                  </div>

                  <ArrowRight
                    size={19}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h3>
                    Subjects
                  </h3>

                  <p>
                    Manage workload and subject
                    deadline information.
                  </p>
                </div>

                <strong>
                  {subjects.length}
                  {" "}
                  {subjects.length === 1
                    ? "subject"
                    : "subjects"}
                </strong>
              </Link>


              <Link
                to="/planner/availability"
                className="planner-tool-card"
              >
                <div className="planner-tool-card__top">
                  <div
                    className="planner-tool-card__icon"
                    aria-hidden="true"
                  >
                    <CalendarDays
                      size={22}
                      strokeWidth={1.8}
                    />
                  </div>

                  <ArrowRight
                    size={19}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h3>
                    Availability
                  </h3>

                  <p>
                    Review when you can
                    realistically study.
                  </p>
                </div>

                <strong>
                  {availableDays.length}
                  {" "}
                  {availableDays.length === 1
                    ? "study day"
                    : "study days"}
                </strong>
              </Link>
            </div>
          </section>


          {/* =========================================
              PLANNING STATUS
              ========================================= */}

          <section
            className="planner-status"
            aria-labelledby="planner-status-title"
          >
            <div className="planner-section-heading">
              <div>
                <p>
                  PLANNING STATUS
                </p>

                <h2 id="planner-status-title">
                  {schedulingStatus.title}
                </h2>
              </div>
            </div>


            <div
  className={`planner-status__content ${
    isSchedulingReady
      ? "planner-status__content--ready"
      : "planner-status__content--waiting"
  }`}
>
  <div
    className="planner-status__icon"
    aria-hidden="true"
  >
    <CheckCircle2
      size={24}
      strokeWidth={1.8}
    />
  </div>


  <div>
    <strong>
      {isSchedulingReady
        ? "Your planning inputs are connected."
        : "Planner setup still needs attention."}
    </strong>

    <p>
      {schedulingStatus.message}
    </p>
  </div>
</div>

         <div
  className="planner-readiness"
  aria-label="Scheduling readiness checks"
>
  <article
    className={`planner-readiness__item ${
      hasSubjects
        ? "planner-readiness__item--ready"
        : "planner-readiness__item--missing"
    }`}
  >
    <CheckCircle2
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <div>
      <span>
        Subjects
      </span>

      <strong>
        {hasSubjects
          ? `${subjects.length} ${
              subjects.length === 1
                ? "subject"
                : "subjects"
            } ready`
          : "No subjects"}
      </strong>
    </div>
  </article>


  <article
    className={`planner-readiness__item ${
      hasOpenTasks
        ? "planner-readiness__item--ready"
        : "planner-readiness__item--missing"
    }`}
  >
    <CheckCircle2
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <div>
      <span>
        Open work
      </span>

      <strong>
        {hasOpenTasks
          ? `${openTasks.length} ${
              openTasks.length === 1
                ? "task"
                : "tasks"
            } ready`
          : "No open tasks"}
      </strong>
    </div>
  </article>


  <article
    className={`planner-readiness__item ${
      hasStudyAvailability
        ? "planner-readiness__item--ready"
        : "planner-readiness__item--missing"
    }`}
  >
    <CheckCircle2
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <div>
      <span>
        Study time
      </span>

      <strong>
        {hasStudyAvailability
          ? `${formatDuration(
              weeklyAvailableMinutes
            )} available`
          : "No study time"}
      </strong>
    </div>
  </article>
</div>


{(
  overdueOpenTasks.length > 0 ||
  undatedOpenTasks.length > 0
) && (
  <div className="planner-notices">
    {overdueOpenTasks.length > 0 && (
      <div className="planner-notice">
        <strong>
          {overdueOpenTasks.length}
          {" "}
          {overdueOpenTasks.length === 1
            ? "open task is"
            : "open tasks are"}
          {" "}
          overdue.
        </strong>

        <p>
          Overdue work will need attention
          before or alongside newer
          deadlines when scheduling is
          introduced.
        </p>
      </div>
    )}


    {undatedOpenTasks.length > 0 && (
      <div className="planner-notice">
        <strong>
          {undatedOpenTasks.length}
          {" "}
          {undatedOpenTasks.length === 1
            ? "open task has"
            : "open tasks have"}
          {" "}
          no due date.
        </strong>

        <p>
          These tasks are still valid
          planning inputs. Their saved
          priority and workload context can
          still be used later.
        </p>
      </div>
    )}
  </div>
)}
<div className="planner-status__actions">
  <Link
    to={
      readinessAction.to
    }
    className="planner-status__action"
  >
    {
      readinessAction.label
    }

    <ArrowRight
      size={17}
      aria-hidden="true"
    />
  </Link>
</div>
</section>

          {/* =========================================
              UPCOMING WORK
              ========================================= */}

          <section
            className="planner-upcoming"
            aria-labelledby="planner-upcoming-title"
          >
            <div className="planner-section-heading planner-section-heading--row">
              <div>
                <p>
                  UPCOMING WORK
                </p>

                <h2 id="planner-upcoming-title">
                  What needs attention
                </h2>
              </div>

              <Link
                to="/planner/tasks"
                className="planner-section-link"
              >
                View all tasks
              </Link>
            </div>


            {attentionOpenTasks.length > 0 ? (
              <div className="planner-upcoming__list">
                {attentionOpenTasks.map(
                  (task) => (
                    <Link
                      key={task.id}
                      to={`/planner/tasks/${task.id}`}
                      className="planner-upcoming-item"
                    >
                      <div>
                        <strong>
                          {task.title}
                        </strong>

                        <span>
                          {
                            taskSubjectMap.get(
                              String(
                                task.subjectId
                              )
                            ) ||
                            "Unknown subject"
                          }
                        </span>
                      </div>


                      <div className="planner-upcoming-item__meta">
                        <span>
                          {
                            formatDuration(
                              task.estimatedMinutes
                            )
                          }
                        </span>

                        <strong>
                          {
                            formatDateDistance(
                              task.dueDate
                            )
                          }
                        </strong>
                      </div>


                      <ArrowRight
                        size={18}
                        aria-hidden="true"
                      />
                    </Link>
                  )
                )}
              </div>
            ) : (
              <div className="planner-upcoming__empty">
                <ListTodo
  size={22}
  strokeWidth={1.8}
  aria-hidden="true"
/>

<div>
  <strong>
    {openTasks.length === 0
      ? "No open tasks right now."
      : "No dated task deadlines."}
  </strong>

  <p>
    {openTasks.length === 0
      ? (
          <>
            Completed work stays recorded,
            and new open tasks will appear
            here when you add them.
          </>
        )
      : (
          <>
            Your open tasks are still
            saved, but none currently have
            a due date.
          </>
        )}
  </p>
</div>
              </div>
            )}
          </section>


          <p className="planner-completed-note">
            {completedTasks.length}
            {" "}
            {completedTasks.length === 1
              ? "task is"
              : "tasks are"}
            {" "}
            currently completed.
          </p>
        </>
      )}
    </section>
  );
}


export default PlannerPage;