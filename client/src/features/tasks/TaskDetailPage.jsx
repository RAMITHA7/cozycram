import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  ListTodo,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  loadStudyData,
} from "../../services/studyDataService.js";

import "./tasks.css";


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


const formatDueDate = (
  dueDate
) => {
  if (!dueDate) {
    return "";
  }


  return new Intl.DateTimeFormat(
    undefined,
    {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    new Date(
      `${dueDate}T00:00:00`
    )
  );
};


const getDaysUntilDue = (
  dueDate
) => {
  if (!dueDate) {
    return null;
  }


  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const deadline =
    new Date(
      `${dueDate}T00:00:00`
    );


  return Math.round(
    (
      deadline.getTime() -
      today.getTime()
    ) /
      86400000
  );
};


const formatDueDistance = (
  dueDate
) => {
  const days =
    getDaysUntilDue(
      dueDate
    );


  if (days === null) {
    return "No due date";
  }


  if (days < 0) {
    const absoluteDays =
      Math.abs(days);


    return absoluteDays === 1
      ? "1 day past due"
      : `${absoluteDays} days past due`;
  }


  if (days === 0) {
    return "Due today";
  }


  if (days === 1) {
    return "Due tomorrow";
  }


  return `Due in ${days} days`;
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


const formatTimestamp = (
  value
) => {
  if (!value) {
    return "";
  }


  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
};


function TaskDetailPage() {
  const {
    taskId,
  } = useParams();


  const [initialData] =
    useState(
      loadStudyData
    );


  const studyData =
    initialData.data;


  const loadError =
    initialData.error;


  const tasks =
    Array.isArray(
      studyData?.tasks
    )
      ? studyData.tasks
      : [];


  const subjects =
    Array.isArray(
      studyData?.subjects
    )
      ? studyData.subjects
      : [];


  const task =
    tasks.find(
      (currentTask) =>
        String(
          currentTask.id
        ) ===
        String(
          taskId
        )
    );


  const subject =
    task
      ? subjects.find(
          (currentSubject) =>
            String(
              currentSubject.id
            ) ===
            String(
              task.subjectId
            )
        )
      : null;


  if (loadError) {
    return (
      <section
        className="task-detail-page"
        aria-labelledby="task-detail-error-title"
      >
        <Link
          to="/planner/tasks"
          className="task-detail-back"
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Back to tasks
        </Link>


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
            <h1 id="task-detail-error-title">
              We couldn't load this task.
            </h1>

            <p>
              {loadError}
            </p>
          </div>
        </section>
      </section>
    );
  }


  if (!studyData?.completed) {
    return (
      <section
        className="task-detail-page"
        aria-labelledby="task-detail-setup-title"
      >
        <Link
          to="/planner/tasks"
          className="task-detail-back"
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Back to tasks
        </Link>


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
            <h1 id="task-detail-setup-title">
              Complete your study setup first.
            </h1>

            <p>
              Task details become available
              after CozyCram has a completed
              study setup.
            </p>
          </div>
        </section>
      </section>
    );
  }


  if (!task) {
    return (
      <section
        className="task-detail-page"
        aria-labelledby="task-not-found-title"
      >
        <Link
          to="/planner/tasks"
          className="task-detail-back"
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Back to tasks
        </Link>


        <section className="task-detail-not-found">
          <div
            className="task-detail-not-found__icon"
            aria-hidden="true"
          >
            <ListTodo
              size={25}
              strokeWidth={1.8}
            />
          </div>

          <h1 id="task-not-found-title">
            Task not found.
          </h1>

          <p>
            This task may have been deleted,
            or the link may no longer match a
            task in your current CozyCram data.
          </p>

          <Link
            to="/planner/tasks"
            className="task-detail-not-found__link"
          >
            View tasks
          </Link>
        </section>
      </section>
    );
  }


  const isCompleted =
    task.status ===
    "done";


  return (
    <section
      className="task-detail-page"
      aria-labelledby="task-detail-title"
    >
      <Link
        to="/planner/tasks"
        className="task-detail-back"
      >
        <ArrowLeft
          size={18}
          aria-hidden="true"
        />

        Back to tasks
      </Link>


      <header className="task-detail-header">
        <div
          className="task-detail-header__icon"
          aria-hidden="true"
        >
          <ListTodo
            size={24}
            strokeWidth={1.8}
          />
        </div>

        <div>
          <p className="task-detail-eyebrow">
            TASK
          </p>

          <h1 id="task-detail-title">
            {task.title}
          </h1>

          <p>
            {subject?.name ||
              "Subject unavailable"}
          </p>
        </div>
      </header>


      <section
        className="task-detail-summary"
        aria-label={`${task.title} summary`}
      >
        <article className="task-detail-summary__card">
          <CheckCircle2
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              Status
            </span>

            <strong>
              {isCompleted
                ? "Done"
                : "To do"}
            </strong>
          </div>
        </article>


        <article className="task-detail-summary__card">
          <Flag
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              Priority
            </span>

            <strong>
              {
                formatPriority(
                  task.priority
                )
              }
            </strong>
          </div>
        </article>


        <article className="task-detail-summary__card">
          <Clock3
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              Estimated work
            </span>

            <strong>
              {
                formatEstimate(
                  task.estimatedMinutes
                )
              }
            </strong>
          </div>
        </article>


        <article className="task-detail-summary__card">
          <CalendarDays
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              Due
            </span>

            <strong>
              {
                formatDueDistance(
                  task.dueDate
                )
              }
            </strong>
          </div>
        </article>
      </section>


      <section
        className="task-detail-content"
        aria-labelledby="task-details-title"
      >
        <div className="task-detail-content__heading">
          <p>
            TASK DETAILS
          </p>

          <h2 id="task-details-title">
            Current task information
          </h2>
        </div>


        <dl className="task-detail-list">
          <div>
            <dt>
              Task
            </dt>

            <dd>
              {task.title}
            </dd>
          </div>


          <div>
            <dt>
              Subject
            </dt>

            <dd>
  {subject ? (
    <Link
      to={`/planner/subjects/${subject.id}`}
      className="task-detail-subject-link"
    >
      {subject.name}
    </Link>
  ) : (
    "Subject unavailable"
  )}
</dd>
          </div>


          <div>
            <dt>
              Status
            </dt>

            <dd>
              {isCompleted
                ? "Done"
                : "To do"}
            </dd>
          </div>


          <div>
            <dt>
              Priority
            </dt>

            <dd>
              {
                formatPriority(
                  task.priority
                )
              }
            </dd>
          </div>


          <div>
            <dt>
              Estimated work
            </dt>

            <dd>
              {
                formatEstimate(
                  task.estimatedMinutes
                )
              }
            </dd>
          </div>


          <div>
            <dt>
              Due date
            </dt>

            <dd>
              {task.dueDate
                ? formatDueDate(
                    task.dueDate
                  )
                : "No due date added"}
            </dd>
          </div>


          <div>
            <dt>
              Created
            </dt>

            <dd>
              {
                formatTimestamp(
                  task.createdAt
                )
              }
            </dd>
          </div>


          {isCompleted && (
            <div>
              <dt>
                Completed
              </dt>

              <dd>
                {
                  formatTimestamp(
                    task.completedAt
                  )
                }
              </dd>
            </div>
          )}
        </dl>
      </section>


      <section
        className="task-detail-notes"
        aria-labelledby="task-notes-title"
      >
        <div>
          <p>
            NOTES
          </p>

          <h2 id="task-notes-title">
            Task notes
          </h2>
        </div>

        <p className="task-detail-notes__body">
          {task.notes ||
            "No notes added for this task."}
        </p>
      </section>
    </section>
  );
}


export default TaskDetailPage;