import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Coffee,
  ListTodo,
  Timer,
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

import {
  MIN_SCHEDULE_BLOCK_MINUTES,
  resolveFocusPlan,
} from "../../services/schedulingEngine.js";

import "./focus.css";

const FOCUS_DURATION_OPTIONS = [
  {
    id: "quick",
    label: "Quick",
    minutes: 25,
  },

  {
    id: "classic",
    label: "Classic",
    minutes: 50,
  },

  {
    id: "deep",
    label: "Deep",
    minutes: 90,
  },

  {
    id: "custom",
    label: "Custom",
    minutes: null,
  },
];

const DATE_KEY_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/;


const isValidDateKey = (
  value
) => {
  const normalized =
    String(
      value ?? ""
    ).trim();


  if (
    !DATE_KEY_PATTERN.test(
      normalized
    )
  ) {
    return false;
  }


  const [
    year,
    month,
    day,
  ] =
    normalized
      .split("-")
      .map(Number);


  const date =
    new Date(
      year,
      month - 1,
      day
    );


  return (
    date.getFullYear() ===
      year &&
    date.getMonth() ===
      month - 1 &&
    date.getDate() ===
      day
  );
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


const formatDueDate = (
  value
) => {
  if (
    !value
  ) {
    return "No due date";
  }


  if (
    !isValidDateKey(
      value
    )
  ) {
    return "Deadline needs attention";
  }


  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    new Date(
      `${value}T00:00:00`
    )
  );
};


const formatPriority = (
  value
) => {
  if (
    value === "high"
  ) {
    return "High priority";
  }


  if (
    value === "low"
  ) {
    return "Low priority";
  }


  if (
    value === "medium"
  ) {
    return "Medium priority";
  }


  return "Priority not set";
};


const formatFocusPreset = (
  value
) => {
  if (
    value === "quick"
  ) {
    return "Quick";
  }


  if (
    value === "classic"
  ) {
    return "Classic";
  }


  if (
    value === "deep"
  ) {
    return "Deep";
  }


  if (
    value === "custom"
  ) {
    return "Custom";
  }


  return "Focus";
};


function FocusPage() {
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


  const preferences =
    studyData?.preferences &&
    typeof studyData
      .preferences ===
      "object"
      ? studyData.preferences
      : {};


  const subjectMap =
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


  const focusResult =
    resolveFocusPlan(
      preferences
    );


  const focusPlan =
    focusResult.valid
      ? focusResult.focusPlan
      : null;

   const [
  selectedTaskId,
  setSelectedTaskId,
] = useState(
  null
);


const [
  selectedDurationOption,
  setSelectedDurationOption,
] = useState(
  () => {
    const savedPreset =
      focusPlan?.preset;


    return FOCUS_DURATION_OPTIONS
      .some(
        (option) =>
          option.id ===
          savedPreset
      )
      ? savedPreset
      : null;
  }
);


const [
  customFocusMinutes,
  setCustomFocusMinutes,
] = useState(
  () =>
    focusPlan?.preset ===
    "custom"
      ? String(
          focusPlan.focusMinutes
        )
      : ""
);


const selectedTask =
  openTasks.find(
    (task) =>
      String(
        task.id
      ) ===
      String(
        selectedTaskId
      )
  ) ||
  null;


const selectedDurationPreset =
  FOCUS_DURATION_OPTIONS
    .find(
      (option) =>
        option.id ===
        selectedDurationOption
    ) ||
  null;


const numericCustomFocusMinutes =
  Number(
    customFocusMinutes
  );


const customDurationIsValid =
  Number.isInteger(
    numericCustomFocusMinutes
  ) &&
  numericCustomFocusMinutes >=
    MIN_SCHEDULE_BLOCK_MINUTES;


const selectedDurationMinutes =
  selectedDurationOption ===
  "custom"
    ? (
        customDurationIsValid
          ? numericCustomFocusMinutes
          : null
      )
    : (
        selectedDurationPreset
          ?.minutes ??
        null
      );


const customDurationError =
  selectedDurationOption ===
    "custom" &&
  customFocusMinutes !== "" &&
  !customDurationIsValid
    ? `Enter a whole number of at least ${MIN_SCHEDULE_BLOCK_MINUTES} minutes.`
    : "";


const canContinueToFocus =
  Boolean(
    selectedTask &&
    selectedDurationMinutes
  );

  if (
    loadError
  ) {
    return (
      <main className="focus-page">
        <section
          className="focus-state"
          role="alert"
        >
          <div
            className="focus-state__icon"
            aria-hidden="true"
          >
            <CircleAlert
              size={26}
              strokeWidth={1.8}
            />
          </div>


          <div>
            <h1>
              Focus is unavailable
            </h1>

            <p>
              CozyCram could not load your
              study data safely.
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
      <main className="focus-page">
        <section className="focus-state">
          <div
            className="focus-state__icon"
            aria-hidden="true"
          >
            <Timer
              size={26}
              strokeWidth={1.8}
            />
          </div>


          <div>
            <h1>
              Finish your study setup
            </h1>

            <p>
              Complete onboarding before
              preparing a Focus session.
            </p>
          </div>


          <Link
            to="/onboarding"
            className="focus-state__link"
          >
            Continue setup
          </Link>
        </section>
      </main>
    );
  }


  if (
    !focusResult.valid
  ) {
    return (
      <main className="focus-page">
        <section className="focus-state">
          <div
            className="focus-state__icon"
            aria-hidden="true"
          >
            <CircleAlert
              size={26}
              strokeWidth={1.8}
            />
          </div>


          <div>
            <h1>
              Focus preference needs attention
            </h1>

            <p>
              {focusResult.error}
            </p>
          </div>


          <Link
            to="/onboarding"
            className="focus-state__link"
          >
            Review setup
          </Link>
        </section>
      </main>
    );
  }


  return (
    <main
      className="focus-page"
      aria-labelledby="focus-page-title"
    >
      <header className="focus-header">
        <div>
          <p className="focus-header__eyebrow">
            FOCUS
          </p>

          <h1 id="focus-page-title">
            Ready to focus?
          </h1>

          <p className="focus-header__description">
            Prepare a study session using
            your real open tasks and saved
            focus preference.
          </p>
        </div>
      </header>


      <section
        className="focus-summary"
        aria-label="Focus summary"
      >
        <article className="focus-summary-card">
          <ListTodo
            size={21}
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


        <article className="focus-summary-card">
          <Timer
            size={21}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              Preferred session
            </span>

            <strong>
              {
                formatDuration(
                  focusPlan.focusMinutes
                )
              }
            </strong>
          </div>
        </article>


        <article className="focus-summary-card">
          <Coffee
            size={21}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              Saved break
            </span>

            <strong>
              {
                formatDuration(
                  focusPlan.breakMinutes
                )
              }
            </strong>
          </div>
        </article>
      </section>


      <section
        className="focus-preference"
        aria-labelledby="focus-preference-title"
      >
        <div className="focus-section-heading">
          <div>
            <p>
              SESSION PREFERENCE
            </p>

            <h2 id="focus-preference-title">
              Your saved focus rhythm
            </h2>

            <span>
              Focus uses the same preference
              already connected to your
              Planner.
            </span>
          </div>
        </div>


        <div className="focus-preference__grid">
          <article>
            <span>
              Preset
            </span>

            <strong>
              {
                formatFocusPreset(
                  focusPlan.preset
                )
              }
            </strong>
          </article>


          <article>
            <span>
              Focus time
            </span>

            <strong>
              {
                formatDuration(
                  focusPlan.focusMinutes
                )
              }
            </strong>
          </article>


          <article>
            <span>
              Break time
            </span>

            <strong>
              {
                formatDuration(
                  focusPlan.breakMinutes
                )
              }
            </strong>
          </article>
        </div>
      </section>


      <section
        className="focus-work"
        aria-labelledby="focus-work-title"
      >
        <div className="focus-section-heading focus-section-heading--row">
          <div>
            <p>
              OPEN WORK
            </p>

            <h2 id="focus-work-title">
              Work available for focus
            </h2>

            <span>
              These are your current open
              tasks from the same study data
              used by Planner.
            </span>
          </div>


          {openTasks.length > 0 && (
            <span className="focus-work__count">
              {openTasks.length}
              {" "}
              {openTasks.length === 1
                ? "task"
                : "tasks"}
            </span>
          )}
        </div>


       {openTasks.length > 0 ? (
  <div className="focus-task-grid">
    {openTasks.map(
      (task) => {
        const isSelected =
          String(
            selectedTaskId
          ) ===
          String(
            task.id
          );


        return (
          <article
            key={task.id}
            className={`focus-task-card${
              isSelected
                ? " focus-task-card--selected"
                : ""
            }`}
          >
            <button
              type="button"
              className="focus-task-card__select"
              aria-pressed={
                isSelected
              }
              onClick={
                () =>
                  setSelectedTaskId(
                    task.id
                  )
              }
            >
              <div className="focus-task-card__top">
                <div
                  className="focus-task-card__icon"
                  aria-hidden="true"
                >
                  <BookOpen
                    size={20}
                    strokeWidth={1.8}
                  />
                </div>


                {isSelected ? (
                  <span className="focus-task-card__selected">
                    <CheckCircle2
                      size={16}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    Selected
                  </span>
                ) : (
                  <span className="focus-task-card__choose">
                    Choose
                  </span>
                )}
              </div>


              <div className="focus-task-card__content">
                <strong>
                  {task.title}
                </strong>

                <span>
                  {
                    subjectMap.get(
                      String(
                        task.subjectId
                      )
                    ) ||
                    "Unknown subject"
                  }
                </span>
              </div>


              <div className="focus-task-card__meta">
                <span>
                  <Clock3
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

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


              <p className="focus-task-card__deadline">
                {
                  formatDueDate(
                    task.dueDate
                  )
                }
              </p>
            </button>


            <Link
              to={`/planner/tasks/${task.id}`}
              className="focus-task-card__details"
            >
              View task

              <ArrowRight
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </Link>
          </article>
        );
      }
    )}
  </div>
) : (
  <div className="focus-empty">
    <ListTodo
      size={26}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <div>
      <h3>
        No open tasks right now.
      </h3>

      <p>
        Add an open task before
        preparing a task-linked
        Focus session.
      </p>
    </div>


    <Link
      to="/planner/tasks"
      className="focus-empty__link"
    >
      Manage tasks
    </Link>
  </div>
)}

      </section>
      <section
  className="focus-duration"
  aria-labelledby="focus-duration-title"
>
  <div className="focus-section-heading">
    <div>
      <p>
        SESSION LENGTH
      </p>

      <h2 id="focus-duration-title">
        Choose your focus time
      </h2>

      <span>
        Use a standard session or choose
        your own valid focus duration.
      </span>
    </div>
  </div>


  <div
    className="focus-duration__options"
    role="group"
    aria-label="Focus duration"
  >
    {FOCUS_DURATION_OPTIONS.map(
      (option) => {
        const isSelected =
          selectedDurationOption ===
          option.id;


        return (
          <button
            key={option.id}
            type="button"
            className="focus-duration__option"
            aria-pressed={
              isSelected
            }
            onClick={
              () =>
                setSelectedDurationOption(
                  option.id
                )
            }
          >
            <span>
              {option.label}
            </span>

            <strong>
              {option.id ===
              "custom"
                ? "Your time"
                : formatDuration(
                    option.minutes
                  )}
            </strong>
          </button>
        );
      }
    )}
  </div>


  {selectedDurationOption ===
    "custom" && (
    <div className="focus-duration__custom">
      <label htmlFor="focus-custom-minutes">
        Custom focus minutes
      </label>


      <input
        id="focus-custom-minutes"
        type="number"
        inputMode="numeric"
        min={
          MIN_SCHEDULE_BLOCK_MINUTES
        }
        step="1"
        value={
          customFocusMinutes
        }
        onChange={
          (event) =>
            setCustomFocusMinutes(
              event.target.value
            )
        }
        aria-describedby="focus-custom-help"
        aria-invalid={
          Boolean(
            customDurationError
          )
        }
      />


      <p
        id="focus-custom-help"
        className={
          customDurationError
            ? "focus-duration__custom-help focus-duration__custom-help--error"
            : "focus-duration__custom-help"
        }
      >
        {customDurationError ||
          `Use a whole number of at least ${MIN_SCHEDULE_BLOCK_MINUTES} minutes.`}
      </p>
    </div>
  )}
</section>

<section
  className="focus-session-setup"
  aria-labelledby="focus-session-setup-title"
>
  <div className="focus-section-heading">
    <div>
      <p>
        SESSION SUMMARY
      </p>

      <h2 id="focus-session-setup-title">
        Your focus setup
      </h2>

      <span>
        Check the task and duration before
        continuing into Focus mode.
      </span>
    </div>
  </div>


  <div className="focus-session-setup__summary">
    <article>
      <span>
        Task
      </span>

      <strong>
        {selectedTask
          ? selectedTask.title
          : "Choose a task"}
      </strong>

      {selectedTask && (
        <small>
          {
            subjectMap.get(
              String(
                selectedTask
                  .subjectId
              )
            ) ||
            "Unknown subject"
          }
        </small>
      )}
    </article>


    <article>
      <span>
        Focus time
      </span>

      <strong>
        {selectedDurationMinutes
          ? formatDuration(
              selectedDurationMinutes
            )
          : "Choose a duration"}
      </strong>

      {selectedDurationOption && (
        <small>
          {
            selectedDurationPreset
              ?.label ||
            "Custom"
          }
        </small>
      )}
    </article>
  </div>


  <div className="focus-session-setup__footer">
    <div>
      <strong>
        {canContinueToFocus
          ? "Your session setup is ready."
          : "Choose a task and valid duration to continue."}
      </strong>

      <p>
        The active countdown has not started
        yet.
      </p>
    </div>


    {canContinueToFocus ? (
      <Link
        to="/focus/session"
        state={{
          focusSetup: {
            taskId:
              selectedTask.id,

            durationMinutes:
              selectedDurationMinutes,

            durationOption:
              selectedDurationOption,
          },
        }}
        className="focus-session-setup__continue"
      >
        Continue to focus

        <ArrowRight
          size={17}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </Link>
    ) : (
      <button
        type="button"
        className="focus-session-setup__continue"
        disabled
      >
        Continue to focus

        <ArrowRight
          size={17}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>
    )}
  </div>
</section>
    </main>
  );
}


export default FocusPage;