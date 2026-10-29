import {
  SCHEDULE_VERSION,
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
