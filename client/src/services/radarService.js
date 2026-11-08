export const RADAR_VERSION =
  1;


export const RADAR_INPUT_STATUS = {
  READY:
    "ready",

  NO_OPEN_WORK:
    "no_open_work",

  NO_AVAILABILITY:
    "no_availability",

  INVALID_DATA:
    "invalid_data",
};

export const RADAR_RISK = {
  SAFE:
    "safe",

  WATCH:
    "watch",

  AT_RISK:
    "at_risk",

  OVERLOADED:
    "overloaded",
};

export const RADAR_RISK_THRESHOLDS =
  Object.freeze({
    SAFE_MAX:
      0.6,

    WATCH_MAX:
      0.8,

    AT_RISK_MAX:
      1,
  });

const TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)$/;


const DATE_KEY_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/;


const parseTimeToMinutes = (
  value
) => {
  const normalized =
    String(
      value ?? ""
    ).trim();


  const match =
    normalized.match(
      TIME_PATTERN
    );


  if (
    !match
  ) {
    return null;
  }


  return (
    Number(
      match[1]
    ) *
      60 +
    Number(
      match[2]
    )
  );
};


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


const getAvailabilityMinutes = (
  availability
) => {
  if (
    !Array.isArray(
      availability
    )
  ) {
    return {
      valid: false,

      totalMinutes:
        0,
    };
  }


  let totalMinutes =
    0;


  for (
    const day
    of availability
  ) {
    if (
      !day ||
      day.enabled !== true
    ) {
      continue;
    }


    const startMinutes =
      parseTimeToMinutes(
        day.start
      );


    const endMinutes =
      parseTimeToMinutes(
        day.end
      );


    if (
      startMinutes === null ||
      endMinutes === null ||
      endMinutes <=
        startMinutes
    ) {
      return {
        valid: false,

        totalMinutes:
          0,
      };
    }


    totalMinutes +=
      endMinutes -
      startMinutes;
  }


  return {
    valid: true,

    totalMinutes,
  };
};


const createBaseSnapshot = ({
  status,
  openTasks = [],
  datedTasks = [],
  undatedTasks = [],
  invalidDeadlineTasks = [],
  remainingWorkMinutes = 0,
  weeklyAvailableMinutes = 0,
}) => ({
  version:
    RADAR_VERSION,

  status,

  openTasks,

  datedTasks,

  undatedTasks,

  invalidDeadlineTasks,

  openTaskCount:
    openTasks.length,

  datedTaskCount:
    datedTasks.length,

  undatedTaskCount:
    undatedTasks.length,

  invalidDeadlineCount:
    invalidDeadlineTasks.length,

  remainingWorkMinutes,

  weeklyAvailableMinutes,
});


export const createRadarInputSnapshot =
  (
    studyData
  ) => {
    if (
      !studyData ||
      typeof studyData !==
        "object" ||
      studyData.completed !==
        true
    ) {
      return {
        valid: false,

        error:
          "Cram Radar requires completed CozyCram study data.",

        snapshot:
          createBaseSnapshot({
            status:
              RADAR_INPUT_STATUS
                .INVALID_DATA,
          }),
      };
    }


    const tasks =
      Array.isArray(
        studyData.tasks
      )
        ? studyData.tasks
        : [];


    const openTasks =
      tasks.filter(
        (task) =>
          task &&
          task.status ===
            "todo"
      );


    const normalizedOpenTasks =
      [];


    const datedTasks =
      [];


    const undatedTasks =
      [];


    const invalidDeadlineTasks =
      [];


    let remainingWorkMinutes =
      0;


    for (
      const task
      of openTasks
    ) {
      const estimatedMinutes =
        Number(
          task.estimatedMinutes
        );


      if (
        !Number.isInteger(
          estimatedMinutes
        ) ||
        estimatedMinutes <= 0
      ) {
        return {
          valid: false,

          error:
            "Cram Radar found an open task with an invalid remaining-work estimate.",

          snapshot:
            createBaseSnapshot({
              status:
                RADAR_INPUT_STATUS
                  .INVALID_DATA,
            }),
        };
      }


      const normalizedTask = {
        id:
          task.id,

        title:
          String(
            task.title ?? ""
          ).trim(),

        subjectId:
          task.subjectId,

        estimatedMinutes,

        dueDate:
          task.dueDate ||
          "",

        priority:
          task.priority ||
          "medium",
      };


      normalizedOpenTasks.push(
        normalizedTask
      );


      remainingWorkMinutes +=
        estimatedMinutes;


      if (
        !normalizedTask.dueDate
      ) {
        undatedTasks.push(
          normalizedTask
        );

        continue;
      }


      if (
        !isValidDateKey(
          normalizedTask.dueDate
        )
      ) {
        invalidDeadlineTasks.push(
          normalizedTask
        );

        continue;
      }


      datedTasks.push(
        normalizedTask
      );
    }


    const availabilityResult =
      getAvailabilityMinutes(
        studyData.availability
      );


    if (
      !availabilityResult.valid
    ) {
      return {
        valid: false,

        error:
          "Cram Radar found invalid saved study availability.",

        snapshot:
          createBaseSnapshot({
            status:
              RADAR_INPUT_STATUS
                .INVALID_DATA,
          }),
      };
    }


    if (
      normalizedOpenTasks.length ===
      0
    ) {
      return {
        valid: true,

        error: "",

        snapshot:
          createBaseSnapshot({
            status:
              RADAR_INPUT_STATUS
                .NO_OPEN_WORK,

            weeklyAvailableMinutes:
              availabilityResult
                .totalMinutes,
          }),
      };
    }


    if (
      availabilityResult
        .totalMinutes <= 0
    ) {
      return {
        valid: true,

        error: "",

        snapshot:
          createBaseSnapshot({
            status:
              RADAR_INPUT_STATUS
                .NO_AVAILABILITY,

            openTasks:
              normalizedOpenTasks,

            datedTasks,

            undatedTasks,

            invalidDeadlineTasks,

            remainingWorkMinutes,
          }),
      };
    }


    return {
      valid: true,

      error: "",

      snapshot:
        createBaseSnapshot({
          status:
            RADAR_INPUT_STATUS
              .READY,

          openTasks:
            normalizedOpenTasks,

          datedTasks,

          undatedTasks,

          invalidDeadlineTasks,

          remainingWorkMinutes,

          weeklyAvailableMinutes:
            availabilityResult
              .totalMinutes,
        }),
    };
  };

  const RADAR_WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];


const RADAR_WEEKDAY_ALIASES = {
  sun:
    "sunday",

  sunday:
    "sunday",

  mon:
    "monday",

  monday:
    "monday",

  tue:
    "tuesday",

  tues:
    "tuesday",

  tuesday:
    "tuesday",

  wed:
    "wednesday",

  wednesday:
    "wednesday",

  thu:
    "thursday",

  thur:
    "thursday",

  thurs:
    "thursday",

  thursday:
    "thursday",

  fri:
    "friday",

  friday:
    "friday",

  sat:
    "saturday",

  saturday:
    "saturday",
};
const parseRadarDateKey = (
  value
) => {
  if (
    !isValidDateKey(
      value
    )
  ) {
    return null;
  }


  const [
    year,
    month,
    day,
  ] =
    String(
      value
    )
      .split("-")
      .map(Number);


  return {
    year,
    month,
    day,
  };
};


const getRadarDateSerial = (
  value
) => {
  const parsed =
    parseRadarDateKey(
      value
    );


  if (
    !parsed
  ) {
    return null;
  }


  return Math.floor(
    Date.UTC(
      parsed.year,
      parsed.month - 1,
      parsed.day
    ) /
      86400000
  );
};
const createRadarDateKeyFromSerial = (
  serial
) => {
  const date =
    new Date(
      serial *
        86400000
    );


  const year =
    date.getUTCFullYear();


  const month =
    String(
      date.getUTCMonth() +
        1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getUTCDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;
};
const getRadarWeekdayKey = (
  dateKey
) => {
  const parsed =
    parseRadarDateKey(
      dateKey
    );


  if (
    !parsed
  ) {
    return null;
  }


  const weekdayIndex =
    new Date(
      Date.UTC(
        parsed.year,
        parsed.month - 1,
        parsed.day
      )
    ).getUTCDay();


  return (
    RADAR_WEEKDAY_KEYS[
      weekdayIndex
    ] ??
    null
  );
};
const normalizeRadarAvailabilityDayKey =
  (
    day
  ) => {
    const candidates = [
      day?.id,
      day?.label,
    ];


    for (
      const candidate
      of candidates
    ) {
      const normalized =
        String(
          candidate ?? ""
        )
          .trim()
          .toLowerCase();


      if (
        RADAR_WEEKDAY_ALIASES[
          normalized
        ]
      ) {
        return (
          RADAR_WEEKDAY_ALIASES[
            normalized
          ]
        );
      }
    }


    return null;
  };
const validateRadarAvailability =
  (
    availability
  ) => {
    if (
      !Array.isArray(
        availability
      )
    ) {
      return {
        valid: false,

        error:
          "Cram Radar requires saved study availability.",
      };
    }


    for (
      const day
      of availability
    ) {
      if (
        !day ||
        day.enabled !==
          true
      ) {
        continue;
      }


      const weekdayKey =
        normalizeRadarAvailabilityDayKey(
          day
        );


      const startMinutes =
        parseTimeToMinutes(
          day.start
        );


      const endMinutes =
        parseTimeToMinutes(
          day.end
        );


      if (
        !weekdayKey ||
        startMinutes ===
          null ||
        endMinutes ===
          null ||
        endMinutes <=
          startMinutes
      ) {
        return {
          valid: false,

          error:
            "Cram Radar found study availability that cannot be matched safely to a weekday and time window.",
        };
      }
    }


    return {
      valid: true,

      error: "",
    };
  };
  const getRadarCapacityForDate =
  ({
    availability,
    dateKey,
    referenceDateKey,
    referenceMinutesIntoDay,
  }) => {
    const weekdayKey =
      getRadarWeekdayKey(
        dateKey
      );


    if (
      !weekdayKey
    ) {
      return 0;
    }


    let totalMinutes =
      0;


    for (
      const day
      of availability
    ) {
      if (
        !day ||
        day.enabled !==
          true ||
        normalizeRadarAvailabilityDayKey(
          day
        ) !==
          weekdayKey
      ) {
        continue;
      }


      const startMinutes =
        parseTimeToMinutes(
          day.start
        );


      const endMinutes =
        parseTimeToMinutes(
          day.end
        );


      if (
        startMinutes ===
          null ||
        endMinutes ===
          null ||
        endMinutes <=
          startMinutes
      ) {
        continue;
      }


      if (
        dateKey ===
          referenceDateKey
      ) {
        const effectiveStart =
          Math.max(
            startMinutes,
            referenceMinutesIntoDay
          );


        totalMinutes +=
          Math.max(
            0,
            endMinutes -
              effectiveStart
          );


        continue;
      }


      totalMinutes +=
        endMinutes -
        startMinutes;
    }


    return totalMinutes;
  };
  const getRadarCapacityThroughDate =
  ({
    availability,
    referenceDateKey,
    referenceMinutesIntoDay,
    dueDate,
  }) => {
    const referenceSerial =
      getRadarDateSerial(
        referenceDateKey
      );


    const dueSerial =
      getRadarDateSerial(
        dueDate
      );


    if (
      referenceSerial ===
        null ||
      dueSerial ===
        null ||
      dueSerial <
        referenceSerial
    ) {
      return 0;
    }


    let totalMinutes =
      0;


    for (
      let serial =
        referenceSerial;
      serial <=
        dueSerial;
      serial += 1
    ) {
      const dateKey =
        createRadarDateKeyFromSerial(
          serial
        );


      totalMinutes +=
        getRadarCapacityForDate({
          availability,

          dateKey,

          referenceDateKey,

          referenceMinutesIntoDay,
        });
    }


    return totalMinutes;
  };
  export const classifyRadarPressure =
  ({
    workMinutes,
    availableMinutes,
    overdue = false,
  }) => {
    const safeWorkMinutes =
      Number(
        workMinutes
      );


    const safeAvailableMinutes =
      Number(
        availableMinutes
      );


    if (
      !Number.isFinite(
        safeWorkMinutes
      ) ||
      safeWorkMinutes < 0 ||
      !Number.isFinite(
        safeAvailableMinutes
      ) ||
      safeAvailableMinutes < 0
    ) {
      return null;
    }


    if (
      safeWorkMinutes ===
        0
    ) {
      return RADAR_RISK
        .SAFE;
    }


    if (
      overdue
    ) {
      return RADAR_RISK
        .OVERLOADED;
    }


    if (
      safeAvailableMinutes ===
        0
    ) {
      return RADAR_RISK
        .OVERLOADED;
    }


    const pressureRatio =
      safeWorkMinutes /
      safeAvailableMinutes;


    if (
      pressureRatio <=
        RADAR_RISK_THRESHOLDS
          .SAFE_MAX
    ) {
      return RADAR_RISK
        .SAFE;
    }


    if (
      pressureRatio <=
        RADAR_RISK_THRESHOLDS
          .WATCH_MAX
    ) {
      return RADAR_RISK
        .WATCH;
    }


    if (
      pressureRatio <=
        RADAR_RISK_THRESHOLDS
          .AT_RISK_MAX
    ) {
      return RADAR_RISK
        .AT_RISK;
    }


    return RADAR_RISK
      .OVERLOADED;
  };
  const RADAR_RISK_SEVERITY = {
  [RADAR_RISK.SAFE]:
    1,

  [RADAR_RISK.WATCH]:
    2,

  [RADAR_RISK.AT_RISK]:
    3,

  [RADAR_RISK.OVERLOADED]:
    4,
};
export const createRadarDeadlineAnalysis =
  ({
    snapshot,
    availability,
    referenceDateKey,
    referenceMinutesIntoDay,
  }) => {
    if (
      !snapshot ||
      typeof snapshot !==
        "object" ||
      snapshot.version !==
        RADAR_VERSION
    ) {
      return {
        valid: false,

        error:
          "Cram Radar requires a valid Radar input snapshot.",

        analysis: null,
      };
    }


    if (
      snapshot.status !==
        RADAR_INPUT_STATUS
          .READY
    ) {
      return {
        valid: false,

        error:
          "Cram Radar deadline analysis requires ready workload and availability inputs.",

        analysis: null,
      };
    }


    if (
      !isValidDateKey(
        referenceDateKey
      )
    ) {
      return {
        valid: false,

        error:
          "Cram Radar requires a valid reference date.",

        analysis: null,
      };
    }


    const safeReferenceMinutes =
      Number(
        referenceMinutesIntoDay
      );


    if (
      !Number.isInteger(
        safeReferenceMinutes
      ) ||
      safeReferenceMinutes <
        0 ||
      safeReferenceMinutes >
        1439
    ) {
      return {
        valid: false,

        error:
          "Cram Radar requires a valid current time of day.",

        analysis: null,
      };
    }


    const availabilityValidation =
      validateRadarAvailability(
        availability
      );


    if (
      !availabilityValidation
        .valid
    ) {
      return {
        valid: false,

        error:
          availabilityValidation
            .error,

        analysis: null,
      };
    }


    const datedTasks =
      Array.isArray(
        snapshot.datedTasks
      )
        ? snapshot.datedTasks
        : [];


    if (
      datedTasks.length ===
        0
    ) {
      return {
        valid: true,

        error: "",

        analysis: {
          version:
            RADAR_VERSION,

          referenceDateKey,

          overallRisk:
            null,

          horizonCount:
            0,

          overdueTaskCount:
            0,

          overdueWorkMinutes:
            0,

          horizons:
            [],
        },
      };
    }


    const referenceSerial =
      getRadarDateSerial(
        referenceDateKey
      );


    const uniqueDueDates =
      [
        ...new Set(
          datedTasks.map(
            (task) =>
              task.dueDate
          )
        ),
      ].sort();


    const horizons =
      [];


    for (
      const dueDate
      of uniqueDueDates
    ) {
      const dueSerial =
        getRadarDateSerial(
          dueDate
        );


      if (
        dueSerial ===
          null
      ) {
        continue;
      }


      const daysUntilDeadline =
        dueSerial -
        referenceSerial;


      const overdue =
        daysUntilDeadline <
        0;


      const tasksDueOnDate =
        datedTasks.filter(
          (task) =>
            task.dueDate ===
            dueDate
        );


      const tasksDueByDate =
        datedTasks.filter(
          (task) =>
            task.dueDate <=
            dueDate
        );


      const workMinutesDueOnDate =
        tasksDueOnDate.reduce(
          (
            total,
            task
          ) =>
            total +
            task.estimatedMinutes,
          0
        );


      const cumulativeWorkMinutes =
        tasksDueByDate.reduce(
          (
            total,
            task
          ) =>
            total +
            task.estimatedMinutes,
          0
        );


      const availableMinutes =
        overdue
          ? 0
          : getRadarCapacityThroughDate({
              availability,

              referenceDateKey,

              referenceMinutesIntoDay:
                safeReferenceMinutes,

              dueDate,
            });


      const risk =
        classifyRadarPressure({
          workMinutes:
            cumulativeWorkMinutes,

          availableMinutes,

          overdue,
        });


      if (
        !risk
      ) {
        return {
          valid: false,

          error:
            "Cram Radar could not classify a deadline horizon safely.",

          analysis: null,
        };
      }


      const pressureRatio =
        availableMinutes >
        0
          ? cumulativeWorkMinutes /
            availableMinutes
          : null;


      horizons.push({
        dueDate,

        daysUntilDeadline,

        overdue,

        taskCountDueOnDate:
          tasksDueOnDate.length,

        workMinutesDueOnDate,

        cumulativeTaskCount:
          tasksDueByDate.length,

        cumulativeWorkMinutes,

        availableMinutes,

        bufferMinutes:
          availableMinutes -
          cumulativeWorkMinutes,

        capacityUsedPercent:
          pressureRatio ===
          null
            ? null
            : Math.round(
                pressureRatio *
                  100
              ),

        risk,
      });
    }


    const overdueTasks =
      datedTasks.filter(
        (task) =>
          task.dueDate <
          referenceDateKey
      );


    const overdueWorkMinutes =
      overdueTasks.reduce(
        (
          total,
          task
        ) =>
          total +
          task.estimatedMinutes,
        0
      );


    const overallRisk =
      horizons.reduce(
        (
          highestRisk,
          horizon
        ) => {
          if (
            !highestRisk
          ) {
            return horizon.risk;
          }


          return (
            RADAR_RISK_SEVERITY[
              horizon.risk
            ] >
            RADAR_RISK_SEVERITY[
              highestRisk
            ]
              ? horizon.risk
              : highestRisk
          );
        },
        null
      );


    return {
      valid: true,

      error: "",

      analysis: {
        version:
          RADAR_VERSION,

        referenceDateKey,

        overallRisk,

        horizonCount:
          horizons.length,

        overdueTaskCount:
          overdueTasks.length,

        overdueWorkMinutes,

        horizons,
      },
    };
};