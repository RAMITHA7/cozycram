import {
  resolveFocusPlan,
} from "./schedulingEngine.js";

import {
  FOCUS_SESSION_END_REASON,
} from "./focusSessionService.js";


export const SMART_BREAK_VERSION =
  1;

export const SMART_BREAK_HANDOFF_VERSION =
  1;

export const SMART_BREAK_STATUS = {
  ELIGIBLE:
    "eligible",

  NOT_ELIGIBLE:
    "not_eligible",

  DISABLED:
    "disabled",
};

export const SMART_BREAK_READY_ACTION = {
  START_BREAK:
    "start_break",

  CONTINUE_WITHOUT_BREAK:
    "continue_without_break",
};

export const SMART_BREAK_TIMER_STATUS = {
  IDLE:
    "idle",

  RUNNING:
    "running",

  COMPLETE:
    "complete",

  ENDED:
    "ended",
};

export const SMART_BREAK_END_REASON = {
  TIMER_COMPLETE:
    "timer_complete",

  USER_ENDED:
    "user_ended",
};

export const SMART_BREAK_OUTCOME = {
  COMPLETED:
    "completed",

  ENDED_EARLY:
    "ended_early",

  SKIPPED:
    "skipped",
};

export const SMART_BREAK_REASON = {
  FOCUS_COMPLETED:
    "focus_completed",

  FOCUS_NOT_COMPLETE:
    "focus_not_complete",

  BREAK_DISABLED:
    "break_disabled",

  INVALID_PREFERENCES:
    "invalid_preferences",

  INVALID_SESSION_RESULT:
    "invalid_session_result",
};


const validateSessionEndSnapshot = (
  sessionEndSnapshot
) => {
  if (
    !sessionEndSnapshot ||
    typeof sessionEndSnapshot !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Smart Break review requires a Focus session result.",
    };
  }


  const plannedDurationSeconds =
    Number(
      sessionEndSnapshot
        .plannedDurationSeconds
    );


  const remainingSeconds =
    Number(
      sessionEndSnapshot
        .remainingSeconds
    );


  const elapsedSeconds =
    Number(
      sessionEndSnapshot
        .elapsedSeconds
    );


  if (
    !Number.isInteger(
      plannedDurationSeconds
    ) ||
    plannedDurationSeconds <= 0
  ) {
    return {
      valid: false,

      error:
        "Smart Break review received an invalid planned Focus duration.",
    };
  }


  if (
    !Number.isInteger(
      remainingSeconds
    ) ||
    remainingSeconds < 0 ||
    remainingSeconds >
      plannedDurationSeconds
  ) {
    return {
      valid: false,

      error:
        "Smart Break review received invalid remaining Focus time.",
    };
  }


  if (
    !Number.isInteger(
      elapsedSeconds
    ) ||
    elapsedSeconds < 0 ||
    elapsedSeconds >
      plannedDurationSeconds
  ) {
    return {
      valid: false,

      error:
        "Smart Break review received invalid elapsed Focus time.",
    };
  }


  if (
    elapsedSeconds +
      remainingSeconds !==
    plannedDurationSeconds
  ) {
    return {
      valid: false,

      error:
        "Smart Break review received inconsistent Focus-session accounting.",
    };
  }


  const reason =
    sessionEndSnapshot
      .reason;


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
        "Smart Break review received an unsupported Focus-session end reason.",
    };
  }


  return {
    valid: true,

    error: "",
  };
};


const createBaseDecision = ({
  status,
  reason,
  breakMinutes = 0,
  focusPreset = null,
  message,
}) => ({
  version:
    SMART_BREAK_VERSION,

  status,

  reason,

  eligible:
    status ===
    SMART_BREAK_STATUS
      .ELIGIBLE,

  breakMinutes,

  breakSeconds:
    breakMinutes * 60,

  focusPreset,

  message,
});


export const evaluateSmartBreakEligibility = ({
  preferences,
  sessionEndSnapshot,
}) => {
  const sessionValidation =
    validateSessionEndSnapshot(
      sessionEndSnapshot
    );


  if (
    !sessionValidation.valid
  ) {
    return {
      valid: false,

      error:
        sessionValidation.error,

      decision:
        createBaseDecision({
          status:
            SMART_BREAK_STATUS
              .NOT_ELIGIBLE,

          reason:
            SMART_BREAK_REASON
              .INVALID_SESSION_RESULT,

          message:
            sessionValidation.error,
        }),
    };
  }


  const focusPlanResult =
    resolveFocusPlan(
      preferences
    );


  if (
    !focusPlanResult.valid
  ) {
    return {
      valid: false,

      error:
        focusPlanResult.error,

      decision:
        createBaseDecision({
          status:
            SMART_BREAK_STATUS
              .NOT_ELIGIBLE,

          reason:
            SMART_BREAK_REASON
              .INVALID_PREFERENCES,

          message:
            "CozyCram could not determine a safe break from the current Focus preference.",
        }),
    };
  }


  const focusPlan =
    focusPlanResult
      .focusPlan;


  const breakMinutes =
    Number(
      focusPlan
        .breakMinutes
    );


  if (
    !Number.isInteger(
      breakMinutes
    ) ||
    breakMinutes < 0
  ) {
    return {
      valid: false,

      error:
        "The saved Focus preference contains an invalid break duration.",

      decision:
        createBaseDecision({
          status:
            SMART_BREAK_STATUS
              .NOT_ELIGIBLE,

          reason:
            SMART_BREAK_REASON
              .INVALID_PREFERENCES,

          focusPreset:
            focusPlan.preset,

          message:
            "CozyCram could not determine a valid saved break duration.",
        }),
    };
  }


  if (
    breakMinutes === 0
  ) {
    return {
      valid: true,

      error: "",

      decision:
        createBaseDecision({
          status:
            SMART_BREAK_STATUS
              .DISABLED,

          reason:
            SMART_BREAK_REASON
              .BREAK_DISABLED,

          breakMinutes:
            0,

          focusPreset:
            focusPlan.preset,

          message:
            "Your saved Focus preference does not include a break.",
        }),
    };
  }


  const completedNaturally =
    sessionEndSnapshot
      .reason ===
      FOCUS_SESSION_END_REASON
        .TIMER_COMPLETE &&
    sessionEndSnapshot
      .remainingSeconds ===
      0 &&
    sessionEndSnapshot
      .elapsedSeconds ===
      sessionEndSnapshot
        .plannedDurationSeconds &&
    sessionEndSnapshot
      .reachedZero ===
      true;


  if (
    !completedNaturally
  ) {
    return {
      valid: true,

      error: "",

      decision:
        createBaseDecision({
          status:
            SMART_BREAK_STATUS
              .NOT_ELIGIBLE,

          reason:
            SMART_BREAK_REASON
              .FOCUS_NOT_COMPLETE,

          breakMinutes,

          focusPreset:
            focusPlan.preset,

          message:
            "Smart Break is offered after a Focus timer reaches its planned end.",
        }),
    };
  }


  return {
    valid: true,

    error: "",

    decision:
      createBaseDecision({
        status:
          SMART_BREAK_STATUS
            .ELIGIBLE,

        reason:
          SMART_BREAK_REASON
            .FOCUS_COMPLETED,

        breakMinutes,

        focusPreset:
          focusPlan.preset,

        message:
          `Focus complete. Your saved ${breakMinutes}-minute break is ready.`,
      }),
  };
};

export const createSmartBreakHandoff = ({
  decision,
  sessionEndSnapshot,
  taskId,
}) => {
  if (
    !decision ||
    typeof decision !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Smart Break handoff requires an eligibility decision.",

      handoff: null,
    };
  }


  if (
    decision.version !==
      SMART_BREAK_VERSION
  ) {
    return {
      valid: false,

      error:
        "Smart Break handoff received an unsupported decision version.",

      handoff: null,
    };
  }


  if (
    decision.status !==
      SMART_BREAK_STATUS
        .ELIGIBLE ||
    decision.eligible !== true ||
    decision.reason !==
      SMART_BREAK_REASON
        .FOCUS_COMPLETED
  ) {
    return {
      valid: false,

      error:
        "Only an eligible completed Focus session can create a Smart Break handoff.",

      handoff: null,
    };
  }


  const sessionValidation =
    validateSessionEndSnapshot(
      sessionEndSnapshot
    );


  if (
    !sessionValidation.valid
  ) {
    return {
      valid: false,

      error:
        sessionValidation.error,

      handoff: null,
    };
  }


  const completedNaturally =
    sessionEndSnapshot
      .reason ===
      FOCUS_SESSION_END_REASON
        .TIMER_COMPLETE &&
    sessionEndSnapshot
      .remainingSeconds ===
      0 &&
    sessionEndSnapshot
      .elapsedSeconds ===
      sessionEndSnapshot
        .plannedDurationSeconds &&
    sessionEndSnapshot
      .reachedZero ===
      true;


  if (
    !completedNaturally
  ) {
    return {
      valid: false,

      error:
        "Smart Break handoff requires a Focus timer that reached its planned end.",

      handoff: null,
    };
  }


  const breakMinutes =
    Number(
      decision.breakMinutes
    );


  const breakSeconds =
    Number(
      decision.breakSeconds
    );


  if (
    !Number.isInteger(
      breakMinutes
    ) ||
    breakMinutes <= 0
  ) {
    return {
      valid: false,

      error:
        "Smart Break handoff requires a positive saved break duration.",

      handoff: null,
    };
  }


  if (
    !Number.isInteger(
      breakSeconds
    ) ||
    breakSeconds !==
      breakMinutes * 60
  ) {
    return {
      valid: false,

      error:
        "Smart Break handoff received inconsistent break-duration accounting.",

      handoff: null,
    };
  }


  const normalizedTaskId =
    String(
      taskId ?? ""
    ).trim();


  if (
    !normalizedTaskId
  ) {
    return {
      valid: false,

      error:
        "Smart Break handoff requires the completed Focus task.",

      handoff: null,
    };
  }


  const focusEndedAtMs =
    Number(
      sessionEndSnapshot
        .endedAtMs
    );


  if (
    !Number.isFinite(
      focusEndedAtMs
    ) ||
    focusEndedAtMs < 0
  ) {
    return {
      valid: false,

      error:
        "Smart Break handoff requires a valid Focus completion time.",

      handoff: null,
    };
  }


  return {
    valid: true,

    error: "",

    handoff: {
      version:
        SMART_BREAK_HANDOFF_VERSION,

      sourceFocus: {
        taskId,

        endedAtMs:
          focusEndedAtMs,

        endReason:
          sessionEndSnapshot
            .reason,
      },

      breakPlan: {
        durationMinutes:
          breakMinutes,

        durationSeconds:
          breakSeconds,

        focusPreset:
          decision.focusPreset,
      },
    },
  };
};

export const createSmartBreakReadySelection = ({
  handoff,
  action,
}) => {
  if (
    !handoff ||
    typeof handoff !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Smart Break selection requires a valid break handoff.",

      selection: null,
    };
  }


  if (
    handoff.version !==
      SMART_BREAK_HANDOFF_VERSION
  ) {
    return {
      valid: false,

      error:
        "Smart Break selection received an unsupported handoff version.",

      selection: null,
    };
  }


  if (
    !Object.values(
      SMART_BREAK_READY_ACTION
    ).includes(
      action
    )
  ) {
    return {
      valid: false,

      error:
        "Choose a valid Smart Break action.",

      selection: null,
    };
  }


  const durationMinutes =
    Number(
      handoff
        .breakPlan
        ?.durationMinutes
    );


  const durationSeconds =
    Number(
      handoff
        .breakPlan
        ?.durationSeconds
    );


  if (
    !Number.isInteger(
      durationMinutes
    ) ||
    durationMinutes <= 0
  ) {
    return {
      valid: false,

      error:
        "Smart Break selection requires a positive break duration.",

      selection: null,
    };
  }


  if (
    !Number.isInteger(
      durationSeconds
    ) ||
    durationSeconds !==
      durationMinutes * 60
  ) {
    return {
      valid: false,

      error:
        "Smart Break selection received inconsistent break-duration accounting.",

      selection: null,
    };
  }


  return {
    valid: true,

    error: "",

    selection: {
      action,

      breakPlan: {
        durationMinutes,

        durationSeconds,

        focusPreset:
          handoff
            .breakPlan
            .focusPreset,
      },

      sourceFocus: {
        ...handoff
          .sourceFocus,
      },
    },
  };
};

export const createSmartBreakTimerRuntime = ({
  durationSeconds,
  startedAtMs,
}) => {
  const safeDurationSeconds =
    Number(
      durationSeconds
    );


  const safeStartedAtMs =
    Number(
      startedAtMs
    );


  if (
    !Number.isInteger(
      safeDurationSeconds
    ) ||
    safeDurationSeconds <= 0
  ) {
    return {
      valid: false,

      error:
        "Smart Break timer requires a positive whole-number duration.",

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
        "Smart Break timer requires a valid explicit start time.",

      runtime: null,
    };
  }


  return {
    valid: true,

    error: "",

    runtime: {
      durationSeconds:
        safeDurationSeconds,

      startedAtMs:
        safeStartedAtMs,

      endAtMs:
        safeStartedAtMs +
        safeDurationSeconds *
          1000,
    },
  };
};

export const calculateSmartBreakRemainingSeconds = ({
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

export const createSmartBreakEndSnapshot = ({
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
        "Smart Break ending requires a valid planned duration.",

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
        "Smart Break ending received an invalid remaining-time value.",

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
        "Smart Break ending requires a valid explicit end time.",

      snapshot: null,
    };
  }


  if (
    !Object.values(
      SMART_BREAK_END_REASON
    ).includes(
      reason
    )
  ) {
    return {
      valid: false,

      error:
        "Smart Break ending requires a valid end reason.",

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

export const createSmartBreakOutcomeSummary = ({
  selection,
  endSnapshot,
  timerStatus,
}) => {
  if (
    !selection ||
    typeof selection !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Smart Break outcome requires a valid break selection.",

      summary: null,
    };
  }


  if (
    !Object.values(
      SMART_BREAK_READY_ACTION
    ).includes(
      selection.action
    )
  ) {
    return {
      valid: false,

      error:
        "Smart Break outcome received an unsupported break action.",

      summary: null,
    };
  }


  const durationMinutes =
    Number(
      selection
        .breakPlan
        ?.durationMinutes
    );


  const durationSeconds =
    Number(
      selection
        .breakPlan
        ?.durationSeconds
    );


  if (
    !Number.isInteger(
      durationMinutes
    ) ||
    durationMinutes <= 0 ||
    !Number.isInteger(
      durationSeconds
    ) ||
    durationSeconds !==
      durationMinutes * 60
  ) {
    return {
      valid: false,

      error:
        "Smart Break outcome received invalid planned break duration.",

      summary: null,
    };
  }


  if (
    selection.action ===
      SMART_BREAK_READY_ACTION
        .CONTINUE_WITHOUT_BREAK
  ) {
    if (
      timerStatus !==
        SMART_BREAK_TIMER_STATUS
          .IDLE
    ) {
      return {
        valid: false,

        error:
          "A skipped Smart Break cannot have an active or completed break timer.",

        summary: null,
      };
    }


    if (
      endSnapshot !== null &&
      endSnapshot !== undefined
    ) {
      return {
        valid: false,

        error:
          "A skipped Smart Break cannot contain a break-end result.",

        summary: null,
      };
    }


    return {
      valid: true,

      error: "",

      summary: {
        outcome:
          SMART_BREAK_OUTCOME
            .SKIPPED,

        plannedDurationMinutes:
          durationMinutes,

        plannedDurationSeconds:
          durationSeconds,

        elapsedSeconds:
          0,

        remainingSeconds:
          durationSeconds,

        reachedZero:
          false,

        endedAtMs:
          null,

        focusPreset:
          selection
            .breakPlan
            .focusPreset,

        taskId:
          selection
            .sourceFocus
            ?.taskId,
      },
    };
  }


  if (
    selection.action !==
      SMART_BREAK_READY_ACTION
        .START_BREAK
  ) {
    return {
      valid: false,

      error:
        "Smart Break outcome requires a supported final action.",

      summary: null,
    };
  }


  if (
    !endSnapshot ||
    typeof endSnapshot !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "A started Smart Break requires a final break result.",

      summary: null,
    };
  }


  const plannedDurationSeconds =
    Number(
      endSnapshot
        .plannedDurationSeconds
    );


  const remainingSeconds =
    Number(
      endSnapshot
        .remainingSeconds
    );


  const elapsedSeconds =
    Number(
      endSnapshot
        .elapsedSeconds
    );


  const endedAtMs =
    Number(
      endSnapshot
        .endedAtMs
    );


  if (
    !Number.isInteger(
      plannedDurationSeconds
    ) ||
    plannedDurationSeconds !==
      durationSeconds
  ) {
    return {
      valid: false,

      error:
        "Smart Break outcome does not match the selected break duration.",

      summary: null,
    };
  }


  if (
    !Number.isInteger(
      remainingSeconds
    ) ||
    remainingSeconds < 0 ||
    remainingSeconds >
      durationSeconds
  ) {
    return {
      valid: false,

      error:
        "Smart Break outcome contains invalid remaining time.",

      summary: null,
    };
  }


  if (
    !Number.isInteger(
      elapsedSeconds
    ) ||
    elapsedSeconds < 0 ||
    elapsedSeconds >
      durationSeconds
  ) {
    return {
      valid: false,

      error:
        "Smart Break outcome contains invalid elapsed time.",

      summary: null,
    };
  }


  if (
    elapsedSeconds +
      remainingSeconds !==
    durationSeconds
  ) {
    return {
      valid: false,

      error:
        "Smart Break outcome contains inconsistent time accounting.",

      summary: null,
    };
  }


  if (
    !Number.isFinite(
      endedAtMs
    ) ||
    endedAtMs < 0
  ) {
    return {
      valid: false,

      error:
        "Smart Break outcome requires a valid explicit end time.",

      summary: null,
    };
  }


  const completedNaturally =
    timerStatus ===
      SMART_BREAK_TIMER_STATUS
        .COMPLETE &&
    endSnapshot.reason ===
      SMART_BREAK_END_REASON
        .TIMER_COMPLETE &&
    remainingSeconds ===
      0 &&
    elapsedSeconds ===
      durationSeconds &&
    endSnapshot.reachedZero ===
      true;


  if (
    completedNaturally
  ) {
    return {
      valid: true,

      error: "",

      summary: {
        outcome:
          SMART_BREAK_OUTCOME
            .COMPLETED,

        plannedDurationMinutes:
          durationMinutes,

        plannedDurationSeconds:
          durationSeconds,

        elapsedSeconds,

        remainingSeconds,

        reachedZero:
          true,

        endedAtMs,

        focusPreset:
          selection
            .breakPlan
            .focusPreset,

        taskId:
          selection
            .sourceFocus
            ?.taskId,
      },
    };
  }


  const endedEarly =
    timerStatus ===
      SMART_BREAK_TIMER_STATUS
        .ENDED &&
    endSnapshot.reason ===
      SMART_BREAK_END_REASON
        .USER_ENDED &&
    remainingSeconds > 0 &&
    elapsedSeconds <
      durationSeconds &&
    endSnapshot.reachedZero ===
      false;


  if (
    endedEarly
  ) {
    return {
      valid: true,

      error: "",

      summary: {
        outcome:
          SMART_BREAK_OUTCOME
            .ENDED_EARLY,

        plannedDurationMinutes:
          durationMinutes,

        plannedDurationSeconds:
          durationSeconds,

        elapsedSeconds,

        remainingSeconds,

        reachedZero:
          false,

        endedAtMs,

        focusPreset:
          selection
            .breakPlan
            .focusPreset,

        taskId:
          selection
            .sourceFocus
            ?.taskId,
      },
    };
  }


  return {
    valid: false,

    error:
      "Smart Break outcome does not match a supported completed, ended, or skipped state.",

    summary: null,
  };
};
