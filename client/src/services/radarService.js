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