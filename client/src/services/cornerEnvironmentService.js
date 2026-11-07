export const CORNER_ENVIRONMENT_VERSION =
  1;

export const CORNER_ENVIRONMENT_PREFERENCE_KEY =
  "cornerEnvironmentId";

export const CORNER_ENVIRONMENT_ID = {
  RAINY_WINDOW:
    "rainy-window",

  DARK_LIBRARY:
    "dark-library",

  MIDNIGHT_CITY:
    "midnight-city",

  QUIET_CAFE:
    "quiet-cafe",

  FOREST_CABIN:
    "forest-cabin",

  DEEP_SPACE:
    "deep-space",
};


const CORNER_ENVIRONMENT_CATALOG =
  Object.freeze([
    Object.freeze({
      id:
        CORNER_ENVIRONMENT_ID
          .RAINY_WINDOW,

      name:
        "Rainy Window",

      visualKey:
        "rain",

      atmosphere:
        "Rain-streaked glass · dim desk · calm night",

      description:
        "A quiet window-side atmosphere with a darker visual mood and soft weather-inspired details.",
    }),


    Object.freeze({
      id:
        CORNER_ENVIRONMENT_ID
          .DARK_LIBRARY,

      name:
        "Dark Library",

      visualKey:
        "library",

      atmosphere:
        "Low light · shelves · focused stillness",

      description:
        "A reserved library-inspired space built around warm shelves, low visual noise and a focused study mood.",
    }),


    Object.freeze({
      id:
        CORNER_ENVIRONMENT_ID
          .MIDNIGHT_CITY,

      name:
        "Midnight City",

      visualKey:
        "city",

      atmosphere:
        "Night skyline · distant windows · quiet energy",

      description:
        "A late-night city atmosphere with distant lights and a clean desk-first feeling.",
    }),


    Object.freeze({
      id:
        CORNER_ENVIRONMENT_ID
          .QUIET_CAFE,

      name:
        "Quiet Café",

      visualKey:
        "cafe",

      atmosphere:
        "Warm table · soft interior · steady pace",

      description:
        "A simple café-inspired environment for a warmer visual study space without social or distracting features.",
    }),


    Object.freeze({
      id:
        CORNER_ENVIRONMENT_ID
          .FOREST_CABIN,

      name:
        "Forest Cabin",

      visualKey:
        "forest",

      atmosphere:
        "Wood textures · trees · grounded calm",

      description:
        "A cabin-inspired atmosphere with natural visual cues and a quieter grounded study mood.",
    }),


    Object.freeze({
      id:
        CORNER_ENVIRONMENT_ID
          .DEEP_SPACE,

      name:
        "Deep Space",

      visualKey:
        "space",

      atmosphere:
        "Dark sky · distant stars · minimal visual noise",

      description:
        "A minimal dark-space atmosphere designed around simplicity, distance and low visual clutter.",
    }),
  ]);


export const getCornerEnvironmentCatalog =
  () =>
    CORNER_ENVIRONMENT_CATALOG.map(
      (environment) => ({
        ...environment,
      })
    );


export const getCornerEnvironmentById =
  (
    environmentId
  ) => {
    const normalizedId =
      String(
        environmentId ?? ""
      ).trim();


    if (
      !normalizedId
    ) {
      return null;
    }


    const environment =
      CORNER_ENVIRONMENT_CATALOG.find(
        (candidate) =>
          candidate.id ===
          normalizedId
      );


    return environment
      ? {
          ...environment,
        }
      : null;
  };
export const getSavedCornerEnvironment = (
  studyData
) => {
  if (
    !studyData ||
    typeof studyData !==
      "object"
  ) {
    return null;
  }


  const savedEnvironmentId =
    studyData
      .preferences
      ?.[
        CORNER_ENVIRONMENT_PREFERENCE_KEY
      ];


  if (
    !savedEnvironmentId
  ) {
    return null;
  }


  return getCornerEnvironmentById(
    savedEnvironmentId
  );
};

export const createCornerEnvironmentPreferenceUpdate =
  ({
    studyData,
    environmentId,
  }) => {
    if (
      !studyData ||
      typeof studyData !==
        "object"
    ) {
      return {
        valid: false,

        error:
          "My Corner requires current CozyCram study data before saving an environment.",

        nextStudyData:
          null,

        environment:
          null,
      };
    }


    if (
      studyData.completed !==
        true
    ) {
      return {
        valid: false,

        error:
          "Complete your CozyCram study setup before saving a My Corner environment.",

        nextStudyData:
          null,

        environment:
          null,
      };
    }


    const environment =
      getCornerEnvironmentById(
        environmentId
      );


    if (
      !environment
    ) {
      return {
        valid: false,

        error:
          "Choose a valid My Corner environment before saving.",

        nextStudyData:
          null,

        environment:
          null,
      };
    }


    const currentPreferences =
      (
        studyData.preferences &&
        typeof studyData.preferences ===
          "object"
      )
        ? studyData.preferences
        : {};


    return {
      valid: true,

      error: "",

      environment,

      nextStudyData: {
        ...studyData,

        preferences: {
          ...currentPreferences,

          [
            CORNER_ENVIRONMENT_PREFERENCE_KEY
          ]:
            environment.id,
        },
      },
    };
  };
