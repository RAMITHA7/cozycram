import {
  createTaskSchedulingExplanation,
  SCHEDULE_VERSION,
  scoreTaskForScheduling,
} from "./schedulingEngine.js";

export const ADAPTIVE_RESCHEDULE_VERSION =
  1;

export const RESCHEDULE_TRIGGER = {
  USER_REQUESTED:
    "user_requested",

  STUDY_DATA_CHANGED:
    "study_data_changed",

  ELAPSED_REVIEW:
    "elapsed_review",
};

export const RESCHEDULE_BLOCK_STATE = {
  FUTURE_PLANNED:
    "future_planned",

  CONFIRMED_COMPLETE:
    "confirmed_complete",

  ELAPSED_UNCONFIRMED:
    "elapsed_unconfirmed",

  INVALIDATED:
    "invalidated",
};

export const RESCHEDULE_DRIFT_REASON = {
  INVALID_BLOCK:
    "invalid_block",

  TASK_REMOVED:
    "task_removed",

  TASK_COMPLETED:
    "task_completed",

  TASK_NOT_OPEN:
    "task_not_open",

  SUBJECT_REMOVED:
    "subject_removed",

  SUBJECT_CHANGED:
    "subject_changed",

  INVALID_DEADLINE:
    "invalid_deadline",

  BLOCK_AFTER_DEADLINE:
    "block_after_deadline",

  NO_AVAILABILITY:
    "no_availability",

  AVAILABILITY_DISABLED:
    "availability_disabled",

  INVALID_AVAILABILITY:
    "invalid_availability",

  OUTSIDE_AVAILABILITY:
    "outside_availability",

  SCHEDULING_INPUT_CHANGED:
    "scheduling_input_changed",
};

export const ADAPTIVE_RESCHEDULE_STATUS = {
  UNCHANGED:
    "unchanged",

  ADJUSTED:
    "adjusted",

  NEEDS_REVIEW:
    "needs_review",

  BLOCKED:
    "blocked",
};

export const ADAPTIVE_WORK_STATE = {
  CONFIRMED_COMPLETE:
    "confirmed_complete",

  FUTURE_COVERED:
    "future_covered",

  NEEDS_REVIEW:
    "needs_review",

  READY_TO_RESCHEDULE:
    "ready_to_reschedule",
};

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
      Date.UTC(
        year,
        month - 1,
        day
      )
    );


  return (
    date.getUTCFullYear() ===
      year &&
    date.getUTCMonth() ===
      month - 1 &&
    date.getUTCDate() ===
      day
  );
};

const TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)$/;


const isValidTime = (
  value
) =>
  TIME_PATTERN.test(
    String(
      value ?? ""
    ).trim()
  );


const timeToMinutes = (
  value
) => {
  const normalized =
    String(
      value ?? ""
    ).trim();


  if (
    !isValidTime(
      normalized
    )
  ) {
    return null;
  }


  const [
    hours,
    minutes,
  ] =
    normalized
      .split(":")
      .map(Number);


  return (
    hours * 60 +
    minutes
  );
};

const getWeekdayKeyFromDateKey = (
  dateKey
) => {
  if (
    !isValidDateKey(
      dateKey
    )
  ) {
    return null;
  }


  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split("-")
      .map(Number);


  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );


  return WEEKDAY_KEYS[
    date.getUTCDay()
  ];
};

const getAvailabilityForDateKey = (
  availability,
  dateKey
) => {
  const weekdayKey =
    getWeekdayKeyFromDateKey(
      dateKey
    );


  if (
    !weekdayKey
  ) {
    return null;
  }


  return (
    availability.find(
      (day) =>
        normalizeWeekdayKey(
          day?.id
        ) ===
          weekdayKey ||
        normalizeWeekdayKey(
          day?.label
        ) ===
          weekdayKey
    ) ||
    null
  );
};

const validateAvailabilityWindow = (
  availabilityDay
) => {
  if (
    !availabilityDay
  ) {
    return {
      valid: false,

      reason:
        RESCHEDULE_DRIFT_REASON
          .NO_AVAILABILITY,

      startMinutes: null,
      endMinutes: null,
    };
  }


  if (
    !availabilityDay.enabled
  ) {
    return {
      valid: false,

      reason:
        RESCHEDULE_DRIFT_REASON
          .AVAILABILITY_DISABLED,

      startMinutes: null,
      endMinutes: null,
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
    startMinutes === null ||
    endMinutes === null ||
    endMinutes <=
      startMinutes
  ) {
    return {
      valid: false,

      reason:
        RESCHEDULE_DRIFT_REASON
          .INVALID_AVAILABILITY,

      startMinutes,
      endMinutes,
    };
  }


  return {
    valid: true,

    reason: null,

    startMinutes,
    endMinutes,
  };
};

const validateOriginalScheduleBlock = (
  block
) => {
  if (
    !block ||
    typeof block !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Schedule block is missing or invalid.",
    };
  }


  if (
    block.id ===
      undefined ||
    block.id ===
      null ||
    block.taskId ===
      undefined ||
    block.taskId ===
      null ||
    block.subjectId ===
      undefined ||
    block.subjectId ===
      null
  ) {
    return {
      valid: false,

      error:
        "Schedule block is missing required identifiers.",
    };
  }


  if (
    !isValidDateKey(
      block.date
    ) ||
    !isValidTime(
      block.startTime
    ) ||
    !isValidTime(
      block.endTime
    )
  ) {
    return {
      valid: false,

      error:
        "Schedule block contains an invalid date or time.",
    };
  }


  const startMinutes =
    timeToMinutes(
      block.startTime
    );


  const endMinutes =
    timeToMinutes(
      block.endTime
    );


  const durationMinutes =
    Number(
      block.durationMinutes
    );


  if (
    endMinutes <=
      startMinutes ||
    !Number.isFinite(
      durationMinutes
    ) ||
    durationMinutes <= 0 ||
    durationMinutes !==
      endMinutes -
        startMinutes
  ) {
    return {
      valid: false,

      error:
        "Schedule block contains an invalid duration.",
    };
  }


  return {
    valid: true,

    error: "",
  };
};

const ISO_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?(?:Z|[+-]\d{2}:\d{2})$/;


const isValidIsoDateTime = (
  value
) => {
  const normalized =
    String(
      value ?? ""
    ).trim();


  return (
    ISO_DATE_TIME_PATTERN.test(
      normalized
    ) &&
    !Number.isNaN(
      Date.parse(
        normalized
      )
    )
  );
};

const getIsoOffsetSuffix = (
  value
) => {
  const normalized =
    String(
      value ?? ""
    ).trim();


  const match =
    normalized.match(
      /(Z|[+-]\d{2}:\d{2})$/
    );


  return (
    match?.[1] ||
    null
  );
};

const getScheduleBlockTimestamp = ({
  block,
  time,
  asOfDateTime,
}) => {
  if (
    !isValidDateKey(
      block?.date
    ) ||
    !isValidTime(
      time
    )
  ) {
    return null;
  }


  const offset =
    getIsoOffsetSuffix(
      asOfDateTime
    );


  if (
    !offset
  ) {
    return null;
  }


  const dateTime =
    `${block.date}T${time}:00${offset}`;


  const timestamp =
    Date.parse(
      dateTime
    );


  return Number.isNaN(
    timestamp
  )
    ? null
    : timestamp;
};

const doExplanationFactorsMatch = (
  actualFactors,
  expectedFactors
) => {
  if (
    !Array.isArray(
      actualFactors
    ) ||
    !Array.isArray(
      expectedFactors
    ) ||
    actualFactors.length !==
      expectedFactors.length
  ) {
    return false;
  }


  return actualFactors.every(
    (
      actual,
      index
    ) => {
      const expected =
        expectedFactors[
          index
        ];


      return (
        actual?.type ===
          expected?.type &&
        actual?.reason ===
          expected?.reason &&
        actual?.label ===
          expected?.label &&
        Number(
          actual?.score
        ) ===
          Number(
            expected?.score
          )
      );
    }
  );
};

const hasSchedulingInputChanged = ({
  task,
  block,
  weekStart,
}) => {
  if (
    !block?.explanation
  ) {
    return false;
  }


  const currentScore =
    scoreTaskForScheduling(
      task,
      weekStart
    );


  const currentExplanation =
    createTaskSchedulingExplanation(
      task,
      currentScore
    );


  if (
    !currentExplanation
  ) {
    return true;
  }


  return !(
    Number(
      block.explanation
        .totalScore
    ) ===
      Number(
        currentExplanation
          .totalScore
      ) &&
    doExplanationFactorsMatch(
      block.explanation
        .factors,
      currentExplanation
        .factors
    )
  );
};

const getAvailabilityDriftReason = ({
  block,
  availability,
}) => {
  const availabilityDay =
    getAvailabilityForDateKey(
      availability,
      block.date
    );


  const validation =
    validateAvailabilityWindow(
      availabilityDay
    );


  if (
    !validation.valid
  ) {
    return (
      validation.reason
    );
  }


  const blockStart =
    timeToMinutes(
      block.startTime
    );


  const blockEnd =
    timeToMinutes(
      block.endTime
    );


  if (
    blockStart <
      validation.startMinutes ||
    blockEnd >
      validation.endMinutes
  ) {
    return (
      RESCHEDULE_DRIFT_REASON
        .OUTSIDE_AVAILABILITY
    );
  }


  return null;
};

const getBlockDriftReasons = ({
  block,
  taskMap,
  subjectMap,
  availability,
  weekStart,
}) => {
  const blockValidation =
    validateOriginalScheduleBlock(
      block
    );


  if (
    !blockValidation.valid
  ) {
    return [
      RESCHEDULE_DRIFT_REASON
        .INVALID_BLOCK,
    ];
  }


  const task =
    taskMap.get(
      String(
        block.taskId
      )
    );


  if (
    !task
  ) {
    return [
      RESCHEDULE_DRIFT_REASON
        .TASK_REMOVED,
    ];
  }


  if (
    task.status ===
    "done"
  ) {
    return [
      RESCHEDULE_DRIFT_REASON
        .TASK_COMPLETED,
    ];
  }


  if (
    task.status !==
    "todo"
  ) {
    return [
      RESCHEDULE_DRIFT_REASON
        .TASK_NOT_OPEN,
    ];
  }


  const subject =
    subjectMap.get(
      String(
        block.subjectId
      )
    );


  if (
    !subject
  ) {
    return [
      RESCHEDULE_DRIFT_REASON
        .SUBJECT_REMOVED,
    ];
  }


  if (
    String(
      task.subjectId
    ) !==
    String(
      block.subjectId
    )
  ) {
    return [
      RESCHEDULE_DRIFT_REASON
        .SUBJECT_CHANGED,
    ];
  }


  const reasons = [];


  const dueDate =
    String(
      task.dueDate ?? ""
    ).trim();


  if (
    dueDate &&
    !isValidDateKey(
      dueDate
    )
  ) {
    reasons.push(
      RESCHEDULE_DRIFT_REASON
        .INVALID_DEADLINE
    );
  }


  if (
    dueDate &&
    isValidDateKey(
      dueDate
    ) &&
    block.date >
      dueDate
  ) {
    reasons.push(
      RESCHEDULE_DRIFT_REASON
        .BLOCK_AFTER_DEADLINE
    );
  }


  const availabilityReason =
    getAvailabilityDriftReason({
      block,
      availability,
    });


  if (
    availabilityReason
  ) {
    reasons.push(
      availabilityReason
    );
  }


  if (
    hasSchedulingInputChanged({
      task,
      block,
      weekStart,
    })
  ) {
    reasons.push(
      RESCHEDULE_DRIFT_REASON
        .SCHEDULING_INPUT_CHANGED
    );
  }


  return [
    ...new Set(
      reasons
    ),
  ];
};

const validateConfirmedCompletionTiming = ({
  block,
  asOfDateTime,
}) => {
  const blockStartTimestamp =
    getScheduleBlockTimestamp({
      block,
      time:
        block.startTime,
      asOfDateTime,
    });


  const asOfTimestamp =
    Date.parse(
      asOfDateTime
    );


  if (
    blockStartTimestamp ===
      null ||
    Number.isNaN(
      asOfTimestamp
    )
  ) {
    return {
      valid: false,

      error:
        "Adaptive rescheduling could not compare confirmed completion timing safely.",
    };
  }


  if (
    blockStartTimestamp >
      asOfTimestamp
  ) {
    return {
      valid: false,

      error:
        "A future study block cannot be confirmed complete relative to the adaptive review time.",
    };
  }


  return {
    valid: true,

    error: "",
  };
};

const classifyAdaptiveScheduleBlock = ({
  block,
  snapshot,
  taskMap,
  subjectMap,
  completedBlockIdSet,
}) => {
  const blockId =
    String(
      block?.id
    );


  const isConfirmedComplete =
    completedBlockIdSet.has(
      blockId
    );


  if (
    isConfirmedComplete
  ) {
    const timingValidation =
      validateConfirmedCompletionTiming({
        block,

        asOfDateTime:
          snapshot
            .asOfDateTime,
      });


    if (
      !timingValidation.valid
    ) {
      return {
        valid: false,

        error:
          timingValidation.error,

        block: null,
      };
    }


    return {
      valid: true,

      error: "",

      block: {
        ...cloneValue(
          block
        ),

        adaptiveState:
          RESCHEDULE_BLOCK_STATE
            .CONFIRMED_COMPLETE,

        driftReasons: [],
      },
    };
  }

  const driftReasons =
    getBlockDriftReasons({
      block,

      taskMap,

      subjectMap,

      availability:
        snapshot
          .studyData
          .availability,

      weekStart:
        snapshot
          .weekStart,
    });


  if (
    driftReasons.length >
    0
  ) {
    return {
      valid: true,

      error: "",

      block: {
        ...cloneValue(
          block
        ),

        adaptiveState:
          RESCHEDULE_BLOCK_STATE
            .INVALIDATED,

        driftReasons,
      },
    };
  }


  const blockEndTimestamp =
    getScheduleBlockTimestamp({
      block,

      time:
        block.endTime,

      asOfDateTime:
        snapshot
          .asOfDateTime,
    });


  const asOfTimestamp =
    Date.parse(
      snapshot
        .asOfDateTime
    );


  if (
    blockEndTimestamp ===
      null ||
    Number.isNaN(
      asOfTimestamp
    )
  ) {
    return {
      valid: false,

      error:
        "Adaptive rescheduling could not compare a schedule block with the review time safely.",

      block: null,
    };
  }


  const adaptiveState =
    blockEndTimestamp <=
      asOfTimestamp
      ? RESCHEDULE_BLOCK_STATE
          .ELAPSED_UNCONFIRMED
      : RESCHEDULE_BLOCK_STATE
          .FUTURE_PLANNED;


  return {
    valid: true,

    error: "",

    block: {
      ...cloneValue(
        block
      ),

      adaptiveState,

      driftReasons: [],
    },
  };
};

export const analyzeAdaptiveScheduleState = (
  snapshot
) => {
  if (
    !snapshot ||
    typeof snapshot !==
      "object" ||
    snapshot.version !==
      ADAPTIVE_RESCHEDULE_VERSION
  ) {
    return {
      valid: false,

      error:
        "Adaptive rescheduling requires a valid adaptive snapshot.",

      analysis: null,
    };
  }


  if (
    !isValidIsoDateTime(
      snapshot.asOfDateTime
    )
  ) {
    return {
      valid: false,

      error:
        "Adaptive rescheduling requires a valid review time.",

      analysis: null,
    };
  }


  const blocks =
    Array.isArray(
      snapshot
        ?.originalSchedule
        ?.blocks
    )
      ? snapshot
          .originalSchedule
          .blocks
      : [];


  const tasks =
    Array.isArray(
      snapshot
        ?.studyData
        ?.tasks
    )
      ? snapshot
          .studyData
          .tasks
      : [];


  const subjects =
    Array.isArray(
      snapshot
        ?.studyData
        ?.subjects
    )
      ? snapshot
          .studyData
          .subjects
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


  const subjectMap =
    new Map(
      subjects.map(
        (subject) => [
          String(
            subject.id
          ),

          subject,
        ]
      )
    );


  const completedBlockIdSet =
    new Set(
      (
        snapshot
          .confirmedCompletedBlockIds ||
        []
      ).map(
        String
      )
    );


  const classifiedBlocks =
    [];


  for (
    const block
    of blocks
  ) {
    const classification =
      classifyAdaptiveScheduleBlock({
        block,

        snapshot,

        taskMap,

        subjectMap,

        completedBlockIdSet,
      });


    if (
      !classification.valid
    ) {
      return {
        valid: false,

        error:
          classification.error,

        analysis: null,
      };
    }


    classifiedBlocks.push(
      classification.block
    );
  }


  const confirmedCompletedBlocks =
    classifiedBlocks.filter(
      (block) =>
        block.adaptiveState ===
        RESCHEDULE_BLOCK_STATE
          .CONFIRMED_COMPLETE
    );


  const futurePlannedBlocks =
    classifiedBlocks.filter(
      (block) =>
        block.adaptiveState ===
        RESCHEDULE_BLOCK_STATE
          .FUTURE_PLANNED
    );


  const elapsedUnconfirmedBlocks =
    classifiedBlocks.filter(
      (block) =>
        block.adaptiveState ===
        RESCHEDULE_BLOCK_STATE
          .ELAPSED_UNCONFIRMED
    );


  const invalidatedBlocks =
    classifiedBlocks.filter(
      (block) =>
        block.adaptiveState ===
        RESCHEDULE_BLOCK_STATE
          .INVALIDATED
    );


  const triggers =
    [];


  if (
    elapsedUnconfirmedBlocks
      .length > 0
  ) {
    triggers.push(
      RESCHEDULE_TRIGGER
        .ELAPSED_REVIEW
    );
  }


  if (
    invalidatedBlocks
      .length > 0
  ) {
    triggers.push(
      RESCHEDULE_TRIGGER
        .STUDY_DATA_CHANGED
    );
  }


  return {
    valid: true,

    error: "",

    analysis: {
      version:
        ADAPTIVE_RESCHEDULE_VERSION,

      scheduleVersion:
        snapshot
          .scheduleVersion,

      weekStart:
        snapshot
          .weekStart,

      weekEnd:
        snapshot
          .weekEnd,

      asOfDateTime:
        snapshot
          .asOfDateTime,

      blocks:
        classifiedBlocks,

      triggers,

      requiresReview:
        elapsedUnconfirmedBlocks
          .length > 0,

      driftDetected:
        invalidatedBlocks
          .length > 0,

      summary: {
        totalBlocks:
          classifiedBlocks.length,

        confirmedCompletedBlocks:
          confirmedCompletedBlocks
            .length,

        futurePlannedBlocks:
          futurePlannedBlocks
            .length,

        elapsedUnconfirmedBlocks:
          elapsedUnconfirmedBlocks
            .length,

        invalidatedBlocks:
          invalidatedBlocks
            .length,
      },
    },
  };
};

const cloneValue = (
  value
) => {
  if (
    Array.isArray(
      value
    )
  ) {
    return value.map(
      cloneValue
    );
  }


  if (
    value &&
    typeof value ===
      "object"
  ) {
    return Object.fromEntries(
      Object.entries(
        value
      ).map(
        ([
          key,
          nestedValue,
        ]) => [
          key,
          cloneValue(
            nestedValue
          ),
        ]
      )
    );
  }


  return value;
};

const getCurrentTaskEstimate = (
  task
) => {
  const estimatedMinutes =
    Number(
      task?.estimatedMinutes
    );


  if (
    !Number.isFinite(
      estimatedMinutes
    ) ||
    !Number.isInteger(
      estimatedMinutes
    ) ||
    estimatedMinutes <= 0
  ) {
    return null;
  }


  return estimatedMinutes;
};

const sumBlockMinutes = (
  blocks
) =>
  blocks.reduce(
    (
      total,
      block
    ) =>
      total +
      (
        Number(
          block?.durationMinutes
        ) || 0
      ),
    0
  );

  const validateRemainingWorkAnalysis = ({
  snapshot,
  analysis,
}) => {
  if (
    !snapshot ||
    typeof snapshot !==
      "object" ||
    snapshot.version !==
      ADAPTIVE_RESCHEDULE_VERSION
  ) {
    return {
      valid: false,

      error:
        "Remaining-work calculation requires a valid adaptive snapshot.",
    };
  }


  if (
    !analysis ||
    typeof analysis !==
      "object" ||
    analysis.version !==
      ADAPTIVE_RESCHEDULE_VERSION
  ) {
    return {
      valid: false,

      error:
        "Remaining-work calculation requires valid adaptive schedule analysis.",
    };
  }


  if (
    analysis.scheduleVersion !==
      snapshot.scheduleVersion ||
    analysis.weekStart !==
      snapshot.weekStart ||
    analysis.weekEnd !==
      snapshot.weekEnd ||
    analysis.asOfDateTime !==
      snapshot.asOfDateTime
  ) {
    return {
      valid: false,

      error:
        "Adaptive analysis does not belong to the supplied adaptive snapshot.",
    };
  }


  if (
    !Array.isArray(
      analysis.blocks
    )
  ) {
    return {
      valid: false,

      error:
        "Adaptive analysis is missing its classified schedule blocks.",
    };
  }


  const originalBlocks =
    Array.isArray(
      snapshot
        ?.originalSchedule
        ?.blocks
    )
      ? snapshot
          .originalSchedule
          .blocks
      : [];


  if (
    analysis.blocks.length !==
      originalBlocks.length
  ) {
    return {
      valid: false,

      error:
        "Adaptive analysis does not contain the same block set as the original schedule.",
    };
  }


  const originalIds =
    originalBlocks.map(
      (block) =>
        String(
          block.id
        )
    );


  const analysisIds =
    analysis.blocks.map(
      (block) =>
        String(
          block.id
        )
    );


  if (
    new Set(
      originalIds
    ).size !==
      originalIds.length ||
    new Set(
      analysisIds
    ).size !==
      analysisIds.length
  ) {
    return {
      valid: false,

      error:
        "Adaptive remaining-work calculation cannot safely process duplicate schedule block IDs.",
    };
  }


  const originalIdSet =
    new Set(
      originalIds
    );


  const hasUnknownBlock =
    analysisIds.some(
      (blockId) =>
        !originalIdSet.has(
          blockId
        )
    );


  if (
    hasUnknownBlock
  ) {
    return {
      valid: false,

      error:
        "Adaptive analysis contains a block that does not belong to the original schedule.",
    };
  }


  for (
    const block
    of analysis.blocks
  ) {
    const validation =
      validateOriginalScheduleBlock(
        block
      );


    if (
      !validation.valid
    ) {
      return {
        valid: false,

        error:
          "Adaptive remaining-work calculation received an invalid classified block.",
      };
    }


    if (
      !Object.values(
        RESCHEDULE_BLOCK_STATE
      ).includes(
        block.adaptiveState
      )
    ) {
      return {
        valid: false,

        error:
          "Adaptive analysis contains an unknown block review state.",
      };
    }
  }


  return {
    valid: true,

    error: "",
  };
};

const createOriginalUnscheduledMinutesMap = (
  snapshot
) => {
  const unscheduled =
    Array.isArray(
      snapshot
        ?.originalSchedule
        ?.unscheduled
    )
      ? snapshot
          .originalSchedule
          .unscheduled
      : [];


  const minutesByTask =
    new Map();


  for (
    const item
    of unscheduled
  ) {
    if (
      item?.taskId ===
        undefined ||
      item?.taskId ===
        null
    ) {
      return {
        valid: false,

        error:
          "Original unscheduled work is missing a task identifier.",

        minutesByTask:
          new Map(),
      };
    }


    const remainingMinutes =
      Number(
        item.remainingMinutes
      );


    if (
      !Number.isFinite(
        remainingMinutes
      ) ||
      remainingMinutes < 0
    ) {
      return {
        valid: false,

        error:
          "Original unscheduled work contains an invalid remaining-minute value.",

        minutesByTask:
          new Map(),
      };
    }


    const taskId =
      String(
        item.taskId
      );


    minutesByTask.set(
      taskId,
      (
        minutesByTask.get(
          taskId
        ) || 0
      ) +
        remainingMinutes
    );
  }


  return {
    valid: true,

    error: "",

    minutesByTask,
  };
};

const createBlocksByTaskMap = (
  blocks
) => {
  const blocksByTask =
    new Map();


  for (
    const block
    of blocks
  ) {
    const taskId =
      String(
        block.taskId
      );


    if (
      !blocksByTask.has(
        taskId
      )
    ) {
      blocksByTask.set(
        taskId,
        []
      );
    }


    blocksByTask
      .get(
        taskId
      )
      .push(
        block
      );
  }


  return blocksByTask;
};

const getBlocksWithAdaptiveState = ({
  blocks,
  state,
}) =>
  blocks.filter(
    (block) =>
      block.adaptiveState ===
      state
  );

  const resolveAdaptiveWorkState = ({
  currentEstimatedMinutes,
  confirmedCompletedMinutes,
  futurePlannedMinutes,
  reviewHeldMinutes,
  readyToRescheduleMinutes,
}) => {
  if (
    confirmedCompletedMinutes >=
      currentEstimatedMinutes
  ) {
    return (
      ADAPTIVE_WORK_STATE
        .CONFIRMED_COMPLETE
    );
  }


  if (
    reviewHeldMinutes > 0
  ) {
    return (
      ADAPTIVE_WORK_STATE
        .NEEDS_REVIEW
    );
  }


  if (
    readyToRescheduleMinutes >
    0
  ) {
    return (
      ADAPTIVE_WORK_STATE
        .READY_TO_RESCHEDULE
    );
  }


  if (
    futurePlannedMinutes > 0
  ) {
    return (
      ADAPTIVE_WORK_STATE
        .FUTURE_COVERED
    );
  }


  return (
    ADAPTIVE_WORK_STATE
      .READY_TO_RESCHEDULE
  );
};

const calculateTaskRemainingWork = ({
  task,
  taskBlocks,
  originalUnscheduledMinutes,
  hadOriginalSchedulePresence,
}) => {
  const currentEstimatedMinutes =
    getCurrentTaskEstimate(
      task
    );


  if (
    currentEstimatedMinutes ===
    null
  ) {
    return {
      valid: false,

      error:
        `Task "${String(
          task?.title ??
            task?.id ??
            "unknown"
        )}" has an invalid current work estimate.`,

      work: null,
    };
  }


  const confirmedBlocks =
    getBlocksWithAdaptiveState({
      blocks:
        taskBlocks,

      state:
        RESCHEDULE_BLOCK_STATE
          .CONFIRMED_COMPLETE,
    });


  const futureBlocks =
    getBlocksWithAdaptiveState({
      blocks:
        taskBlocks,

      state:
        RESCHEDULE_BLOCK_STATE
          .FUTURE_PLANNED,
    });


  const elapsedUnconfirmedBlocks =
    getBlocksWithAdaptiveState({
      blocks:
        taskBlocks,

      state:
        RESCHEDULE_BLOCK_STATE
          .ELAPSED_UNCONFIRMED,
    });


  const invalidatedBlocks =
    getBlocksWithAdaptiveState({
      blocks:
        taskBlocks,

      state:
        RESCHEDULE_BLOCK_STATE
          .INVALIDATED,
    });


  const observedConfirmedMinutes =
    sumBlockMinutes(
      confirmedBlocks
    );


  const observedFutureMinutes =
    sumBlockMinutes(
      futureBlocks
    );


  const observedElapsedUnconfirmedMinutes =
    sumBlockMinutes(
      elapsedUnconfirmedBlocks
    );


  const observedInvalidatedMinutes =
    sumBlockMinutes(
      invalidatedBlocks
    );


  const confirmedCompletedMinutes =
    Math.min(
      currentEstimatedMinutes,
      observedConfirmedMinutes
    );


  const afterConfirmed =
    Math.max(
      0,
      currentEstimatedMinutes -
        confirmedCompletedMinutes
    );


  const futurePlannedMinutes =
    Math.min(
      afterConfirmed,
      observedFutureMinutes
    );


  const afterFuture =
    Math.max(
      0,
      afterConfirmed -
        futurePlannedMinutes
    );


  const reviewHeldMinutes =
    Math.min(
      afterFuture,
      observedElapsedUnconfirmedMinutes
    );


  const readyToRescheduleMinutes =
    Math.max(
      0,
      afterFuture -
        reviewHeldMinutes
    );


  const accountedMinutes =
    confirmedCompletedMinutes +
    futurePlannedMinutes +
    reviewHeldMinutes +
    readyToRescheduleMinutes;


  if (
    accountedMinutes !==
    currentEstimatedMinutes
  ) {
    return {
      valid: false,

      error:
        "Adaptive remaining-work accounting failed for a current open task.",

      work: null,
    };
  }


  const state =
    resolveAdaptiveWorkState({
      currentEstimatedMinutes,

      confirmedCompletedMinutes,

      futurePlannedMinutes,

      reviewHeldMinutes,

      readyToRescheduleMinutes,
    });


  return {
    valid: true,

    error: "",

    work: {
      taskId:
        task.id,

      subjectId:
        task.subjectId,

      task:
        cloneValue(
          task
        ),

      state,

      isNewTask:
        !hadOriginalSchedulePresence,

      currentEstimatedMinutes,

      confirmedCompletedMinutes,

      futurePlannedMinutes,

      reviewHeldMinutes,

      readyToRescheduleMinutes,

      observedMinutes: {
        confirmedCompleted:
          observedConfirmedMinutes,

        futurePlanned:
          observedFutureMinutes,

        elapsedUnconfirmed:
          observedElapsedUnconfirmedMinutes,

        invalidated:
          observedInvalidatedMinutes,

        originalUnscheduled:
          originalUnscheduledMinutes,
      },

      excessMinutes: {
        confirmedCompleted:
          Math.max(
            0,
            observedConfirmedMinutes -
              confirmedCompletedMinutes
          ),

        futurePlanned:
          Math.max(
            0,
            observedFutureMinutes -
              futurePlannedMinutes
          ),

        elapsedUnconfirmed:
          Math.max(
            0,
            observedElapsedUnconfirmedMinutes -
              reviewHeldMinutes
          ),
      },

      blockIds: {
        confirmedCompleted:
          confirmedBlocks.map(
            (block) =>
              block.id
          ),

        futurePlanned:
          futureBlocks.map(
            (block) =>
              block.id
          ),

        elapsedUnconfirmed:
          elapsedUnconfirmedBlocks.map(
            (block) =>
              block.id
          ),

        invalidated:
          invalidatedBlocks.map(
            (block) =>
              block.id
          ),
      },

      accounting: {
        currentEstimatedMinutes,

        accountedMinutes,

        valid:
          accountedMinutes ===
          currentEstimatedMinutes,
      },
    },
  };
};

export const calculateAdaptiveRemainingWork = ({
  snapshot,
  analysis,
}) => {
  const inputValidation =
    validateRemainingWorkAnalysis({
      snapshot,
      analysis,
    });


  if (
    !inputValidation.valid
  ) {
    return {
      valid: false,

      error:
        inputValidation.error,

      remainingWork: null,
    };
  }


  const unscheduledValidation =
    createOriginalUnscheduledMinutesMap(
      snapshot
    );


  if (
    !unscheduledValidation.valid
  ) {
    return {
      valid: false,

      error:
        unscheduledValidation
          .error,

      remainingWork: null,
    };
  }


  const tasks =
    Array.isArray(
      snapshot
        ?.studyData
        ?.tasks
    )
      ? snapshot
          .studyData
          .tasks
      : [];


  const openTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "todo"
    );


  const blocksByTask =
    createBlocksByTaskMap(
      analysis.blocks
    );


  const workItems =
    [];


  for (
    const task
    of openTasks
  ) {
    const taskId =
      String(
        task.id
      );


    const taskBlocks =
      blocksByTask.get(
        taskId
      ) || [];


    const originalUnscheduledMinutes =
      unscheduledValidation
        .minutesByTask
        .get(
          taskId
        ) || 0;


    const hadOriginalSchedulePresence =
      taskBlocks.length > 0 ||
      unscheduledValidation
        .minutesByTask
        .has(
          taskId
        );


    const calculation =
      calculateTaskRemainingWork({
        task,

        taskBlocks,

        originalUnscheduledMinutes,

        hadOriginalSchedulePresence,
      });


    if (
      !calculation.valid
    ) {
      return {
        valid: false,

        error:
          calculation.error,

        remainingWork: null,
      };
    }


    workItems.push(
      calculation.work
    );
  }


  const summary =
    workItems.reduce(
      (
        totals,
        item
      ) => {
        totals.currentEstimatedMinutes +=
          item.currentEstimatedMinutes;


        totals.confirmedCompletedMinutes +=
          item.confirmedCompletedMinutes;


        totals.futurePlannedMinutes +=
          item.futurePlannedMinutes;


        totals.reviewHeldMinutes +=
          item.reviewHeldMinutes;


        totals.readyToRescheduleMinutes +=
          item.readyToRescheduleMinutes;


        totals.observedInvalidatedMinutes +=
          item.observedMinutes
            .invalidated;


        totals.originalUnscheduledMinutes +=
          item.observedMinutes
            .originalUnscheduled;


        if (
          item.state ===
          ADAPTIVE_WORK_STATE
            .NEEDS_REVIEW
        ) {
          totals.tasksNeedingReview +=
            1;
        }


        if (
          item.readyToRescheduleMinutes >
          0
        ) {
          totals.tasksWithReadyWork +=
            1;
        }


        if (
          item.state ===
          ADAPTIVE_WORK_STATE
            .FUTURE_COVERED
        ) {
          totals.tasksCoveredByFuturePlan +=
            1;
        }


        if (
          item.state ===
          ADAPTIVE_WORK_STATE
            .CONFIRMED_COMPLETE
        ) {
          totals.tasksConfirmedComplete +=
            1;
        }


        if (
          item.isNewTask
        ) {
          totals.newTasks +=
            1;
        }


        return totals;
      },
      {
        openTasks:
          workItems.length,

        currentEstimatedMinutes: 0,

        confirmedCompletedMinutes: 0,

        futurePlannedMinutes: 0,

        reviewHeldMinutes: 0,

        readyToRescheduleMinutes: 0,

        observedInvalidatedMinutes: 0,

        originalUnscheduledMinutes: 0,

        tasksNeedingReview: 0,

        tasksWithReadyWork: 0,

        tasksCoveredByFuturePlan: 0,

        tasksConfirmedComplete: 0,

        newTasks: 0,
      }
    );


  const accountedMinutes =
    summary.confirmedCompletedMinutes +
    summary.futurePlannedMinutes +
    summary.reviewHeldMinutes +
    summary.readyToRescheduleMinutes;


  if (
    accountedMinutes !==
    summary.currentEstimatedMinutes
  ) {
    return {
      valid: false,

      error:
        "Adaptive remaining-work accounting failed across current open tasks.",

      remainingWork: null,
    };
  }


  return {
    valid: true,

    error: "",

    remainingWork: {
      version:
        ADAPTIVE_RESCHEDULE_VERSION,

      scheduleVersion:
        snapshot
          .scheduleVersion,

      weekStart:
        snapshot
          .weekStart,

      weekEnd:
        snapshot
          .weekEnd,

      asOfDateTime:
        snapshot
          .asOfDateTime,

      tasks:
        workItems,

      requiresReview:
        summary.reviewHeldMinutes >
        0,

      hasReadyWork:
        summary.readyToRescheduleMinutes >
        0,

      summary: {
        ...summary,

        accountedMinutes,
      },
    },
  };
};

const validateScheduleResult = (
  scheduleResult
) => {
  if (
    !scheduleResult ||
    typeof scheduleResult !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Adaptive rescheduling requires an existing generated schedule.",
    };
  }


  if (
    Number(
      scheduleResult.version
    ) !==
    SCHEDULE_VERSION
  ) {
    return {
      valid: false,

      error:
        "Adaptive rescheduling received an unsupported schedule version.",
    };
  }


  if (
    !isValidDateKey(
      scheduleResult.weekStart
    ) ||
    !isValidDateKey(
      scheduleResult.weekEnd
    )
  ) {
    return {
      valid: false,

      error:
        "Adaptive rescheduling requires a valid schedule week.",
    };
  }


  if (
    !Array.isArray(
      scheduleResult.blocks
    ) ||
    !Array.isArray(
      scheduleResult.unscheduled
    )
  ) {
    return {
      valid: false,

      error:
        "Adaptive rescheduling received an incomplete schedule result.",
    };
  }


  return {
    valid: true,

    error: "",
  };
};

const normalizeCompletedBlockIds = ({
  completedBlockIds,
  blocks,
}) => {
  if (
    !Array.isArray(
      completedBlockIds
    )
  ) {
    return {
      valid: false,

      error:
        "Confirmed completed block IDs must be provided as an array.",

      blockIds: [],
    };
  }


  const knownBlockIds =
    new Set(
      blocks.map(
        (block) =>
          String(
            block.id
          )
      )
    );


  const normalized =
    [
      ...new Set(
        completedBlockIds.map(
          (blockId) =>
            String(
              blockId
            )
        )
      ),
    ];


  const unknownBlockId =
    normalized.find(
      (blockId) =>
        !knownBlockIds.has(
          blockId
        )
    );


  if (
    unknownBlockId
  ) {
    return {
      valid: false,

      error:
        "Adaptive rescheduling received a completed block ID that does not belong to the current schedule.",

      blockIds: [],
    };
  }


  return {
    valid: true,

    error: "",

    blockIds:
      normalized,
  };
};

export const createAdaptiveReschedulingSnapshot = ({
  studyData,
  scheduleResult,
  asOfDateTime,
  completedBlockIds = [],
}) => {
  if (
    !studyData ||
    typeof studyData !==
      "object"
  ) {
    return {
      valid: false,

      error:
        "Adaptive rescheduling requires the current study data.",

      snapshot: null,
    };
  }


  const scheduleValidation =
    validateScheduleResult(
      scheduleResult
    );


  if (
    !scheduleValidation.valid
  ) {
    return {
      valid: false,

      error:
        scheduleValidation.error,

      snapshot: null,
    };
  }


  if (
    !isValidIsoDateTime(
      asOfDateTime
    )
  ) {
    return {
      valid: false,

      error:
        "Adaptive rescheduling requires a valid explicit as-of date and time.",

      snapshot: null,
    };
  }


  const completedBlockValidation =
    normalizeCompletedBlockIds({
      completedBlockIds,

      blocks:
        scheduleResult.blocks,
    });


  if (
    !completedBlockValidation
      .valid
  ) {
    return {
      valid: false,

      error:
        completedBlockValidation
          .error,

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


  const snapshot = {
    version:
      ADAPTIVE_RESCHEDULE_VERSION,

    scheduleVersion:
      SCHEDULE_VERSION,

    weekStart:
      scheduleResult.weekStart,

    weekEnd:
      scheduleResult.weekEnd,

    asOfDateTime:
      String(
        asOfDateTime
      ).trim(),

    studyData: {
      subjects:
        cloneValue(
          subjects
        ),

      tasks:
        cloneValue(
          tasks
        ),

      availability:
        cloneValue(
          availability
        ),

      preferences:
        cloneValue(
          preferences
        ),
    },

    originalSchedule: {
      version:
        scheduleResult.version,

      generatedAt:
        scheduleResult.generatedAt ??
        null,

      blocks:
        cloneValue(
          scheduleResult.blocks
        ),

      unscheduled:
        cloneValue(
          scheduleResult.unscheduled
        ),

      summary:
        cloneValue(
          scheduleResult.summary ??
            {}
        ),
    },

    confirmedCompletedBlockIds:
      [
        ...completedBlockValidation
          .blockIds,
      ],
  };


  return {
    valid: true,

    error: "",

    snapshot,
  };
};

export const createEmptyAdaptiveReschedulingResult = (
  snapshot
) => ({
  version:
    ADAPTIVE_RESCHEDULE_VERSION,

  scheduleVersion:
    snapshot?.scheduleVersion ??
    SCHEDULE_VERSION,

  weekStart:
    snapshot?.weekStart ??
    null,

  weekEnd:
    snapshot?.weekEnd ??
    null,

  asOfDateTime:
    snapshot?.asOfDateTime ??
    null,

  status:
    ADAPTIVE_RESCHEDULE_STATUS
      .UNCHANGED,

  changed: false,

  trigger: null,

  keptBlocks: [],

  completedBlocks: [],

  elapsedUnconfirmedBlocks: [],

  removedBlocks: [],

  replacementBlocks: [],

  unscheduled: [],

  reasons: [],

  summary: {
    originalBlocks:
      Array.isArray(
        snapshot
          ?.originalSchedule
          ?.blocks
      )
        ? snapshot
            .originalSchedule
            .blocks
            .length
        : 0,

    keptBlocks: 0,

    completedBlocks: 0,

    elapsedUnconfirmedBlocks: 0,

    removedBlocks: 0,

    replacementBlocks: 0,
  },
});
