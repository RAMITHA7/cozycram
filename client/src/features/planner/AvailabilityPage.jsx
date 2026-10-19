import {
  ArrowLeft,
  CalendarDays,
  Clock3,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  loadStudyData,
} from "../../services/studyDataService.js";

import "./planner.css";


const getMinutesBetweenTimes = (
  start,
  end
) => {
  if (
    !start ||
    !end
  ) {
    return 0;
  }


  const [
    startHour,
    startMinute,
  ] =
    start
      .split(":")
      .map(Number);


  const [
    endHour,
    endMinute,
  ] =
    end
      .split(":")
      .map(Number);


  return Math.max(
    0,
    (
      endHour * 60 +
      endMinute
    ) -
      (
        startHour * 60 +
        startMinute
      )
  );
};


const formatDuration = (
  minutes
) => {
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


  return `${remainingMinutes} min`;
};


function AvailabilityPage() {
  const [initialData] =
    useState(
      loadStudyData
    );


  const studyData =
    initialData.data;


  const loadError =
    initialData.error;


  const availability =
    Array.isArray(
      studyData?.availability
    )
      ? studyData.availability
      : [];


  const enabledDays =
    availability.filter(
      (day) =>
        day.enabled
    );


  const weeklyAvailableMinutes =
    enabledDays.reduce(
      (total, day) =>
        total +
        getMinutesBetweenTimes(
          day.start,
          day.end
        ),
      0
    );


  return (
    <section
      className="availability-page"
      aria-labelledby="availability-page-title"
    >
      <Link
        to="/planner"
        className="availability-back"
      >
        <ArrowLeft
          size={18}
          aria-hidden="true"
        />

        Back to Planner
      </Link>


      <header className="availability-header">
        <p>
          PLANNER
        </p>

        <h1 id="availability-page-title">
          Study availability
        </h1>

        <span>
          Review the weekly study windows
          CozyCram can use when schedules
          are generated.
        </span>
      </header>


      {loadError ? (
        <section
          className="planner-state"
          role="alert"
        >
          <div
            className="planner-state__icon"
            aria-hidden="true"
          >
            <CalendarDays
              size={24}
            />
          </div>

          <div>
            <h2>
              We couldn't load your
              availability.
            </h2>

            <p>
              {loadError}
            </p>
          </div>
        </section>
      ) : !studyData?.completed ? (
        <section className="planner-state">
          <div
            className="planner-state__icon"
            aria-hidden="true"
          >
            <CalendarDays
              size={24}
            />
          </div>

          <div>
            <h2>
              Complete your study setup
              first.
            </h2>

            <p>
              Availability is created
              during CozyCram onboarding.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section
            className="availability-summary"
            aria-label="Availability summary"
          >
            <article>
              <CalendarDays
                size={20}
                aria-hidden="true"
              />

              <div>
                <span>
                  Study days
                </span>

                <strong>
                  {enabledDays.length}
                </strong>
              </div>
            </article>


            <article>
              <Clock3
                size={20}
                aria-hidden="true"
              />

              <div>
                <span>
                  Weekly availability
                </span>

                <strong>
                  {
                    formatDuration(
                      weeklyAvailableMinutes
                    )
                  }
                </strong>
              </div>
            </article>
          </section>


          <section
            className="availability-list-section"
            aria-labelledby="availability-week-title"
          >
            <div className="planner-section-heading">
              <div>
                <p>
                  WEEKLY WINDOWS
                </p>

                <h2 id="availability-week-title">
                  Your study week
                </h2>
              </div>
            </div>


            <div className="availability-list">
              {availability.map(
                (day) => {
                  const duration =
                    day.enabled
                      ? getMinutesBetweenTimes(
                          day.start,
                          day.end
                        )
                      : 0;


                  return (
                    <article
                      key={day.id}
                      className="availability-day"
                    >
                      <div>
                        <strong>
                          {day.label}
                        </strong>

                        <span
                          className={`availability-day__status ${
                            day.enabled
                              ? "availability-day__status--active"
                              : ""
                          }`}
                        >
                          {day.enabled
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>


                      <div className="availability-day__time">
                        {day.enabled ? (
                          <>
                            <strong>
                              {day.start}
                              {" – "}
                              {day.end}
                            </strong>

                            <span>
                              {
                                formatDuration(
                                  duration
                                )
                              }
                            </span>
                          </>
                        ) : (
                          <span>
                            No study window
                          </span>
                        )}
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </section>


          <div className="availability-edit-note">
            <div>
              <strong>
                Need to change these
                windows?
              </strong>

              <p>
                Availability is currently
                managed through your study
                setup.
              </p>
            </div>

            <Link
              to="/onboarding"
              className="planner-primary-link"
            >
              Review setup
            </Link>
          </div>
        </>
      )}
    </section>
  );
}


export default AvailabilityPage;