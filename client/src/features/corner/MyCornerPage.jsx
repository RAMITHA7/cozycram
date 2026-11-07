import {
  BookOpen,
  Building2,
  Check,
  CloudRain,
  Coffee,
  Eye,
  Moon,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trees,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  loadStudyData,
  saveStudyData,
} from "../../services/studyDataService.js";

import {
  createCornerEnvironmentPreferenceUpdate,
  getCornerEnvironmentById,
  getCornerEnvironmentCatalog,
  getSavedCornerEnvironment,
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
    const [
  initialData,
] = useState(
  loadStudyData
);


const studyData =
  initialData.data;


const loadError =
  initialData.error;


const initiallySavedEnvironment =
  getSavedCornerEnvironment(
    studyData
  );


const initialSavedEnvironmentId =
  initiallySavedEnvironment
    ?.id ??
  null;

  const [
  selectedEnvironmentId,
  setSelectedEnvironmentId,
] = useState(
  initialSavedEnvironmentId
);

const [
  savedEnvironmentId,
  setSavedEnvironmentId,
] = useState(
  initialSavedEnvironmentId
);

const [
  saveError,
  setSaveError,
] = useState(
  loadError || ""
);


const [
  saveNotice,
  setSaveNotice,
] = useState(
  ""
);

  const selectedEnvironment =
    selectedEnvironmentId
      ? getCornerEnvironmentById(
          selectedEnvironmentId
        )
      : null;

const savedEnvironment =
  savedEnvironmentId
    ? getCornerEnvironmentById(
        savedEnvironmentId
      )
    : null;

    const previewDiffersFromSaved =
  Boolean(
    selectedEnvironment
  ) &&
  selectedEnvironmentId !==
    savedEnvironmentId;


const previewMatchesSaved =
  Boolean(
    selectedEnvironment
  ) &&
  selectedEnvironmentId ===
    savedEnvironmentId;

  const handleSelectEnvironment =
    (
      environmentId
    ) => {
      const environment =
        getCornerEnvironmentById(
          environmentId
        );


      if (
        !environment
      ) {
        return;
      }

setSaveError(
  ""
);


setSaveNotice(
  ""
);

      setSelectedEnvironmentId(
        environment.id
      );
    };


  const handleClearPreview =
  () => {
    setSelectedEnvironmentId(
      null
    );


    setSaveError(
      ""
    );


    setSaveNotice(
      ""
    );
  };

const handleSaveEnvironment =
  () => {
    if (
      !selectedEnvironmentId
    ) {
      setSaveError(
        "Choose an environment before saving."
      );

      return;
    }


    setSaveError(
      ""
    );


    setSaveNotice(
      ""
    );


    const latestDataResult =
      loadStudyData();


    if (
      latestDataResult.error ||
      !latestDataResult.data
    ) {
      setSaveError(
        latestDataResult.error ||
        "CozyCram could not reload your current study data safely."
      );

      return;
    }


    const updateResult =
      createCornerEnvironmentPreferenceUpdate({
        studyData:
          latestDataResult.data,

        environmentId:
          selectedEnvironmentId,
      });


    if (
      !updateResult.valid
    ) {
      setSaveError(
        updateResult.error
      );

      return;
    }


    const saveResult =
      saveStudyData(
        updateResult
          .nextStudyData
      );


    if (
      !saveResult.success
    ) {
      setSaveError(
        saveResult.error
      );

      return;
    }


    setSavedEnvironmentId(
      updateResult
        .environment
        .id
    );


    setSaveNotice(
      `${updateResult.environment.name} is now your saved My Corner environment.`
    );
  };

  const handleRestoreSavedEnvironment =
  () => {
    if (
      !savedEnvironment
    ) {
      return;
    }


    setSelectedEnvironmentId(
      savedEnvironment.id
    );


    setSaveError(
      ""
    );


    setSaveNotice(
      "Saved environment restored to the preview."
    );
  };

  const SelectedEnvironmentIcon =
    selectedEnvironment
      ? ENVIRONMENT_ICON_MAP[
          selectedEnvironment
            .visualKey
        ] ||
        Sparkles
      : Sparkles;


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
  Preview any environment below,
  then save it only when you want
  CozyCram to remember the choice.
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


              const isSelected =
                selectedEnvironmentId ===
                environment.id;

              const isSaved =
  savedEnvironmentId ===
    environment.id;

              return (
                <article
                  key={
                    environment.id
                  }
                  className={`my-corner-environment-card${
                    isSelected
                      ? " my-corner-environment-card--selected"
                      : ""
                  }`}
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

                    {isSaved && (
  <span className="my-corner-environment-card__saved">
    <Check
      size={14}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    Saved
  </span>
)}
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


                    <button
                      type="button"
                      className="my-corner-environment-card__select"
                      aria-pressed={
                        isSelected
                      }
                      onClick={
                        () =>
                          handleSelectEnvironment(
                            environment.id
                          )
                      }
                    >
                      {isSelected ? (
                        <Check
                          size={17}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      ) : (
                        <Eye
                          size={17}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      )}

                      {isSelected
                        ? "Previewing"
                        : "Preview environment"}
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </section>


      <section
        className={`my-corner-preview${
          selectedEnvironment
            ? ` my-corner-preview--${selectedEnvironment.visualKey}`
            : ""
        }`}
        aria-labelledby="my-corner-preview-title"
      >
        {selectedEnvironment ? (
          <>
            <div
              className="my-corner-preview__scene"
              aria-hidden="true"
            >
              <SelectedEnvironmentIcon
                size={38}
                strokeWidth={1.6}
              />

              <span>
                {
                  selectedEnvironment
                    .name
                }
              </span>
            </div>


            <div className="my-corner-preview__content">
              <p>
                LIVE PREVIEW
              </p>

              <h2 id="my-corner-preview-title">
                {
                  selectedEnvironment
                    .name
                }
              </h2>

              <strong>
                {
                  selectedEnvironment
                    .atmosphere
                }
              </strong>

              <span>
                {
                  selectedEnvironment
                    .description
                }
              </span>


              <div
                className="my-corner-preview__notice"
                role="status"
                aria-live="polite"
              >
                {previewMatchesSaved ? (
  <>
    <Check
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <p>
      Saved environment — CozyCram
      will remember this choice.
    </p>
  </>
) : (
  <>
    <Eye
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    <p>
      Preview only — save this
      environment if you want CozyCram
      to remember it.
    </p>
  </>
)}
              </div>


              <div className="my-corner-preview__actions">
  <button
    type="button"
    className="my-corner-preview__save"
    onClick={
      handleSaveEnvironment
    }
    disabled={
      !previewDiffersFromSaved
    }
  >
    <Check
      size={17}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    {previewMatchesSaved
      ? "Environment saved"
      : "Save environment"}
  </button>


  {savedEnvironment &&
    previewDiffersFromSaved && (
    <button
      type="button"
      className="my-corner-preview__secondary"
      onClick={
        handleRestoreSavedEnvironment
      }
    >
      <RotateCcw
        size={17}
        strokeWidth={1.8}
        aria-hidden="true"
      />

      Restore saved
    </button>
  )}


  <button
    type="button"
    className="my-corner-preview__secondary"
    onClick={
      handleClearPreview
    }
  >
    <Eye
      size={17}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    Clear preview
  </button>
</div>
{saveError && (
  <div
    className="my-corner-preview__feedback my-corner-preview__feedback--error"
    role="alert"
  >
    <p>
      {saveError}
    </p>
  </div>
)}


{saveNotice && (
  <div
    className="my-corner-preview__feedback"
    role="status"
    aria-live="polite"
  >
    <p>
      {saveNotice}
    </p>
  </div>
)}
            </div>
          </>
        ) : (
          <>
            <div
              className="my-corner-preview__empty-icon"
              aria-hidden="true"
            >
              <Eye
                size={27}
                strokeWidth={1.8}
              />
            </div>


            <div className="my-corner-preview__empty">
              <p>
                LIVE PREVIEW
              </p>

              <h2 id="my-corner-preview-title">
                No environment selected
              </h2>

              <span>
                Choose one of the six
                environments above to preview
                how your study atmosphere
                could feel.
              </span>
              {savedEnvironment && (
  <button
    type="button"
    className="my-corner-preview__restore"
    onClick={
      handleRestoreSavedEnvironment
    }
  >
    <RotateCcw
      size={17}
      strokeWidth={1.8}
      aria-hidden="true"
    />

    Preview saved{" "}
    {
      savedEnvironment
        .name
    }
  </button>
)}
            </div>
          </>
        )}
      </section>
    </main>
  );
}


export default MyCornerPage;