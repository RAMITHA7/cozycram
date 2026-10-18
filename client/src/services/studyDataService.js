const STUDY_DATA_KEY =
  "cozycram-onboarding";


const isValidDeadlineDate = (
  value
) => {
  if (value === "") {
    return true;
  }


  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }


  const date =
    new Date(
      `${value}T00:00:00Z`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return false;
  }


  return (
    date
      .toISOString()
      .slice(0, 10) ===
    value
  );
};


const validateSubjects = (
  subjects
) => {
  if (!Array.isArray(subjects)) {
    return {
      valid: false,
      error:
        "Your saved subject list is not valid.",
    };
  }


  const seenIds =
    new Set();

  const seenNames =
    new Set();


  for (const subject of subjects) {
    if (
      !subject ||
      typeof subject !== "object" ||
      Array.isArray(subject)
    ) {
      return {
        valid: false,
        error:
          "One of your saved subjects is not valid.",
      };
    }


    const subjectId =
      subject.id;

    const subjectIdKey =
      String(
        subjectId ?? ""
      ).trim();


    const subjectName =
      typeof subject.name ===
      "string"
        ? subject.name.trim()
        : "";


    const weeklyHours =
      Number(
        subject.weeklyHours
      );


    const deadlineTitle =
      subject.deadlineTitle ?? "";

    const deadlineDate =
      subject.deadlineDate ?? "";


    if (!subjectIdKey) {
      return {
        valid: false,
        error:
          "One of your saved subjects is missing an identifier.",
      };
    }


    if (!subjectName) {
      return {
        valid: false,
        error:
          "One of your saved subjects is missing a name.",
      };
    }


    if (
      !Number.isFinite(
        weeklyHours
      ) ||
      weeklyHours < 0.5
    ) {
      return {
        valid: false,
        error:
          `${subjectName} must have at least 0.5 weekly study hours.`,
      };
    }


    if (
      typeof deadlineTitle !==
      "string"
    ) {
      return {
        valid: false,
        error:
          `${subjectName} has invalid deadline information.`,
      };
    }


    if (
      typeof deadlineDate !==
        "string" ||
      !isValidDeadlineDate(
        deadlineDate
      )
    ) {
      return {
        valid: false,
        error:
          `${subjectName} has an invalid deadline date.`,
      };
    }


    const normalizedName =
      subjectName.toLowerCase();


    if (
      seenIds.has(
        subjectIdKey
      )
    ) {
      return {
        valid: false,
        error:
          "Your saved subject list contains duplicate identifiers.",
      };
    }


    if (
      seenNames.has(
        normalizedName
      )
    ) {
      return {
        valid: false,
        error:
          "Your saved subject list contains duplicate subject names.",
      };
    }


    seenIds.add(
      subjectIdKey
    );

    seenNames.add(
      normalizedName
    );
  }


  return {
    valid: true,
    error: "",
  };
};

const TASK_PRIORITIES =
  new Set([
    "low",
    "medium",
    "high",
  ]);


const TASK_STATUSES =
  new Set([
    "todo",
    "done",
  ]);


const validateTasks = (
  tasks
) => {
  if (!Array.isArray(tasks)) {
    return {
      valid: false,

      error:
        "Your saved task list is not valid.",
    };
  }


  const seenIds =
    new Set();


  for (const task of tasks) {
    if (
      !task ||
      typeof task !== "object" ||
      Array.isArray(task)
    ) {
      return {
        valid: false,

        error:
          "One of your saved tasks is not valid.",
      };
    }


    const taskId =
      String(
        task.id ?? ""
      ).trim();


    const title =
      typeof task.title ===
      "string"
        ? task.title.trim()
        : "";


    const subjectId =
      String(
        task.subjectId ?? ""
      ).trim();


    const estimatedMinutes =
      Number(
        task.estimatedMinutes
      );


    const dueDate =
      task.dueDate ?? "";


    const notes =
      task.notes ?? "";


    if (!taskId) {
      return {
        valid: false,

        error:
          "One of your saved tasks is missing an identifier.",
      };
    }


    if (
      seenIds.has(
        taskId
      )
    ) {
      return {
        valid: false,

        error:
          "Your saved task list contains duplicate identifiers.",
      };
    }


    if (!title) {
      return {
        valid: false,

        error:
          "One of your saved tasks is missing a title.",
      };
    }


    if (!subjectId) {
      return {
        valid: false,

        error:
          `${title} is not connected to a subject.`,
      };
    }


    if (
      !Number.isFinite(
        estimatedMinutes
      ) ||
      estimatedMinutes < 15
    ) {
      return {
        valid: false,

        error:
          `${title} must have at least 15 minutes of estimated work.`,
      };
    }


    if (
      typeof dueDate !==
        "string" ||
      !isValidDeadlineDate(
        dueDate
      )
    ) {
      return {
        valid: false,

        error:
          `${title} has an invalid due date.`,
      };
    }


    if (
      !TASK_PRIORITIES.has(
        task.priority
      )
    ) {
      return {
        valid: false,

        error:
          `${title} has an invalid priority.`,
      };
    }


    if (
      !TASK_STATUSES.has(
        task.status
      )
    ) {
      return {
        valid: false,

        error:
          `${title} has an invalid status.`,
      };
    }


    if (
      typeof notes !==
      "string"
    ) {
      return {
        valid: false,

        error:
          `${title} has invalid notes.`,
      };
    }


    if (
      typeof task.createdAt !==
        "string" ||
      Number.isNaN(
        Date.parse(
          task.createdAt
        )
      )
    ) {
      return {
        valid: false,

        error:
          `${title} has invalid creation information.`,
      };
    }


    if (
      task.completedAt !== null &&
      task.completedAt !==
        undefined &&
      (
        typeof task.completedAt !==
          "string" ||
        Number.isNaN(
          Date.parse(
            task.completedAt
          )
        )
      )
    ) {
      return {
        valid: false,

        error:
          `${title} has invalid completion information.`,
      };
    }

    if (
  task.status === "done" &&
  (
    typeof task.completedAt !==
      "string" ||
    Number.isNaN(
      Date.parse(
        task.completedAt
      )
    )
  )
) {
  return {
    valid: false,

    error:
      `${title} is marked done but is missing valid completion information.`,
  };
}


if (
  task.status === "todo" &&
  task.completedAt !== null &&
  task.completedAt !==
    undefined
) {
  return {
    valid: false,

    error:
      `${title} has completion information even though it is still marked to do.`,
  };
}

    seenIds.add(
      taskId
    );
  }


  return {
    valid: true,
    error: "",
  };
};


const validateStudyData = (
  studyData
) => {
  if (
    !studyData ||
    typeof studyData !== "object" ||
    Array.isArray(studyData)
  ) {
    return {
      valid: false,
      error:
        "Your saved CozyCram study data is not valid.",
    };
  }


  if (
    studyData.subjects !==
    undefined
  ) {
    const subjectValidation =
      validateSubjects(
        studyData.subjects
      );


    if (
      !subjectValidation.valid
    ) {
      return subjectValidation;
    }
  }


  if (
    studyData.tasks !==
    undefined
  ) {
    const taskValidation =
      validateTasks(
        studyData.tasks
      );


    if (
      !taskValidation.valid
    ) {
      return taskValidation;
    }
  }

  if (
  Array.isArray(
    studyData.subjects
  ) &&
  Array.isArray(
    studyData.tasks
  )
) {
  const subjectIds =
    new Set(
      studyData.subjects.map(
        (subject) =>
          String(
            subject.id
          )
      )
    );


  const orphanTask =
    studyData.tasks.find(
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
        `${orphanTask.title} is connected to a subject that no longer exists.`,
    };
  }
}

  return {
    valid: true,
    error: "",
  };
};


export const loadStudyData = () => {
  try {
    const storedValue =
      localStorage.getItem(
        STUDY_DATA_KEY
      );


    if (!storedValue) {
      return {
        data: null,
        error: "",
      };
    }


    const parsedValue =
      JSON.parse(
        storedValue
      );


    const validation =
      validateStudyData(
        parsedValue
      );


    if (!validation.valid) {
      return {
        data: null,
        error:
          validation.error,
      };
    }


    return {
      data: parsedValue,
      error: "",
    };
  } catch {
    return {
      data: null,
      error:
        "Your saved CozyCram study data could not be read.",
    };
  }
};


export const saveStudyData = (
  nextData
) => {
  const validation =
    validateStudyData(
      nextData
    );


  if (!validation.valid) {
    return {
      success: false,
      error:
        validation.error,
    };
  }


  try {
    localStorage.setItem(
      STUDY_DATA_KEY,
      JSON.stringify(
        nextData
      )
    );


    return {
      success: true,
      error: "",
    };
  } catch {
    return {
      success: false,
      error:
        "CozyCram could not save your changes in this browser.",
    };
  }
};


export const saveSubjects = (
  subjects
) => {
  const validation =
    validateSubjects(
      subjects
    );


  if (!validation.valid) {
    return {
      success: false,
      error:
        validation.error,
    };
  }


  const {
    data,
    error,
  } = loadStudyData();


  if (error) {
    return {
      success: false,
      error,
    };
  }


  if (!data) {
    return {
      success: false,
      error:
        "Complete your CozyCram setup before managing subjects.",
    };
  }


  const nextData = {
    ...data,
    subjects,
  };


  const result =
    saveStudyData(
      nextData
    );


  return {
    ...result,

    data:
      result.success
        ? nextData
        : data,
  };
};

export const saveTasks = (
  tasks
) => {
  const validation =
    validateTasks(
      tasks
    );


  if (!validation.valid) {
    return {
      success: false,

      error:
        validation.error,
    };
  }


  const {
    data,
    error,
  } = loadStudyData();


  if (error) {
    return {
      success: false,
      error,
    };
  }


  if (!data) {
    return {
      success: false,

      error:
        "Complete your CozyCram setup before managing tasks.",
    };
  }


  const nextData = {
    ...data,

    tasks,
  };


  const result =
    saveStudyData(
      nextData
    );


  return {
    ...result,

    data:
      result.success
        ? nextData
        : data,
  };
};

export {
  STUDY_DATA_KEY,
};