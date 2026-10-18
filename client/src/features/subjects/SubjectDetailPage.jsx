import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  CheckCircle2,
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
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    new Date(
      `${deadlineDate}T00:00:00`
    )
  );
};


const getDaysUntilDeadline = (
  deadlineDate
) => {
  if (!deadlineDate) {
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
      `${deadlineDate}T00:00:00`
    );


  return Math.round(
    (
      deadline.getTime() -
      today.getTime()
    ) /
      86400000
  );
};


const formatDeadlineDistance = (
  deadlineDate
) => {
  const days =
    getDaysUntilDeadline(
      deadlineDate
    );


  if (days === null) {
    return "";
  }


  if (days < 0) {
    const absoluteDays =
      Math.abs(days);

    return absoluteDays === 1
      ? "1 day past"
      : `${absoluteDays} days past`;
  }


  if (days === 0) {
    return "Due today";
  }


  if (days === 1) {
    return "Due tomorrow";
  }


  return `Due in ${days} days`;
};

const formatTaskEstimate = (
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

function SubjectDetailPage() {
  const {
    subjectId,
  } = useParams();


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

  const tasks =
  Array.isArray(
    studyData?.tasks
  )
    ? studyData.tasks
    : [];

  const subject =
    subjects.find(
      (currentSubject) =>
        String(
          currentSubject.id
        ) ===
        String(
          subjectId
        )
    );

  const subjectTasks =
  subject
    ? tasks.filter(
        (task) =>
          String(
            task.subjectId
          ) ===
          String(
            subject.id
          )
      )
    : [];


const openSubjectTasks =
  subjectTasks.filter(
    (task) =>
      task.status ===
      "todo"
  );


const completedSubjectTasks =
  subjectTasks.filter(
    (task) =>
      task.status ===
      "done"
  );


if (loadError) {
  return (
    <section
      className="subject-detail-page"
      aria-labelledby="subject-detail-error-title"
    >
      <Link
        to="/planner/subjects"
        className="subject-detail-back"
      >
        <ArrowLeft
          size={18}
          aria-hidden="true"
        />

        Back to subjects
      </Link>


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
          <h1 id="subject-detail-error-title">
            We couldn't load this subject.
          </h1>

          <p>
            {loadError}
          </p>
        </div>

        <Link
          to="/onboarding"
          className="subjects-state__link"
        >
          Review setup
        </Link>
      </section>
    </section>
  );
}


  if (!studyData?.completed) {
    return (
      <section
        className="subject-detail-page"
        aria-labelledby="subject-detail-setup-title"
      >
        <Link
          to="/planner/subjects"
          className="subject-detail-back"
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Back to subjects
        </Link>


        <section className="subjects-state">
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
            <h1 id="subject-detail-setup-title">
              Complete your study setup first.
            </h1>

            <p>
              Subject details become available
              after CozyCram has a saved study
              setup.
            </p>
          </div>

          <Link
            to="/onboarding"
            className="subjects-state__link"
          >
            Continue setup
          </Link>
        </section>
      </section>
    );
  }


  if (!subject) {
    return (
      <section
        className="subject-detail-page"
        aria-labelledby="subject-not-found-title"
      >
        <Link
          to="/planner/subjects"
          className="subject-detail-back"
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Back to subjects
        </Link>


        <section className="subject-detail-not-found">
          <div
            className="subject-detail-not-found__icon"
            aria-hidden="true"
          >
            <BookOpen
              size={25}
              strokeWidth={1.8}
            />
          </div>

          <h1 id="subject-not-found-title">
            Subject not found.
          </h1>

          <p>
            This subject may have been deleted,
            or the link may no longer match a
            subject in your current CozyCram
            study data.
          </p>

          <Link
            to="/planner/subjects"
            className="subject-detail-not-found__link"
          >
            View subjects
          </Link>
        </section>
      </section>
    );
  }


  const weeklyHours =
    Number(
      subject.weeklyHours
    ) || 0;


  return (
    <section
      className="subject-detail-page"
      aria-labelledby="subject-detail-title"
    >
      <Link
        to="/planner/subjects"
        className="subject-detail-back"
      >
        <ArrowLeft
          size={18}
          aria-hidden="true"
        />

        Back to subjects
      </Link>


      <header className="subject-detail-header">
        <div
          className="subject-detail-header__icon"
          aria-hidden="true"
        >
          <BookOpen
            size={24}
            strokeWidth={1.8}
          />
        </div>

        <div>
          <p className="subject-detail-eyebrow">
            SUBJECT
          </p>

          <h1 id="subject-detail-title">
            {subject.name}
          </h1>

          <p>
            Your current study workload and
            deadline context for this subject.
          </p>
        </div>
      </header>


      <section
        className="subject-detail-summary"
        aria-label={`${subject.name} summary`}
      >
        <article className="subject-detail-summary__card">
          <Clock3
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              Weekly workload
            </span>

            <strong>
              {weeklyHours}
              {" "}
              {weeklyHours === 1
                ? "hour"
                : "hours"}
            </strong>
          </div>
        </article>


        <article className="subject-detail-summary__card">
          <CalendarDays
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              Deadline
            </span>

            <strong>
              {subject.deadlineDate
                ? formatDeadlineDistance(
                    subject.deadlineDate
                  )
                : "None added"}
            </strong>
          </div>
        </article>
      </section>


      <section
        className="subject-detail-content"
        aria-labelledby="subject-planning-context-title"
      >
        <div className="subject-detail-content__heading">
          <p>
            PLANNING CONTEXT
          </p>

          <h2 id="subject-planning-context-title">
            Current subject details
          </h2>
        </div>


        <dl className="subject-detail-list">
          <div>
            <dt>
              Subject
            </dt>

            <dd>
              {subject.name}
            </dd>
          </div>


          <div>
            <dt>
              Weekly study target
            </dt>

            <dd>
              {weeklyHours}
              {" "}
              {weeklyHours === 1
                ? "hour"
                : "hours"}
            </dd>
          </div>


          <div>
            <dt>
              Next deadline
            </dt>

            <dd>
              {subject.deadlineTitle ||
                "No deadline title added"}
            </dd>
          </div>


          <div>
            <dt>
              Deadline date
            </dt>

            <dd>
              {subject.deadlineDate
                ? formatDeadlineDate(
                    subject.deadlineDate
                  )
                : "No deadline date added"}
            </dd>
          </div>
        </dl>
      </section>

      <section
  className="subject-detail-tasks"
  aria-labelledby="subject-tasks-title"
>
  <div className="subject-detail-tasks__header">
    <div>
      <p>
        TASKS
      </p>

      <h2 id="subject-tasks-title">
        Work for {subject.name}
      </h2>

      <span>
        {openSubjectTasks.length}
        {" "}
        {openSubjectTasks.length === 1
          ? "open task"
          : "open tasks"}
        {" · "}
        {completedSubjectTasks.length}
        {" "}
        completed
      </span>
    </div>


    <Link
      to="/planner/tasks"
      className="subject-detail-tasks__all"
    >
      View all tasks
    </Link>
  </div>


  {subjectTasks.length === 0 ? (
    <div className="subject-detail-tasks__empty">
      <ListTodo
        size={22}
        strokeWidth={1.8}
        aria-hidden="true"
      />

      <div>
        <strong>
          No tasks for this subject yet.
        </strong>

        <p>
          Add a task from Planner → Tasks
          and connect it to {subject.name}.
        </p>
      </div>
    </div>
  ) : (
    <div className="subject-detail-task-list">
      {subjectTasks.map(
        (task) => (
          <article
            key={task.id}
            className="subject-detail-task"
          >
            <div className="subject-detail-task__main">
              <div>
                {task.status ===
                "done" ? (
                  <CheckCircle2
                    size={18}
                    aria-hidden="true"
                  />
                ) : (
                  <ListTodo
                    size={18}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div>
                <strong>
                  {task.title}
                </strong>

                <span>
                  {
                    formatTaskEstimate(
                      task.estimatedMinutes
                    )
                  }

                  {task.dueDate && (
                    <>
                      {" · "}
                      Due{" "}
                      {
                        formatDeadlineDate(
                          task.dueDate
                        )
                      }
                    </>
                  )}
                </span>
              </div>
            </div>


            <div className="subject-detail-task__right">
              <span
                className={`subject-detail-task__status subject-detail-task__status--${task.status}`}
              >
                {task.status === "done"
                  ? "Done"
                  : "To do"}
              </span>

              <Link
                to={`/planner/tasks/${task.id}`}
              >
                View task
              </Link>
            </div>
          </article>
        )
      )}
    </div>
  )}
</section>
    </section>
  );
}


export default SubjectDetailPage;