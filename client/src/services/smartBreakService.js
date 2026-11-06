import {
  resolveFocusPlan,
} from "./schedulingEngine.js";

import {
  FOCUS_SESSION_END_REASON,
} from "./focusSessionService.js";


export const SMART_BREAK_VERSION =
  1;


export const SMART_BREAK_STATUS = {
  ELIGIBLE:
    "eligible",

  NOT_ELIGIBLE:
    "not_eligible",

  DISABLED:
    "disabled",
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