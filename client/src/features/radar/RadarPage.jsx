import {
  Activity,
  CalendarClock,
  Clock3,
  Gauge,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  loadStudyData,
} from "../../services/studyDataService.js";

import {
  createRadarInputSnapshot,
  RADAR_INPUT_STATUS,
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

function RadarPage() {
    const [
  initialData,
] = useState(
  loadStudyData
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
              .READY
              ? "Inputs ready for deadline analysis"
              : radarSnapshot
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
              .READY
              ? "Radar can now compare your open workload with deadline-specific study capacity in the next stage."
              : radarSnapshot
                    .status ===
                  RADAR_INPUT_STATUS
                    .NO_OPEN_WORK
                ? "There are currently no open tasks creating deadline pressure."
                : "You have open work, but Radar cannot compare it with capacity until study availability is available."
          }
        </span>
      </div>
    </section>
  </>
)}
    </main>
  );
}


export default RadarPage;