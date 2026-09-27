import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CalendarDays,
  Check,
  Clock3,
  GraduationCap,
  Pencil,
  Plus,
  Target,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

import "./onboarding.css";


const onboardingSteps = [
  "Basic setup",
  "Subjects",
  "Workload & deadlines",
  "Availability",
  "Preferences",
  "Review",
];

const ONBOARDING_STORAGE_KEY =
  "cozycram-onboarding";

const defaultAvailability = [
  {
    id: "monday",
    label: "Monday",
    enabled: false,
    start: "18:00",
    end: "20:00",
  },
  {
    id: "tuesday",
    label: "Tuesday",
    enabled: false,
    start: "18:00",
    end: "20:00",
  },
  {
    id: "wednesday",
    label: "Wednesday",
    enabled: false,
    start: "18:00",
    end: "20:00",
  },
  {
    id: "thursday",
    label: "Thursday",
    enabled: false,
    start: "18:00",
    end: "20:00",
  },
  {
    id: "friday",
    label: "Friday",
    enabled: false,
    start: "18:00",
    end: "20:00",
  },
  {
    id: "saturday",
    label: "Saturday",
    enabled: false,
    start: "10:00",
    end: "13:00",
  },
  {
    id: "sunday",
    label: "Sunday",
    enabled: false,
    start: "10:00",
    end: "13:00",
  },
];


const studyLevelLabels = {
  school: "School",
  college: "College / university",
  "exam-prep": "Exam preparation",
  "self-study": "Self-directed learning",
};


const goalLabels = {
  "stay-on-track": "Stay on track",
  prioritize: "Know what to study first",
  "avoid-cramming":
    "Avoid last-minute cramming",
  focus: "Build better focus habits",
};


const studyTimeLabels = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  flexible: "No preference",
};


const spacingLabels = {
  standard: "Standard · about 10 min",
  spacious: "Spacious · about 20 min",
  flexible: "No preference",
};

const loadSavedOnboarding = () => {
  try {
    const savedValue =
      localStorage.getItem(
        ONBOARDING_STORAGE_KEY
      );

    if (!savedValue) {
      return {
        data: null,
        error: "",
      };
    }

    return {
      data: JSON.parse(
        savedValue
      ),
      error: "",
    };
  } catch {
    return {
      data: null,
      error:
        "Your saved onboarding setup could not be restored.",
    };
  }
};

function OnboardingPage() {
  const [initialSaved] =
    useState(
      loadSavedOnboarding
    );

  const savedOnboarding =
    initialSaved.data;


  const [currentStep, setCurrentStep] =
    useState(
      savedOnboarding?.completed
        ? 5
        : 0
    );


  const [name, setName] =
    useState(
      savedOnboarding?.profile
        ?.name ?? ""
    );


  const [studyLevel, setStudyLevel] =
    useState(
      savedOnboarding?.profile
        ?.studyLevel ?? ""
    );


  const [
    primaryGoal,
    setPrimaryGoal,
  ] = useState(
    savedOnboarding?.profile
      ?.primaryGoal ?? ""
  );


  const [
    subjectDraft,
    setSubjectDraft,
  ] = useState("");


  const [
    editingSubjectId,
    setEditingSubjectId,
  ] = useState(null);


  const [
    subjectError,
    setSubjectError,
  ] = useState("");


  const [subjects, setSubjects] =
    useState(
      Array.isArray(
        savedOnboarding?.subjects
      )
        ? savedOnboarding.subjects
        : []
    );


  const [
    availability,
    setAvailability,
  ] = useState(
    Array.isArray(
      savedOnboarding?.availability
    )
      ? savedOnboarding.availability
      : defaultAvailability.map(
          (day) => ({
            ...day,
          })
        )
  );


  const [
    focusPreset,
    setFocusPreset,
  ] = useState(
    savedOnboarding?.preferences
      ?.focusPreset ?? ""
  );


  const [
    customFocusMinutes,
    setCustomFocusMinutes,
  ] = useState(
    savedOnboarding?.preferences
      ?.customFocusMinutes ?? "45"
  );


  const [
    customBreakMinutes,
    setCustomBreakMinutes,
  ] = useState(
    savedOnboarding?.preferences
      ?.customBreakMinutes ?? "10"
  );


  const [
    preferredStudyTime,
    setPreferredStudyTime,
  ] = useState(
    savedOnboarding?.preferences
      ?.preferredStudyTime ?? ""
  );


  const [
    setupSaved,
    setSetupSaved,
  ] = useState(
    Boolean(
      savedOnboarding?.completed
    )
  );


  const [
    saveError,
    setSaveError,
  ] = useState(
    initialSaved.error
  );


  const [
    scheduleSpacing,
    setScheduleSpacing,
  ] = useState(
    savedOnboarding?.preferences
      ?.scheduleSpacing ?? ""
  );



  const progress =
    ((currentStep + 1) /
      onboardingSteps.length) *
    100;


  const basicSetupComplete =
    name.trim().length > 0 &&
    studyLevel !== "" &&
    primaryGoal !== "";


  const subjectsComplete =
    subjects.length > 0;


  const workloadComplete =
    subjects.length > 0 &&
    subjects.every(
      (subject) =>
        Number(subject.weeklyHours) > 0
    );

   const selectedAvailability =
  availability.filter(
    (day) => day.enabled
  );


const availabilityHasInvalidWindow =
  selectedAvailability.some(
    (day) =>
      !day.start ||
      !day.end ||
      day.end <= day.start
  );


const availabilityComplete =
  selectedAvailability.length > 0 &&
  !availabilityHasInvalidWindow;

  const customPresetValid =
  focusPreset !== "custom" ||
  (
    Number(customFocusMinutes) >= 10 &&
    Number(customFocusMinutes) <= 180 &&
    Number(customBreakMinutes) >= 5 &&
    Number(customBreakMinutes) <= 60
  );


const preferencesComplete =
  focusPreset !== "" &&
  preferredStudyTime !== "" &&
  scheduleSpacing !== "" &&
  customPresetValid;

const focusPresetLabel = (() => {
  if (focusPreset === "quick") {
    return "Quick · 25 min focus / 5 min break";
  }

  if (focusPreset === "classic") {
    return "Classic · 50 min focus / 10 min break";
  }

  if (focusPreset === "deep") {
    return "Deep · 90 min focus / 20 min break";
  }

  if (focusPreset === "custom") {
    return `Custom · ${customFocusMinutes} min focus / ${customBreakMinutes} min break`;
  }

  return "Not selected";
})();



  const handleBasicSetupSubmit = (
    event
  ) => {
    event.preventDefault();

    if (!basicSetupComplete) {
      return;
    }

    setCurrentStep(1);
  };


  const resetSubjectEditor = () => {
    setSubjectDraft("");
    setEditingSubjectId(null);
    setSubjectError("");
  };


  const handleSubjectSubmit = (
    event
  ) => {
    event.preventDefault();

    const cleanName =
      subjectDraft.trim();

    if (!cleanName) {
      return;
    }


    const duplicateSubject =
      subjects.some(
        (subject) =>
          subject.id !== editingSubjectId &&
          subject.name
            .toLowerCase() ===
            cleanName.toLowerCase()
      );


    if (duplicateSubject) {
      setSubjectError(
        "That subject is already in your list."
      );

      return;
    }


    if (editingSubjectId !== null) {
      setSubjects(
        (currentSubjects) =>
          currentSubjects.map(
            (subject) =>
              subject.id ===
              editingSubjectId
                ? {
                    ...subject,
                    name: cleanName,
                  }
                : subject
          )
      );

      resetSubjectEditor();

      return;
    }


    setSubjects(
      (currentSubjects) => [
        ...currentSubjects,
        {
          id: Date.now(),
          name: cleanName,
          weeklyHours: "",
          deadlineTitle: "",
          deadlineDate: "",
        },
      ]
    );

    resetSubjectEditor();
  };


  const handleEditSubject = (
    subject
  ) => {
    setSubjectDraft(
      subject.name
    );

    setEditingSubjectId(
      subject.id
    );

    setSubjectError("");
  };


  const handleRemoveSubject = (
    subjectId
  ) => {
    setSubjects(
      (currentSubjects) =>
        currentSubjects.filter(
          (subject) =>
            subject.id !== subjectId
        )
    );


    if (
      editingSubjectId === subjectId
    ) {
      resetSubjectEditor();
    }
  };


  const updateSubjectField = (
    subjectId,
    field,
    value
  ) => {
    setSubjects(
      (currentSubjects) =>
        currentSubjects.map(
          (subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  [field]: value,
                }
              : subject
        )
    );
  };

  const toggleAvailabilityDay = (
  dayId
) => {
  setAvailability(
    (currentAvailability) =>
      currentAvailability.map(
        (day) =>
          day.id === dayId
            ? {
                ...day,
                enabled:
                  !day.enabled,
              }
            : day
      )
  );
};


const updateAvailabilityField = (
  dayId,
  field,
  value
) => {
  setAvailability(
    (currentAvailability) =>
      currentAvailability.map(
        (day) =>
          day.id === dayId
            ? {
                ...day,
                [field]: value,
              }
            : day
      )
  );
};

const handleFinishSetup = () => {
  const onboardingData = {
    version: 1,

    completed: true,

    completedAt:
      new Date().toISOString(),

    profile: {
      name,
      studyLevel,
      primaryGoal,
    },

    subjects,

    availability,

    preferences: {
      focusPreset,
      customFocusMinutes,
      customBreakMinutes,
      preferredStudyTime,
      scheduleSpacing,
    },
  };


  try {
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify(
        onboardingData
      )
    );

    setSaveError("");
    setSetupSaved(true);
  } catch {
    setSetupSaved(false);

    setSaveError(
      "CozyCram could not save your setup in this browser."
    );
  }
};

  return (
    <main
      className="onboarding-page"
      aria-labelledby="onboarding-title"
    >
      <div className="onboarding-shell">
        <header className="onboarding-header">
          <div className="onboarding-header__top">
            <div>
              <p className="onboarding-eyebrow">
                SET UP YOUR WORKSPACE
              </p>

              <h1 id="onboarding-title">
                Build a plan around your real week.
              </h1>
            </div>

            <p
              className="onboarding-step-count"
              aria-label={`Step ${currentStep + 1} of ${onboardingSteps.length}`}
            >
              Step {currentStep + 1} of{" "}
              {onboardingSteps.length}
            </p>
          </div>


          <div
            className="onboarding-progress"
            aria-hidden="true"
          >
            <div
              className="onboarding-progress__bar"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>


          <ol
            className="onboarding-steps"
            aria-label="Onboarding progress"
          >
            {onboardingSteps.map(
              (step, index) => (
                <li
                  key={step}
                  className={
                    index === currentStep
                      ? "onboarding-step onboarding-step--active"
                      : index < currentStep
                        ? "onboarding-step onboarding-step--complete"
                        : "onboarding-step"
                  }
                >
                  <span className="onboarding-step__marker">
                    {index <
                    currentStep ? (
                      <Check
                        size={13}
                        aria-hidden="true"
                      />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <span>
                    {step}
                  </span>
                </li>
              )
            )}
          </ol>
        </header>


        {/* ================================================
            STEP 1 — BASIC SETUP
            ================================================ */}

        {currentStep === 0 && (
          <section
            className="onboarding-card"
            aria-labelledby="basic-setup-title"
          >
            <div className="onboarding-card__heading">
              <div
                className="onboarding-card__icon"
                aria-hidden="true"
              >
                <UserRound
                  size={22}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="onboarding-card__eyebrow">
                  STEP 1
                </p>

                <h2 id="basic-setup-title">
                  Tell CozyCram how you study.
                </h2>

                <p>
                  Start with a few basics so the
                  planner can shape a realistic
                  study week around you.
                </p>
              </div>
            </div>


            <form
              className="onboarding-form"
              onSubmit={
                handleBasicSetupSubmit
              }
            >
              <div className="onboarding-field">
                <label htmlFor="onboarding-name">
                  What should CozyCram call you?
                </label>

                <div className="onboarding-control">
                  <UserRound
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <input
                    id="onboarding-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your first name"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                  />
                </div>

                <p className="onboarding-field__help">
                  This is only used to
                  personalize your CozyCram
                  workspace.
                </p>
              </div>


              <fieldset className="onboarding-field">
                <legend>
                  What best describes your
                  current study level?
                </legend>

                <div className="onboarding-choice-grid">
                  {[
                    {
                      value: "school",
                      title: "School",
                      description:
                        "Classes, homework and exams",
                      icon:
                        GraduationCap,
                    },
                    {
                      value: "college",
                      title:
                        "College / university",
                      description:
                        "Courses, assignments and exams",
                      icon:
                        GraduationCap,
                    },
                    {
                      value: "exam-prep",
                      title:
                        "Exam preparation",
                      description:
                        "Competitive or entrance exams",
                      icon:
                        Target,
                    },
                    {
                      value: "self-study",
                      title:
                        "Self-directed learning",
                      description:
                        "Coding, certifications or skills",
                      icon:
                        Target,
                    },
                  ].map(
                    ({
                      value,
                      title,
                      description,
                      icon: Icon,
                    }) => (
                      <label
                        key={value}
                        className={
                          studyLevel ===
                          value
                            ? "onboarding-choice onboarding-choice--selected"
                            : "onboarding-choice"
                        }
                      >
                        <input
                          type="radio"
                          name="studyLevel"
                          value={value}
                          checked={
                            studyLevel ===
                            value
                          }
                          onChange={(
                            event
                          ) =>
                            setStudyLevel(
                              event
                                .target
                                .value
                            )
                          }
                        />

                        <Icon
                          size={20}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />

                        <span>
                          <strong>
                            {title}
                          </strong>

                          <small>
                            {
                              description
                            }
                          </small>
                        </span>
                      </label>
                    )
                  )}
                </div>
              </fieldset>


              <fieldset className="onboarding-field">
                <legend>
                  What do you want CozyCram to
                  help you improve first?
                </legend>

                <div className="onboarding-goals">
                  {[
                    [
                      "stay-on-track",
                      "Stay on track",
                    ],
                    [
                      "prioritize",
                      "Know what to study first",
                    ],
                    [
                      "avoid-cramming",
                      "Avoid last-minute cramming",
                    ],
                    [
                      "focus",
                      "Build better focus habits",
                    ],
                  ].map(
                    ([value, label]) => (
                      <label
                        key={value}
                        className={
                          primaryGoal ===
                          value
                            ? "onboarding-goal onboarding-goal--selected"
                            : "onboarding-goal"
                        }
                      >
                        <input
                          type="radio"
                          name="primaryGoal"
                          value={value}
                          checked={
                            primaryGoal ===
                            value
                          }
                          onChange={(
                            event
                          ) =>
                            setPrimaryGoal(
                              event
                                .target
                                .value
                            )
                          }
                        />

                        <span>
                          {label}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </fieldset>


              <div className="onboarding-actions">
                <p>
                  Your answers stay in this
                  browser during the current V1
                  setup.
                </p>

                <button
                  type="submit"
                  className="onboarding-next"
                  disabled={
                    !basicSetupComplete
                  }
                >
                  Continue to subjects

                  <ArrowRight
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </form>
          </section>
        )}


        {/* ================================================
            STEP 2 — SUBJECTS
            ================================================ */}

        {currentStep === 1 && (
          <section
            className="onboarding-card"
            aria-labelledby="subjects-title"
          >
            <div className="onboarding-card__heading">
              <div
                className="onboarding-card__icon"
                aria-hidden="true"
              >
                <BookOpen
                  size={22}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="onboarding-card__eyebrow">
                  STEP 2
                </p>

                <h2 id="subjects-title">
                  What are you studying?
                </h2>

                <p>
                  Add the subjects, courses or
                  learning areas you want
                  CozyCram to plan around.
                </p>
              </div>
            </div>


            <form
              className="onboarding-inline-form"
              onSubmit={
                handleSubjectSubmit
              }
            >
              <div className="onboarding-field onboarding-field--grow">
                <label htmlFor="subject-name">
                  Subject name
                </label>

                <div className="onboarding-control">
                  <BookOpen
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <input
                    id="subject-name"
                    type="text"
                    value={subjectDraft}
                    onChange={(event) => {
                      setSubjectDraft(
                        event.target.value
                      );

                      setSubjectError(
                        ""
                      );
                    }}
                    placeholder="e.g. Physics"
                    aria-describedby={
                      subjectError
                        ? "subject-error"
                        : undefined
                    }
                  />
                </div>

                {subjectError && (
                  <p
                    id="subject-error"
                    className="onboarding-error"
                    role="alert"
                  >
                    {subjectError}
                  </p>
                )}
              </div>


              <button
                type="submit"
                className="onboarding-add"
                disabled={
                  subjectDraft
                    .trim()
                    .length === 0
                }
              >
                {editingSubjectId !==
                null ? (
                  <>
                    <Check
                      size={18}
                      aria-hidden="true"
                    />

                    Save changes
                  </>
                ) : (
                  <>
                    <Plus
                      size={18}
                      aria-hidden="true"
                    />

                    Add subject
                  </>
                )}
              </button>
            </form>


            {editingSubjectId !== null && (
              <button
                type="button"
                className="onboarding-cancel-edit"
                onClick={
                  resetSubjectEditor
                }
              >
                Cancel editing
              </button>
            )}


            <div
              className="onboarding-subjects"
              aria-live="polite"
            >
              {subjects.length === 0 ? (
                <div className="onboarding-empty-state">
                  <BookOpen
                    size={24}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      No subjects yet
                    </strong>

                    <p>
                      Add at least one subject
                      before continuing.
                    </p>
                  </div>
                </div>
              ) : (
                subjects.map(
                  (subject) => (
                    <div
                      key={
                        subject.id
                      }
                      className="onboarding-subject-row"
                    >
                      <div className="onboarding-subject-row__main">
                        <span
                          className="onboarding-subject-row__icon"
                          aria-hidden="true"
                        >
                          <BookOpen
                            size={17}
                            strokeWidth={1.8}
                          />
                        </span>

                        <div>
                          <strong>
                            {
                              subject.name
                            }
                          </strong>

                          <span>
                            Workload and
                            deadlines come next
                          </span>
                        </div>
                      </div>


                      <div className="onboarding-subject-row__actions">
                        <button
                          type="button"
                          className="onboarding-icon-button"
                          onClick={() =>
                            handleEditSubject(
                              subject
                            )
                          }
                          aria-label={`Edit ${subject.name}`}
                        >
                          <Pencil
                            size={17}
                            aria-hidden="true"
                          />
                        </button>

                        <button
                          type="button"
                          className="onboarding-icon-button onboarding-icon-button--danger"
                          onClick={() =>
                            handleRemoveSubject(
                              subject.id
                            )
                          }
                          aria-label={`Remove ${subject.name}`}
                        >
                          <Trash2
                            size={17}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>


            <div className="onboarding-actions">
              <p>
                You can add more subjects later
                from your planner settings.
              </p>

              <div className="onboarding-actions__buttons">
                <button
                  type="button"
                  className="onboarding-back"
                  onClick={() =>
                    setCurrentStep(0)
                  }
                >
                  <ArrowLeft
                    size={18}
                    aria-hidden="true"
                  />

                  Back
                </button>

                <button
                  type="button"
                  className="onboarding-next"
                  disabled={
                    !subjectsComplete
                  }
                  onClick={() =>
                    setCurrentStep(2)
                  }
                >
                  Continue

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </section>
        )}


        {/* ================================================
            STEP 3 — WORKLOAD & DEADLINES
            ================================================ */}

        {currentStep === 2 && (
          <section
            className="onboarding-card"
            aria-labelledby="workload-title"
          >
            <div className="onboarding-card__heading">
              <div
                className="onboarding-card__icon"
                aria-hidden="true"
              >
                <Clock3
                  size={22}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="onboarding-card__eyebrow">
                  STEP 3
                </p>

                <h2 id="workload-title">
                  How much work is ahead?
                </h2>

                <p>
                  Give CozyCram a rough weekly
                  workload for each subject and
                  add the next important
                  deadline when you have one.
                </p>
              </div>
            </div>


            <div className="onboarding-workload-list">
              {subjects.map(
                (subject) => (
                  <article
                    key={subject.id}
                    className="onboarding-workload-card"
                  >
                    <div className="onboarding-workload-card__header">
                      <div>
                        <BookOpen
                          size={18}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />

                        <strong>
                          {subject.name}
                        </strong>
                      </div>

                      <span>
                        Required workload,
                        optional deadline
                      </span>
                    </div>


                    <div className="onboarding-workload-grid">
                      <div className="onboarding-field">
                        <label
                          htmlFor={`hours-${subject.id}`}
                        >
                          Study hours per week
                        </label>

                        <div className="onboarding-control">
                          <Clock3
                            size={18}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />

                          <input
                            id={`hours-${subject.id}`}
                            type="number"
                            min="0.5"
                            step="0.5"
                            inputMode="decimal"
                            placeholder="e.g. 4"
                            value={
                              subject.weeklyHours
                            }
                            onChange={(
                              event
                            ) =>
                              updateSubjectField(
                                subject.id,
                                "weeklyHours",
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </div>

                        <p className="onboarding-field__help">
                          A realistic estimate is
                          better than a perfect
                          one.
                        </p>
                      </div>


                      <div className="onboarding-field">
                        <label
                          htmlFor={`deadline-title-${subject.id}`}
                        >
                          Next deadline
                        </label>

                        <div className="onboarding-control">
                          <CalendarDays
                            size={18}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />

                          <input
                            id={`deadline-title-${subject.id}`}
                            type="text"
                            placeholder="e.g. Midterm exam"
                            value={
                              subject.deadlineTitle
                            }
                            onChange={(
                              event
                            ) =>
                              updateSubjectField(
                                subject.id,
                                "deadlineTitle",
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </div>
                      </div>


                      <div className="onboarding-field">
                        <label
                          htmlFor={`deadline-date-${subject.id}`}
                        >
                          Deadline date
                        </label>

                        <div className="onboarding-control">
                          <CalendarDays
                            size={18}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />

                          <input
                            id={`deadline-date-${subject.id}`}
                            type="date"
                            value={
                              subject.deadlineDate
                            }
                            onChange={(
                              event
                            ) =>
                              updateSubjectField(
                                subject.id,
                                "deadlineDate",
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </div>

                        <p className="onboarding-field__help">
                          Leave the deadline
                          fields blank if there
                          is nothing upcoming.
                        </p>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>


            <div className="onboarding-actions">
              <p>
                Every subject needs a weekly
                workload. Deadlines are optional
                during onboarding.
              </p>

              <div className="onboarding-actions__buttons">
                <button
                  type="button"
                  className="onboarding-back"
                  onClick={() =>
                    setCurrentStep(1)
                  }
                >
                  <ArrowLeft
                    size={18}
                    aria-hidden="true"
                  />

                  Back
                </button>

                <button
                  type="button"
                  className="onboarding-next"
                  disabled={
                    !workloadComplete
                  }
                  onClick={() =>
                    setCurrentStep(3)
                  }
                >
                  Continue to availability

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ================================================
    STEP 4 — AVAILABILITY
    ================================================ */}

{currentStep === 3 && (
  <section
    className="onboarding-card"
    aria-labelledby="availability-title"
  >
    <div className="onboarding-card__heading">
      <div
        className="onboarding-card__icon"
        aria-hidden="true"
      >
        <CalendarClock
          size={22}
          strokeWidth={1.8}
        />
      </div>

      <div>
        <p className="onboarding-card__eyebrow">
          STEP 4
        </p>

        <h2 id="availability-title">
          When can you realistically study?
        </h2>

        <p>
          Choose the days you usually have
          available and give CozyCram a
          realistic time window for each one.
        </p>
      </div>
    </div>


    <div className="onboarding-availability-list">
      {availability.map(
        (day) => (
          <div
            key={day.id}
            className={
              day.enabled
                ? "onboarding-availability-row onboarding-availability-row--active"
                : "onboarding-availability-row"
            }
          >
            <label className="onboarding-availability-toggle">
              <input
                type="checkbox"
                checked={
                  day.enabled
                }
                onChange={() =>
                  toggleAvailabilityDay(
                    day.id
                  )
                }
              />

              <span>
                <strong>
                  {day.label}
                </strong>

                <small>
                  {day.enabled
                    ? "Available to study"
                    : "Not available"}
                </small>
              </span>
            </label>


            {day.enabled && (
              <div className="onboarding-time-window">
                <div className="onboarding-field">
                  <label
                    htmlFor={`start-${day.id}`}
                  >
                    From
                  </label>

                  <div className="onboarding-control">
                    <Clock3
                      size={17}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    <input
                      id={`start-${day.id}`}
                      type="time"
                      value={
                        day.start
                      }
                      onChange={(
                        event
                      ) =>
                        updateAvailabilityField(
                          day.id,
                          "start",
                          event
                            .target
                            .value
                        )
                      }
                    />
                  </div>
                </div>


                <div className="onboarding-field">
                  <label
                    htmlFor={`end-${day.id}`}
                  >
                    Until
                  </label>

                  <div className="onboarding-control">
                    <Clock3
                      size={17}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    <input
                      id={`end-${day.id}`}
                      type="time"
                      value={
                        day.end
                      }
                      onChange={(
                        event
                      ) =>
                        updateAvailabilityField(
                          day.id,
                          "end",
                          event
                            .target
                            .value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>


    {availabilityHasInvalidWindow && (
      <p
        className="onboarding-error"
        role="alert"
      >
        Each study window must end later
        than it starts.
      </p>
    )}


    <p className="onboarding-availability-note">
      Use the time you can genuinely protect
      for studying. CozyCram should plan
      around your life, not fill every free
      minute.
    </p>


    <div className="onboarding-actions">
      <p>
        Choose at least one valid study
        window before continuing.
      </p>

      <div className="onboarding-actions__buttons">
        <button
          type="button"
          className="onboarding-back"
          onClick={() =>
            setCurrentStep(2)
          }
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Back
        </button>

        <button
          type="button"
          className="onboarding-next"
          disabled={
            !availabilityComplete
          }
          onClick={() =>
            setCurrentStep(4)
          }
        >
          Continue to preferences

          <ArrowRight
            size={18}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  </section>
)}

  {/* ================================================
    STEP 5 — PREFERENCES
    ================================================ */}

{currentStep === 4 && (
  <section
    className="onboarding-card"
    aria-labelledby="preferences-title"
  >
    <div className="onboarding-card__heading">
      <div
        className="onboarding-card__icon"
        aria-hidden="true"
      >
        <Clock3
          size={22}
          strokeWidth={1.8}
        />
      </div>

      <div>
        <p className="onboarding-card__eyebrow">
          STEP 5
        </p>

        <h2 id="preferences-title">
          How do you prefer to study?
        </h2>

        <p>
          These preferences help CozyCram
          shape sessions around the way you
          work best. Your real availability
          still comes first.
        </p>
      </div>
    </div>


    <div className="onboarding-form">
      <fieldset className="onboarding-field">
        <legend>
          Choose a starting focus rhythm
        </legend>

        <div className="onboarding-preference-grid">
          {[
            {
              value: "quick",
              title: "Quick",
              description:
                "25 min focus · 5 min break",
            },
            {
              value: "classic",
              title: "Classic",
              description:
                "50 min focus · 10 min break",
            },
            {
              value: "deep",
              title: "Deep",
              description:
                "90 min focus · 20 min break",
            },
            {
              value: "custom",
              title: "Custom",
              description:
                "Choose your own rhythm",
            },
          ].map(
            ({
              value,
              title,
              description,
            }) => (
              <label
                key={value}
                className={
                  focusPreset === value
                    ? "onboarding-preference-card onboarding-preference-card--selected"
                    : "onboarding-preference-card"
                }
              >
                <input
                  type="radio"
                  name="focusPreset"
                  value={value}
                  checked={
                    focusPreset === value
                  }
                  onChange={(event) =>
                    setFocusPreset(
                      event.target.value
                    )
                  }
                />

                <span>
                  <strong>
                    {title}
                  </strong>

                  <small>
                    {description}
                  </small>
                </span>
              </label>
            )
          )}
        </div>


        {focusPreset === "custom" && (
          <div className="onboarding-custom-focus">
            <div className="onboarding-field">
              <label htmlFor="custom-focus">
                Focus minutes
              </label>

              <div className="onboarding-control">
                <Clock3
                  size={17}
                  aria-hidden="true"
                />

                <input
                  id="custom-focus"
                  type="number"
                  min="10"
                  max="180"
                  step="5"
                  value={
                    customFocusMinutes
                  }
                  onChange={(event) =>
                    setCustomFocusMinutes(
                      event.target.value
                    )
                  }
                />
              </div>
            </div>


            <div className="onboarding-field">
              <label htmlFor="custom-break">
                Break minutes
              </label>

              <div className="onboarding-control">
                <Clock3
                  size={17}
                  aria-hidden="true"
                />

                <input
                  id="custom-break"
                  type="number"
                  min="5"
                  max="60"
                  step="5"
                  value={
                    customBreakMinutes
                  }
                  onChange={(event) =>
                    setCustomBreakMinutes(
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}
      </fieldset>


      <fieldset className="onboarding-field">
        <legend>
          When do you usually feel best
          doing demanding work?
        </legend>

        <div className="onboarding-goals">
          {[
            [
              "morning",
              "Morning",
            ],
            [
              "afternoon",
              "Afternoon",
            ],
            [
              "evening",
              "Evening",
            ],
            [
              "flexible",
              "No preference",
            ],
          ].map(
            ([value, label]) => (
              <label
                key={value}
                className={
                  preferredStudyTime ===
                  value
                    ? "onboarding-goal onboarding-goal--selected"
                    : "onboarding-goal"
                }
              >
                <input
                  type="radio"
                  name="preferredStudyTime"
                  value={value}
                  checked={
                    preferredStudyTime ===
                    value
                  }
                  onChange={(event) =>
                    setPreferredStudyTime(
                      event.target.value
                    )
                  }
                />

                <span>
                  {label}
                </span>
              </label>
            )
          )}
        </div>

        <p className="onboarding-field__help">
          This is a preference, not a hard
          rule. Your actual availability
          always takes priority.
        </p>
      </fieldset>


      <fieldset className="onboarding-field">
        <legend>
          How much breathing room do you
          prefer between study blocks?
        </legend>

        <div className="onboarding-goals">
          {[
            [
              "standard",
              "Standard · about 10 min",
            ],
            [
              "spacious",
              "Spacious · about 20 min",
            ],
            [
              "flexible",
              "No preference",
            ],
          ].map(
            ([value, label]) => (
              <label
                key={value}
                className={
                  scheduleSpacing ===
                  value
                    ? "onboarding-goal onboarding-goal--selected"
                    : "onboarding-goal"
                }
              >
                <input
                  type="radio"
                  name="scheduleSpacing"
                  value={value}
                  checked={
                    scheduleSpacing ===
                    value
                  }
                  onChange={(event) =>
                    setScheduleSpacing(
                      event.target.value
                    )
                  }
                />

                <span>
                  {label}
                </span>
              </label>
            )
          )}
        </div>
      </fieldset>


      <div className="onboarding-actions">
        <p>
          You can change these preferences
          later. They should guide the plan,
          not trap you in one routine.
        </p>

        <div className="onboarding-actions__buttons">
          <button
            type="button"
            className="onboarding-back"
            onClick={() =>
              setCurrentStep(3)
            }
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />

            Back
          </button>

          <button
            type="button"
            className="onboarding-next"
            disabled={
              !preferencesComplete
            }
            onClick={() =>
                setCurrentStep(5)
            }
          >
            Continue to review

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  </section>
)}

{/* ================================================
    STEP 6 — REVIEW
    ================================================ */}

{currentStep === 5 && (
  <section
    className="onboarding-card"
    aria-labelledby="review-title"
  >
    <div className="onboarding-card__heading">
      <div
        className="onboarding-card__icon"
        aria-hidden="true"
      >
        <Check
          size={22}
          strokeWidth={1.8}
        />
      </div>

      <div>
        <p className="onboarding-card__eyebrow">
          STEP 6
        </p>

        <h2 id="review-title">
          Review your setup.
        </h2>

        <p>
          Make sure this reflects your real
          workload and available study time.
          You can go back and change anything
          before saving.
        </p>
      </div>
    </div>


    <div className="onboarding-review">
      {/* BASIC SETUP */}

      <article className="onboarding-review-card">
        <div className="onboarding-review-card__header">
          <div>
            <span className="onboarding-review-card__step">
              1
            </span>

            <h3>
              Basic setup
            </h3>
          </div>

          <button
            type="button"
            className="onboarding-review-edit"
            onClick={() => {
              setSetupSaved(false);
              setCurrentStep(0);
            }}
          >
            Edit
          </button>
        </div>


        <dl className="onboarding-review-list">
          <div>
            <dt>
              Name
            </dt>

            <dd>
              {name}
            </dd>
          </div>

          <div>
            <dt>
              Study level
            </dt>

            <dd>
              {
                studyLevelLabels[
                  studyLevel
                ]
              }
            </dd>
          </div>

          <div>
            <dt>
              Main goal
            </dt>

            <dd>
              {
                goalLabels[
                  primaryGoal
                ]
              }
            </dd>
          </div>
        </dl>
      </article>


      {/* SUBJECTS + WORKLOAD */}

      <article className="onboarding-review-card">
        <div className="onboarding-review-card__header">
          <div>
            <span className="onboarding-review-card__step">
              2–3
            </span>

            <h3>
              Subjects and workload
            </h3>
          </div>

          <button
            type="button"
            className="onboarding-review-edit"
            onClick={() => {
              setSetupSaved(false);
              setCurrentStep(1);
            }}
          >
            Edit
          </button>
        </div>


        <div className="onboarding-review-subjects">
          {subjects.map(
            (subject) => (
              <div
                key={subject.id}
                className="onboarding-review-subject"
              >
                <div>
                  <strong>
                    {subject.name}
                  </strong>

                  <span>
                    {subject.weeklyHours}
                    {" "}
                    hours / week
                  </span>
                </div>

                {subject.deadlineTitle ? (
                  <p>
                    {
                      subject.deadlineTitle
                    }

                    {subject.deadlineDate
                      ? ` · ${subject.deadlineDate}`
                      : ""}
                  </p>
                ) : (
                  <p>
                    No upcoming deadline added
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </article>


      {/* AVAILABILITY */}

      <article className="onboarding-review-card">
        <div className="onboarding-review-card__header">
          <div>
            <span className="onboarding-review-card__step">
              4
            </span>

            <h3>
              Study availability
            </h3>
          </div>

          <button
            type="button"
            className="onboarding-review-edit"
            onClick={() => {
              setSetupSaved(false);
              setCurrentStep(3);
            }}
          >
            Edit
          </button>
        </div>


        <div className="onboarding-review-availability">
          {selectedAvailability.map(
            (day) => (
              <div
                key={day.id}
              >
                <strong>
                  {day.label}
                </strong>

                <span>
                  {day.start}
                  {" – "}
                  {day.end}
                </span>
              </div>
            )
          )}
        </div>
      </article>


      {/* PREFERENCES */}

      <article className="onboarding-review-card">
        <div className="onboarding-review-card__header">
          <div>
            <span className="onboarding-review-card__step">
              5
            </span>

            <h3>
              Study preferences
            </h3>
          </div>

          <button
            type="button"
            className="onboarding-review-edit"
            onClick={() => {
              setSetupSaved(false);
              setCurrentStep(4);
            }}
          >
            Edit
          </button>
        </div>


        <dl className="onboarding-review-list">
          <div>
            <dt>
              Focus rhythm
            </dt>

            <dd>
              {focusPresetLabel}
            </dd>
          </div>

          <div>
            <dt>
              Preferred time
            </dt>

            <dd>
              {
                studyTimeLabels[
                  preferredStudyTime
                ]
              }
            </dd>
          </div>

          <div>
            <dt>
              Spacing
            </dt>

            <dd>
              {
                spacingLabels[
                  scheduleSpacing
                ]
              }
            </dd>
          </div>
        </dl>
      </article>
    </div>


    {saveError && (
      <p
        className="onboarding-error"
        role="alert"
      >
        {saveError}
      </p>
    )}


    {setupSaved && (
      <div
        className="onboarding-complete"
        role="status"
        aria-live="polite"
      >
        <Check
          size={20}
          strokeWidth={2}
          aria-hidden="true"
        />

        <div>
          <strong>
            Setup saved.
          </strong>

          <p>
            Your onboarding preferences are
            stored locally in this browser.
            CozyCram has not synced anything
            to an account yet.
          </p>
        </div>
      </div>
    )}


    <div className="onboarding-actions">
      <p>
        V1 stores this setup only in this
        browser. Account syncing comes later
        with the real backend.
      </p>

      <div className="onboarding-actions__buttons">
        <button
          type="button"
          className="onboarding-back"
          onClick={() =>
            setCurrentStep(4)
          }
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Back
        </button>

        <button
          type="button"
          className="onboarding-next"
          onClick={
            handleFinishSetup
          }
        >
          {setupSaved
            ? "Save changes"
            : "Finish setup"}

          <Check
            size={18}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  </section>
)}


      </div>
    </main>
  );
}


export default OnboardingPage;