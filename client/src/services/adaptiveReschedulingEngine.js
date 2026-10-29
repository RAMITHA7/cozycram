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
