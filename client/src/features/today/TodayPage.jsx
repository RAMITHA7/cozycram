import {
  BookOpen,
  CalendarDays,
  Clock3,
  Target,
  Timer,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import "./today.css";

import {
  loadStudyData,
} from "../../services/studyDataService.js";




const DAY_IDS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];



const getGreeting = () => {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
};


const formatToday = () =>
  new Intl.DateTimeFormat(
    undefined,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    }
  ).format(
    new Date()
  );


const formatFocusPreset = (
  preferences
) => {
  if (!preferences?.focusPreset) {
    return "Not set";
  }

  if (
    preferences.focusPreset ===
    "quick"
  ) {
    return "Quick · 25 / 5";
  }

  if (
    preferences.focusPreset ===
    "classic"
  ) {
    return "Classic · 50 / 10";
  }

  if (
    preferences.focusPreset ===
    "deep"
  ) {
    return "Deep · 90 / 20";
  }

  if (
    preferences.focusPreset ===
    "custom"
  ) {
    return `Custom · ${preferences.customFocusMinutes} / ${preferences.customBreakMinutes}`;
  }

  return "Not set";
};


const getFocusMinutes = (
  preferences
) => {
  if (!preferences?.focusPreset) {
    return 50;
  }

  if (
    preferences.focusPreset ===
    "quick"
  ) {
    return 25;
  }

  if (
    preferences.focusPreset ===
    "classic"
  ) {
    return 50;
  }

  if (
    preferences.focusPreset ===
    "deep"
  ) {
    return 90;
  }

  if (
    preferences.focusPreset ===
    "custom"
  ) {
    const customMinutes =
      Number(
        preferences
          .customFocusMinutes
      );

    return customMinutes > 0
      ? customMinutes
      : 50;
  }

  return 50;
};


const timeToMinutes = (
  value
) => {
  if (!value) {
    return 0;
  }

  const [
    hours,
    minutes,
  ] = value
    .split(":")
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
};


const getWindowMinutes = (
  day
) => {
  if (
    !day?.enabled ||
    !day.start ||
    !day.end
  ) {
    return 0;
  }

  return Math.max(
    0,
    timeToMinutes(day.end) -
      timeToMinutes(day.start)
  );
};


const formatDuration = (
  minutes
) => {
  if (!minutes) {
    return "0 min";
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remainingMinutes =
    minutes % 60;


  if (
    hours > 0 &&
    remainingMinutes > 0
  ) {
    return `${hours}h ${remainingMinutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${remainingMinutes}m`;
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

  if (days === 0) {
    return "due today";
  }

  if (days === 1) {
    return "due tomorrow";
  }

  return `due in ${days} days`;
};

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
    }
  ).format(
    new Date(
      `${deadlineDate}T00:00:00`
    )
  );
};

const getRecommendation = (
  subjects
) => {
  if (!subjects.length) {
    return null;
  }


  const futureDeadlineSubjects =
    subjects
      .filter(
        (subject) => {
          const days =
            getDaysUntilDeadline(
              subject.deadlineDate
            );

          return (
            days !== null &&
            days >= 0
          );
        }
      )
      .sort(
        (first, second) => {
          const firstDays =
            getDaysUntilDeadline(
              first.deadlineDate
            );

          const secondDays =
            getDaysUntilDeadline(
              second.deadlineDate
            );


          if (
            firstDays !==
            secondDays
          ) {
            return (
              firstDays -
              secondDays
            );
          }


          return (
            Number(
              second.weeklyHours
            ) -
            Number(
              first.weeklyHours
            )
          );
        }
      );


  if (
    futureDeadlineSubjects.length >
    0
  ) {
    return {
      subject:
        futureDeadlineSubjects[0],

      reason:
        "deadline",
    };
  }


  const workloadSubjects =
    [...subjects].sort(
      (first, second) =>
        Number(
          second.weeklyHours
        ) -
        Number(
          first.weeklyHours
        )
    );


  return {
    subject:
      workloadSubjects[0],

    reason:
      "workload",
  };
};


function TodayPage() {
 const [initialStudyData] =
  useState(
    loadStudyData
  );


const onboardingData =
  initialStudyData.data;

const loadError =
  initialStudyData.error;

    const [
  showAllDeadlines,
  setShowAllDeadlines,
] = useState(false);


  const profile =
    onboardingData?.profile;

  const subjects =
    Array.isArray(
      onboardingData?.subjects
    )
      ? onboardingData.subjects
      : [];

  const availability =
    Array.isArray(
      onboardingData?.availability
    )
      ? onboardingData.availability
      : [];

  const preferences =
    onboardingData?.preferences;


  const availableDays =
    availability.filter(
      (day) => day.enabled
    );


  const weeklyHours =
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


  const todayId =
    DAY_IDS[
      new Date().getDay()
    ];


  const todayAvailability =
    availability.find(
      (day) =>
        day.id === todayId
    );


  const todayAvailableMinutes =
    getWindowMinutes(
      todayAvailability
    );


  /*
   * Focus-session tracking does not
   * exist yet in V1 at this stage.
   * Do not manufacture completed time.
   */
  const recordedFocusMinutes =
    0;
    const focusProgressPercent =
  todayAvailableMinutes > 0
    ? Math.min(
        100,
        (
          recordedFocusMinutes /
          todayAvailableMinutes
        ) *
          100
      )
    : 0;
   /*
 * Day 11's scheduling engine will eventually
 * provide real study blocks here.
 *
 * Expected block shape:
 * {
 *   id,
 *   subjectId,
 *   subjectName,
 *   start,
 *   end,
 *   durationMinutes,
 *   status
 * }
 */
const todayPlan = [];

  const subjectsWithDeadlines =
    subjects.filter(
      (subject) =>
        subject.deadlineDate &&
        (
          getDaysUntilDeadline(
            subject.deadlineDate
          ) ?? -1
        ) >= 0
    );


  const sortedUpcomingDeadlines =
  [...subjectsWithDeadlines]
    .sort(
      (first, second) =>
        getDaysUntilDeadline(
          first.deadlineDate
        ) -
        getDaysUntilDeadline(
          second.deadlineDate
        )
    );


const visibleUpcomingDeadlines =
  showAllDeadlines
    ? sortedUpcomingDeadlines
    : sortedUpcomingDeadlines.slice(
        0,
        3
      );


const hasMoreDeadlines =
  sortedUpcomingDeadlines.length >
  3;

    const workloadSubjects =
  [...subjects]
    .filter(
      (subject) =>
        Number(
          subject.weeklyHours
        ) > 0
    )
    .sort(
      (first, second) =>
        Number(
          second.weeklyHours
        ) -
        Number(
          first.weeklyHours
        )
    )
    .slice(
      0,
      4
    );


const maximumSubjectHours =
  workloadSubjects.length > 0
    ? Number(
        workloadSubjects[0]
          .weeklyHours
      )
    : 0;


  const recommendation =
    getRecommendation(
      subjects
    );


  const recommendationSubject =
    recommendation?.subject;


  const suggestedFocusMinutes =
    getFocusMinutes(
      preferences
    );


  const firstName =
    profile?.name?.trim();


  return (
    <section
      className="today-page"
      aria-labelledby="today-title"
    >
      <header className="today-header">
        <div>
          <p className="today-eyebrow">
            TODAY
          </p>

          <h1 id="today-title">
            {getGreeting()}
            {firstName
              ? `, ${firstName}.`
              : "."}
          </h1>

          <p className="today-date">
            {formatToday()}
          </p>
        </div>


        <Link
          to="/onboarding"
          className="today-setup-link"
        >
          Review setup
        </Link>
      </header>


      {loadError ? (
        <section
          className="today-setup-state"
          role="alert"
          aria-labelledby="today-load-error-title"
        >
          <div
            className="today-setup-state__icon"
            aria-hidden="true"
          >
            <Target
              size={24}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2 id="today-load-error-title">
              We couldn't load your study data.
            </h2>

            <p>
              {loadError}
            </p>
          </div>

          <Link
            to="/onboarding"
            className="today-primary-link"
          >
            Review setup
          </Link>
        </section>
            ) : !onboardingData?.completed ? (
        <section
          className="today-setup-state"
          aria-labelledby="today-setup-required-title"
        >
          <div
            className="today-setup-state__icon"
            aria-hidden="true"
          >
            <Target
              size={24}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2 id="today-setup-required-title">
              Complete your study setup first.
            </h2>

            <p>
              Finish onboarding so CozyCram can use
              your subjects, workload, availability,
              deadlines and study preferences.
            </p>
          </div>

          <Link
            to="/onboarding"
            className="today-primary-link"
          >
            Complete setup
          </Link>
        </section>
      ) : (
        <>
          {/* =========================================
              SETUP SUMMARY
              ========================================= */}

          <section
            className="today-summary-grid"
            aria-label="Study setup summary"
          >
            <article className="today-summary-card">
              <div
                className="today-summary-card__icon"
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


            <article className="today-summary-card">
              <div
                className="today-summary-card__icon"
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
                  {weeklyHours}
                  {" "}
                  h
                </strong>
              </div>
            </article>


            <article className="today-summary-card">
              <div
                className="today-summary-card__icon"
                aria-hidden="true"
              >
                <CalendarDays
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <span>
                  Study days
                </span>

                <strong>
                  {
                    availableDays.length
                  }
                </strong>
              </div>
            </article>


            <article className="today-summary-card">
              <div
                className="today-summary-card__icon"
                aria-hidden="true"
              >
                <Target
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <span>
                  Focus rhythm
                </span>

                <strong className="today-summary-card__value--small">
                  {
                    formatFocusPreset(
                      preferences
                    )
                  }
                </strong>
              </div>
            </article>
          </section>

        {subjects.length === 0 && (
  <section
    className="today-data-alert"
    aria-labelledby="today-data-alert-title"
  >
    <div
      className="today-data-alert__icon"
      aria-hidden="true"
    >
      <BookOpen
        size={21}
        strokeWidth={1.8}
      />
    </div>

    <div className="today-data-alert__content">
      <h2 id="today-data-alert-title">
        Your saved setup has no subjects.
      </h2>

      <p>
        Add at least one subject so CozyCram
        can show workload, deadlines and a
        useful study recommendation.
      </p>
    </div>

    <Link
      to="/onboarding"
      className="today-data-alert__link"
    >
      Review subjects
    </Link>
  </section>
)}


          {/* =========================================
              STAGE 2 — DAILY OVERVIEW
              ========================================= */}

          <section
            className="today-daily-grid"
            aria-label="Today's study overview"
          >
            <article className="today-progress-card">
              <div className="today-section-heading">
                <div>
                  <p>
                    DAILY PROGRESS
                  </p>

                  <h2>
                    Focus time today
                  </h2>
                </div>

                <Timer
                  size={21}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>


              <div className="today-progress-card__numbers">
                <strong>
                  {
                    formatDuration(
                      recordedFocusMinutes
                    )
                  }
                  {" "}
                  recorded
                </strong>

                <span>
                  {todayAvailability?.enabled
                    ? `${formatDuration(
                        todayAvailableMinutes
                      )} available today`
                    : "No study window set for today"}
                </span>
              </div>


              {todayAvailableMinutes > 0 ? (
  <div
    className="today-progress-track"
    role="progressbar"
    aria-label="Recorded focus time today"
    aria-valuemin={0}
    aria-valuemax={
      todayAvailableMinutes
    }
    aria-valuenow={
      recordedFocusMinutes
    }
    aria-valuetext={`${formatDuration(
      recordedFocusMinutes
    )} recorded of ${formatDuration(
      todayAvailableMinutes
    )} available`}
  >
    <div
      className="today-progress-track__fill"
      style={{
        width:
          `${focusProgressPercent}%`,
      }}
    />
  </div>
) : (
  <div
    className="today-progress-track"
    aria-hidden="true"
  >
    <div
      className="today-progress-track__fill"
      style={{
        width: "0%",
      }}
    />
  </div>
)}


              <p className="today-progress-card__note">
                Completed focus time will
                appear here when study
                sessions are recorded.
              </p>
            </article>


            <article className="today-availability-card">
              <div className="today-section-heading">
                <div>
                  <p>
                    TODAY'S AVAILABILITY
                  </p>

                  <h2>
                    {todayAvailability?.enabled
                      ? todayAvailability.label
                      : "No study window"}
                  </h2>
                </div>

                <Clock3
                  size={21}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>


              {todayAvailability?.enabled ? (
                <>
                  <strong className="today-availability-card__time">
                    {todayAvailability.start}
                    {" – "}
                    {todayAvailability.end}
                  </strong>

                  <p>
                    {
                      formatDuration(
                        todayAvailableMinutes
                      )
                    }
                    {" "}
                    of study time available
                    from your onboarding setup.
                  </p>
                </>
              ) : (
                <p>
                  You marked today as
                  unavailable during onboarding.
                  CozyCram will not assume you
                  should study today.
                </p>
              )}
            </article>
          </section>


          {/* =========================================
              STAGE 3 — RECOMMENDATION
              ========================================= */}

          <section
            className="today-recommendation"
            aria-labelledby="today-recommendation-title"
          >
            <div className="today-recommendation__top">
              <div>
                <p className="today-recommendation__eyebrow">
                  WHAT SHOULD I STUDY NOW?
                </p>

                <h2 id="today-recommendation-title">
                  {recommendationSubject
                    ? recommendationSubject.name
                    : "Add a subject to get a recommendation"}
                </h2>
              </div>


              {recommendationSubject && (
                <span className="today-recommendation__badge">
                  Based on your setup
                </span>
              )}
            </div>


            {recommendationSubject ? (
              <>
                <div className="today-recommendation__details">
                  <div>
                    <span>
                      Suggested session
                    </span>

                    <strong>
                      {
                        suggestedFocusMinutes
                      }
                      {" "}
                      min
                    </strong>
                  </div>

                  <div>
                    <span>
                      Weekly workload
                    </span>

                    <strong>
                      {
                        recommendationSubject.weeklyHours
                      }
                      {" "}
                      h
                    </strong>
                  </div>

                  {recommendationSubject.deadlineDate && (
                    <div>
                      <span>
                        Deadline
                      </span>

                      <strong>
                        {
                          formatDeadlineDistance(
                            recommendationSubject.deadlineDate
                          )
                        }
                      </strong>
                    </div>
                  )}
                </div>


                <details className="today-recommendation__reason">
  <summary>
    <Target
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <span>
      Why this subject?
    </span>
  </summary>

  <p>
    {recommendation.reason ===
    "deadline"
      ? `${
          recommendationSubject
            .deadlineTitle ||
          "Its next deadline"
        } is ${formatDeadlineDistance(
          recommendationSubject
            .deadlineDate
        )}, making it your nearest saved deadline.`
      : `${recommendationSubject.name} has the largest weekly workload in your current setup, so it is the clearest next priority without an upcoming deadline.`}
  </p>
</details>


                {!todayAvailability?.enabled && (
                  <p className="today-recommendation__availability-note">
                    You marked today as
                    unavailable. Treat this as
                    your suggested next subject
                    for your next study window.
                  </p>
                )}
              </>
            ) : (
              <p className="today-recommendation__empty">
                CozyCram needs at least one
                subject before it can suggest
                what deserves your attention
                next.
              </p>
            )}
          </section>




          {/* =========================================
    STAGE 4 — TODAY'S PLAN
    ========================================= */}

<section
  className="today-plan"
  aria-labelledby="today-plan-title"
>
  <div className="today-plan__header">
    <div>
      <p className="today-plan__eyebrow">
        TODAY'S PLAN
      </p>

      <h2 id="today-plan-title">
        Your study blocks
      </h2>

      <p>
        Planner-generated study sessions
        for today will appear here.
      </p>
    </div>


    <span className="today-plan__count">
      {todayPlan.length}
      {" "}
      {todayPlan.length === 1
        ? "block"
        : "blocks"}
    </span>
  </div>


  {todayPlan.length === 0 ? (
    <div className="today-plan-empty">
      <div
        className="today-plan-empty__icon"
        aria-hidden="true"
      >
        <CalendarDays
          size={23}
          strokeWidth={1.8}
        />
      </div>


      <div className="today-plan-empty__content">
        <h3>
          No study blocks generated yet.
        </h3>

        {todayAvailability?.enabled ? (
          <p>
            You have{" "}
            <strong>
              {
                formatDuration(
                  todayAvailableMinutes
                )
              }
            </strong>
            {" "}
            available today from{" "}
            <strong>
              {todayAvailability.start}
              {" – "}
              {todayAvailability.end}
            </strong>
            . Once CozyCram's planner
            generates sessions, they will
            appear here.
          </p>
        ) : (
          <p>
            You marked today as unavailable,
            so CozyCram will not assume that
            study blocks should be scheduled
            today.
          </p>
        )}
      </div>
    </div>
  ) : (
    <div className="today-plan__blocks">
      {todayPlan.map(
        (block) => (
          <article
            key={block.id}
            className="today-plan-block"
          >
            <div>
              <span>
                {block.start}
              </span>

              <strong>
                {block.subjectName}
              </strong>
            </div>

            <span>
              {
                formatDuration(
                  block.durationMinutes
                )
              }
            </span>
          </article>
        )
      )}
    </div>
  )}
</section>

{/* =========================================
    STAGE 5 — UPCOMING CONTEXT
    ========================================= */}

<section
  className="today-context-grid"
  aria-label="Upcoming study workload"
>
  {/* UPCOMING DEADLINES */}

  <article className="today-context-card">
    <div className="today-context-card__header">
      <div>
        <p>
          UPCOMING DEADLINES
        </p>

        <h2>
          What is coming up
        </h2>
      </div>

      <CalendarDays
        size={21}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </div>


    {sortedUpcomingDeadlines.length > 0 ? (
      <>
      <div className="today-deadline-list">
        {visibleUpcomingDeadlines.map(
          (subject) => (
            <div
              key={subject.id}
              className="today-deadline-row"
            >
              <div className="today-deadline-row__main">
                <strong>
                  {
                    subject.deadlineTitle ||
                    "Upcoming deadline"
                  }
                </strong>

                <span>
                  {subject.name}
                </span>
              </div>


              <div className="today-deadline-row__date">
                <strong>
                  {
                    formatDeadlineDate(
                      subject.deadlineDate
                    )
                  }
                </strong>

                <span>
                  {
                    formatDeadlineDistance(
                      subject.deadlineDate
                    )
                  }
                </span>
              </div>
            </div>
          )
        )}
      </div>

      { hasMoreDeadlines && (
  <button
    type="button"
    className="today-context-toggle"
    onClick={() =>
      setShowAllDeadlines(
        (current) => !current
      )
    }
    aria-expanded={
      showAllDeadlines
    }
  >
    {showAllDeadlines
      ? "Show fewer deadlines"
      : `Show all ${sortedUpcomingDeadlines.length} deadlines`}
  </button>
)}
  </>
    ) : (
      <div className="today-context-empty">
        <CalendarDays
          size={21}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <div>
          <strong>
            No upcoming deadlines
          </strong>

          <p>
            Add a deadline during setup or
            later in Planner and it will
            appear here.
          </p>
        </div>
      </div>
    )}
  </article>


  {/* WEEKLY WORKLOAD */}

  <article className="today-context-card">
    <div className="today-context-card__header">
      <div>
        <p>
          WEEKLY WORKLOAD
        </p>

        <h2>
          Where your time is going
        </h2>
      </div>

      <Clock3
        size={21}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </div>


    <div className="today-workload-summary">
      <strong>
        {weeklyHours}
        {" "}
        h
      </strong>

      <span>
        total planned study per week
      </span>
    </div>


    {workloadSubjects.length > 0 ? (
      <div className="today-workload-list">
        {workloadSubjects.map(
          (subject) => {
            const subjectHours =
              Number(
                subject.weeklyHours
              );


            const width =
              maximumSubjectHours > 0
                ? (
                    subjectHours /
                    maximumSubjectHours
                  ) *
                  100
                : 0;


            return (
              <div
                key={subject.id}
                className="today-workload-row"
              >
                <div className="today-workload-row__label">
                  <strong>
                    {subject.name}
                  </strong>

                  <span>
                    {subjectHours}
                    {" "}
                    h
                  </span>
                </div>


                <div
                  className="today-workload-track"
                  aria-hidden="true"
                >
                  <div
                    className="today-workload-track__fill"
                    style={{
                      width:
                        `${width}%`,
                    }}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    ) : (
      <div className="today-context-empty">
        <BookOpen
          size={21}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <div>
          <strong>
            No workload added
          </strong>

          <p>
            Weekly subject workload will
            appear here after it is added.
          </p>
        </div>
      </div>
    )}
  </article>
</section>

        </>
      )}
    </section>
  );
}


export default TodayPage;