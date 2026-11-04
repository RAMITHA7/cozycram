import {
  MIN_SCHEDULE_BLOCK_MINUTES,
} from "./schedulingEngine.js";


export const FOCUS_SESSION_VERSION =
  1;

export const FOCUS_TIMER_STATUS = {
  READY:
    "ready",

  RUNNING:
    "running",

  PAUSED:
    "paused",

  COMPLETE:
    "complete",

  ENDED:
    "ended",
};

export const FOCUS_SESSION_END_REASON = {
  TIMER_COMPLETE:
    "timer_complete",

  USER_ENDED:
    "user_ended",
};

export const FOCUS_DURATION_OPTION = {
  QUICK:
    "quick",

  CLASSIC:
    "classic",

  DEEP:
    "deep",

  CUSTOM:
    "custom",
};


const STANDARD_DURATION_MINUTES = {
  [FOCUS_DURATION_OPTION.QUICK]:
    25,

  [FOCUS_DURATION_OPTION.CLASSIC]:
    50,

  [FOCUS_DURATION_OPTION.DEEP]:
    90,
};


const normalizeId = (
  value
) =>
  String(
    value ?? ""
  ).trim();


const getSafeTaskSnapshot = (
  task
) => ({
  id:
    task.id,

  title:
    task.title,

  subjectId:
    task.subjectId,

  estimatedMinutes:
    task.estimatedMinutes,

  dueDate:
    task.dueDate,

  priority:
    task.priority,

  status:
    task.status,
});


const getSafeSubjectSnapshot = (
  subject
) => ({
  id:
    subject.id,

  name:
    subject.name,
});


export const validateFocusSessionHandoff = ({
  focusSetup,
  studyData,
}) => {
  if (
    !studyData ||
    typeof studyData !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Focus session validation requires current study data.",

      sessionDraft: null,
    };
  }


  if (
    !studyData.completed
  ) {
    return {
      valid: false,

      error:
        "Complete your study setup before starting a Focus session.",

      sessionDraft: null,
    };
  }


  if (
    !focusSetup ||
    typeof focusSetup !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Choose a task and duration from Focus before opening a session.",

      sessionDraft: null,
    };
  }


  const taskId =
    normalizeId(
      focusSetup.taskId
    );


  if (
    !taskId
  ) {
    return {
      valid: false,

      error:
        "The Focus session is missing its selected task.",

      sessionDraft: null,
    };
  }


  const tasks =
    Array.isArray(
      studyData.tasks
    )
      ? studyData.tasks
      : [];


  const task =
    tasks.find(
      (candidate) =>
        normalizeId(
          candidate.id
        ) ===
        taskId
    );


  if (
    !task
  ) {
    return {
      valid: false,

      error:
        "The selected task no longer exists. Choose another task before starting Focus.",

      sessionDraft: null,
    };
  }


  if (
    task.status !==
    "todo"
  ) {
    return {
      valid: false,

      error:
        "The selected task is no longer open. Choose a current open task before starting Focus.",

      sessionDraft: null,
    };
  }


  const subjects =
    Array.isArray(
      studyData.subjects
    )
      ? studyData.subjects
      : [];


  const subject =
    subjects.find(
      (candidate) =>
        normalizeId(
          candidate.id
        ) ===
        normalizeId(
          task.subjectId
        )
    );


  if (
    !subject
  ) {
    return {
      valid: false,

      error:
        "The selected task no longer has a valid subject.",

      sessionDraft: null,
    };
  }


  const durationOption =
    String(
      focusSetup
        .durationOption ??
        ""
    ).trim();


  const validDurationOptions =
    Object.values(
      FOCUS_DURATION_OPTION
    );


  if (
    !validDurationOptions.includes(
      durationOption
    )
  ) {
    return {
      valid: false,

      error:
        "The Focus session contains an unsupported duration option.",

      sessionDraft: null,
    };
  }


  const durationMinutes =
    Number(
      focusSetup
        .durationMinutes
    );


  if (
    !Number.isInteger(
      durationMinutes
    ) ||
    durationMinutes <
      MIN_SCHEDULE_BLOCK_MINUTES
  ) {
    return {
      valid: false,

      error:
        `Focus duration must be a whole number of at least ${MIN_SCHEDULE_BLOCK_MINUTES} minutes.`,

      sessionDraft: null,
    };
  }


  if (
    durationOption !==
    FOCUS_DURATION_OPTION.CUSTOM
  ) {
    const expectedMinutes =
      STANDARD_DURATION_MINUTES[
        durationOption
      ];


    if (
      durationMinutes !==
      expectedMinutes
    ) {
      return {
        valid: false,

        error:
          "The selected Focus duration does not match its duration option.",

        sessionDraft: null,
      };
    }
  }


  return {
    valid: true,

    error: "",

    sessionDraft: {
      version:
        FOCUS_SESSION_VERSION,

      task:
        getSafeTaskSnapshot(
          task
        ),

      subject:
        getSafeSubjectSnapshot(
          subject
        ),

      durationOption,

      durationMinutes,
    },
  };
};

export const createFocusTimerRuntime = ({
  durationMinutes,
  startedAtMs,
}) => {
  const safeDurationMinutes =
    Number(
      durationMinutes
    );


  const safeStartedAtMs =
    Number(
      startedAtMs
    );


  if (
    !Number.isInteger(
      safeDurationMinutes
    ) ||
    safeDurationMinutes <
      MIN_SCHEDULE_BLOCK_MINUTES
  ) {
    return {
      valid: false,

      error:
        `Focus duration must be a whole number of at least ${MIN_SCHEDULE_BLOCK_MINUTES} minutes.`,

      runtime: null,
    };
  }


  if (
    !Number.isFinite(
      safeStartedAtMs
    ) ||
    safeStartedAtMs < 0
  ) {
    return {
      valid: false,

      error:
        "Focus timer requires a valid explicit start time.",

      runtime: null,
    };
  }


  const durationSeconds =
    safeDurationMinutes *
    60;


  const endAtMs =
    safeStartedAtMs +
    durationSeconds *
      1000;


  return {
    valid: true,

    error: "",

    runtime: {
      durationMinutes:
        safeDurationMinutes,

      durationSeconds,

      startedAtMs:
        safeStartedAtMs,

      endAtMs,
    },
  };
};

export const createFocusTimerResumeRuntime = ({
  remainingSeconds,
  resumedAtMs,
}) => {
  const safeRemainingSeconds =
    Number(
      remainingSeconds
    );


  const safeResumedAtMs =
    Number(
      resumedAtMs
    );


  if (
    !Number.isInteger(
      safeRemainingSeconds
    ) ||
    safeRemainingSeconds <= 0
  ) {
    return {
      valid: false,

      error:
        "Focus resume requires a positive whole number of remaining seconds.",

      runtime: null,
    };
  }


  if (
    !Number.isFinite(
      safeResumedAtMs
    ) ||
    safeResumedAtMs < 0
  ) {
    return {
      valid: false,

      error:
        "Focus resume requires a valid explicit resume time.",

      runtime: null,
    };
  }


  return {
    valid: true,

    error: "",

    runtime: {
      remainingSecondsAtResume:
        safeRemainingSeconds,

      resumedAtMs:
        safeResumedAtMs,

      endAtMs:
        safeResumedAtMs +
        safeRemainingSeconds *
          1000,
    },
  };
};

export const calculateFocusTimerRemainingSeconds = ({
  endAtMs,
  currentTimeMs,
}) => {
  const safeEndAtMs =
    Number(
      endAtMs
    );


  const safeCurrentTimeMs =
    Number(
      currentTimeMs
    );


  if (
    !Number.isFinite(
      safeEndAtMs
    ) ||
    !Number.isFinite(
      safeCurrentTimeMs
    )
  ) {
    return null;
  }


  const remainingMilliseconds =
    safeEndAtMs -
    safeCurrentTimeMs;


  if (
    remainingMilliseconds <= 0
  ) {
    return 0;
  }


  return Math.ceil(
    remainingMilliseconds /
      1000
  );
};

export const createFocusSessionEndSnapshot = ({
  plannedDurationSeconds,
  remainingSeconds,
  endedAtMs,
  reason,
}) => {
  const safePlannedDurationSeconds =
    Number(
      plannedDurationSeconds
    );


  const safeRemainingSeconds =
    Number(
      remainingSeconds
    );


  const safeEndedAtMs =
    Number(
      endedAtMs
    );


  if (
    !Number.isInteger(
      safePlannedDurationSeconds
    ) ||
    safePlannedDurationSeconds <= 0
  ) {
    return {
      valid: false,

      error:
        "Focus session ending requires a valid planned duration.",

      snapshot: null,
    };
  }


  if (
    !Number.isInteger(
      safeRemainingSeconds
    ) ||
    safeRemainingSeconds < 0 ||
    safeRemainingSeconds >
      safePlannedDurationSeconds
  ) {
    return {
      valid: false,

      error:
        "Focus session ending received an invalid remaining-time value.",

      snapshot: null,
    };
  }


  if (
    !Number.isFinite(
      safeEndedAtMs
    ) ||
    safeEndedAtMs < 0
  ) {
    return {
      valid: false,

      error:
        "Focus session ending requires a valid explicit end time.",

      snapshot: null,
    };
  }


  if (
    !Object.values(
      FOCUS_SESSION_END_REASON
    ).includes(
      reason
    )
  ) {
    return {
      valid: false,

      error:
        "Focus session ending requires a valid end reason.",

      snapshot: null,
    };
  }


  const elapsedSeconds =
    safePlannedDurationSeconds -
    safeRemainingSeconds;


  return {
    valid: true,

    error: "",

    snapshot: {
      plannedDurationSeconds:
        safePlannedDurationSeconds,

      remainingSeconds:
        safeRemainingSeconds,

      elapsedSeconds,

      endedAtMs:
        safeEndedAtMs,

      reason,

      reachedZero:
        safeRemainingSeconds ===
        0,
    },
  };
};