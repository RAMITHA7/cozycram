/* =========================================================
   COZYCRAM SCHEDULING ENGINE — V1
   =========================================================

   Day 11 Stage 1 establishes the scheduling contract.

   This file must remain:
   - independent from React
   - independent from localStorage
   - independent from the router
   - independent from backend/API code

   Later Day 11 stages will add the actual scheduling logic.
   ========================================================= */


export const SCHEDULE_VERSION = 1;


export const MIN_SCHEDULE_BLOCK_MINUTES = 15;


export const SCHEDULE_BLOCK_STATUS = {
  PLANNED: "planned",
};


export const UNSCHEDULED_REASON = {
  NO_AVAILABILITY:
    "no_availability",

  INSUFFICIENT_CAPACITY:
    "insufficient_capacity",

  INVALID_DEADLINE:
    "invalid_deadline",
};

export const TASK_DUE_STATE = {
  OVERDUE: "overdue",
  TODAY: "today",
  UPCOMING: "upcoming",
  UNDATED: "undated",
  INVALID: "invalid",
};


export const TASK_PRIORITY_SCORE = {
  high: 60,
  medium: 30,
  low: 10,
};

export const FOCUS_PRESET_CONFIG = {
  quick: {
    focusMinutes: 25,
    breakMinutes: 5,
  },

  classic: {
    focusMinutes: 50,
    breakMinutes: 10,
  },

  deep: {
    focusMinutes: 90,
    breakMinutes: 20,
  },
};

const normalizeFocusPreset = (
  value
) =>
  String(
    value ?? ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      ""
    );

    export const resolveFocusPlan = (
  preferences
) => {
  if (
    !preferences ||
    typeof preferences !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Study preferences are required before scheduling.",

      focusPlan: null,
    };
  }


  const preset =
    normalizeFocusPreset(
      preferences.focusPreset
    );


  if (
    preset.includes(
      "quick"
    ) ||
    preset === "255"
  ) {
    return {
      valid: true,

      error: "",

      focusPlan: {
        preset: "quick",

        focusMinutes:
          FOCUS_PRESET_CONFIG
            .quick
            .focusMinutes,

        breakMinutes:
          FOCUS_PRESET_CONFIG
            .quick
            .breakMinutes,
      },
    };
  }


  if (
    preset.includes(
      "classic"
    ) ||
    preset === "5010"
  ) {
    return {
      valid: true,

      error: "",

      focusPlan: {
        preset: "classic",

        focusMinutes:
          FOCUS_PRESET_CONFIG
            .classic
            .focusMinutes,

        breakMinutes:
          FOCUS_PRESET_CONFIG
            .classic
            .breakMinutes,
      },
    };
  }


  if (
    preset.includes(
      "deep"
    ) ||
    preset === "9020"
  ) {
    return {
      valid: true,

      error: "",

      focusPlan: {
        preset: "deep",

        focusMinutes:
          FOCUS_PRESET_CONFIG
            .deep
            .focusMinutes,

        breakMinutes:
          FOCUS_PRESET_CONFIG
            .deep
            .breakMinutes,
      },
    };
  }


  if (
    preset.includes(
      "custom"
    )
  ) {
    const focusMinutes =
      Number(
        preferences
          .customFocusMinutes
      );


    const breakMinutes =
      Number(
        preferences
          .customBreakMinutes
      );


    if (
      !Number.isInteger(
        focusMinutes
      ) ||
      focusMinutes <
        MIN_SCHEDULE_BLOCK_MINUTES
    ) {
      return {
        valid: false,

        error:
          `Custom focus time must be at least ${MIN_SCHEDULE_BLOCK_MINUTES} minutes.`,

        focusPlan: null,
      };
    }


    if (
      !Number.isInteger(
        breakMinutes
      ) ||
      breakMinutes < 0
    ) {
      return {
        valid: false,

        error:
          "Custom break time must be zero or more minutes.",

        focusPlan: null,
      };
    }


    return {
      valid: true,

      error: "",

      focusPlan: {
        preset: "custom",

        focusMinutes,

        breakMinutes,
      },
    };
  }


  return {
    valid: false,

    error:
      "A valid focus preset is required before scheduling.",

    focusPlan: null,
  };
};

export const canTaskUseWindow = (
  task,
  window,
  referenceDateKey
) => {
  if (
    !task ||
    !window
  ) {
    return false;
  }


  const dueContext =
    getTaskDueContext(
      task,
      referenceDateKey
    );


  if (
    dueContext.state ===
    TASK_DUE_STATE.INVALID
  ) {
    return false;
  }


  if (
    dueContext.state ===
      TASK_DUE_STATE.UNDATED ||
    dueContext.state ===
      TASK_DUE_STATE.OVERDUE
  ) {
    return true;
  }


  if (
    !isValidDateKey(
      window.date
    ) ||
    !isValidDateKey(
      task.dueDate
    )
  ) {
    return false;
  }


  return (
    window.date <=
    task.dueDate
  );
};

export const calculateNextBlockDuration = ({
  remainingTaskMinutes,
  availableWindowMinutes,
  focusMinutes,
}) => {
  const remaining =
    Number(
      remainingTaskMinutes
    );


  const available =
    Number(
      availableWindowMinutes
    );


  const focus =
    Number(
      focusMinutes
    );


  if (
    !Number.isFinite(
      remaining
    ) ||
    !Number.isFinite(
      available
    ) ||
    !Number.isFinite(
      focus
    )
  ) {
    return 0;
  }


  if (
    remaining <
      MIN_SCHEDULE_BLOCK_MINUTES ||
    available <
      MIN_SCHEDULE_BLOCK_MINUTES ||
    focus <
      MIN_SCHEDULE_BLOCK_MINUTES
  ) {
    return 0;
  }


  let duration =
    Math.min(
      remaining,
      available,
      focus
    );


  const remainingAfterBlock =
    remaining -
    duration;


  if (
    remainingAfterBlock > 0 &&
    remainingAfterBlock <
      MIN_SCHEDULE_BLOCK_MINUTES
  ) {
    const adjustment =
      MIN_SCHEDULE_BLOCK_MINUTES -
      remainingAfterBlock;


    const adjustedDuration =
      duration -
      adjustment;


    if (
      adjustedDuration >=
      MIN_SCHEDULE_BLOCK_MINUTES
    ) {
      duration =
        adjustedDuration;
    } else {
      return 0;
    }
  }


  return Math.floor(
    duration
  );
};

export const sortCandidateWindows = (
  windows
) =>
  (
    Array.isArray(
      windows
    )
      ? windows
      : []
  )
    .map(
      (window) => ({
        ...window,
      })
    )
    .sort(
      (
        first,
        second
      ) => {
        if (
          first.date !==
          second.date
        ) {
          return first.date
            .localeCompare(
              second.date
            );
        }


        return (
          Number(
            first.startMinutes
          ) -
          Number(
            second.startMinutes
          )
        );
      }
    );

const createWindowRuntimeState = (
  window
) => ({
  ...window,

  cursorMinutes:
    Number(
      window.startMinutes
    ),

  blocksPlaced: 0,

  studyMinutesUsed: 0,

  breakMinutesUsed: 0,
});

const getSafeEstimatedMinutes = (
  task
) => {
  const minutes =
    Number(
      task?.estimatedMinutes
    );


  if (
    !Number.isFinite(
      minutes
    ) ||
    minutes <= 0
  ) {
    return 0;
  }


  return Math.floor(
    minutes
  );
};

export const classifyUnscheduledReason = ({
  task,
  windows,
  referenceDateKey,
}) => {
  const dueContext =
    getTaskDueContext(
      task,
      referenceDateKey
    );


  if (
    dueContext.state ===
    TASK_DUE_STATE.INVALID
  ) {
    return UNSCHEDULED_REASON
      .INVALID_DEADLINE;
  }


  const safeWindows =
    Array.isArray(
      windows
    )
      ? windows
      : [];


  if (
    safeWindows.length === 0
  ) {
    return UNSCHEDULED_REASON
      .NO_AVAILABILITY;
  }


  return UNSCHEDULED_REASON
    .INSUFFICIENT_CAPACITY;
};

export const placeRankedTasksIntoWindows = ({
  rankedTasks,
  windows,
  preferences,
  weekStart,
}) => {
  if (
    !isValidDateKey(
      weekStart
    )
  ) {
    return {
      valid: false,

      error:
        "A valid scheduling week start is required.",

      blocks: [],

      taskProgress: [],

      windowUsage: [],

      focusPlan: null,
    };
  }


  const focusResult =
    resolveFocusPlan(
      preferences
    );


  if (
    !focusResult.valid
  ) {
    return {
      valid: false,

      error:
        focusResult.error,

      blocks: [],

      taskProgress: [],

      windowUsage: [],

      focusPlan: null,
    };
  }


  const focusPlan =
    focusResult.focusPlan;


  const safeRankedTasks =
    Array.isArray(
      rankedTasks
    )
      ? rankedTasks
      : [];


  const windowStates =
    sortCandidateWindows(
      windows
    ).map(
      createWindowRuntimeState
    );


  const blocks = [];


  const taskProgress = [];


  let blockSequence = 0;


  for (
    const rankedItem
    of safeRankedTasks
  ) {
    const task =
      rankedItem?.task;


    if (
      !task ||
      task.status !==
        "todo"
    ) {
      continue;
    }


    const originalMinutes =
      Number(
        task.estimatedMinutes
      );


    if (
      !Number.isFinite(
        originalMinutes
      ) ||
      originalMinutes <= 0
    ) {
      taskProgress.push({
        taskId:
          task.id,

        originalMinutes:
          Number.isFinite(
            originalMinutes
          )
            ? originalMinutes
            : 0,

        scheduledMinutes: 0,

        remainingMinutes:
          Number.isFinite(
            originalMinutes
          )
            ? Math.max(
                0,
                originalMinutes
              )
            : 0,
      });

      continue;
    }


    let remainingMinutes =
      originalMinutes;


    let scheduledMinutes = 0;


    for (
      const windowState
      of windowStates
    ) {
      if (
        remainingMinutes <
        MIN_SCHEDULE_BLOCK_MINUTES
      ) {
        break;
      }


      if (
        !canTaskUseWindow(
          task,
          windowState,
          weekStart
        )
      ) {
        continue;
      }


      while (
        remainingMinutes >=
        MIN_SCHEDULE_BLOCK_MINUTES
      ) {
        const breakBeforeBlock =
          windowState.blocksPlaced > 0
            ? focusPlan.breakMinutes
            : 0;


        const proposedStart =
          windowState.cursorMinutes +
          breakBeforeBlock;


        const availableMinutes =
          windowState.endMinutes -
          proposedStart;


        if (
          availableMinutes <
          MIN_SCHEDULE_BLOCK_MINUTES
        ) {
          break;
        }


        const blockDuration =
          calculateNextBlockDuration({
            remainingTaskMinutes:
              remainingMinutes,

            availableWindowMinutes:
              availableMinutes,

            focusMinutes:
              focusPlan.focusMinutes,
          });


        if (
          blockDuration <
          MIN_SCHEDULE_BLOCK_MINUTES
        ) {
          break;
        }


        const startMinutes =
          proposedStart;


        const endMinutes =
          startMinutes +
          blockDuration;


        const startTime =
          minutesToTime(
            startMinutes
          );


        const endTime =
          minutesToTime(
            endMinutes
          );


        const id =
          buildScheduleBlockId({
            taskId:
              task.id,

            date:
              windowState.date,

            startTime,

            sequence:
              blockSequence,
          });


        blocks.push(
          createScheduleBlock({
            id,

            taskId:
              task.id,

            subjectId:
              task.subjectId,

            date:
              windowState.date,

            startTime,

            endTime,

            durationMinutes:
              blockDuration,
          })
        );


        blockSequence += 1;


        if (
          breakBeforeBlock > 0
        ) {
          windowState
            .breakMinutesUsed +=
            breakBeforeBlock;
        }


        windowState.cursorMinutes =
          endMinutes;


        windowState.blocksPlaced +=
          1;


        windowState
          .studyMinutesUsed +=
          blockDuration;


        remainingMinutes -=
          blockDuration;


        scheduledMinutes +=
          blockDuration;


        if (
          remainingMinutes <
          MIN_SCHEDULE_BLOCK_MINUTES
        ) {
          break;
        }
      }
    }


    taskProgress.push({
      taskId:
        task.id,

      originalMinutes,

      scheduledMinutes,

      remainingMinutes:
        Math.max(
          0,
          remainingMinutes
        ),
    });
  }


  const windowUsage =
    windowStates.map(
      (window) => ({
        id:
          window.id,

        date:
          window.date,

        weekday:
          window.weekday,

        startTime:
          window.startTime,

        endTime:
          window.endTime,

        capacityMinutes:
          window.durationMinutes,

        studyMinutesUsed:
          window.studyMinutesUsed,

        breakMinutesUsed:
          window.breakMinutesUsed,

        remainingMinutes:
          Math.max(
            0,
            window.endMinutes -
              window.cursorMinutes
          ),

        blocksPlaced:
          window.blocksPlaced,
      })
    );


  return {
    valid: true,

    error: "",

    blocks,

    taskProgress,

    windowUsage,

    focusPlan,
  };
};

const DATE_KEY_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/;


const TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];


const normalizeWeekdayKey = (
  value
) =>
  String(
    value ?? ""
  )
    .trim()
    .toLowerCase();


/* =========================================================
   DATE HELPERS
   ========================================================= */

export const isValidDateKey = (
  value
) => {
  if (
    typeof value !== "string" ||
    !DATE_KEY_PATTERN.test(
      value
    )
  ) {
    return false;
  }


  const date =
    new Date(
      `${value}T00:00:00Z`
    );


  return (
    !Number.isNaN(
      date.getTime()
    ) &&
    date
      .toISOString()
      .slice(
        0,
        10
      ) === value
  );
};


export const addDaysToDateKey = (
  dateKey,
  amount
) => {
  if (
    !isValidDateKey(
      dateKey
    )
  ) {
    throw new Error(
      "A valid YYYY-MM-DD date is required."
    );
  }


  const numericAmount =
    Number(amount);


  if (
    !Number.isInteger(
      numericAmount
    )
  ) {
    throw new Error(
      "Day adjustment must be an integer."
    );
  }


  const date =
    new Date(
      `${dateKey}T00:00:00Z`
    );


  date.setUTCDate(
    date.getUTCDate() +
      numericAmount
  );


  return date
    .toISOString()
    .slice(
      0,
      10
    );
};


export const getWeekEndKey = (
  weekStart
) =>
  addDaysToDateKey(
    weekStart,
    6
  );

export const getWeekdayKeyFromDateKey = (
  dateKey
) => {
  if (
    !isValidDateKey(
      dateKey
    )
  ) {
    throw new Error(
      "A valid YYYY-MM-DD date is required."
    );
  }


  const date =
    new Date(
      `${dateKey}T00:00:00Z`
    );


  return WEEKDAY_KEYS[
    date.getUTCDay()
  ];
};

export const getAvailabilityForDateKey = (
  availability,
  dateKey
) => {
  if (
    !Array.isArray(
      availability
    )
  ) {
    return null;
  }


  const weekdayKey =
    getWeekdayKeyFromDateKey(
      dateKey
    );


  return (
    availability.find(
      (day) =>
        normalizeWeekdayKey(
          day.id
        ) ===
          weekdayKey ||
        normalizeWeekdayKey(
          day.label
        ) ===
          weekdayKey
    ) || null
  );
};

export const getDateDifferenceInDays = (
  fromDateKey,
  toDateKey
) => {
  if (
    !isValidDateKey(
      fromDateKey
    ) ||
    !isValidDateKey(
      toDateKey
    )
  ) {
    throw new Error(
      "Two valid YYYY-MM-DD dates are required."
    );
  }


  const fromDate =
    new Date(
      `${fromDateKey}T00:00:00Z`
    );


  const toDate =
    new Date(
      `${toDateKey}T00:00:00Z`
    );


  return Math.round(
    (
      toDate.getTime() -
      fromDate.getTime()
    ) /
      86400000
  );
};

export const getTaskDueContext = (
  task,
  referenceDateKey
) => {
  if (
    !isValidDateKey(
      referenceDateKey
    )
  ) {
    throw new Error(
      "A valid scheduling reference date is required."
    );
  }


  if (
    !task?.dueDate
  ) {
    return {
      state:
        TASK_DUE_STATE.UNDATED,

      daysUntilDue:
        null,
    };
  }


  if (
    !isValidDateKey(
      task.dueDate
    )
  ) {
    return {
      state:
        TASK_DUE_STATE.INVALID,

      daysUntilDue:
        null,
    };
  }


  const daysUntilDue =
    getDateDifferenceInDays(
      referenceDateKey,
      task.dueDate
    );


  if (
    daysUntilDue < 0
  ) {
    return {
      state:
        TASK_DUE_STATE.OVERDUE,

      daysUntilDue,
    };
  }


  if (
    daysUntilDue === 0
  ) {
    return {
      state:
        TASK_DUE_STATE.TODAY,

      daysUntilDue,
    };
  }


  return {
    state:
      TASK_DUE_STATE.UPCOMING,

    daysUntilDue,
  };
};

export const calculateDeadlineScore = (
  dueContext
) => {
  if (
    !dueContext ||
    typeof dueContext !==
      "object"
  ) {
    return 0;
  }


  const {
    state,
    daysUntilDue,
  } =
    dueContext;


  if (
    state ===
    TASK_DUE_STATE.OVERDUE
  ) {
    return (
      1000 +
      Math.min(
        Math.abs(
          daysUntilDue
        ),
        60
      )
    );
  }


  if (
    state ===
    TASK_DUE_STATE.TODAY
  ) {
    return 900;
  }


  if (
    state ===
    TASK_DUE_STATE.UPCOMING
  ) {
    if (
      daysUntilDue === 1
    ) {
      return 850;
    }


    if (
      daysUntilDue === 2
    ) {
      return 800;
    }


    if (
      daysUntilDue <= 3
    ) {
      return 750;
    }


    if (
      daysUntilDue <= 6
    ) {
      return 650;
    }


    if (
      daysUntilDue <= 13
    ) {
      return 500;
    }


    if (
      daysUntilDue <= 27
    ) {
      return 350;
    }


    return 200;
  }


  if (
    state ===
    TASK_DUE_STATE.UNDATED
  ) {
    return 100;
  }


  return 0;
};

export const calculateUserPriorityScore = (
  priority
) =>
  TASK_PRIORITY_SCORE[
    priority
  ] || 0;

export const calculateTaskWorkloadScore = (
  estimatedMinutes
) => {
  const minutes =
    Number(
      estimatedMinutes
    );


  if (
    !Number.isFinite(
      minutes
    ) ||
    minutes <= 0
  ) {
    return 0;
  }


  return Math.min(
    40,
    Math.ceil(
      minutes / 30
    ) * 5
  );
};

export const scoreTaskForScheduling = (
  task,
  referenceDateKey
) => {
  const dueContext =
    getTaskDueContext(
      task,
      referenceDateKey
    );


  const deadlineScore =
    calculateDeadlineScore(
      dueContext
    );


  const priorityScore =
    calculateUserPriorityScore(
      task?.priority
    );


  const workloadScore =
    calculateTaskWorkloadScore(
      task?.estimatedMinutes
    );


  return {
    taskId:
      task?.id,

    dueState:
      dueContext.state,

    daysUntilDue:
      dueContext.daysUntilDue,

    deadlineScore,

    priorityScore,

    workloadScore,

    totalScore:
      deadlineScore +
      priorityScore +
      workloadScore,
  };
};

export const explainTaskSchedulingPriority = (
  task,
  score
) => {
  const reasons = [];


  if (
    score.dueState ===
    TASK_DUE_STATE.OVERDUE
  ) {
    const overdueDays =
      Math.abs(
        score.daysUntilDue
      );


    reasons.push(
      overdueDays === 1
        ? "1 day overdue"
        : `${overdueDays} days overdue`
    );
  }


  if (
    score.dueState ===
    TASK_DUE_STATE.TODAY
  ) {
    reasons.push(
      "due at the start of this scheduling week"
    );
  }


  if (
    score.dueState ===
      TASK_DUE_STATE.UPCOMING &&
    score.daysUntilDue !== null
  ) {
    reasons.push(
      score.daysUntilDue === 1
        ? "due in 1 day"
        : `due in ${score.daysUntilDue} days`
    );
  }


  if (
    score.dueState ===
    TASK_DUE_STATE.UNDATED
  ) {
    reasons.push(
      "no due date"
    );
  }


  if (
    score.dueState ===
    TASK_DUE_STATE.INVALID
  ) {
    reasons.push(
      "invalid due date"
    );
  }


  if (
    task?.priority === "high"
  ) {
    reasons.push(
      "high priority"
    );
  }


  if (
    Number(
      task?.estimatedMinutes
    ) >= 120
  ) {
    reasons.push(
      "larger workload"
    );
  }


  return reasons;
};

export const rankTasksForScheduling = (
  snapshot
) => {
  if (
    !snapshot ||
    typeof snapshot !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "A scheduling snapshot is required.",

      rankedTasks: [],
    };
  }


  if (
    !isValidDateKey(
      snapshot.weekStart
    )
  ) {
    return {
      valid: false,

      error:
        "The scheduling snapshot contains an invalid week start.",

      rankedTasks: [],
    };
  }


  const tasks =
    Array.isArray(
      snapshot.tasks
    )
      ? snapshot.tasks
      : [];


  const rankedTasks =
    tasks
      .filter(
        (task) =>
          task.status ===
          "todo"
      )
      .map(
        (task) => {
          const score =
            scoreTaskForScheduling(
              task,
              snapshot.weekStart
            );


          return {
            task: {
              ...task,
            },

            score,

            reasons:
              explainTaskSchedulingPriority(
                task,
                score
              ),
          };
        }
      )
      .sort(
        (
          first,
          second
        ) => {
          if (
            second.score
              .totalScore !==
            first.score
              .totalScore
          ) {
            return (
              second.score
                .totalScore -
              first.score
                .totalScore
            );
          }


          const firstHasValidDueDate =
            isValidDateKey(
              first.task.dueDate
            );


          const secondHasValidDueDate =
            isValidDateKey(
              second.task.dueDate
            );


          if (
            firstHasValidDueDate &&
            secondHasValidDueDate &&
            first.task.dueDate !==
              second.task.dueDate
          ) {
            return first.task.dueDate
              .localeCompare(
                second.task.dueDate
              );
          }


          if (
            second.score
              .priorityScore !==
            first.score
              .priorityScore
          ) {
            return (
              second.score
                .priorityScore -
              first.score
                .priorityScore
            );
          }


          const firstMinutes =
            Number(
              first.task
                .estimatedMinutes
            ) || 0;


          const secondMinutes =
            Number(
              second.task
                .estimatedMinutes
            ) || 0;


          if (
            secondMinutes !==
            firstMinutes
          ) {
            return (
              secondMinutes -
              firstMinutes
            );
          }


          const firstCreatedAt =
            Date.parse(
              first.task.createdAt ||
                ""
            );


          const secondCreatedAt =
            Date.parse(
              second.task.createdAt ||
                ""
            );


          if (
            !Number.isNaN(
              firstCreatedAt
            ) &&
            !Number.isNaN(
              secondCreatedAt
            ) &&
            firstCreatedAt !==
              secondCreatedAt
          ) {
            return (
              firstCreatedAt -
              secondCreatedAt
            );
          }


          return String(
            first.task.id
          ).localeCompare(
            String(
              second.task.id
            )
          );
        }
      );


  return {
    valid: true,

    error: "",

    rankedTasks,
  };
};


/* =========================================================
   TIME HELPERS
   ========================================================= */

export const isValidTime = (
  value
) =>
  typeof value === "string" &&
  TIME_PATTERN.test(
    value
  );


export const timeToMinutes = (
  value
) => {
  if (
    !isValidTime(
      value
    )
  ) {
    throw new Error(
      "A valid HH:MM time is required."
    );
  }


  const [
    hours,
    minutes,
  ] =
    value
      .split(":")
      .map(Number);


  return (
    hours * 60 +
    minutes
  );
};


export const minutesToTime = (
  value
) => {
  const minutes =
    Number(value);


  if (
    !Number.isInteger(
      minutes
    ) ||
    minutes < 0 ||
    minutes >= 1440
  ) {
    throw new Error(
      "Minutes must be an integer between 0 and 1439."
    );
  }


  const hours =
    Math.floor(
      minutes / 60
    );


  const remainingMinutes =
    minutes % 60;


  return `${String(
    hours
  ).padStart(
    2,
    "0"
  )}:${String(
    remainingMinutes
  ).padStart(
    2,
    "0"
  )}`;
};

export const validateAvailabilityWindow = (
  availabilityDay
) => {
  if (
    !availabilityDay ||
    typeof availabilityDay !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Availability data is missing.",
    };
  }


  if (
    !availabilityDay.enabled
  ) {
    return {
      valid: false,

      error:
        "This study day is disabled.",
    };
  }


  if (
    !isValidTime(
      availabilityDay.start
    ) ||
    !isValidTime(
      availabilityDay.end
    )
  ) {
    return {
      valid: false,

      error:
        "Availability must contain valid start and end times.",
    };
  }


  const startMinutes =
    timeToMinutes(
      availabilityDay.start
    );


  const endMinutes =
    timeToMinutes(
      availabilityDay.end
    );


  if (
    endMinutes <=
    startMinutes
  ) {
    return {
      valid: false,

      error:
        "Availability end time must be later than its start time.",
    };
  }


  const durationMinutes =
    endMinutes -
    startMinutes;


  if (
    durationMinutes <
    MIN_SCHEDULE_BLOCK_MINUTES
  ) {
    return {
      valid: false,

      error:
        `Availability must provide at least ${MIN_SCHEDULE_BLOCK_MINUTES} minutes of usable study time.`,
    };
  }


  return {
    valid: true,

    error: "",

    startMinutes,

    endMinutes,

    durationMinutes,
  };
};


/* =========================================================
   SCHEDULING SNAPSHOT
   ========================================================= */

/*
  The scheduler must never directly mutate the object returned
  by loadStudyData().

  Instead, Day 11 creates a clean snapshot containing only the
  inputs needed by the scheduling engine.

  Snapshot shape:

  {
    version: 1,

    weekStart: "YYYY-MM-DD",
    weekEnd: "YYYY-MM-DD",

    subjects: [...],

    tasks: [
      open tasks only
    ],

    availability: [...],

    preferences: {...}
  }
*/


export const createSchedulingSnapshot = (
  studyData,
  weekStart
) => {
  if (
    !studyData ||
    typeof studyData !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Study data is required before a schedule can be generated.",

      snapshot: null,
    };
  }


  if (
    !studyData.completed
  ) {
    return {
      valid: false,

      error:
        "Study setup must be completed before scheduling.",

      snapshot: null,
    };
  }


  if (
    !isValidDateKey(
      weekStart
    )
  ) {
    return {
      valid: false,

      error:
        "A valid scheduling week is required.",

      snapshot: null,
    };
  }


  const subjects =
    Array.isArray(
      studyData.subjects
    )
      ? studyData.subjects
      : [];


  const tasks =
    Array.isArray(
      studyData.tasks
    )
      ? studyData.tasks
      : [];


  const availability =
    Array.isArray(
      studyData.availability
    )
      ? studyData.availability
      : [];


  const preferences =
    studyData.preferences &&
    typeof studyData.preferences ===
      "object"
      ? studyData.preferences
      : {};


  const subjectIds =
    new Set(
      subjects.map(
        (subject) =>
          String(
            subject.id
          )
      )
    );


  const orphanTask =
    tasks.find(
      (task) =>
        !subjectIds.has(
          String(
            task.subjectId
          )
        )
    );


  if (orphanTask) {
    return {
      valid: false,

      error:
        `${orphanTask.title || "A task"} is connected to a subject that does not exist.`,

      snapshot: null,
    };
  }


  const openTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "todo"
    );


  const snapshot = {
    version:
      SCHEDULE_VERSION,

    weekStart,

    weekEnd:
      getWeekEndKey(
        weekStart
      ),

    subjects:
      subjects.map(
        (subject) => ({
          ...subject,
        })
      ),

    tasks:
      openTasks.map(
        (task) => ({
          ...task,
        })
      ),

    availability:
      availability.map(
        (day) => ({
          ...day,
        })
      ),

    preferences: {
      ...preferences,
    },
  };


  return {
    valid: true,

    error: "",

    snapshot,
  };
};

export const createCandidateStudyWindows = (
  snapshot
) => {
  if (
    !snapshot ||
    typeof snapshot !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "A scheduling snapshot is required.",

      windows: [],

      skippedDays: [],
    };
  }


  if (
    !isValidDateKey(
      snapshot.weekStart
    ) ||
    !isValidDateKey(
      snapshot.weekEnd
    )
  ) {
    return {
      valid: false,

      error:
        "The scheduling snapshot contains an invalid week.",

      windows: [],

      skippedDays: [],
    };
  }


  const availability =
    Array.isArray(
      snapshot.availability
    )
      ? snapshot.availability
      : [];


  const windows = [];


  const skippedDays = [];


  for (
    let dayOffset = 0;
    dayOffset < 7;
    dayOffset += 1
  ) {
    const date =
      addDaysToDateKey(
        snapshot.weekStart,
        dayOffset
      );


    const weekday =
      getWeekdayKeyFromDateKey(
        date
      );


    const availabilityDay =
      getAvailabilityForDateKey(
        availability,
        date
      );


    if (
      !availabilityDay
    ) {
      skippedDays.push({
        date,

        weekday,

        reason:
          "missing_availability",
      });

      continue;
    }


    if (
      !availabilityDay.enabled
    ) {
      skippedDays.push({
        date,

        weekday,

        reason:
          "disabled",
      });

      continue;
    }


    const validation =
      validateAvailabilityWindow(
        availabilityDay
      );


    if (
      !validation.valid
    ) {
      skippedDays.push({
        date,

        weekday,

        reason:
          "invalid_window",
      });

      continue;
    }


    windows.push(
      createCandidateWindow({
        date,

        weekday,

        startTime:
          availabilityDay.start,

        endTime:
          availabilityDay.end,

        startMinutes:
          validation.startMinutes,

        endMinutes:
          validation.endMinutes,

        durationMinutes:
          validation.durationMinutes,
      })
    );
  }


  return {
    valid: true,

    error: "",

    windows,

    skippedDays,
  };
};


/* =========================================================
   CANDIDATE STUDY WINDOW CONTRACT
   ========================================================= */

/*
  Candidate windows represent time where CozyCram is allowed
  to place future study blocks.

  They contain NO task assignment.

  Example:

  {
    id: "2026-10-26-1800-2000",

    date: "2026-10-26",
    weekday: "monday",

    startTime: "18:00",
    endTime: "20:00",

    startMinutes: 1080,
    endMinutes: 1200,

    durationMinutes: 120
  }
*/

export const buildCandidateWindowId = ({
  date,
  startTime,
  endTime,
}) => {
  const safeStart =
    String(
      startTime
    ).replace(
      ":",
      ""
    );


  const safeEnd =
    String(
      endTime
    ).replace(
      ":",
      ""
    );


  return [
    date,
    safeStart,
    safeEnd,
  ].join(
    "-"
  );
};

export const createCandidateWindow = ({
  date,
  weekday,
  startTime,
  endTime,
  startMinutes,
  endMinutes,
  durationMinutes,
}) => ({
  id:
    buildCandidateWindowId({
      date,
      startTime,
      endTime,
    }),

  date,

  weekday,

  startTime,

  endTime,

  startMinutes,

  endMinutes,

  durationMinutes,
});

export const summarizeCandidateWindows = (
  windows
) => {
  const safeWindows =
    Array.isArray(
      windows
    )
      ? windows
      : [];


  return {
    availableDays:
      safeWindows.length,

    availableMinutes:
      safeWindows.reduce(
        (
          total,
          window
        ) =>
          total +
          (
            Number(
              window.durationMinutes
            ) || 0
          ),
        0
      ),
  };
};


/* =========================================================
   SCHEDULE BLOCK CONTRACT
   ========================================================= */

/*
  A real generated study block will eventually look like:

  {
    id: "taskId-date-start-sequence",

    taskId: 123,
    subjectId: 456,

    date: "2026-10-27",

    startTime: "18:00",
    endTime: "18:50",

    durationMinutes: 50,

    status: "planned"
  }

  IMPORTANT:
  Stage 1 defines the contract only.
  We are NOT creating these blocks yet.
*/


export const buildScheduleBlockId = ({
  taskId,
  date,
  startTime,
  sequence,
}) => {
  const safeTime =
    String(
      startTime
    ).replace(
      ":",
      ""
    );


  return [
    String(
      taskId
    ),

    date,

    safeTime,

    String(
      sequence
    ),
  ].join(
    "-"
  );
};


export const createScheduleBlock = ({
  id,
  taskId,
  subjectId,
  date,
  startTime,
  endTime,
  durationMinutes,
}) => ({
  id,

  taskId,

  subjectId,

  date,

  startTime,

  endTime,

  durationMinutes,

  status:
    SCHEDULE_BLOCK_STATUS.PLANNED,
});


/* =========================================================
   UNSCHEDULED WORK CONTRACT
   ========================================================= */

/*
  The scheduler must NEVER silently drop work.

  If some task minutes cannot be placed, they will eventually
  appear in `unscheduled`.

  Example:

  {
    taskId: 123,
    remainingMinutes: 45,
    reason: "insufficient_capacity"
  }
*/


export const createUnscheduledItem = ({
  taskId,
  remainingMinutes,
  reason,
}) => ({
  taskId,

  remainingMinutes,

  reason,
});

export const createUnscheduledWork = ({
  snapshot,
  taskProgress,
  windows,
}) => {
  const tasks =
    Array.isArray(
      snapshot?.tasks
    )
      ? snapshot.tasks
      : [];


  const progress =
    Array.isArray(
      taskProgress
    )
      ? taskProgress
      : [];


  const taskMap =
    new Map(
      tasks.map(
        (task) => [
          String(
            task.id
          ),

          task,
        ]
      )
    );


  return progress
    .filter(
      (item) =>
        Number(
          item.remainingMinutes
        ) > 0
    )
    .map(
      (item) => {
        const task =
          taskMap.get(
            String(
              item.taskId
            )
          );


        return createUnscheduledItem({
          taskId:
            item.taskId,

          remainingMinutes:
            Math.max(
              0,
              Number(
                item.remainingMinutes
              ) || 0
            ),

          reason:
            classifyUnscheduledReason({
              task,

              windows,

              referenceDateKey:
                snapshot.weekStart,
            }),
        });
      }
    );
};

export const createFullyUnscheduledWork = ({
  snapshot,
  windows,
}) => {
  const tasks =
    Array.isArray(
      snapshot?.tasks
    )
      ? snapshot.tasks
      : [];


  return tasks
    .map(
      (task) => ({
        task,

        remainingMinutes:
          getSafeEstimatedMinutes(
            task
          ),
      })
    )
    .filter(
      (item) =>
        item.remainingMinutes >
        0
    )
    .map(
      ({
        task,
        remainingMinutes,
      }) =>
        createUnscheduledItem({
          taskId:
            task.id,

          remainingMinutes,

          reason:
            classifyUnscheduledReason({
              task,

              windows,

              referenceDateKey:
                snapshot.weekStart,
            }),
        })
    );
};

export const createScheduleSummary = ({
  tasks,
  blocks,
  unscheduled,
}) => {
  const safeTasks =
    Array.isArray(
      tasks
    )
      ? tasks
      : [];


  const safeBlocks =
    Array.isArray(
      blocks
    )
      ? blocks
      : [];


  const safeUnscheduled =
    Array.isArray(
      unscheduled
    )
      ? unscheduled
      : [];


  const scheduledTaskIds =
    new Set(
      safeBlocks.map(
        (block) =>
          String(
            block.taskId
          )
      )
    );


  const scheduledMinutes =
    safeBlocks.reduce(
      (
        total,
        block
      ) =>
        total +
        (
          Number(
            block.durationMinutes
          ) || 0
        ),
      0
    );


  const unscheduledMinutes =
    safeUnscheduled.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          Number(
            item.remainingMinutes
          ) || 0
        ),
      0
    );


  return {
    totalOpenTasks:
      safeTasks.length,

    scheduledTasks:
      scheduledTaskIds.size,

    scheduledMinutes,

    unscheduledMinutes,
  };
};

export const validateScheduleAccounting = ({
  tasks,
  blocks,
  unscheduled,
}) => {
  const safeTasks =
    Array.isArray(
      tasks
    )
      ? tasks
      : [];


  const safeBlocks =
    Array.isArray(
      blocks
    )
      ? blocks
      : [];


  const safeUnscheduled =
    Array.isArray(
      unscheduled
    )
      ? unscheduled
      : [];


  const totalTaskMinutes =
    safeTasks.reduce(
      (
        total,
        task
      ) =>
        total +
        getSafeEstimatedMinutes(
          task
        ),
      0
    );


  const scheduledMinutes =
    safeBlocks.reduce(
      (
        total,
        block
      ) =>
        total +
        (
          Number(
            block.durationMinutes
          ) || 0
        ),
      0
    );


  const unscheduledMinutes =
    safeUnscheduled.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          Number(
            item.remainingMinutes
          ) || 0
        ),
      0
    );


  const accountedMinutes =
    scheduledMinutes +
    unscheduledMinutes;


  if (
    accountedMinutes !==
    totalTaskMinutes
  ) {
    return {
      valid: false,

      error:
        "Schedule accounting failed because some task time was lost or counted twice.",

      totals: {
        totalTaskMinutes,

        scheduledMinutes,

        unscheduledMinutes,

        accountedMinutes,
      },
    };
  }


  return {
    valid: true,

    error: "",

    totals: {
      totalTaskMinutes,

      scheduledMinutes,

      unscheduledMinutes,

      accountedMinutes,
    },
  };
};

export const generateWeeklySchedule = (
  studyData,
  weekStart
) => {
  const snapshotResult =
    createSchedulingSnapshot(
      studyData,
      weekStart
    );


  if (
    !snapshotResult.valid
  ) {
    return {
      valid: false,

      error:
        snapshotResult.error,

      result: null,
    };
  }


  const snapshot =
    snapshotResult.snapshot;


  const emptyResult =
    createEmptyScheduleResult({
      weekStart:
        snapshot.weekStart,

      weekEnd:
        snapshot.weekEnd,
    });


  /* -----------------------------------------
     NO OPEN WORK
     ----------------------------------------- */

  if (
    snapshot.tasks.length === 0
  ) {
    return {
      valid: true,

      error: "",

      result: {
        ...emptyResult,

        generatedAt:
          new Date()
            .toISOString(),
      },
    };
  }


  /* -----------------------------------------
     CANDIDATE WINDOWS
     ----------------------------------------- */

  const windowResult =
    createCandidateStudyWindows(
      snapshot
    );


  if (
    !windowResult.valid
  ) {
    return {
      valid: false,

      error:
        windowResult.error,

      result: null,
    };
  }


  const windows =
    windowResult.windows;


  /* -----------------------------------------
     NO USABLE AVAILABILITY
     ----------------------------------------- */

  if (
    windows.length === 0
  ) {
    const unscheduled =
      createFullyUnscheduledWork({
        snapshot,

        windows,
      });


    const accounting =
      validateScheduleAccounting({
        tasks:
          snapshot.tasks,

        blocks: [],

        unscheduled,
      });


    if (
      !accounting.valid
    ) {
      return {
        valid: false,

        error:
          accounting.error,

        result: null,
      };
    }


    return {
      valid: true,

      error: "",

      result: {
        ...emptyResult,

        generatedAt:
          new Date()
            .toISOString(),

        unscheduled,

        summary:
          createScheduleSummary({
            tasks:
              snapshot.tasks,

            blocks: [],

            unscheduled,
          }),
      },
    };
  }


  /* -----------------------------------------
     TASK RANKING
     ----------------------------------------- */

  const rankingResult =
    rankTasksForScheduling(
      snapshot
    );


  if (
    !rankingResult.valid
  ) {
    return {
      valid: false,

      error:
        rankingResult.error,

      result: null,
    };
  }


  /* -----------------------------------------
     BLOCK PLACEMENT
     ----------------------------------------- */

  const placementResult =
    placeRankedTasksIntoWindows({
      rankedTasks:
        rankingResult
          .rankedTasks,

      windows,

      preferences:
        snapshot.preferences,

      weekStart:
        snapshot.weekStart,
    });


  if (
    !placementResult.valid
  ) {
    return {
      valid: false,

      error:
        placementResult.error,

      result: null,
    };
  }


  /* -----------------------------------------
     UNSCHEDULED WORK
     ----------------------------------------- */

  const unscheduled =
    createUnscheduledWork({
      snapshot,

      taskProgress:
        placementResult
          .taskProgress,

      windows,
    });


  /* -----------------------------------------
     ACCOUNTING SAFETY CHECK
     ----------------------------------------- */

  const accounting =
    validateScheduleAccounting({
      tasks:
        snapshot.tasks,

      blocks:
        placementResult.blocks,

      unscheduled,
    });


  if (
    !accounting.valid
  ) {
    return {
      valid: false,

      error:
        accounting.error,

      result: null,
    };
  }


  /* -----------------------------------------
     FINAL RESULT
     ----------------------------------------- */

  return {
    valid: true,

    error: "",

    result: {
      ...emptyResult,

      generatedAt:
        new Date()
          .toISOString(),

      blocks:
        placementResult
          .blocks
          .map(
            (block) => ({
              ...block,
            })
          ),

      unscheduled:
        unscheduled.map(
          (item) => ({
            ...item,
          })
        ),

      summary:
        createScheduleSummary({
          tasks:
            snapshot.tasks,

          blocks:
            placementResult.blocks,

          unscheduled,
        }),
    },
  };
};

/* =========================================================
   EMPTY RESULT CONTRACT
   ========================================================= */

/*
  Later stages will populate this result.

  Nothing generated by the scheduling engine should be
  presented to the UI unless it follows this contract.
*/


export const createEmptyScheduleResult = ({
  weekStart,
  weekEnd,
}) => ({
  version:
    SCHEDULE_VERSION,

  weekStart,

  weekEnd,

  generatedAt: null,

  blocks: [],

  unscheduled: [],

  summary: {
    totalOpenTasks: 0,

    scheduledTasks: 0,

    scheduledMinutes: 0,

    unscheduledMinutes: 0,
  },
});