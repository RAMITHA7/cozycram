import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  ListTodo,
  Pencil,
  Plus,
  RotateCcw,
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
  saveTasks,
} from "../../services/studyDataService.js";

import "./tasks.css";


const formatDueDate = (
  dueDate
) => {
  if (!dueDate) {
    return "No due date";
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
      `${dueDate}T00:00:00`
    )
  );
};


const formatEstimate = (
  minutes
) => {
  const numericMinutes =
    Number(minutes) || 0;


  const hours =
    Math.floor(
      numericMinutes / 60
    );


  const remainingMinutes =
    numericMinutes % 60;


  if (
    hours > 0 &&
    remainingMinutes > 0
  ) {
    return `${hours}h ${remainingMinutes}m`;
  }


  if (hours > 0) {
    return `${hours}h`;
  }


  return `${remainingMinutes} min`;
};


const formatPriority = (
  priority
) => {
  if (priority === "high") {
    return "High";
  }


  if (priority === "low") {
    return "Low";
  }


  return "Medium";
};


function TasksPage() {
  const [initialData] =
    useState(
      loadStudyData
    );


  const studyData =
    initialData.data;


  const loadError =
    initialData.error;


  const subjects =
    Array.isArray(
      studyData?.subjects
    )
      ? studyData.subjects
      : [];


  const [
  tasks,
  setTasks,
] = useState(
  Array.isArray(
    studyData?.tasks
  )
    ? studyData.tasks
    : []
);

const [
  editorOpen,
  setEditorOpen,
] = useState(false);

const [
  editingTaskId,
  setEditingTaskId,
] = useState(null);


const [
  deleteCandidateId,
  setDeleteCandidateId,
] = useState(null);

const [
  taskTitle,
  setTaskTitle,
] = useState("");


const [
  taskSubjectId,
  setTaskSubjectId,
] = useState("");


const [
  estimatedMinutes,
  setEstimatedMinutes,
] = useState("");


const [
  dueDate,
  setDueDate,
] = useState("");


const [
  priority,
  setPriority,
] = useState("medium");


const [
  notes,
  setNotes,
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

const [
  statusFilter,
  setStatusFilter,
] = useState("all");


const [
  subjectFilter,
  setSubjectFilter,
] = useState("all");


const [
  priorityFilter,
  setPriorityFilter,
] = useState("all");

  const openTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "todo"
    );


  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "done"
    );


  const tasksWithDueDates =
    tasks.filter(
      (task) =>
        task.dueDate
    );

  const filteredTasks =
  tasks.filter(
    (task) => {
      const matchesStatus =
        statusFilter === "all" ||
        task.status ===
          statusFilter;


      const matchesSubject =
        subjectFilter === "all" ||
        String(
          task.subjectId
        ) ===
          subjectFilter;


      const matchesPriority =
        priorityFilter === "all" ||
        task.priority ===
          priorityFilter;


      return (
        matchesStatus &&
        matchesSubject &&
        matchesPriority
      );
    }
  );


const hasActiveFilters =
  statusFilter !== "all" ||
  subjectFilter !== "all" ||
  priorityFilter !== "all";

  const subjectMap =
    new Map(
      subjects.map(
        (subject) => [
          String(
            subject.id
          ),

          subject.name,
        ]
      )
    );

const resetTaskEditor = () => {
  setTaskTitle("");
  setTaskSubjectId("");
  setEstimatedMinutes("");
  setDueDate("");
  setPriority("medium");
  setNotes("");

  setEditingTaskId(null);

  setFormError("");
  setSaveError("");
};

const openAddTask = () => {
  resetTaskEditor();

  setDeleteCandidateId(
    null
  );

  setStatusMessage("");

  setEditorOpen(true);
};

const closeTaskEditor = () => {
  resetTaskEditor();

  setEditorOpen(false);
};

const handleEditTask = (
  task
) => {
  setTaskTitle(
    task.title ?? ""
  );

  setTaskSubjectId(
    String(
      task.subjectId ?? ""
    )
  );

  setEstimatedMinutes(
    String(
      task.estimatedMinutes ?? ""
    )
  );

  setDueDate(
    task.dueDate ?? ""
  );

  setPriority(
    task.priority ?? "medium"
  );

  setNotes(
    task.notes ?? ""
  );

  setEditingTaskId(
    task.id
  );

  setDeleteCandidateId(
    null
  );

  setFormError("");
  setSaveError("");
  setStatusMessage("");

  setEditorOpen(true);
};

const handleTaskSubmit = (
  event
) => {
  event.preventDefault();

  const wasEditing =
  editingTaskId !== null;

  const cleanTitle =
    taskTitle.trim();


  const cleanSubjectId =
    taskSubjectId.trim();


  const numericEstimate =
    Number(
      estimatedMinutes
    );


  const cleanNotes =
    notes.trim();


  setFormError("");
  setSaveError("");
  setStatusMessage("");


  if (!cleanTitle) {
    setFormError(
      "Enter a task title."
    );

    return;
  }


  if (!cleanSubjectId) {
    setFormError(
      "Choose a subject for this task."
    );

    return;
  }


  const selectedSubject =
    subjects.find(
      (subject) =>
        String(
          subject.id
        ) ===
        cleanSubjectId
    );


  if (!selectedSubject) {
    setFormError(
      "Choose a valid subject."
    );

    return;
  }


  if (
    !Number.isFinite(
      numericEstimate
    ) ||
    numericEstimate < 15
  ) {
    setFormError(
      "Estimated work must be at least 15 minutes."
    );

    return;
  }


   const nextTasks =
  wasEditing
    ? tasks.map(
        (task) =>
          task.id ===
          editingTaskId
            ? {
                ...task,

                title:
                  cleanTitle,

                subjectId:
                  selectedSubject.id,

                estimatedMinutes:
                  numericEstimate,

                dueDate,

                priority,

                notes:
                  cleanNotes,
              }
            : task
      )
    : [
        ...tasks,

        {
          id:
            Date.now(),

          title:
            cleanTitle,

          subjectId:
            selectedSubject.id,

          estimatedMinutes:
            numericEstimate,

          dueDate,

          priority,

          status:
            "todo",

          notes:
            cleanNotes,

          createdAt:
            new Date()
              .toISOString(),

          completedAt:
            null,
        },
      ];


  const result =
    saveTasks(
      nextTasks
    );


  if (!result.success) {
    setSaveError(
      result.error
    );

    return;
  }


  setTasks(
    nextTasks
  );


  resetTaskEditor();

  setEditorOpen(false);


  setStatusMessage(
  wasEditing
    ? `${cleanTitle} was updated.`
    : `${cleanTitle} was added.`
);
};

const handleToggleTaskStatus = (
  task
) => {
  setSaveError("");
  setFormError("");
  setStatusMessage("");


  const markingDone =
    task.status !==
    "done";


  const nextTasks =
    tasks.map(
      (currentTask) =>
        currentTask.id ===
        task.id
          ? {
              ...currentTask,

              status:
                markingDone
                  ? "done"
                  : "todo",

              completedAt:
                markingDone
                  ? new Date()
                      .toISOString()
                  : null,
            }
          : currentTask
    );


  const result =
    saveTasks(
      nextTasks
    );


  if (!result.success) {
    setSaveError(
      result.error
    );

    return;
  }


  setTasks(
    nextTasks
  );


  if (
    editingTaskId ===
    task.id
  ) {
    resetTaskEditor();

    setEditorOpen(false);
  }


  setDeleteCandidateId(
    null
  );


  setStatusMessage(
    markingDone
      ? `${task.title} was completed.`
      : `${task.title} was reopened.`
  );
};

const handleDeleteTask = (
  task
) => {
  setSaveError("");
  setFormError("");
  setStatusMessage("");


  const nextTasks =
    tasks.filter(
      (currentTask) =>
        currentTask.id !==
        task.id
    );


  const result =
    saveTasks(
      nextTasks
    );


  if (!result.success) {
    setSaveError(
      result.error
    );

    return;
  }


  setTasks(
    nextTasks
  );


  if (
    editingTaskId ===
    task.id
  ) {
    resetTaskEditor();

    setEditorOpen(false);
  }


  setDeleteCandidateId(
    null
  );


  setStatusMessage(
    `${task.title} was deleted.`
  );
};

const clearTaskFilters = () => {
  setStatusFilter("all");
  setSubjectFilter("all");
  setPriorityFilter("all");
};

  return (
    <section
      className="tasks-page"
      aria-labelledby="tasks-page-title"
    >
      <header className="tasks-page__header">
  <div>
    <p className="tasks-page__eyebrow">
      PLANNER
    </p>

    <h1 id="tasks-page-title">
      Tasks
    </h1>

    <p className="tasks-page__intro">
      Break your subjects into real work.
      CozyCram will use task deadlines,
      estimated effort and priority when
      planning what you should work on.
    </p>
  </div>


  {studyData?.completed &&
    !loadError &&
    subjects.length > 0 && (
      <button
        type="button"
        className="tasks-add-button"
        onClick={
          openAddTask
        }
        aria-expanded={
          editorOpen
        }
        aria-controls="task-editor"
      >
        <Plus
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        Add task
      </button>
    )}
</header>

{editorOpen &&
  studyData?.completed &&
  !loadError &&
  subjects.length > 0 && (
    <section
      id="task-editor"
      className="task-editor"
      aria-labelledby="task-editor-title"
    >
      <div className="task-editor__header">
        <div>
          <p>
            TASK DETAILS
          </p>

          <h2 id="task-editor-title">
  {editingTaskId !== null
    ? "Edit task"
    : "Add a task"}
</h2>
        </div>


        <button
          type="button"
          className="task-editor__close"
          onClick={
            closeTaskEditor
          }
          aria-label="Close task editor"
        >
          <X
            size={18}
            aria-hidden="true"
          />
        </button>
      </div>


      <form
        className="task-editor__form"
        onSubmit={
          handleTaskSubmit
        }
      >
        <div className="task-editor__grid">

          {/* TASK TITLE */}

          <div className="task-editor__field task-editor__field--wide">
            <label htmlFor="task-title">
              Task title
            </label>

            <div className="task-editor__control">
              <ListTodo
                size={17}
                aria-hidden="true"
              />

              <input
                id="task-title"
                type="text"
                autoFocus
                value={
                  taskTitle
                }
                onChange={(event) => {
                  setTaskTitle(
                    event.target.value
                  );

                  setFormError("");
                }}
                placeholder="e.g. Complete calculus worksheet"
              />
            </div>
          </div>


          {/* SUBJECT */}

          <div className="task-editor__field">
            <label htmlFor="task-subject">
              Subject
            </label>

            <div className="task-editor__control">
              <BookOpen
                size={17}
                aria-hidden="true"
              />

              <select
                id="task-subject"
                value={
                  taskSubjectId
                }
                onChange={(event) => {
                  setTaskSubjectId(
                    event.target.value
                  );

                  setFormError("");
                }}
              >
                <option value="">
                  Choose a subject
                </option>

                {subjects.map(
                  (subject) => (
                    <option
                      key={subject.id}
                      value={
                        String(
                          subject.id
                        )
                      }
                    >
                      {subject.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>


          {/* ESTIMATE */}

          <div className="task-editor__field">
            <label htmlFor="task-estimate">
              Estimated work
            </label>

            <div className="task-editor__control">
              <Clock3
                size={17}
                aria-hidden="true"
              />

              <input
                id="task-estimate"
                type="number"
                min="15"
                step="15"
                inputMode="numeric"
                value={
                  estimatedMinutes
                }
                onChange={(event) => {
                  setEstimatedMinutes(
                    event.target.value
                  );

                  setFormError("");
                }}
                placeholder="Minutes, e.g. 60"
              />
            </div>
          </div>


          {/* DUE DATE */}

          <div className="task-editor__field">
            <label htmlFor="task-due-date">
              Due date

              <span>
                Optional
              </span>
            </label>

            <div className="task-editor__control">
              <CalendarDays
                size={17}
                aria-hidden="true"
              />

              <input
                id="task-due-date"
                type="date"
                value={
                  dueDate
                }
                onChange={(event) => {
                  setDueDate(
                    event.target.value
                  );

                  setFormError("");
                }}
              />
            </div>
          </div>


          {/* PRIORITY */}

          <div className="task-editor__field">
            <label htmlFor="task-priority">
              Priority
            </label>

            <div className="task-editor__control">
              <Flag
                size={17}
                aria-hidden="true"
              />

              <select
                id="task-priority"
                value={
                  priority
                }
                onChange={(event) =>
                  setPriority(
                    event.target.value
                  )
                }
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </div>
          </div>


          {/* NOTES */}

          <div className="task-editor__field task-editor__field--wide">
            <label htmlFor="task-notes">
              Notes

              <span>
                Optional
              </span>
            </label>

            <textarea
              id="task-notes"
              className="task-editor__textarea"
              rows="4"
              value={
                notes
              }
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Add any useful context for this task."
            />
          </div>
        </div>


        {formError && (
          <p
            id="task-form-error"
            className="tasks-form-error"
            role="alert"
          >
            {formError}
          </p>
        )}


        <div className="task-editor__actions">
          <button
            type="button"
            className="task-editor__cancel"
            onClick={
              closeTaskEditor
            }
          >
            Cancel
          </button>


          <button
  type="submit"
  className="task-editor__save"
>
  {editingTaskId ===
    null && (
    <Plus
      size={18}
      aria-hidden="true"
    />
  )}

  {editingTaskId !== null
    ? "Save changes"
    : "Add task"}
</button>
        </div>
      </form>
    </section>
  )}

  <p
  className="tasks-status"
  role="status"
  aria-live="polite"
>
  {statusMessage}
</p>


{saveError && (
  <p
    className="tasks-save-error"
    role="alert"
  >
    {saveError}
  </p>
)}

      {loadError ? (
        <section
          className="tasks-state"
          role="alert"
        >
          <div
            className="tasks-state__icon"
            aria-hidden="true"
          >
            <ListTodo
              size={23}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2>
              We couldn't load your tasks.
            </h2>

            <p>
              {loadError}
            </p>
          </div>
        </section>
      ) : !studyData?.completed ? (
        <section className="tasks-state">
          <div
            className="tasks-state__icon"
            aria-hidden="true"
          >
            <ListTodo
              size={23}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2>
              Complete your study setup first.
            </h2>

            <p>
              Tasks are connected to your
              subjects, so CozyCram needs a
              completed study setup first.
            </p>
          </div>
        </section>
      ) : subjects.length === 0 ? (
        <section className="tasks-state">
          <div
            className="tasks-state__icon"
            aria-hidden="true"
          >
            <BookOpen
              size={23}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2>
              Add a subject before creating tasks.
            </h2>

            <p>
              Every CozyCram task belongs to a
              subject. Add at least one subject
              from Planner first.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section
            className="tasks-summary"
            aria-label="Task summary"
          >
            <article className="tasks-summary__card">
              <ListTodo
                size={19}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <div>
                <span>
                  Total tasks
                </span>

                <strong>
                  {tasks.length}
                </strong>
              </div>
            </article>


            <article className="tasks-summary__card">
              <Clock3
                size={19}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <div>
                <span>
                  To do
                </span>

                <strong>
                  {openTasks.length}
                </strong>
              </div>
            </article>


            <article className="tasks-summary__card">
              <CheckCircle2
                size={19}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <div>
                <span>
                  Completed
                </span>

                <strong>
                  {completedTasks.length}
                </strong>
              </div>
            </article>


            <article className="tasks-summary__card">
              <CalendarDays
                size={19}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <div>
                <span>
                  With due dates
                </span>

                <strong>
                  {
                    tasksWithDueDates.length
                  }
                </strong>
              </div>
            </article>
          </section>

        {tasks.length > 0 && (
  <section
    className="tasks-filters"
    aria-labelledby="tasks-filters-title"
  >
    <div className="tasks-filters__header">
      <div>
        <p>
          FILTERS
        </p>

        <h2 id="tasks-filters-title">
          Narrow your task list
        </h2>
      </div>


      {hasActiveFilters && (
        <button
          type="button"
          className="tasks-filters__clear"
          onClick={
            clearTaskFilters
          }
        >
          Clear filters
        </button>
      )}
    </div>


    <div className="tasks-filters__grid">

      <div className="tasks-filters__field">
        <label htmlFor="tasks-status-filter">
          Status
        </label>

        <select
          id="tasks-status-filter"
          value={
            statusFilter
          }
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All status
          </option>

          <option value="todo">
            To do
          </option>

          <option value="done">
            Done
          </option>
        </select>
      </div>


      <div className="tasks-filters__field">
        <label htmlFor="tasks-subject-filter">
          Subject
        </label>

        <select
          id="tasks-subject-filter"
          value={
            subjectFilter
          }
          onChange={(event) =>
            setSubjectFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All subjects
          </option>

          {subjects.map(
            (subject) => (
              <option
                key={subject.id}
                value={
                  String(
                    subject.id
                  )
                }
              >
                {subject.name}
              </option>
            )
          )}
        </select>
      </div>


      <div className="tasks-filters__field">
        <label htmlFor="tasks-priority-filter">
          Priority
        </label>

        <select
          id="tasks-priority-filter"
          value={
            priorityFilter
          }
          onChange={(event) =>
            setPriorityFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All priorities
          </option>

          <option value="high">
            High
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="low">
            Low
          </option>
        </select>
      </div>
    </div>


    <p
      className="tasks-filters__count"
      aria-live="polite"
    >
      Showing{" "}
      <strong>
        {filteredTasks.length}
      </strong>
      {" "}
      of{" "}
      <strong>
        {tasks.length}
      </strong>
      {" "}
      {tasks.length === 1
        ? "task"
        : "tasks"}
    </p>
  </section>
)}


          {tasks.length === 0 ? (
            <section className="tasks-empty">
              <div
                className="tasks-empty__icon"
                aria-hidden="true"
              >
                <ListTodo
                  size={26}
                  strokeWidth={1.8}
                />
              </div>

              <h2>
                No tasks yet.
              </h2>

                            <p>
                Add the specific work you need
                to finish for each subject.
                Your tasks will appear here.
              </p>
            </section>
          ) : filteredTasks.length === 0 ? (
            <section className="tasks-filter-empty">
              <div
                className="tasks-filter-empty__icon"
                aria-hidden="true"
              >
                <ListTodo
                  size={24}
                  strokeWidth={1.8}
                />
              </div>

              <h2>
                No tasks match these filters.
              </h2>

              <p>
                Your tasks are still saved.
                Change or clear the filters to
                see them again.
              </p>

              <button
                type="button"
                className="tasks-filter-empty__clear"
                onClick={
                  clearTaskFilters
                }
              >
                Clear filters
              </button>
            </section>
          ) : (
            <section
              className="tasks-list-section"
              aria-labelledby="tasks-list-title"
            >
              <div className="tasks-list-section__header">
                <div>
                  <p>
                    YOUR TASKS
                  </p>

                  <h2 id="tasks-list-title">
                    Current work
                  </h2>
                </div>

                <span>
                   {filteredTasks.length}
                   {" "}
                    {filteredTasks.length === 1
                     ? "task"
                    : "tasks"}
                </span>
              </div>


              <div className="tasks-list">
  {filteredTasks.map(
    (task) => (
      <article
        key={task.id}
        className="task-card"
      >
        <div className="task-card__heading">
          <div>
            <span
              className={`task-card__status task-card__status--${task.status}`}
            >
              {task.status === "done"
                ? "Done"
                : "To do"}
            </span>

            <h3>
              {task.title}
            </h3>

            <p>
              {
                subjectMap.get(
                  String(
                    task.subjectId
                  )
                ) ||
                "Unknown subject"
              }
            </p>
          </div>

          <span
            className={`task-card__priority task-card__priority--${task.priority}`}
          >
            {
              formatPriority(
                task.priority
              )
            }
          </span>
        </div>


        <div className="task-card__meta">
          <div>
            <Clock3
              size={16}
              aria-hidden="true"
            />

            <span>
              Estimated
            </span>

            <strong>
              {
                formatEstimate(
                  task.estimatedMinutes
                )
              }
            </strong>
          </div>


          <div>
            <CalendarDays
              size={16}
              aria-hidden="true"
            />

            <span>
              Due
            </span>

            <strong>
              {
                formatDueDate(
                  task.dueDate
                )
              }
            </strong>
          </div>
        </div>

        <Link
  to={`/planner/tasks/${task.id}`}
  className="task-card__open"
>
  View task
</Link>


        <div className="task-card__actions">
          <button
            type="button"
            className="task-card__action task-card__action--complete"
            onClick={() =>
              handleToggleTaskStatus(
                task
              )
            }
          >
            {task.status === "done" ? (
              <>
                <RotateCcw
                  size={17}
                  aria-hidden="true"
                />

                Reopen
              </>
            ) : (
              <>
                <CheckCircle2
                  size={17}
                  aria-hidden="true"
                />

                Complete
              </>
            )}
          </button>


          <button
            type="button"
            className="task-card__action"
            onClick={() =>
              handleEditTask(
                task
              )
            }
          >
            <Pencil
              size={17}
              aria-hidden="true"
            />

            Edit
          </button>


          <button
            type="button"
            className="task-card__action task-card__action--danger"
            onClick={() => {
              setDeleteCandidateId(
                task.id
              );

              setStatusMessage("");
              setSaveError("");
            }}
          >
            <Trash2
              size={17}
              aria-hidden="true"
            />

            Delete
          </button>
        </div>


        {deleteCandidateId ===
          task.id && (
          <div
            className="task-card__delete"
            role="group"
            aria-label={`Delete ${task.title}`}
          >
            <p>
              Delete{" "}
              <strong>
                {task.title}
              </strong>
              ? This removes the task from your
              current CozyCram study data.
            </p>


            <div>
              <button
                type="button"
                className="task-card__delete-cancel"
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
                className="task-card__delete-confirm"
                onClick={() =>
                  handleDeleteTask(
                    task
                  )
                }
              >
                Delete task
              </button>
            </div>
          </div>
        )}
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


export default TasksPage;