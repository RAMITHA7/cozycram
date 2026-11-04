import {
  ArrowLeft,
  BookOpen,
  CircleAlert,
  Clock3,
  ShieldCheck,
  Timer,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  loadStudyData,
} from "../../services/studyDataService.js";

import {
  calculateFocusTimerRemainingSeconds,
  createFocusTimerRuntime,
  FOCUS_DURATION_OPTION,
  FOCUS_TIMER_STATUS,
  validateFocusSessionHandoff,
} from "../../services/focusSessionService.js";

import "./focusSession.css";


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


const formatPriority = (
  value
) => {
  if (
    value === "high"
  ) {
    return "High priority";
  }


  if (
    value === "medium"
  ) {
    return "Medium priority";
  }


  if (
    value === "low"
  ) {
    return "Low priority";
  }


  return "Priority not set";
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


const formatDurationOption = (
  value
) => {
  if (
    value ===
    FOCUS_DURATION_OPTION.QUICK
  ) {
    return "Quick";
  }


  if (
    value ===
    FOCUS_DURATION_OPTION.CLASSIC
  ) {
    return "Classic";
  }


  if (
    value ===
    FOCUS_DURATION_OPTION.DEEP
  ) {
    return "Deep";
  }


  if (
    value ===
    FOCUS_DURATION_OPTION.CUSTOM
  ) {
    return "Custom";
  }


  return "Focus";
};

const formatTimerClock = (
  value
) => {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(
        Number(
          value
        ) || 0
      )
    );


  const minutes =
    Math.floor(
      safeSeconds / 60
    );


  const seconds =
    safeSeconds % 60;


  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;
};

const createFocusRuntimeOnStart = (
  durationMinutes
) => {
  return createFocusTimerRuntime({
    durationMinutes,
    startedAtMs: Date.now(),
  });
};

function FocusSessionPageContent({
  location,
}) {


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


  const focusSetup =
    location.state
      ?.focusSetup;


  const handoffResult =
    !loadError
      ? validateFocusSessionHandoff({
          focusSetup,
          studyData,
        })
      : null;

const sessionDraft =
  handoffResult?.valid
    ? handoffResult
        .sessionDraft
    : null;

    const [
  timerStatus,
  setTimerStatus,
] = useState(
  FOCUS_TIMER_STATUS.READY
);


const [
  timerRuntime,
  setTimerRuntime,
] = useState(
  null
);


const [
  remainingSeconds,
  setRemainingSeconds,
] = useState(
  () =>
    sessionDraft
      ? sessionDraft
          .durationMinutes *
        60
      : 0
);


const [
  timerError,
  setTimerError,
] = useState(
  ""
);


useEffect(
  () => {
    if (
      timerStatus !==
        FOCUS_TIMER_STATUS
          .RUNNING ||
      !timerRuntime
    ) {
      return undefined;
    }


    const syncRemainingTime =
      () => {
        const nextRemainingSeconds =
          calculateFocusTimerRemainingSeconds({
            endAtMs:
              timerRuntime
                .endAtMs,

            currentTimeMs:
              Date.now(),
          });


        if (
          nextRemainingSeconds ===
          null
        ) {
          setTimerError(
            "CozyCram could not safely calculate the remaining Focus time."
          );


          setTimerStatus(
            FOCUS_TIMER_STATUS
              .READY
          );


          setTimerRuntime(
            null
          );


          return;
        }


        setRemainingSeconds(
          nextRemainingSeconds
        );


        if (
          nextRemainingSeconds ===
          0
        ) {
          setTimerStatus(
            FOCUS_TIMER_STATUS
              .COMPLETE
          );


          setTimerRuntime(
            null
          );
        }
      };


    syncRemainingTime();


    const intervalId =
      window.setInterval(
        syncRemainingTime,
        250
      );


    return () => {
      window.clearInterval(
        intervalId
      );
    };
  },
  [
    timerStatus,
    timerRuntime,
  ]
);

const handleStartFocus =
  () => {
    if (
      !sessionDraft ||
      timerStatus !==
        FOCUS_TIMER_STATUS
          .READY
    ) {
      return;
    }


    setTimerError(
      ""
    );


    const runtimeResult =
  createFocusRuntimeOnStart(
    sessionDraft.durationMinutes
  );


    if (
      !runtimeResult.valid
    ) {
      setTimerError(
        runtimeResult.error
      );

      return;
    }


    setRemainingSeconds(
      runtimeResult
        .runtime
        .durationSeconds
    );


    setTimerRuntime(
      runtimeResult.runtime
    );


    setTimerStatus(
      FOCUS_TIMER_STATUS
        .RUNNING
    );
  };

  const timerIsReady =
  timerStatus ===
  FOCUS_TIMER_STATUS.READY;


const timerIsRunning =
  timerStatus ===
  FOCUS_TIMER_STATUS.RUNNING;


const timerIsComplete =
  timerStatus ===
  FOCUS_TIMER_STATUS.COMPLETE;

  if (
    loadError
  ) {
    return (
      <main className="focus-session-page">
        <section
          className="focus-session-state"
          role="alert"
        >
          <CircleAlert
            size={30}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <h1>
              Focus session unavailable
            </h1>

            <p>
              CozyCram could not load your
              current study data safely.
            </p>
          </div>


          <Link
            to="/focus"
            className="focus-session-state__link"
          >
            Return to Focus
          </Link>
        </section>
      </main>
    );
  }


  if (
    !handoffResult.valid
  ) {
    return (
      <main className="focus-session-page">
        <section className="focus-session-state">
          <CircleAlert
            size={30}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <h1>
              Session setup unavailable
            </h1>

            <p>
              {
                handoffResult.error
              }
            </p>
          </div>


          <Link
            to="/focus"
            className="focus-session-state__link"
          >
            Choose session setup
          </Link>
        </section>
      </main>
    );
  }


  return (
    <main
      className="focus-session-page"
      aria-labelledby="focus-session-title"
    >
      <header className="focus-session-header">
        <Link
          to="/focus"
          className="focus-session-header__back"
        >
          <ArrowLeft
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          Change setup
        </Link>


        <div>
          <p className="focus-session-header__eyebrow">
            FOCUS SESSION
          </p>

          <h1 id="focus-session-title">
            Session ready
          </h1>

          <p className="focus-session-header__description">
            Your task and duration have
            been verified against your
            current CozyCram study data.
          </p>
        </div>
      </header>


      <section
        className="focus-session-card"
        aria-labelledby="focus-session-task-title"
      >
        <div
          className="focus-session-card__icon"
          aria-hidden="true"
        >
          <BookOpen
            size={26}
            strokeWidth={1.8}
          />
        </div>


        <div className="focus-session-card__content">
          <p>
            YOU'RE FOCUSING ON
          </p>

          <h2 id="focus-session-task-title">
            {
              sessionDraft
                .task
                .title
            }
          </h2>

          <span>
            {
              sessionDraft
                .subject
                .name
            }
          </span>
        </div>
      </section>


      <section
        className="focus-session-details"
        aria-label="Focus session details"
      >
        <article>
          <Timer
            size={21}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              Focus time
            </span>

            <strong>
              {
                formatDuration(
                  sessionDraft
                    .durationMinutes
                )
              }
            </strong>

            <small>
              {
                formatDurationOption(
                  sessionDraft
                    .durationOption
                )
              }
            </small>
          </div>
        </article>


        <article>
          <Clock3
            size={21}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              Estimated task work
            </span>

            <strong>
              {
                formatDuration(
                  sessionDraft
                    .task
                    .estimatedMinutes
                )
              }
            </strong>

            <small>
              {
                formatPriority(
                  sessionDraft
                    .task
                    .priority
                )
              }
            </small>
          </div>
        </article>


        <article>
          <BookOpen
            size={21}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              Due date
            </span>

            <strong>
              {
                formatDueDate(
                  sessionDraft
                    .task
                    .dueDate
                )
              }
            </strong>

            <small>
              Current task data
            </small>
          </div>
        </article>
      </section>


      <section
        className="focus-session-ready"
        aria-labelledby="focus-session-ready-title"
      >
        <ShieldCheck
          size={28}
          strokeWidth={1.8}
          aria-hidden="true"
        />


        <div>
          <p className="focus-session-ready__eyebrow">
            HANDOFF VERIFIED
          </p>

          <h2 id="focus-session-ready-title">
            Ready for Focus mode
          </h2>

          <p>
            The task is still open and
            the selected duration is valid.
            The countdown has not started.
          </p>
        </div>
      </section>
      <section
  className="focus-session-timer"
  aria-labelledby="focus-session-timer-title"
>
  <div className="focus-session-timer__heading">
    <div>
      <p>
        ACTIVE FOCUS
      </p>

      <h2 id="focus-session-timer-title">
        {timerIsReady &&
          "Start when you're ready"}

        {timerIsRunning &&
          "Focus in progress"}

        {timerIsComplete &&
          "Focus timer complete"}
      </h2>
    </div>


    <span className="focus-session-timer__status">
      {timerIsReady &&
        "Ready"}

      {timerIsRunning &&
        "Focusing"}

      {timerIsComplete &&
        "Complete"}
    </span>
  </div>


  <div
    className="focus-session-timer__clock"
    aria-live="off"
  >
    <span>
      {
        sessionDraft
          .subject
          .name
      }
    </span>

    <strong>
      {
        formatTimerClock(
          remainingSeconds
        )
      }
    </strong>

    <p>
      {
        sessionDraft
          .task
          .title
      }
    </p>
  </div>


  {timerError && (
    <div
      className="focus-session-timer__error"
      role="alert"
    >
      <CircleAlert
        size={19}
        strokeWidth={1.8}
        aria-hidden="true"
      />

      <p>
        {timerError}
      </p>
    </div>
  )}


  {timerIsReady && (
    <div className="focus-session-timer__action">
      <div>
        <strong>
          The timer starts only when
          you choose Start focus.
        </strong>

        <p>
          No study time has been
          recorded yet.
        </p>
      </div>


      <button
        type="button"
        onClick={
          handleStartFocus
        }
      >
        <Timer
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        Start focus
      </button>
    </div>
  )}


  {timerIsRunning && (
    <div
      className="focus-session-timer__notice"
      role="status"
    >
      <Timer
        size={20}
        strokeWidth={1.8}
        aria-hidden="true"
      />

      <div>
        <strong>
          Session in progress
        </strong>

        <p>
          CozyCram calculates the
          countdown from the real
          session end time, so switching
          browser tabs will not pause
          the clock.
        </p>
      </div>
    </div>
  )}


  {timerIsComplete && (
    <div
      className="focus-session-timer__notice"
      role="status"
      aria-live="polite"
    >
      <ShieldCheck
        size={22}
        strokeWidth={1.8}
        aria-hidden="true"
      />

      <div>
        <strong>
          Timer finished
        </strong>

        <p>
          The countdown reached zero.
          CozyCram has not recorded task
          progress or completion yet.
        </p>
      </div>
    </div>
  )}
</section>
        </main>
  );
}


function FocusSessionPage() {
  const location =
    useLocation();

  return (
    <FocusSessionPageContent
      key={location.key}
      location={location}
    />
  );
}


export default FocusSessionPage;
