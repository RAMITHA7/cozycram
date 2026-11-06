import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Coffee,
  Pause,
  Play,
  ShieldCheck,
  Square,
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
  saveTasks,
} from "../../services/studyDataService.js";

import {
  calculateFocusTimerRemainingSeconds,
  createFocusSessionEndSnapshot,
  createFocusTaskResultSummary,
  createFocusTaskUpdate,
  createFocusTimerResumeRuntime,
  createFocusTimerRuntime,
  FOCUS_DURATION_OPTION,
  FOCUS_SESSION_END_REASON,
  FOCUS_TASK_RESULT_ACTION,
  FOCUS_TIMER_STATUS,
  validateFocusSessionHandoff,
} from "../../services/focusSessionService.js";

import {
  createSmartBreakHandoff,
  createSmartBreakReadySelection,
  evaluateSmartBreakEligibility,
  SMART_BREAK_READY_ACTION,
  SMART_BREAK_STATUS,
} from "../../services/smartBreakService.js";

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

const [
  sessionEndSnapshot,
  setSessionEndSnapshot,
] = useState(
  null
);


const [
  endConfirmationOpen,
  setEndConfirmationOpen,
] = useState(
  false
);

const [
  taskResultAction,
  setTaskResultAction,
] = useState(
  null
);


const [
  taskResultError,
  setTaskResultError,
] = useState(
  ""
);


const [
  taskResultNotice,
  setTaskResultNotice,
] = useState(
  ""
);


const [
  taskResultApplied,
  setTaskResultApplied,
] = useState(
  false
);

const [
  smartBreakSelection,
  setSmartBreakSelection,
] = useState(
  null
);


const [
  smartBreakSelectionError,
  setSmartBreakSelectionError,
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
  const endedAtMs =
    Date.now();


  const endResult =
    createFocusSessionEndSnapshot({
      plannedDurationSeconds:
        sessionDraft
          .durationMinutes *
        60,

      remainingSeconds:
        0,

      endedAtMs,

      reason:
        FOCUS_SESSION_END_REASON
          .TIMER_COMPLETE,
    });


  if (
    !endResult.valid
  ) {
    setTimerError(
      endResult.error
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
    0
  );


  setSessionEndSnapshot(
    endResult.snapshot
  );


  setTimerStatus(
    FOCUS_TIMER_STATUS
      .COMPLETE
  );


  setTimerRuntime(
    null
  );


  setEndConfirmationOpen(
    false
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
  sessionDraft
    ?.durationMinutes,
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

    setSessionEndSnapshot(
  null
);


setEndConfirmationOpen(
  false
);

setTaskResultAction(
  null
);


setTaskResultError(
  ""
);


setTaskResultNotice(
  ""
);


setTaskResultApplied(
  false
);

setTaskResultAction(
  null
);


setTaskResultError(
  ""
);


setTaskResultNotice(
  ""
);


setTaskResultApplied(
  false
);

setSmartBreakSelection(
  null
);


setSmartBreakSelectionError(
  ""
);

setSmartBreakSelection(
  null
);


setSmartBreakSelectionError(
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

  const handlePauseFocus =
  () => {
    if (
      timerStatus !==
        FOCUS_TIMER_STATUS
          .RUNNING ||
      !timerRuntime ||
      !sessionDraft
    ) {
      return;
    }


    setTimerError(
      ""
    );


    const pausedAtMs =
      Date.now();


    const nextRemainingSeconds =
      calculateFocusTimerRemainingSeconds({
        endAtMs:
          timerRuntime
            .endAtMs,

        currentTimeMs:
          pausedAtMs,
      });


    if (
      nextRemainingSeconds ===
      null
    ) {
      setTimerError(
        "CozyCram could not safely pause this Focus session."
      );

      return;
    }


    if (
      nextRemainingSeconds ===
      0
    ) {
      const endResult =
        createFocusSessionEndSnapshot({
          plannedDurationSeconds:
            sessionDraft
              .durationMinutes *
            60,

          remainingSeconds:
            0,

          endedAtMs:
            pausedAtMs,

          reason:
            FOCUS_SESSION_END_REASON
              .TIMER_COMPLETE,
        });


      if (
        !endResult.valid
      ) {
        setTimerError(
          endResult.error
        );

        return;
      }


      setRemainingSeconds(
        0
      );


      setSessionEndSnapshot(
        endResult.snapshot
      );


      setTimerRuntime(
        null
      );


      setTimerStatus(
        FOCUS_TIMER_STATUS
          .COMPLETE
      );


      setEndConfirmationOpen(
        false
      );


      return;
    }


    setRemainingSeconds(
      nextRemainingSeconds
    );


    setTimerRuntime(
      null
    );


    setTimerStatus(
      FOCUS_TIMER_STATUS
        .PAUSED
    );


    setEndConfirmationOpen(
      false
    );
  };

  const handleResumeFocus =
  () => {
    if (
      timerStatus !==
        FOCUS_TIMER_STATUS
          .PAUSED ||
      remainingSeconds <= 0
    ) {
      return;
    }


    setTimerError(
      ""
    );


    const resumeResult =
      createFocusTimerResumeRuntime({
        remainingSeconds,

        resumedAtMs:
          Date.now(),
      });


    if (
      !resumeResult.valid
    ) {
      setTimerError(
        resumeResult.error
      );

      return;
    }


    setTimerRuntime(
      resumeResult.runtime
    );


    setTimerStatus(
      FOCUS_TIMER_STATUS
        .RUNNING
    );


    setEndConfirmationOpen(
      false
    );
  };

  const handleRequestEndSession =
  () => {
    if (
      timerStatus !==
        FOCUS_TIMER_STATUS
          .RUNNING &&
      timerStatus !==
        FOCUS_TIMER_STATUS
          .PAUSED
    ) {
      return;
    }


    setEndConfirmationOpen(
      true
    );
  };

  const handleCancelEndSession =
  () => {
    setEndConfirmationOpen(
      false
    );
  };

  const handleConfirmEndSession =
  () => {
    if (
      !sessionDraft ||
      (
        timerStatus !==
          FOCUS_TIMER_STATUS
            .RUNNING &&
        timerStatus !==
          FOCUS_TIMER_STATUS
            .PAUSED
      )
    ) {
      return;
    }


    setTimerError(
      ""
    );


    const endedAtMs =
      Date.now();


    let finalRemainingSeconds =
      remainingSeconds;


    if (
      timerStatus ===
        FOCUS_TIMER_STATUS
          .RUNNING
    ) {
      if (
        !timerRuntime
      ) {
        setTimerError(
          "CozyCram could not safely end the active Focus session."
        );

        return;
      }


      const calculatedRemaining =
        calculateFocusTimerRemainingSeconds({
          endAtMs:
            timerRuntime
              .endAtMs,

          currentTimeMs:
            endedAtMs,
        });


      if (
        calculatedRemaining ===
        null
      ) {
        setTimerError(
          "CozyCram could not safely calculate the final Focus time."
        );

        return;
      }


      finalRemainingSeconds =
        calculatedRemaining;
    }


    const reachedZero =
      finalRemainingSeconds ===
      0;


    const endResult =
      createFocusSessionEndSnapshot({
        plannedDurationSeconds:
          sessionDraft
            .durationMinutes *
          60,

        remainingSeconds:
          finalRemainingSeconds,

        endedAtMs,

        reason:
          reachedZero
            ? FOCUS_SESSION_END_REASON
                .TIMER_COMPLETE
            : FOCUS_SESSION_END_REASON
                .USER_ENDED,
      });


    if (
      !endResult.valid
    ) {
      setTimerError(
        endResult.error
      );

      return;
    }


    setRemainingSeconds(
      finalRemainingSeconds
    );


    setSessionEndSnapshot(
      endResult.snapshot
    );


    setTimerRuntime(
      null
    );


    setTimerStatus(
      reachedZero
        ? FOCUS_TIMER_STATUS
            .COMPLETE
        : FOCUS_TIMER_STATUS
            .ENDED
    );


    setEndConfirmationOpen(
      false
    );
  };

  const timerIsReady =
  timerStatus ===
  FOCUS_TIMER_STATUS.READY;


const timerIsRunning =
  timerStatus ===
  FOCUS_TIMER_STATUS.RUNNING;


const timerIsPaused =
  timerStatus ===
  FOCUS_TIMER_STATUS.PAUSED;


const timerIsComplete =
  timerStatus ===
  FOCUS_TIMER_STATUS.COMPLETE;


const timerIsEnded =
  timerStatus ===
  FOCUS_TIMER_STATUS.ENDED;


const timerIsActive =
  timerIsRunning ||
  timerIsPaused;

  const sessionHasEnded =
  Boolean(
    sessionEndSnapshot
  ) &&
  (
    timerIsComplete ||
    timerIsEnded
  );

const smartBreakEligibilityResult =
  sessionHasEnded
    ? evaluateSmartBreakEligibility({
        preferences:
          studyData
            ?.preferences,

        sessionEndSnapshot,
      })
    : null;


const smartBreakDecision =
  smartBreakEligibilityResult
    ?.decision ??
  null;

  const smartBreakHandoffResult =
  smartBreakDecision
    ?.eligible &&
  sessionDraft
    ? createSmartBreakHandoff({
        decision:
          smartBreakDecision,

        sessionEndSnapshot,

        taskId:
          sessionDraft
            .task
            .id,
      })
    : null;


const smartBreakHandoff =
  smartBreakHandoffResult
    ?.valid
    ? smartBreakHandoffResult
        .handoff
    : null;

    const smartBreakCanBeShown =
  timerIsComplete &&
  Boolean(
    sessionEndSnapshot
  );


const smartBreakIsReady =
  smartBreakCanBeShown &&
  smartBreakEligibilityResult
    ?.valid === true &&
  smartBreakDecision
    ?.status ===
    SMART_BREAK_STATUS
      .ELIGIBLE &&
  Boolean(
    smartBreakHandoff
  );


const smartBreakIsDisabled =
  smartBreakCanBeShown &&
  smartBreakEligibilityResult
    ?.valid === true &&
  smartBreakDecision
    ?.status ===
    SMART_BREAK_STATUS
      .DISABLED;


const smartBreakHasError =
  smartBreakCanBeShown &&
  smartBreakEligibilityResult &&
  smartBreakEligibilityResult
    .valid === false;

    const smartBreakStartRequested =
  smartBreakSelection
    ?.action ===
  SMART_BREAK_READY_ACTION
    .START_BREAK;


const smartBreakSkipped =
  smartBreakSelection
    ?.action ===
  SMART_BREAK_READY_ACTION
    .CONTINUE_WITHOUT_BREAK;

    const handleSmartBreakSelection =
  (
    action
  ) => {
    if (
      !smartBreakIsReady ||
      !smartBreakHandoff
    ) {
      return;
    }


    setSmartBreakSelectionError(
      ""
    );


    const selectionResult =
      createSmartBreakReadySelection({
        handoff:
          smartBreakHandoff,

        action,
      });


    if (
      !selectionResult.valid
    ) {
      setSmartBreakSelectionError(
        selectionResult.error
      );

      return;
    }


    setSmartBreakSelection(
      selectionResult
        .selection
    );
  };

  const handleStartBreak =
  () => {
    handleSmartBreakSelection(
      SMART_BREAK_READY_ACTION
        .START_BREAK
    );
  };

  const handleContinueWithoutBreak =
  () => {
    handleSmartBreakSelection(
      SMART_BREAK_READY_ACTION
        .CONTINUE_WITHOUT_BREAK
    );
  };

  const handleChangeSmartBreakChoice =
  () => {
    setSmartBreakSelection(
      null
    );


    setSmartBreakSelectionError(
      ""
    );
  };

const taskResultSummaryResult =
  sessionHasEnded &&
  sessionDraft
    ? createFocusTaskResultSummary({
        task:
          sessionDraft.task,

        sessionEndSnapshot,
      })
    : null;


const taskResultSummary =
  taskResultSummaryResult
    ?.valid
    ? taskResultSummaryResult
        .summary
    : null;

    const handleConfirmTaskResult =
  () => {
    if (
      !sessionEndSnapshot ||
      !sessionDraft ||
      !taskResultAction ||
      taskResultApplied
    ) {
      return;
    }


    setTaskResultError(
      ""
    );


    setTaskResultNotice(
      ""
    );


    const latestDataResult =
      loadStudyData();


    if (
      latestDataResult.error ||
      !latestDataResult.data
    ) {
      setTaskResultError(
        latestDataResult.error ||
        "CozyCram could not reload the current task safely."
      );

      return;
    }


    const latestTasks =
      Array.isArray(
        latestDataResult
          .data
          .tasks
      )
        ? latestDataResult
            .data
            .tasks
        : [];


    const currentTask =
      latestTasks.find(
        (task) =>
          String(
            task.id
          ) ===
          String(
            sessionDraft
              .task
              .id
          )
      );


    if (
      !currentTask
    ) {
      setTaskResultError(
        "The linked task no longer exists, so this Focus result cannot update it."
      );

      return;
    }


    const updateResult =
      createFocusTaskUpdate({
        task:
          currentTask,

        sessionEndSnapshot,

        action:
          taskResultAction,

        completedAtIso:
          taskResultAction ===
          FOCUS_TASK_RESULT_ACTION
            .MARK_COMPLETE
            ? new Date()
                .toISOString()
            : null,
      });


    if (
      !updateResult.valid
    ) {
      setTaskResultError(
        updateResult.error
      );

      return;
    }


    if (
      !updateResult
        .update
        .changed
    ) {
      setTaskResultApplied(
        true
      );


      setTaskResultNotice(
        "Task kept open. No task data was changed."
      );


      return;
    }


    const nextTasks =
      latestTasks.map(
        (task) =>
          String(
            task.id
          ) ===
          String(
            currentTask.id
          )
            ? updateResult
                .update
                .nextTask
            : task
      );


    const saveResult =
      saveTasks(
        nextTasks
      );


    if (
      !saveResult.success
    ) {
      setTaskResultError(
        saveResult.error
      );

      return;
    }


    setTaskResultApplied(
      true
    );


    if (
      taskResultAction ===
      FOCUS_TASK_RESULT_ACTION
        .REDUCE_ESTIMATE
    ) {
      setTaskResultNotice(
        `Remaining estimate updated to ${formatDuration(
          updateResult
            .update
            .nextTask
            .estimatedMinutes
        )}.`
      );


      return;
    }


    setTaskResultNotice(
      `${currentTask.title} was marked complete.`
    );
  };

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
        {timerIsActive ? (
  <span className="focus-session-header__back focus-session-header__back--inactive">
    <Timer
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    Session active
  </span>
) : (
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
)}


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

{timerIsPaused &&
  "Focus paused"}

{timerIsComplete &&
  "Focus timer complete"}

{timerIsEnded &&
  "Session ended"}
      </h2>
    </div>


    <span className="focus-session-timer__status">
      {timerIsReady &&
  "Ready"}

{timerIsRunning &&
  "Focusing"}

{timerIsPaused &&
  "Paused"}

{timerIsComplete &&
  "Complete"}

{timerIsEnded &&
  "Ended"}
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
  <>
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
          The countdown follows the real
          end timestamp. Pause temporarily
          freezes your remaining Focus time.
        </p>
      </div>
    </div>


    <div className="focus-session-timer__controls">
      <button
        type="button"
        className="focus-session-timer__control focus-session-timer__control--primary"
        onClick={
          handlePauseFocus
        }
      >
        <Pause
          size={17}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        Pause
      </button>


      <button
        type="button"
        className="focus-session-timer__control"
        onClick={
          handleRequestEndSession
        }
      >
        <Square
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        End session
      </button>
    </div>
  </>
)}

{timerIsPaused && (
  <>
    <div
      className="focus-session-timer__notice"
      role="status"
      aria-live="polite"
    >
      <Pause
        size={20}
        strokeWidth={1.8}
        aria-hidden="true"
      />

      <div>
        <strong>
          Focus paused
        </strong>

        <p>
          The remaining time is frozen.
          Resume when you're ready to
          continue this session.
        </p>
      </div>
    </div>


    <div className="focus-session-timer__controls">
      <button
        type="button"
        className="focus-session-timer__control focus-session-timer__control--primary"
        onClick={
          handleResumeFocus
        }
      >
        <Play
          size={17}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        Resume
      </button>


      <button
        type="button"
        className="focus-session-timer__control"
        onClick={
          handleRequestEndSession
        }
      >
        <Square
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        End session
      </button>
    </div>
  </>
)}

{endConfirmationOpen &&
  timerIsActive && (
  <div
    className="focus-session-timer__end-confirmation"
    role="group"
    aria-labelledby="focus-end-confirmation-title"
  >
    <div>
      <strong id="focus-end-confirmation-title">
        End this Focus session?
      </strong>

      <p>
        {timerIsRunning
          ? "The timer is still running until you confirm. Ending now will stop this session early."
          : "The timer is paused. Ending now will close this session with the current remaining time."}
      </p>
    </div>


    <div className="focus-session-timer__end-actions">
      <button
        type="button"
        onClick={
          handleCancelEndSession
        }
      >
        Keep session
      </button>


      <button
        type="button"
        className="focus-session-timer__end-now"
        onClick={
          handleConfirmEndSession
        }
      >
        End now
      </button>
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
        Focus timer complete
      </strong>

      <p>
        The full selected Focus duration
        reached zero. No task progress has
        been recorded yet.
      </p>
    </div>
  </div>
)}

{timerIsEnded &&
  sessionEndSnapshot && (
  <div
    className="focus-session-timer__notice"
    role="status"
    aria-live="polite"
  >
    <Square
      size={20}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <div>
      <strong>
        Session ended
      </strong>

      <p>
        You focused for approximately{" "}
        {
          formatTimerClock(
            sessionEndSnapshot
              .elapsedSeconds
          )
        }.
        {" "}
        {
          formatTimerClock(
            sessionEndSnapshot
              .remainingSeconds
          )
        }
        {" "}
        remained. Nothing has been written
        to task progress yet.
      </p>
    </div>
  </div>
)}
</section>
{sessionHasEnded &&
  taskResultSummary && (
  <section
    className="focus-session-result"
    aria-labelledby="focus-session-result-title"
  >
    <div className="focus-session-result__heading">
      <div>
        <p>
          SESSION RESULT
        </p>

        <h2 id="focus-session-result-title">
          Link this Focus time to your task
        </h2>

        <span>
          CozyCram will only change the
          linked task after you choose an
          outcome and confirm it.
        </span>
      </div>
    </div>


    <div
      className="focus-session-result__summary"
      aria-label="Focus session result"
    >
      <article>
        <span>
          Focused time
        </span>

        <strong>
          {
            formatTimerClock(
              taskResultSummary
                .elapsedSeconds
            )
          }
        </strong>

        <small>
          Exact timer result
        </small>
      </article>


      <article>
        <span>
          Whole focus minutes
        </span>

        <strong>
          {
            taskResultSummary
              .focusedWholeMinutes
          }
          {" min"}
        </strong>

        <small>
          Eligible for estimate reduction
        </small>
      </article>


      <article>
        <span>
          Current task estimate
        </span>

        <strong>
          {
            formatDuration(
              taskResultSummary
                .currentEstimatedMinutes
            )
          }
        </strong>

        <small>
          Current session snapshot
        </small>
      </article>
    </div>


    <div
      className="focus-session-result__choices"
      role="group"
      aria-label="Choose how this Focus session affects the task"
    >
      <button
        type="button"
        className="focus-session-result__choice"
        aria-pressed={
          taskResultAction ===
          FOCUS_TASK_RESULT_ACTION
            .KEEP_OPEN
        }
        disabled={
          taskResultApplied
        }
        onClick={
          () =>
            setTaskResultAction(
              FOCUS_TASK_RESULT_ACTION
                .KEEP_OPEN
            )
        }
      >
        <BookOpen
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <div>
          <strong>
            Keep task open
          </strong>

          <span>
            Leave the task exactly as it is.
          </span>
        </div>
      </button>


      <button
        type="button"
        className="focus-session-result__choice"
        aria-pressed={
          taskResultAction ===
          FOCUS_TASK_RESULT_ACTION
            .REDUCE_ESTIMATE
        }
        disabled={
          taskResultApplied ||
          !taskResultSummary
            .canReduceEstimate
        }
        onClick={
          () =>
            setTaskResultAction(
              FOCUS_TASK_RESULT_ACTION
                .REDUCE_ESTIMATE
            )
        }
      >
        <Clock3
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <div>
          <strong>
            Update remaining estimate
          </strong>

          <span>
            {taskResultSummary
              .canReduceEstimate
              ? `${formatDuration(
                  taskResultSummary
                    .currentEstimatedMinutes
                )} → ${formatDuration(
                  taskResultSummary
                    .estimatedMinutesAfterFocus
                )}`
              : taskResultSummary
                  .reduceEstimateMessage}
          </span>
        </div>
      </button>


      <button
        type="button"
        className="focus-session-result__choice"
        aria-pressed={
          taskResultAction ===
          FOCUS_TASK_RESULT_ACTION
            .MARK_COMPLETE
        }
        disabled={
          taskResultApplied
        }
        onClick={
          () =>
            setTaskResultAction(
              FOCUS_TASK_RESULT_ACTION
                .MARK_COMPLETE
            )
        }
      >
        <CheckCircle2
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <div>
          <strong>
            Mark task complete
          </strong>

          <span>
            Explicitly complete the linked task.
          </span>
        </div>
      </button>
    </div>


    {taskResultError && (
      <div
        className="focus-session-result__message"
        role="alert"
      >
        <CircleAlert
          size={19}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <p>
          {taskResultError}
        </p>
      </div>
    )}


    {taskResultNotice && (
      <div
        className="focus-session-result__message"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2
          size={19}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <p>
          {taskResultNotice}
        </p>
      </div>
    )}


    <div className="focus-session-result__footer">
      <div>
        <strong>
          {taskResultApplied
            ? "Task outcome confirmed."
            : taskResultAction
              ? "Review your choice, then confirm it."
              : "Choose what this Focus session means for the task."}
        </strong>

        <p>
          The session itself is not stored
          as a separate history record in V1.
        </p>
      </div>


      {!taskResultApplied ? (
        <button
          type="button"
          className="focus-session-result__confirm"
          disabled={
            !taskResultAction
          }
          onClick={
            handleConfirmTaskResult
          }
        >
          <CheckCircle2
            size={17}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          Confirm task outcome
        </button>
      ) : (
        <div className="focus-session-result__next">
          <Link
            to="/focus"
          >
            New Focus session
          </Link>


          <Link
            to={`/planner/tasks/${sessionDraft.task.id}`}
          >
            View task

            <ArrowRight
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </Link>
        </div>
      )}
    </div>
  </section>
)}

{smartBreakIsReady && (
  <section
    className="focus-smart-break"
    aria-labelledby="focus-smart-break-title"
  >
    <div
      className="focus-smart-break__icon"
      aria-hidden="true"
    >
      <Coffee
        size={26}
        strokeWidth={1.8}
      />
    </div>


    <div className="focus-smart-break__content">
      <p>
        SMART BREAK
      </p>

      <h2 id="focus-smart-break-title">
        {
          smartBreakHandoff
            .breakPlan
            .durationMinutes
        }
        -minute break ready
      </h2>

      <span>
        Your Focus timer reached its
        planned end. Choose whether to
        take the saved break or continue
        without starting it.
      </span>


      <div className="focus-smart-break__meta">
        <div>
          <small>
            Saved break
          </small>

          <strong>
            {
              formatDuration(
                smartBreakHandoff
                  .breakPlan
                  .durationMinutes
              )
            }
          </strong>
        </div>


        <div>
          <small>
            Focus preset
          </small>

          <strong>
            {
              formatDurationOption(
                smartBreakHandoff
                  .breakPlan
                  .focusPreset
              )
            }
          </strong>
        </div>
      </div>


      {!smartBreakSelection && (
        <div className="focus-smart-break__ready">
          <div
            className="focus-smart-break__notice"
            role="status"
            aria-live="polite"
          >
            <Coffee
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <p>
              Break ready. Nothing starts
              until you choose an action.
            </p>
          </div>


          <div className="focus-smart-break__actions">
            <button
              type="button"
              className="focus-smart-break__action focus-smart-break__action--primary"
              onClick={
                handleStartBreak
              }
            >
              <Coffee
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              Start break
            </button>


            <button
              type="button"
              className="focus-smart-break__action"
              onClick={
                handleContinueWithoutBreak
              }
            >
              <ArrowRight
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              Continue without break
            </button>
          </div>
        </div>
      )}


      {smartBreakStartRequested && (
        <div
          className="focus-smart-break__choice"
          role="status"
          aria-live="polite"
        >
          <Coffee
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <strong>
              Break selected
            </strong>

            <p>
              Your{" "}
              {
                smartBreakSelection
                  .breakPlan
                  .durationMinutes
              }
              -minute break is ready.
              The countdown has not started yet.
            </p>
          </div>


          <button
            type="button"
            onClick={
              handleChangeSmartBreakChoice
            }
          >
            Change choice
          </button>
        </div>
      )}


      {smartBreakSkipped && (
        <div
          className="focus-smart-break__choice"
          role="status"
          aria-live="polite"
        >
          <ArrowRight
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <strong>
              Continuing without break
            </strong>

            <p>
              No Smart Break timer will
              start from this Focus session.
            </p>
          </div>


          <button
            type="button"
            onClick={
              handleChangeSmartBreakChoice
            }
          >
            Change choice
          </button>
        </div>
      )}


      {smartBreakSelectionError && (
        <div
          className="focus-smart-break__selection-error"
          role="alert"
        >
          <CircleAlert
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <p>
            {
              smartBreakSelectionError
            }
          </p>
        </div>
      )}
    </div>
  </section>
)}

{smartBreakIsDisabled && (
  <section
    className="focus-smart-break focus-smart-break--muted"
    aria-labelledby="focus-smart-break-disabled-title"
  >
    <div
      className="focus-smart-break__icon"
      aria-hidden="true"
    >
      <Coffee
        size={26}
        strokeWidth={1.8}
      />
    </div>


    <div className="focus-smart-break__content">
      <p>
        SMART BREAK
      </p>

      <h2 id="focus-smart-break-disabled-title">
        No saved break for this rhythm
      </h2>

      <span>
        {
          smartBreakDecision
            .message
        }
      </span>
    </div>
  </section>
)}
{smartBreakHasError && (
  <section
    className="focus-smart-break focus-smart-break--error"
    role="alert"
    aria-labelledby="focus-smart-break-error-title"
  >
    <CircleAlert
      size={24}
      strokeWidth={1.8}
      aria-hidden="true"
    />


    <div className="focus-smart-break__content">
      <p>
        SMART BREAK
      </p>

      <h2 id="focus-smart-break-error-title">
        Break unavailable
      </h2>

      <span>
        {
          smartBreakEligibilityResult
            .error
        }
      </span>
    </div>
  </section>
)}
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
