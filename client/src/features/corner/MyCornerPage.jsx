import {
  Moon,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import "./myCorner.css";


function MyCornerPage() {
  return (
    <main
      className="my-corner-page"
      aria-labelledby="my-corner-title"
    >
      <header className="my-corner-header">
        <p className="my-corner-header__eyebrow">
          PERSONALIZATION
        </p>

        <h1 id="my-corner-title">
          My Corner
        </h1>

        <p className="my-corner-header__intro">
          Create a study atmosphere that
          feels comfortable without changing
          how CozyCram plans your work.
        </p>
      </header>


      <section
        className="my-corner-hero"
        aria-labelledby="my-corner-hero-title"
      >
        <div
          className="my-corner-hero__icon"
          aria-hidden="true"
        >
          <Moon
            size={30}
            strokeWidth={1.8}
          />
        </div>


        <div className="my-corner-hero__content">
          <p>
            YOUR STUDY SPACE
          </p>

          <h2 id="my-corner-hero-title">
            Make Focus feel like your space.
          </h2>

          <span>
            My Corner will let you choose a
            visual study environment that can
            accompany Focus mode while keeping
            your schedule, tasks and study
            decisions unchanged.
          </span>
        </div>
      </section>


      <section
        className="my-corner-principles"
        aria-labelledby="my-corner-principles-title"
      >
        <div className="my-corner-section-heading">
          <p>
            HOW IT WORKS
          </p>

          <h2 id="my-corner-principles-title">
            Personalization without pressure
          </h2>
        </div>


        <div className="my-corner-principles__grid">
          <article>
            <div
              className="my-corner-principles__icon"
              aria-hidden="true"
            >
              <Palette
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h3>
                Atmosphere only
              </h3>

              <p>
                Your environment changes how
                the study space feels, not what
                CozyCram decides you should
                study.
              </p>
            </div>
          </article>


          <article>
            <div
              className="my-corner-principles__icon"
              aria-hidden="true"
            >
              <Sparkles
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h3>
                Your choice
              </h3>

              <p>
                CozyCram will not automatically
                switch environments or choose
                one based on productivity.
              </p>
            </div>
          </article>


          <article>
            <div
              className="my-corner-principles__icon"
              aria-hidden="true"
            >
              <ShieldCheck
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h3>
                Private by design
              </h3>

              <p>
                My Corner is personal study
                customization, not a social
                profile, feed or public space.
              </p>
            </div>
          </article>
        </div>
      </section>


      <section
        className="my-corner-catalog-preview"
        aria-labelledby="my-corner-catalog-title"
      >
        <div
          className="my-corner-catalog-preview__icon"
          aria-hidden="true"
        >
          <Sparkles
            size={24}
            strokeWidth={1.8}
          />
        </div>


        <div>
          <p>
            FOCUS ENVIRONMENTS
          </p>

          <h2 id="my-corner-catalog-title">
            Your atmosphere collection starts here.
          </h2>

          <span>
            The environment catalog will appear
            here next. Stage 1 establishes the
            My Corner space without selecting or
            saving anything yet.
          </span>
        </div>
      </section>
    </main>
  );
}


export default MyCornerPage;