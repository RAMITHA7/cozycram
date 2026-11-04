import {
  MIN_SCHEDULE_BLOCK_MINUTES,
} from "./schedulingEngine.js";


export const FOCUS_SESSION_VERSION =
  1;


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