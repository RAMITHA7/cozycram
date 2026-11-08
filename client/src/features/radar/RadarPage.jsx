import {
  Activity,
  CalendarClock,
  Clock3,
  Gauge,
  ShieldCheck,
  CircleAlert,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  loadStudyData,
} from "../../services/studyDataService.js";

import {
  createRadarDeadlineAnalysis,
  createRadarInputSnapshot,
  RADAR_INPUT_STATUS,
  RADAR_RISK,
} from "../../services/radarService.js";

import "./radar.css";

const formatMinutes = (
  value
) => {
  const totalMinutes =
    Number(
      value
    ) || 0;


  const hours =
    Math.floor(
      totalMinutes / 60
    );


  const minutes =
    totalMinutes % 60;


  if (
    hours > 0 &&
    minutes > 0
  ) {
    return `${hours}h ${minutes}m`;
  }


  if (
    hours > 0
  ) {
    return `${hours}h`;
  }


  return `${minutes} min`;
};

const toLocalDateKey = (
  date
) => {
  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;
};

const formatRadarDate = (
  value
) => {
  if (
    !value
  ) {
    return "No deadline";
  }


  return new Intl.DateTimeFormat(
    undefined,
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    }
  ).format(
    new Date(
      `${value}T00:00:00`
    )
  );
};

const getRadarRiskLabel = (
  risk
) => {
  if (
    risk ===
    RADAR_RISK.SAFE
  ) {
    return "Safe";
  }


  if (
    risk ===
    RADAR_RISK.WATCH
  ) {
    return "Watch";
  }


  if (
    risk ===
    RADAR_RISK.AT_RISK
  ) {
    return "At risk";
  }


  if (
    risk ===
    RADAR_RISK.OVERLOADED
  ) {
    return "Overloaded";
  }


  return "Not classified";
};

const getRadarRiskMessage = (
  risk
) => {
  if (
    risk ===
    RADAR_RISK.SAFE
  ) {
    return "The current deadline horizons leave a meaningful study-time buffer.";
  }


  if (
    risk ===
    RADAR_RISK.WATCH
  ) {
    return "The plan still fits, but some of the available study-time buffer is being used.";
  }


  if (
    risk ===
    RADAR_RISK.AT_RISK
  ) {
    return "One or more deadlines use most of the study time available before them.";
  }


  if (
    risk ===
    RADAR_RISK.OVERLOADED
  ) {
    return "At least one deadline currently requires more time than Radar can see before it, or open work is already overdue.";
  }


  return "Radar does not have a deadline pressure classification yet.";
};

const formatRadarBuffer = (
  value
) => {
  const numericValue =
    Number(
      value
    ) || 0;


  if (
    numericValue ===
    0
  ) {
    return "No buffer";
  }


  if (
    numericValue > 0
  ) {
    return `${formatMinutes(
      numericValue
    )} spare`;
  }


  return `${formatMinutes(
    Math.abs(
      numericValue
    )
  )} short`;
};

function RadarPage() {
    const [
  initialData,
] = useState(
  loadStudyData
);

const [
  radarReference,
] = useState(
  () => {
    const now =
      new Date();


    return {
      dateKey:
        toLocalDateKey(
          now
        ),

      minutesIntoDay:
        now.getHours() *
          60 +
        now.getMinutes(),
    };
  }
);

const studyData =
  initialData.data;


const loadError =
  initialData.error;


const radarResult =
  !loadError
    ? createRadarInputSnapshot(
        studyData
      )
    : null;


const radarSnapshot =
  radarResult
    ?.snapshot ??
  null;

  const radarAnalysisResult =
  radarResult
    ?.valid &&
  radarSnapshot
    ?.status ===
    RADAR_INPUT_STATUS
      .READY
    ? createRadarDeadlineAnalysis({
        snapshot:
          radarSnapshot,

        availability:
          studyData
            ?.availability,

        referenceDateKey:
          radarReference
            .dateKey,

        referenceMinutesIntoDay:
          radarReference
            .minutesIntoDay,
      })
    : null;


const radarAnalysis =
  radarAnalysisResult
    ?.valid
    ? radarAnalysisResult
        .analysis
    : null;


const overallRadarRisk =
  radarAnalysis
    ?.overallRisk ??
  null;

  return (
    <main
      className="radar-page"
      aria-labelledby="radar-page-title"
    >
      <header className="radar-header">
        <p className="radar-header__eyebrow">
          CRAM RADAR
        </p>

        <h1 id="radar-page-title">
          See pressure before it becomes panic.
        </h1>

        <p className="radar-header__intro">
          Radar compares the work still ahead
          with the study time available before
          your deadlines, so upcoming pressure
          stays visible.
        </p>
      </header>


      <section
        className="radar-hero"
        aria-labelledby="radar-hero-title"
      >
        <div
          className="radar-hero__icon"
          aria-hidden="true"
        >
          <Gauge
            size={30}
            strokeWidth={1.8}
          />
        </div>


        <div>
          <p>
            DEADLINE INTELLIGENCE
          </p>

          <h2 id="radar-hero-title">
            Workload versus available time
          </h2>

          <span>
            Radar will use your existing tasks,
            deadlines and study availability to
            show where your plan has room and
            where time is becoming tight.
          </span>
        </div>
      </section>


      <section
        className="radar-principles"
        aria-labelledby="radar-principles-title"
      >
        <div className="radar-section-heading">
          <p>
            WHAT RADAR LOOKS AT
          </p>

          <h2 id="radar-principles-title">
            Pressure based on real planning inputs
          </h2>
        </div>


        <div className="radar-principles__grid">
          <article>
            <div
              className="radar-principles__icon"
              aria-hidden="true"
            >
              <Activity
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h3>
                Remaining work
              </h3>

              <p>
                Open task estimates show how
                much study work is still waiting.
              </p>
            </div>
          </article>


          <article>
            <div
              className="radar-principles__icon"
              aria-hidden="true"
            >
              <Clock3
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h3>
                Available study time
              </h3>

              <p>
                Your saved study availability
                gives Radar the capacity side of
                the comparison.
              </p>
            </div>
          </article>


          <article>
            <div
              className="radar-principles__icon"
              aria-hidden="true"
            >
              <CalendarClock
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h3>
                Deadlines
              </h3>

              <p>
                Dated tasks let Radar understand
                which work has less time left.
              </p>
            </div>
          </article>


          <article>
            <div
              className="radar-principles__icon"
              aria-hidden="true"
            >
              <ShieldCheck
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h3>
                Explainable pressure
              </h3>

              <p>
                Radar will show why something
                needs attention rather than
                hiding the decision behind a
                score.
              </p>
            </div>
          </article>
        </div>
      </section>


      {loadError ? (
  <section
    className="radar-state"
    role="alert"
  >
    <div
      className="radar-state__icon"
      aria-hidden="true"
    >
      <Gauge
        size={24}
        strokeWidth={1.8}
      />
    </div>

    <div>
      <h2>
        Radar couldn't load your study data.
      </h2>

      <p>
        {loadError}
      </p>
    </div>
  </section>
) : !radarResult?.valid ? (
  <section
    className="radar-state"
    role="alert"
  >
    <div
      className="radar-state__icon"
      aria-hidden="true"
    >
      <Gauge
        size={24}
        strokeWidth={1.8}
      />
    </div>

    <div>
      <h2>
        Radar needs attention.
      </h2>

      <p>
        {
          radarResult
            ?.error
        }
      </p>
    </div>
  </section>
) : (
  <>
    <section
      className="radar-summary"
      aria-label="Cram Radar input summary"
    >
      <article>
        <Activity
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <div>
          <span>
            Open work
          </span>

          <strong>
            {
              formatMinutes(
                radarSnapshot
                  .remainingWorkMinutes
              )
            }
          </strong>

          <small>
            {
              radarSnapshot
                .openTaskCount
            }
            {" "}
            open{" "}
            {
              radarSnapshot
                .openTaskCount ===
              1
                ? "task"
                : "tasks"
            }
          </small>
        </div>
      </article>


      <article>
        <CalendarClock
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <div>
          <span>
            Dated work
          </span>

          <strong>
            {
              radarSnapshot
                .datedTaskCount
            }
          </strong>

          <small>
            Open tasks with valid deadlines
          </small>
        </div>
      </article>


      <article>
        <Clock3
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <div>
          <span>
            Weekly capacity
          </span>

          <strong>
            {
              formatMinutes(
                radarSnapshot
                  .weeklyAvailableMinutes
              )
            }
          </strong>

          <small>
            Enabled study availability
          </small>
        </div>
      </article>
    </section>


    {radarSnapshot
  .status ===
RADAR_INPUT_STATUS
  .READY ? (
  <>
    {!radarAnalysisResult
      ?.valid ? (
      <section
        className="radar-state"
        role="alert"
      >
        <div
          className="radar-state__icon"
          aria-hidden="true"
        >
          <CircleAlert
            size={24}
            strokeWidth={1.8}
          />
        </div>

        <div>
          <h2>
            Deadline pressure couldn't be calculated.
          </h2>

          <p>
            {
              radarAnalysisResult
                ?.error ||
              "Radar could not safely compare workload with deadline capacity."
            }
          </p>
        </div>
      </section>
    ) : radarAnalysis
        .horizonCount ===
      0 ? (
      <section
        className="radar-foundation"
        aria-labelledby="radar-foundation-title"
      >
        <div
          className="radar-foundation__icon"
          aria-hidden="true"
        >
          <CalendarClock
            size={25}
            strokeWidth={1.8}
          />
        </div>

        <div>
          <p>
            RADAR STATUS
          </p>

          <h2 id="radar-foundation-title">
            No dated work to classify
          </h2>

          <span>
            You have open work, but none of
            the valid tasks currently provide
            a deadline horizon for Radar.
          </span>
        </div>
      </section>
    ) : (
      <>
        <section
          className={`radar-pressure radar-pressure--${overallRadarRisk}`}
          aria-labelledby="radar-pressure-title"
        >
          <div
            className="radar-pressure__icon"
            aria-hidden="true"
          >
            <Gauge
              size={28}
              strokeWidth={1.8}
            />
          </div>


          <div className="radar-pressure__content">
            <p>
              OVERALL PRESSURE
            </p>

            <h2 id="radar-pressure-title">
              {
                getRadarRiskLabel(
                  overallRadarRisk
                )
              }
            </h2>

            <span>
              {
                getRadarRiskMessage(
                  overallRadarRisk
                )
              }
            </span>

            <small>
              Radar uses the most constrained
              valid deadline horizon as the
              overall pressure state.
            </small>
          </div>


          <span className="radar-pressure__badge">
            {
              getRadarRiskLabel(
                overallRadarRisk
              )
            }
          </span>
        </section>


        <section
          className="radar-bands"
          aria-labelledby="radar-bands-title"
        >
          <div className="radar-section-heading">
            <p>
              PRESSURE BANDS
            </p>

            <h2 id="radar-bands-title">
              How Radar reads capacity
            </h2>
          </div>


          <div
            className="radar-bands__track"
            aria-label={`Current Radar pressure: ${getRadarRiskLabel(
              overallRadarRisk
            )}`}
          >
            {[
              {
                risk:
                  RADAR_RISK.SAFE,

                label:
                  "Safe",

                range:
                  "0–60%",
              },

              {
                risk:
                  RADAR_RISK.WATCH,

                label:
                  "Watch",

                range:
                  ">60–80%",
              },

              {
                risk:
                  RADAR_RISK.AT_RISK,

                label:
                  "At risk",

                range:
                  ">80–100%",
              },

              {
                risk:
                  RADAR_RISK.OVERLOADED,

                label:
                  "Overloaded",

                range:
                  ">100%",
              },
            ].map(
              (
                band
              ) => (
                <div
                  key={
                    band.risk
                  }
                  className={`radar-band${
                    overallRadarRisk ===
                    band.risk
                      ? " radar-band--active"
                      : ""
                  }`}
                >
                  <span>
                    {
                      band.label
                    }
                  </span>

                  <strong>
                    {
                      band.range
                    }
                  </strong>
                </div>
              )
            )}
          </div>
        </section>


        <section
          className="radar-horizons"
          aria-labelledby="radar-horizons-title"
        >
          <div className="radar-section-heading">
            <p>
              DEADLINE HORIZONS
            </p>

            <h2 id="radar-horizons-title">
              Pressure by deadline
            </h2>

            <span>
              Each later deadline includes
              the work that must already be
              completed for earlier deadlines.
            </span>
          </div>


          <div className="radar-horizons__list">
            {
              radarAnalysis
                .horizons
                .map(
                  (
                    horizon
                  ) => (
                    <article
                      key={
                        horizon
                          .dueDate
                      }
                      className={`radar-horizon radar-horizon--${horizon.risk}`}
                    >
                      <div className="radar-horizon__heading">
                        <div>
                          <span>
                            DEADLINE
                          </span>

                          <h3>
                            {
                              formatRadarDate(
                                horizon
                                  .dueDate
                              )
                            }
                          </h3>

                          <small>
                            {horizon.overdue
                              ? "Deadline has passed"
                              : horizon
                                    .daysUntilDeadline ===
                                  0
                                ? "Due today"
                                : `${horizon.daysUntilDeadline} ${
                                    horizon.daysUntilDeadline ===
                                    1
                                      ? "day"
                                      : "days"
                                  } remaining`}
                          </small>
                        </div>


                        <span className="radar-horizon__risk">
                          {
                            getRadarRiskLabel(
                              horizon
                                .risk
                            )
                          }
                        </span>
                      </div>


                      <div className="radar-horizon__metrics">
                        <div>
                          <span>
                            Work due by then
                          </span>

                          <strong>
                            {
                              formatMinutes(
                                horizon
                                  .cumulativeWorkMinutes
                              )
                            }
                          </strong>
                        </div>


                        <div>
                          <span>
                            Study capacity
                          </span>

                          <strong>
                            {
                              formatMinutes(
                                horizon
                                  .availableMinutes
                              )
                            }
                          </strong>
                        </div>


                        <div>
                          <span>
                            Buffer
                          </span>

                          <strong>
                            {
                              formatRadarBuffer(
                                horizon
                                  .bufferMinutes
                              )
                            }
                          </strong>
                        </div>


                        <div>
                          <span>
                            Capacity used
                          </span>

                          <strong>
                            {
                              horizon
                                .capacityUsedPercent ===
                              null
                                ? "No capacity"
                                : `${horizon.capacityUsedPercent}%`
                            }
                          </strong>
                        </div>
                      </div>


                      <p className="radar-horizon__note">
                        {
                          horizon
                            .taskCountDueOnDate
                        }
                        {" "}
                        {
                          horizon
                            .taskCountDueOnDate ===
                          1
                            ? "task is"
                            : "tasks are"
                        }
                        {" "}
                        due on this date.
                      </p>
                    </article>
                  )
                )
            }
          </div>
        </section>


        {(
          radarSnapshot
            .undatedTaskCount >
            0 ||
          radarSnapshot
            .invalidDeadlineCount >
            0
        ) && (
          <section
            className="radar-notes"
            aria-labelledby="radar-notes-title"
          >
            <div
              className="radar-notes__icon"
              aria-hidden="true"
            >
              <CircleAlert
                size={22}
                strokeWidth={1.8}
              />
            </div>


            <div>
              <p>
                OUTSIDE DEADLINE RADAR
              </p>

              <h2 id="radar-notes-title">
                Some work cannot be placed on a deadline horizon
              </h2>

              <span>
                {radarSnapshot
                  .undatedTaskCount >
                  0 &&
                  `${radarSnapshot.undatedTaskCount} open ${
                    radarSnapshot.undatedTaskCount ===
                    1
                      ? "task has"
                      : "tasks have"
                  } no deadline. `}

                {radarSnapshot
                  .invalidDeadlineCount >
                  0 &&
                  `${radarSnapshot.invalidDeadlineCount} open ${
                    radarSnapshot.invalidDeadlineCount ===
                    1
                      ? "task has"
                      : "tasks have"
                  } a deadline that Radar cannot interpret safely.`}
              </span>
            </div>
          </section>
        )}
      </>
    )}
  </>
) : (
  <section
    className="radar-foundation"
    aria-labelledby="radar-foundation-title"
  >
    <div
      className="radar-foundation__icon"
      aria-hidden="true"
    >
      <Gauge
        size={25}
        strokeWidth={1.8}
      />
    </div>

    <div>
      <p>
        RADAR STATUS
      </p>

      <h2 id="radar-foundation-title">
        {
          radarSnapshot
            .status ===
          RADAR_INPUT_STATUS
            .NO_OPEN_WORK
            ? "No open work to analyse"
            : "Study availability is missing"
        }
      </h2>

      <span>
        {
          radarSnapshot
            .status ===
          RADAR_INPUT_STATUS
            .NO_OPEN_WORK
            ? "There are currently no open tasks creating deadline pressure."
            : "You have open work, but Radar cannot compare it with capacity until study availability is available."
        }
      </span>
    </div>
  </section>
)}
  </>
)}
    </main>
  );
}


export default RadarPage;