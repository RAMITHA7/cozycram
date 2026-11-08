import {
  Activity,
  CalendarClock,
  Clock3,
  Gauge,
  ShieldCheck,
} from "lucide-react";

import "./radar.css";


function RadarPage() {
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
            RADAR ANALYSIS
          </p>

          <h2 id="radar-foundation-title">
            Your workload picture starts here.
          </h2>

          <span>
            The next stage connects this page to
            your existing CozyCram study data.
            Nothing is changed or rescheduled
            automatically.
          </span>
        </div>
      </section>
    </main>
  );
}


export default RadarPage;