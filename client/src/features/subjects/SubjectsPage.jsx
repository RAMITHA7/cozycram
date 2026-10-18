import {
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  loadStudyData,
  saveSubjects
} from "../../services/studyDataService.js";

import "./subjects.css";


const formatDeadlineDate = (
  deadlineDate
) => {
  if (!deadlineDate) {
    return "";
  }


  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    new Date(
      `${deadlineDate}T00:00:00`
    )
  );
};


function SubjectsPage() {
  const [initialData] =
    useState(
      loadStudyData
    );


  const studyData =
    initialData.data;

  const loadError =
    initialData.error;


  const [
  subjects,
  setSubjects,
] = useState(
  Array.isArray(
    studyData?.subjects
  )
    ? studyData.subjects
    : []
);

const tasks =
  Array.isArray(
    studyData?.tasks
  )
    ? studyData.tasks
    : [];

const [
  editorOpen,
  setEditorOpen,
] = useState(false);


const [
  editingSubjectId,
  setEditingSubjectId,
] = useState(null);


const [
  subjectName,
  setSubjectName,
] = useState("");


const [
  weeklyHours,
  setWeeklyHours,
] = useState("");


const [
  deadlineTitle,
  setDeadlineTitle,
] = useState("");


const [
  deadlineDate,
  setDeadlineDate,
] = useState("");


const [
  formError,
  setFormError,
] = useState("");


const [
  saveError,
  setSaveError,
] = useState("");


const [
  statusMessage,
  setStatusMessage,
] = useState("");


  const totalWeeklyHours =
    subjects.reduce(
      (total, subject) =>
        total +
        (
          Number(
            subject.weeklyHours
          ) || 0
        ),
      0
    );


  const subjectsWithDeadlines =
    subjects.filter(
      (subject) =>
        subject.deadlineDate
    ).length;


   const resetSubjectEditor = () => {
  setSubjectName("");
  setWeeklyHours("");
  setDeadlineTitle("");
  setDeadlineDate("");

  setEditingSubjectId(null);

  setFormError("");
  setSaveError("");
};



const openAddSubject = () => {
  resetSubjectEditor();

  setDeleteCandidateId(
    null
  );

  setStatusMessage("");

  setEditorOpen(true);
};


const closeSubjectEditor = () => {
  resetSubjectEditor();

  setEditorOpen(false);
};

const handleEditSubject = (
  subject
) => {
  setSubjectName(
    subject.name ?? ""
  );

  setWeeklyHours(
    String(
      subject.weeklyHours ?? ""
    )
  );

  setDeadlineTitle(
    subject.deadlineTitle ?? ""
  );

  setDeadlineDate(
    subject.deadlineDate ?? ""
  );

  setEditingSubjectId(
    subject.id
  );

  setDeleteCandidateId(
    null
  );

  setFormError("");
  setSaveError("");
  setStatusMessage("");

  setEditorOpen(true);
};

const [
  deleteCandidateId,
  setDeleteCandidateId,
] = useState(null);


const handleSubjectSubmit = (
  event
) => {
  event.preventDefault();

   const wasEditing =
  editingSubjectId !== null;

  const cleanName =
    subjectName.trim();


  const cleanWeeklyHours =
    weeklyHours.trim();


  const cleanDeadlineTitle =
    deadlineTitle.trim();


  setFormError("");
  setSaveError("");
  setStatusMessage("");


  if (!cleanName) {
    setFormError(
      "Enter a subject name."
    );

    return;
  }


  const numericWeeklyHours =
  Number(
    cleanWeeklyHours
  );


if (
  !cleanWeeklyHours ||
  !Number.isFinite(
    numericWeeklyHours
  ) ||
  numericWeeklyHours < 0.5
) {
  setFormError(
    "Weekly study hours must be at least 0.5."
  );

  return;
}


  const duplicateSubject =
    subjects.some(
      (subject) =>
        subject.id !==
          editingSubjectId &&
        subject.name
          .trim()
          .toLowerCase() ===
          cleanName.toLowerCase()
    );


  if (duplicateSubject) {
    setFormError(
      "That subject is already in your list."
    );

    return;
  }


  const nextSubjects =
  editingSubjectId !== null
    ? subjects.map(
        (subject) =>
          subject.id ===
          editingSubjectId
            ? {
                ...subject,

                name:
                  cleanName,

                weeklyHours:
                  cleanWeeklyHours,

                deadlineTitle:
                  cleanDeadlineTitle,

                deadlineDate,
              }
            : subject
      )
    : [
        ...subjects,
        {
          id: Date.now(),

          name:
            cleanName,

          weeklyHours:
            cleanWeeklyHours,

          deadlineTitle:
            cleanDeadlineTitle,

          deadlineDate,
        },
      ];



  const result =
    saveSubjects(
      nextSubjects
    );


  if (!result.success) {
    setSaveError(
      result.error
    );

    return;
  }


  setSubjects(
    nextSubjects
  );

  resetSubjectEditor();

  setEditorOpen(false);

  setStatusMessage(
    wasEditing
    ? `${cleanName} was updated.`
    : `${cleanName} was added.`
);
};

const handleDeleteSubject = (
  subject
) => {
  setSaveError("");
  setFormError("");
  setStatusMessage("");

const attachedTasks =
  tasks.filter(
    (task) =>
      String(
        task.subjectId
      ) ===
      String(
        subject.id
      )
  );


if (
  attachedTasks.length > 0
) {
  setDeleteCandidateId(
    null
  );


  setSaveError(
    attachedTasks.length === 1
      ? `Move or delete the task connected to ${subject.name} before deleting this subject.`
      : `Move or delete the ${attachedTasks.length} tasks connected to ${subject.name} before deleting this subject.`
  );


  return;
}

  const nextSubjects =
    subjects.filter(
      (currentSubject) =>
        currentSubject.id !==
        subject.id
    );


  const result =
    saveSubjects(
      nextSubjects
    );


  if (!result.success) {
    setSaveError(
      result.error
    );

    return;
  }


  setSubjects(
    nextSubjects
  );


  if (
    editingSubjectId ===
    subject.id
  ) {
    resetSubjectEditor();

    setEditorOpen(false);
  }


  setDeleteCandidateId(
    null
  );


  setStatusMessage(
    `${subject.name} was deleted.`
  );
};


  return (
    <section
      className="subjects-page"
      aria-labelledby="subjects-page-title"
    >
      <header className="subjects-page__header">
  <div>
    <p className="subjects-page__eyebrow">
      PLANNER
    </p>

    <h1 id="subjects-page-title">
      Subjects
    </h1>

    <p className="subjects-page__intro">
      Keep the areas you are studying
      in one place. CozyCram uses their
      workload and deadlines when
      deciding what needs your
      attention.
    </p>
  </div>


  {studyData?.completed &&
    !loadError && (
      <button
        type="button"
        className="subjects-add-button"
        onClick={
          openAddSubject
        }
        aria-expanded={
          editorOpen
        }
        aria-controls="subject-editor"
      >
        <Plus
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        Add subject
      </button>
    )}
</header>

{editorOpen &&
  studyData?.completed &&
  !loadError && (
    <section
      id="subject-editor"
      className="subject-editor"
      aria-labelledby="subject-editor-title"
    >
      <div className="subject-editor__header">
        <div>
          <p>
            SUBJECT DETAILS
          </p>

         <h2 id="subject-editor-title">
  {editingSubjectId !== null
    ? "Edit subject"
    : "Add a subject"}
</h2>
        </div>


        <button
          type="button"
          className="subject-editor__close"
          onClick={
            closeSubjectEditor
          }
          aria-label="Close subject editor"
        >
          <X
            size={18}
            aria-hidden="true"
          />
        </button>
      </div>


      <form
        className="subject-editor__form"
        onSubmit={
          handleSubjectSubmit
        }
      >
        <div className="subject-editor__grid">
          <div className="subject-editor__field subject-editor__field--wide">
            <label htmlFor="subject-name">
              Subject name
            </label>

            <div className="subject-editor__control">
              <BookOpen
                size={17}
                aria-hidden="true"
              />

              <input
                id="subject-name"
                autoFocus
                type="text"
                value={
                  subjectName
                }
                onChange={(event) => {
                  setSubjectName(
                    event.target.value
                  );

                  setFormError("");
                }}
                placeholder="e.g. Mathematics"
              />
            </div>
          </div>


          <div className="subject-editor__field">
            <label htmlFor="subject-hours">
              Study hours per week
            </label>

            <div className="subject-editor__control">
              <Clock3
                size={17}
                aria-hidden="true"
              />

              <input
                id="subject-hours"
                type="number"
                min="0.5"
                step="0.5"
                inputMode="decimal"
                value={
                  weeklyHours
                }
                onChange={(event) => {
                  setWeeklyHours(
                    event.target.value
                  );

                  setFormError("");
                }}
                placeholder="e.g. 4"
              />
            </div>
          </div>


          <div className="subject-editor__field">
            <label htmlFor="subject-deadline-title">
              Next deadline
              <span>
                Optional
              </span>
            </label>

            <div className="subject-editor__control">
              <CalendarDays
                size={17}
                aria-hidden="true"
              />

              <input
                id="subject-deadline-title"
                type="text"
                value={
                  deadlineTitle
                }
                onChange={(event) =>
                  setDeadlineTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Midterm exam"
              />
            </div>
          </div>


          <div className="subject-editor__field">
            <label htmlFor="subject-deadline-date">
              Deadline date
              <span>
                Optional
              </span>
            </label>

            <div className="subject-editor__control">
              <CalendarDays
                size={17}
                aria-hidden="true"
              />

              <input
                id="subject-deadline-date"
                type="date"
                value={
                  deadlineDate
                }
                onChange={(event) =>
                  setDeadlineDate(
                    event.target.value
                  )
                }
              />
            </div>
          </div>
        </div>


        {formError && (
          <p
            className="subjects-form-error"
            role="alert"
          >
            {formError}
          </p>
        )}


        <div className="subject-editor__actions">
          <button
            type="button"
            className="subject-editor__cancel"
            onClick={
              closeSubjectEditor
            }
          >
            Cancel
          </button>

          <button
  type="submit"
  className="subject-editor__save"
>
  {editingSubjectId === null && (
    <Plus
      size={18}
      aria-hidden="true"
    />
  )}

  {editingSubjectId !== null
    ? "Save changes"
    : "Add subject"}
</button>
        </div>
      </form>
    </section>
  )}

  <p
  className="subjects-status"
  role="status"
  aria-live="polite"
>
  {statusMessage}
</p>

{saveError && (
  <p
    className="subjects-save-error"
    role="alert"
  >
    {saveError}
  </p>
)}


      {loadError ? (
        <section
          className="subjects-state"
          role="alert"
        >
          <div
            className="subjects-state__icon"
            aria-hidden="true"
          >
            <BookOpen
              size={23}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2>
              We couldn't load your subjects.
            </h2>

            <p>
              {loadError}
            </p>
          </div>
        </section>
      ) : !studyData?.completed ? (
        <section
          className="subjects-state"
          aria-labelledby="subjects-setup-title"
        >
          <div
            className="subjects-state__icon"
            aria-hidden="true"
          >
            <GraduationCap
              size={23}
              strokeWidth={1.8}
            />
          </div>

          <div className="subjects-state__content">
            <h2 id="subjects-setup-title">
              Complete your study setup first.
            </h2>

            <p>
              CozyCram creates your first
              subject list during onboarding.
              Finish setup before managing
              subjects from Planner.
            </p>
          </div>

          <Link
            to="/onboarding"
            className="subjects-state__link"
          >
            Continue setup
          </Link>
        </section>
      ) : (
        <>
          <section
            className="subjects-summary"
            aria-label="Subject summary"
          >
            <article className="subjects-summary__card">
              <div
                className="subjects-summary__icon"
                aria-hidden="true"
              >
                <BookOpen
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <span>
                  Subjects
                </span>

                <strong>
                  {subjects.length}
                </strong>
              </div>
            </article>


            <article className="subjects-summary__card">
              <div
                className="subjects-summary__icon"
                aria-hidden="true"
              >
                <Clock3
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <span>
                  Weekly workload
                </span>

                <strong>
                  {totalWeeklyHours}
                  {" "}
                  h
                </strong>
              </div>
            </article>


            <article className="subjects-summary__card">
              <div
                className="subjects-summary__icon"
                aria-hidden="true"
              >
                <CalendarDays
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <span>
                  Saved deadlines
                </span>

                <strong>
                  {
                    subjectsWithDeadlines
                  }
                </strong>
              </div>
            </article>
          </section>


          {subjects.length === 0 ? (
            <section className="subjects-empty">
              <div
                className="subjects-empty__icon"
                aria-hidden="true"
              >
                <BookOpen
                  size={25}
                  strokeWidth={1.8}
                />
              </div>

              <h2>
                No subjects yet.
              </h2>

              <p>
                Your subjects will appear here
                once they are added to your
                CozyCram study setup.
              </p>
            </section>
          ) : (
            <section
              className="subjects-list-section"
              aria-labelledby="subject-list-title"
            >
              <div className="subjects-list-section__header">
                <div>
                  <p>
                    YOUR SUBJECTS
                  </p>

                  <h2 id="subject-list-title">
                    Current workload
                  </h2>
                </div>

                <span>
                  {subjects.length}
                  {" "}
                  {subjects.length === 1
                    ? "subject"
                    : "subjects"}
                </span>
              </div>


              <div className="subjects-grid">
                {subjects.map(
                  (subject) => (
                    <article
                      key={subject.id}
                      className="subject-card"
                    >
                      <div className="subject-card__top">
  <div className="subject-card__identity">
    <div
      className="subject-card__icon"
      aria-hidden="true"
    >
      <BookOpen
        size={19}
        strokeWidth={1.8}
      />
    </div>

    <div>
      <h3>
        {subject.name}
      </h3>

      <p>
        {
          Number(
            subject.weeklyHours
          ) || 0
        }
        {" "}
        hours / week
      </p>
    </div>
  </div>


  <div className="subject-card__actions">
    <button
      type="button"
      className="subject-card__action"
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
      className="subject-card__action subject-card__action--danger"
      onClick={() => {
        setDeleteCandidateId(
          subject.id
        );

        setStatusMessage("");
      }}
      aria-label={`Delete ${subject.name}`}
    >
      <Trash2
        size={17}
        aria-hidden="true"
      />
    </button>
  </div>
</div>


                      <div className="subject-card__meta">
                        <div>
                          <Clock3
                            size={16}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />

                          <span>
                            Weekly workload
                          </span>

                          <strong>
                            {
                              Number(
                                subject.weeklyHours
                              ) || 0
                            }
                            {" "}
                            h
                          </strong>
                        </div>


                        <div>
                          <CalendarDays
                            size={16}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />

                          <span>
                            Next deadline
                          </span>

                          <strong>
                            {subject.deadlineDate
                              ? formatDeadlineDate(
                                  subject.deadlineDate
                                )
                              : "None added"}
                          </strong>
                        </div>
                      </div>


                      {subject.deadlineTitle && (
                        <p className="subject-card__deadline">
                          {
                            subject.deadlineTitle
                          }
                        </p>
                      )}

                      {deleteCandidateId ===
  subject.id && (
    <div
      className="subject-card__delete"
      role="group"
      aria-label={`Delete ${subject.name}`}
    >
      <p>
        Delete{" "}
        <strong>
          {subject.name}
        </strong>
        ? Its saved workload and deadline
        will also be removed from your
        current CozyCram study data.
      </p>


      <div>
        <button
          type="button"
          className="subject-card__delete-cancel"
          onClick={() =>
            setDeleteCandidateId(
              null
            )
          }
        >
          Cancel
        </button>


        <button
          type="button"
          className="subject-card__delete-confirm"
          onClick={() =>
            handleDeleteSubject(
              subject
            )
          }
        >
          Delete subject
        </button>
      </div>
    </div>
  )}

  <Link
  to={`/planner/subjects/${subject.id}`}
  className="subject-card__open"
>
  View subject
</Link>

                    </article>
                  )
                )}
              </div>
            </section>
          )}
        </>
      )}
    </section>
  );
}


export default SubjectsPage;