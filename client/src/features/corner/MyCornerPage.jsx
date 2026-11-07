import {
  BookOpen,
  Building2,
  CloudRain,
  Coffee,
  Moon,
  Palette,
  ShieldCheck,
  Sparkles,
  Trees,
} from "lucide-react";

import {
  getCornerEnvironmentCatalog,
} from "../../services/cornerEnvironmentService.js";

import "./myCorner.css";


const ENVIRONMENT_ICON_MAP = {
  rain:
    CloudRain,

  library:
    BookOpen,

  city:
    Building2,

  cafe:
    Coffee,

  forest:
    Trees,

  space:
    Sparkles,
};


const environments =
  getCornerEnvironmentCatalog();


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
            My Corner lets you shape the
            visual atmosphere around studying
            while keeping schedules, tasks and
            planning decisions separate.
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
                Environments change how the
                study space feels, not what
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
                choose an atmosphere based on
                productivity or performance.
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
                My Corner remains personal
                customization rather than a
                profile, social feed or public
                space.
              </p>
            </div>
          </article>
        </div>
      </section>


      <section
        className="my-corner-catalog"
        aria-labelledby="my-corner-catalog-title"
      >
        <div className="my-corner-section-heading">
          <p>
            FOCUS ENVIRONMENTS
          </p>

          <h2 id="my-corner-catalog-title">
            Choose the atmosphere that feels right
          </h2>

          <span>
            These environments are visual
            options only. Selection and preview
            arrive in the next stage.
          </span>
        </div>


        <div className="my-corner-environment-grid">
          {environments.map(
            (
              environment
            ) => {
              const EnvironmentIcon =
                ENVIRONMENT_ICON_MAP[
                  environment
                    .visualKey
                ] ||
                Sparkles;


              return (
                <article
                  key={
                    environment.id
                  }
                  className="my-corner-environment-card"
                >
                  <div
                    className={`my-corner-environment-card__visual my-corner-environment-card__visual--${environment.visualKey}`}
                    aria-hidden="true"
                  >
                    <EnvironmentIcon
                      size={30}
                      strokeWidth={1.7}
                    />

                    <span>
                      {
                        environment
                          .name
                      }
                    </span>
                  </div>


                  <div className="my-corner-environment-card__content">
                    <p>
                      {
                        environment
                          .name
                      }
                    </p>

                    <h3>
                      {
                        environment
                          .atmosphere
                      }
                    </h3>

                    <span>
                      {
                        environment
                          .description
                      }
                    </span>

                    <small>
                      Preview selection arrives next.
                    </small>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </section>
    </main>
  );
}


export default MyCornerPage;