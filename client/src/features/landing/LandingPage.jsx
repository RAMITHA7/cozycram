import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CalendarRange,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  ListTodo,
  Move,
  Pencil,
  RefreshCw,
  SlidersHorizontal,
  Target,
  Timer,
  TimerReset,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import "./landing.css";

function LandingPage() {
   const currentYear = new Date().getFullYear();
   return (
    <div 
        className="landing-page"
         id="top"
    >
      {/* =====================================================
          HERO
          ===================================================== */}

        <section className="landing-hero">
           <div
               className="landing-hero__glow landing-hero__glow--one"
               aria-hidden="true"
            />

           <div
              className="landing-hero__glow landing-hero__glow--two"
              aria-hidden="true"
            />

            <div className="landing-container landing-hero__grid">
               <div className="landing-hero__content">
                   <p className="landing-hero__badge">
                       <span
                          className="landing-hero__badge-dot"
                          aria-hidden="true"
                        />

                        Adaptive study planning
                    </p>

                   <h1 className="landing-hero__title">
                     Less panic.
                     <br />
                     <span>Better planning.</span>
                    </h1>

                    <p className="landing-hero__description">
                       Turn subjects, deadlines, workload and
                       the time you actually have into a study
                       plan you can realistically follow.
                    </p>

                    <div className="landing-hero__actions">
                      <Link
                        to="/signup"
                        className="landing-cta landing-cta--primary"
                      >
                        <span>Get Started</span>

                         <ArrowRight
                            size={18}
                            strokeWidth={1.9}
                            aria-hidden="true"
                         />
                       </Link>

                        <Link
                           to="/login"
                           className="landing-cta landing-cta--secondary"
                        >
                            Login
                        </Link>
                    </div>

                    <ul className="landing-hero__points">
                       <li>
                          <Check
                             size={16}
                             strokeWidth={2}
                             aria-hidden="true"
                           />

                            <span>
                                Plan around your real available time
                            </span>
                         </li>

                        <li>
                           <Check
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                            />

                            <span>
                                Connect scheduled work to focus sessions
                            </span>
                        </li>

                        <li>
                            <Check
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                            />

                            <span>
                                See what deserves your attention next
                            </span>
                        </li>
                    </ul>
                </div>

               <div className="landing-product-preview">
                   <div
                       className="landing-product-preview__ambient"
                       aria-hidden="true"
                    />

                    <div className="landing-product-preview__window">
                        <div className="landing-product-preview__bar">
                            <div
                                className="landing-product-preview__window-controls"
                                aria-hidden="true"
                            >
                               <span />
                               <span />
                               <span />
                            </div>

                            <span className="landing-product-preview__window-title">
                                CozyCram · Today
                            </span>

                            <span
                                className="landing-product-preview__window-status"
                                aria-hidden="true"
                            >
                                ●
                            </span>
                        </div>

                    <div className="landing-product-preview__body">
                       <aside
                            className="landing-product-preview__sidebar"
                            aria-hidden="true"
                        >
                            <div className="landing-product-preview__brand">
                                C.
                            </div>

                            <div className="landing-product-preview__nav-item landing-product-preview__nav-item--active" />

                            <div className="landing-product-preview__nav-item" />
                            <div className="landing-product-preview__nav-item" />
                            <div className="landing-product-preview__nav-item" />

                            <div className="landing-product-preview__nav-spacer" />

                            <div className="landing-product-preview__nav-item landing-product-preview__nav-item--small" />
                        </aside>

                        <div className="landing-product-preview__main">
                            <div className="landing-product-preview__heading">
                                <div>
                                    <span className="landing-product-preview__label">
                                       TODAY
                                    </span>

                                    <strong>
                                        Good evening.
                                    </strong>
                                </div>

                                <span className="landing-product-preview__date">
                                    Thursday
                                </span>
                            </div>

                            <div className="landing-product-preview__progress">
                                <div>
                                    <span>
                                       Daily progress
                                    </span>

                                    <strong>
                                      2h 10m / 4h
                                    </strong>
                                </div>

                                <div className="landing-product-preview__progress-track">
                            <span />
                        </div>
                    </div>

                    <div className="landing-product-preview__recommendation">
                        <div className="landing-product-preview__recommendation-top">
                            <span>
                                WHAT SHOULD I STUDY NOW?
                            </span>

                            <small>
                                Recommended
                            </small>
                        </div>

                        <strong>
                            Physics · Electromagnetic Induction
                        </strong>

                        <p>
                            Exam in 4 days · 2h 20m remaining
                        </p>

                        <div className="landing-product-preview__recommendation-bottom">
                            <span>
                                50 minute session
                            </span>

                            <span className="landing-product-preview__start">
                                Start focus
                            </span>
                        </div>
                    </div>

                    <div className="landing-product-preview__schedule">
                        <div className="landing-product-preview__schedule-heading">
                            <strong>
                                Today&apos;s plan
                            </strong>

                            <span>
                                3 sessions
                            </span>
                        </div>

                        <div className="landing-product-preview__session">
                            <span className="landing-product-preview__time">
                                 7:00
                            </span>

                            <span className="landing-product-preview__session-dot landing-product-preview__session-dot--physics" />

                            <div>
                                <strong>
                                    Physics
                                </strong>

                                <span>
                                    Electromagnetic Induction
                                </span>
                            </div>

                            <small>
                                50m
                            </small>
                        </div>

                        <div className="landing-product-preview__session">
                            <span className="landing-product-preview__time">
                               8:05
                            </span>

                            <span className="landing-product-preview__session-dot landing-product-preview__session-dot--math" />

                            <div>
                                <strong>
                                    Mathematics
                                </strong>

                                <span>
                                    Calculus assignment
                                </span>
                            </div>

                            <small>
                                45m
                            </small>
                        </div>

                        <div className="landing-product-preview__session">
                            <span className="landing-product-preview__time">
                                 9:10
                            </span>

                            <span className="landing-product-preview__session-dot landing-product-preview__session-dot--coding" />

                                <div>
                                    <strong>
                                        DSA
                                    </strong>

                                    <span>
                                        Graph practice
                                    </span>
                                </div>

                                <small>
                                    40m
                                </small>
                            </div>
                       </div>
                    </div>
                 </div>
            </div>

            <div
                className="landing-product-preview__floating-card"
                aria-hidden="true"
            >
                <span>
                   PLAN STATUS
                </span>

                <strong>
                    Tonight fits.
                </strong>

                <small>
                    3 sessions · 2h 15m
                </small>
            </div>
        </div>
    </div>
</section>

      {/* =====================================================
          PRODUCT LOOP
        ===================================================== */}

       <section
            className="landing-section landing-loop"
            aria-labelledby="landing-loop-title"
        > 
            <div className="landing-container">
                <div className="landing-section__intro landing-loop__intro">
                    <p className="landing-eyebrow">
                        ONE CONNECTED WORKFLOW
                    </p>

                    <h2 id="landing-loop-title">
                        Planning only works when it survives
                        the real week.
                    </h2>

                    <p>
                        CozyCram connects the schedule you make
                        with the work you actually complete, so
                        planning and focus stay part of the same
                        workflow.
                    </p>
                </div>

                <ol className="landing-loop__steps">
                   <li className="landing-loop__step">
                       <div className="landing-loop__step-marker">
                            <span className="landing-loop__step-number">
                               01
                            </span>

                            <div className="landing-loop__icon">
                               <CalendarDays
                                   size={22}
                                   strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>

                        <div className="landing-loop__step-content">
                            <p className="landing-loop__step-label">
                                PLAN
                            </p>

                            <h3>
                                Give every task a realistic place.
                            </h3>

                            <p>
                                Add subjects, deadlines, workload
                                and the time you actually have.
                                CozyCram turns those constraints into
                                study blocks across your week.
                            </p>

                            <div className="landing-loop__example landing-loop__example--plan">
                                <div className="landing-loop__example-row">
                                    <span>
                                        Physics
                                    </span>

                                    <strong>
                                        7:00 PM
                                    </strong>
                                </div>

                                <div className="landing-loop__example-row">
                                    <span>
                                        Mathematics
                                    </span>

                                    <strong>
                                        8:05 PM
                                    </strong>
                                </div>

                                <div className="landing-loop__example-row">
                                    <span>
                                       DSA
                                    </span>

                                    <strong>
                                        9:10 PM
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </li>

                    <li className="landing-loop__step">
                        <div className="landing-loop__step-marker">
                            <span className="landing-loop__step-number">
                                02
                            </span>

                            <div className="landing-loop__icon">
                               <Clock3
                                    size={22}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>

                        <div className="landing-loop__step-content">
                            <p className="landing-loop__step-label">
                                FOCUS
                            </p>

                            <h3>
                                Start from the work already planned.
                            </h3>

                            <p>
                                A study block can become a focused
                                session without creating the same task
                                again somewhere else.
                            </p>

                            <div className="landing-loop__focus-example">
                                <div>
                                    <span>
                                        Physics
                                    </span>

                                    <strong>
                                        50:00
                                    </strong>

                                    <small>
                                        Electromagnetic Induction
                                    </small>
                                </div>

                                <span className="landing-loop__focus-status">
                                    Focusing
                                </span>
                            </div>
                        </div>
                    </li>

                    <li className="landing-loop__step">
                        <div className="landing-loop__step-marker">
                            <span className="landing-loop__step-number">
                                03
                            </span>

                            <div className="landing-loop__icon">
                                <CheckCircle2
                                    size={22}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>

                        <div className="landing-loop__step-content">
                            <p className="landing-loop__step-label">
                                MEASURE
                            </p>

                            <h3>
                                Completed work updates the plan.
                            </h3>

                            <p>
                                CozyCram records the focus time you
                                complete and updates progress on the
                                task you were actually working on.
                            </p>

                            <div className="landing-loop__progress-example">
                                <div className="landing-loop__progress-header">
                                    <span>
                                        Physics revision
                                    </span>

                                    <strong>
                                        65%
                                    </strong>
                                </div>

                            <div className="landing-loop__progress-track">
                                <span />
                            </div>

                            <small>
                                +50 minutes completed
                            </small>
                        </div>
                    </div>
                </li>

                <li className="landing-loop__step">
                    <div className="landing-loop__step-marker">
                        <span className="landing-loop__step-number">
                            04
                        </span>

                        <div className="landing-loop__icon">
                            <RefreshCw
                                size={22}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                        </div>
                    </div>

                    <div className="landing-loop__step-content">
                        <p className="landing-loop__step-label">
                            ADAPT
                        </p>

                        <h3>
                            Change the plan without rebuilding it.
                        </h3>

                        <p>
                            When your week changes, move, edit or
                            regenerate study blocks instead of
                            starting the entire schedule again.
                        </p>

                        <div className="landing-loop__adapt-example">
                            <TimerReset
                                size={20}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />

                            <div>
                                <strong>
                                    Need a different evening?
                                </strong>

                                <span>
                                    Edit or regenerate the schedule.
                                </span>
                            </div>
                        </div>
                    </div>
                </li>
            </ol>

            <div className="landing-loop__closing">
                <span className="landing-loop__closing-line" />

                <p>
                    Then the cycle begins again with a plan
                    that reflects what you have completed.
                </p>
            </div>
        </div>
    </section>


      {/* =====================================================
          V1 FEATURES
         ===================================================== */}

       <section
           className="landing-section landing-section--surface landing-features"
           aria-labelledby="landing-features-title"
        >
           <div className="landing-container">
               <div className="landing-section__intro landing-features__intro">
                   <p className="landing-eyebrow">
                       BUILT FOR REAL STUDY WEEKS
                    </p>

                    <h2 id="landing-features-title">
                        The pieces of your week,
                        finally connected.
                    </h2>

                    <p>
                        CozyCram keeps planning, tasks,
                        availability and focus in the same
                        workflow instead of making you rebuild
                        your study plan across separate tools.
                    </p>
                </div>

                <div className="landing-features__grid">
                   {/* SMART PLANNER */}

                   <article className="landing-feature landing-feature--planner">
                        <div className="landing-feature__header">
                            <div className="landing-feature__icon">
                               <CalendarDays
                                    size={21}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </div>

                            <span className="landing-feature__type">
                                PLANNING
                            </span>
                        </div>

                        <div className="landing-feature__copy">
                           <h3>
                               Smart Planner
                            </h3>

                            <p>
                                Turn deadlines, workload and the
                                hours you actually have into study
                                blocks across your week.
                            </p>
                        </div>

                        <div
                            className="feature-planner-preview"
                            aria-hidden="true"
                        >
                            <div className="feature-planner-preview__header">
                                <strong>
                                    This week
                                </strong>

                                <span>
                                    8 study blocks
                                </span>
                            </div>

                            <div className="feature-planner-preview__days">
                                <span>
                                   MON
                                </span>
                                <span>
                                   TUE
                                </span>
                                <span>
                                    WED
                                </span>
                                <span>
                                    THU
                                </span>
                                <span>
                                    FRI
                                </span>
                            </div>

                           <div className="feature-planner-preview__timeline">
                                <div className="feature-planner-preview__time">
                                    <span>
                                        6 PM
                                    </span>
                                    <span>
                                        7 PM
                                    </span>
                                   <span>
                                        8 PM
                                    </span>
                                </div>

                                <div className="feature-planner-preview__blocks">
                                    <div className="feature-planner-preview__block feature-planner-preview__block--physics">
                                        <strong>
                                            Physics
                                        </strong>

                                        <span>
                                            50m
                                        </span>
                                    </div>

                                <div className="feature-planner-preview__block feature-planner-preview__block--math">
                                    <strong>
                                        Calculus
                                    </strong>

                                    <span>
                                        45m
                                    </span>
                                </div>

                                <div className="feature-planner-preview__block feature-planner-preview__block--coding">
                                    <strong>
                                        DSA
                                    </strong>

                                    <span>
                                        40m
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>


                {/* TODAY */}

                <article className="landing-feature landing-feature--today">
                    <div className="landing-feature__header">
                        <div className="landing-feature__icon">
                            <LayoutDashboard
                                size={21}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                        </div>

                        <span className="landing-feature__type">
                            DAILY VIEW
                        </span>
                    </div>

                    <div className="landing-feature__copy">
                        <h3>
                            Today
                        </h3>

                        <p>
                            See what is planned, what is next
                            and how much of today&apos;s work
                            you have completed.
                        </p>
                    </div>

                    <div
                        className="feature-today-preview"
                        aria-hidden="true"
                    >
                    <div className="feature-today-preview__top">
                        <span>
                            DAILY PROGRESS
                        </span>

                       <strong>
                            54%
                        </strong>
                    </div>

                    <div className="feature-today-preview__track">
                        <span />
                    </div>

                    <div className="feature-today-preview__next">
                        <span>
                            NEXT
                        </span>

                        <strong>
                            Physics
                        </strong>

                        <small>
                            7:00 PM · 50 min
                        </small>
                    </div>
                </div>
            </article>


            {/* WHAT SHOULD I STUDY */}

                <article className="landing-feature landing-feature--recommendation">
                    <div className="landing-feature__header">
                        <div className="landing-feature__icon">
                            <Target
                                size={21}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                        </div>

                        <span className="landing-feature__type">
                             NEXT STEP
                        </span>
                    </div>

                    <div className="landing-feature__copy">
                        <h3>
                            What should I study now?
                        </h3>

                        <p>
                            Get a clear next-session suggestion
                            based on the work already in your
                            plan.
                        </p>
                    </div>

                    <div
                        className="feature-recommendation-preview"
                        aria-hidden="true"
                    >
                    <span className="feature-recommendation-preview__label">
                        RECOMMENDED
                    </span>

                    <strong>
                        Physics · EMI
                    </strong>

                    <p>
                        Exam in 4 days
                    </p>

                    <div className="feature-recommendation-preview__reason">
                        <span>
                            High priority
                        </span>

                        <span>
                            50 min
                        </span>
                    </div>
                </div>
            </article>


            {/* FOCUS ENGINE */}

            <article className="landing-feature landing-feature--focus">
                <div className="landing-feature__header">
                    <div className="landing-feature__icon">
                        <Timer
                            size={21}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />
                    </div>

                    <span className="landing-feature__type">
                        FOCUS
                    </span>
                </div>

                <div className="landing-feature__copy">
                    <h3>
                        Focus Engine
                    </h3>

                    <p>
                        Start a 25, 50, 90-minute or custom
                        session and connect the time you
                        complete to the task you were
                        actually studying.
                    </p>
                </div>

                <div
                    className="feature-focus-preview"
                    aria-hidden="true"
                >
                <div className="feature-focus-preview__timer">
                    <span>
                         PHYSICS
                    </span>

                    <strong>
                        42:18
                    </strong>

                    <small>
                        Electromagnetic Induction
                    </small>
                </div>

                <div className="feature-focus-preview__modes">
                    <span>
                        25
                    </span>

                   <span className="feature-focus-preview__mode--active">
                         50
                    </span>

                    <span>
                        90
                    </span>

                    <span>
                        Custom
                    </span>
                </div>
            </div>
        </article>


        {/* CALENDAR */}

        <article className="landing-feature landing-feature--calendar">
            <div className="landing-feature__header">
                <div className="landing-feature__icon">
                    <CalendarRange
                        size={21}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />
                </div>

                <span className="landing-feature__type">
                    CALENDAR
                </span>
            </div>

            <div className="landing-feature__copy">
               <h3>
                   Calendar
                </h3>

                <p>
                    View study blocks, deadlines and
                    tasks together across day, week and
                    month views.
                </p>
            </div>

            <div
                 className="feature-calendar-preview"
                aria-hidden="true"
            >
                <div className="feature-calendar-preview__days">
                    <span>
                        M
                    </span>
                    <span>
                        T
                    </span>
                    <span>
                        W
                    </span>
                    <span className="feature-calendar-preview__day--active">
                        T
                    </span>
                    <span>
                        F
                    </span>
                </div>

                <div className="feature-calendar-preview__event">
                    <span />

                    <div>
                        <strong>
                            Physics
                        </strong>

                        <small>
                            7:00 PM
                        </small>
                    </div>
                </div>

                <div className="feature-calendar-preview__event">
                    <span />

                    <div>
                        <strong>
                            Calculus
                        </strong>

                        <small>
                            8:05 PM
                        </small>
                    </div>
                </div>
            </div>
        </article>


       {/* STUDY FOUNDATION */}

            <article className="landing-feature landing-feature--foundation">
                 <div className="landing-feature__header">
                    <div className="landing-feature__icon">
                        <BookOpen
                            size={21}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />
                    </div>

                    <span className="landing-feature__type">
                        YOUR WORK
                    </span>
                </div>

                <div className="landing-feature__copy">
                    <h3>
                        Subjects, tasks & availability
                    </h3>

                    <p>
                        Give the planner the information it
                        needs: what you are studying, what
                        needs to be done and when you are
                        actually free.
                    </p>
                </div>

                <div
                    className="feature-foundation-preview"
                    aria-hidden="true"
                >
                    <div className="feature-foundation-preview__column">
                        <div className="feature-foundation-preview__heading">
                            <BookOpen
                                size={15}
                                aria-hidden="true"
                            />

                            <span>
                                SUBJECTS
                            </span>
                        </div>

                        <div className="feature-foundation-preview__chips">
                            <span>
                                Physics
                            </span>

                            <span>
                                 Mathematics
                            </span>

                            <span>
                                 DSA
                            </span>
                        </div>
                    </div>

                    <div className="feature-foundation-preview__column">
                        <div className="feature-foundation-preview__heading">
                            <ListTodo
                                size={15}
                            aria-hidden="true"
                            /> 

                            <span>
                                TASKS
                            </span>
                        </div>

                        <div className="feature-foundation-preview__task">
                            <CheckCircle2
                                size={14}
                                aria-hidden="true"
                            />

                            <span>
                                Revision chapter
                            </span>
                        </div>

                        <div className="feature-foundation-preview__task">
                            <span className="feature-foundation-preview__task-dot" />

                            <span>
                                 Finish assignment
                            </span>
                        </div>
                    </div>

                    <div className="feature-foundation-preview__column">
                        <div className="feature-foundation-preview__heading">
                            <Clock3
                                size={15}
                                aria-hidden="true"
                            />

                            <span>
                                AVAILABLE
                            </span>
                        </div>

                         <strong>
                            6:30 – 10:00 PM
                        </strong>

                        <small>
                            Weekdays
                        </small>
                    </div>
                </div>
            </article>
        </div>
    </div>
</section>


       {/* =====================================================
    PLANNER DEMO
    ===================================================== */}

<section
  className="landing-section landing-planner-demo"
  aria-labelledby="landing-planner-title"
>
  <div className="landing-container">
    <div className="landing-section__intro landing-planner-demo__intro">
      <p className="landing-eyebrow">
        FROM WORKLOAD TO A REAL WEEK
      </p>

      <h2 id="landing-planner-title">
        Your tasks are not the plan.
        <br />
        CozyCram turns them into one.
      </h2>

      <p>
        Give CozyCram your deadlines, estimated
        workload and available study time. The
        planner uses those constraints to place
        focused study blocks across your week.
      </p>
    </div>

    <div className="landing-planner-demo__workspace">
      {/* INPUTS */}

      <div className="planner-demo-inputs">
        <div className="planner-demo-panel-heading">
          <div>
            <span className="planner-demo-panel-heading__eyebrow">
              YOUR INPUTS
            </span>

            <strong>
              What CozyCram knows
            </strong>
          </div>

          <SlidersHorizontal
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        <div className="planner-demo-input-group">
          <p className="planner-demo-input-group__label">
            SUBJECTS & WORKLOAD
          </p>

          <div className="planner-demo-workload-row">
            <span className="planner-demo-subject-dot planner-demo-subject-dot--physics" />

            <div>
              <strong>
                Physics
              </strong>

              <small>
                Electromagnetic Induction
              </small>
            </div>

            <span>
              2h 20m
            </span>
          </div>

          <div className="planner-demo-workload-row">
            <span className="planner-demo-subject-dot planner-demo-subject-dot--math" />

            <div>
              <strong>
                Mathematics
              </strong>

              <small>
                Calculus assignment
              </small>
            </div>

            <span>
              1h 30m
            </span>
          </div>

          <div className="planner-demo-workload-row">
            <span className="planner-demo-subject-dot planner-demo-subject-dot--coding" />

            <div>
              <strong>
                DSA
              </strong>

              <small>
                Graph practice
              </small>
            </div>

            <span>
              1h 20m
            </span>
          </div>
        </div>

        <div className="planner-demo-input-group">
          <p className="planner-demo-input-group__label">
            UPCOMING DEADLINES
          </p>

          <div className="planner-demo-deadline">
            <div>
              <strong>
                Physics exam
              </strong>

              <span>
                Thursday
              </span>
            </div>

            <small>
              4 days
            </small>
          </div>

          <div className="planner-demo-deadline">
            <div>
              <strong>
                Calculus assignment
              </strong>

              <span>
                Saturday
              </span>
            </div>

            <small>
              6 days
            </small>
          </div>
        </div>

        <div className="planner-demo-availability">
          <div>
            <Clock3
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <div>
              <span>
                AVAILABLE TO STUDY
              </span>

              <strong>
                6:30 – 10:00 PM
              </strong>
            </div>
          </div>

          <small>
            Weekdays
          </small>
        </div>

        <div
          className="planner-demo-generate"
          aria-hidden="true"
        >
          Generate study plan
          <ArrowRight
            size={17}
            strokeWidth={1.9}
          />
        </div>
      </div>


      {/* GENERATED PLAN */}

      <div className="planner-demo-output">
        <div className="planner-demo-output__header">
          <div>
            <span className="planner-demo-panel-heading__eyebrow">
              GENERATED PLAN
            </span>

            <strong>
              This week
            </strong>
          </div>

          <span className="planner-demo-output__status">
            7 study blocks
          </span>
        </div>

        <div
          className="planner-demo-week"
          aria-hidden="true"
        >
          <div className="planner-demo-day">
            <div className="planner-demo-day__header">
              <span>
                MON
              </span>

              <strong>
                21
              </strong>
            </div>

            <div className="planner-demo-block planner-demo-block--physics">
              <span>
                7:00 PM
              </span>

              <strong>
                Physics
              </strong>

              <small>
                50 min
              </small>
            </div>

            <div className="planner-demo-block planner-demo-block--coding">
              <span>
                8:10 PM
              </span>

              <strong>
                DSA
              </strong>

              <small>
                40 min
              </small>
            </div>
          </div>

          <div className="planner-demo-day">
            <div className="planner-demo-day__header">
              <span>
                TUE
              </span>

              <strong>
                22
              </strong>
            </div>

            <div className="planner-demo-block planner-demo-block--math">
              <span>
                6:45 PM
              </span>

              <strong>
                Calculus
              </strong>

              <small>
                45 min
              </small>
            </div>
          </div>

          <div className="planner-demo-day">
            <div className="planner-demo-day__header">
              <span>
                WED
              </span>

              <strong>
                23
              </strong>
            </div>

            <div className="planner-demo-block planner-demo-block--physics planner-demo-block--selected">
              <span>
                7:00 PM
              </span>

              <strong>
                Physics
              </strong>

              <small>
                50 min
              </small>
            </div>

            <div className="planner-demo-block planner-demo-block--math">
              <span>
                8:15 PM
              </span>

              <strong>
                Calculus
              </strong>

              <small>
                45 min
              </small>
            </div>
          </div>

          <div className="planner-demo-day">
            <div className="planner-demo-day__header">
              <span>
                THU
              </span>

              <strong>
                24
              </strong>
            </div>

            <div className="planner-demo-block planner-demo-block--physics">
              <span>
                6:45 PM
              </span>

              <strong>
                Review
              </strong>

              <small>
                40 min
              </small>
            </div>
          </div>

          <div className="planner-demo-day">
            <div className="planner-demo-day__header">
              <span>
                FRI
              </span>

              <strong>
                25
              </strong>
            </div>

            <div className="planner-demo-block planner-demo-block--coding">
              <span>
                7:30 PM
              </span>

              <strong>
                DSA
              </strong>

              <small>
                40 min
              </small>
            </div>
          </div>
        </div>

        <div className="planner-demo-explanation">
          <CircleHelp
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div>
            <span>
              WHY THIS BLOCK?
            </span>

            <strong>
              Physics · Wednesday at 7:00 PM
            </strong>

            <p>
              The exam is in 4 days, 2h 20m of
              work remains, and this session fits
              inside your available evening time.
            </p>
          </div>
        </div>

        <div
          className="planner-demo-controls"
          aria-label="Example planner controls"
        >
          <span>
            <Pencil
              size={15}
              aria-hidden="true"
            />

            Edit
          </span>

          <span>
            <Move
              size={15}
              aria-hidden="true"
            />

            Move
          </span>

          <span>
            Remove
          </span>

          <span className="planner-demo-controls__regenerate">
            <RefreshCw
              size={15}
              aria-hidden="true"
            />

            Regenerate
          </span>
        </div>
      </div>
    </div>

    <div className="landing-planner-demo__control-note">
      <SlidersHorizontal
        size={20}
        strokeWidth={1.8}
        aria-hidden="true"
      />

      <div>
        <strong>
          The planner proposes. You stay in control.
        </strong>

        <p>
          Accept the schedule as generated, or
          edit, move, remove and regenerate study
          blocks when you want a different plan.
        </p>
      </div>
    </div>
  </div>
</section>


      {/* =====================================================
    FINAL CTA
    ===================================================== */}

<section
  className="landing-final-cta"
  aria-labelledby="landing-final-title"
>
  <div className="landing-container">
    <div className="landing-final-cta__panel">
      <div className="landing-final-cta__copy">
        <p className="landing-eyebrow">
          YOUR WEEK, WITH LESS GUESSWORK
        </p>

        <h2 id="landing-final-title">
          Build a study week
          <br />
          you can actually follow.
        </h2>

        <p>
          Bring your subjects, deadlines,
          workload and available time together
          in one place—and turn them into a plan
          you can focus on.
        </p>

        <div className="landing-final-cta__actions">
          <Link
            to="/signup"
            className="landing-cta landing-cta--primary"
          >
            <span>
              Start planning
            </span>

            <ArrowRight
              size={18}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </Link>

          <Link
            to="/login"
            className="landing-cta landing-cta--secondary"
          >
            Login
          </Link>
        </div>
      </div>

      <div
        className="landing-final-cta__summary"
        aria-hidden="true"
      >
        <div className="landing-final-cta__summary-header">
          <span>
            COZYCRAM
          </span>

          <strong>
            Less panic.
            <br />
            Better planning.
          </strong>
        </div>

        <div className="landing-final-cta__summary-list">
          <div>
            <Check
              size={17}
              strokeWidth={2}
            />

            <span>
              Turn workload into study blocks
            </span>
          </div>

          <div>
            <Check
              size={17}
              strokeWidth={2}
            />

            <span>
              Focus directly from your plan
            </span>
          </div>

          <div>
            <Check
              size={17}
              strokeWidth={2}
            />

            <span>
              Keep progress connected to tasks
            </span>
          </div>

          <div>
            <Check
              size={17}
              strokeWidth={2}
            />

            <span>
              Edit or regenerate when plans change
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


{/* =====================================================
    FOOTER
    ===================================================== */}

<footer className="landing-footer">
  <div className="landing-container">
    <div className="landing-footer__main">
      <div className="landing-footer__brand">
        <a
          href="#top"
          className="landing-footer__logo"
          aria-label="Go to top of CozyCram home page"
        >
          CozyCram.
        </a>

        <p>
          A calmer way to turn study workload
          into a plan you can actually use.
        </p>
      </div>

      <nav
        className="landing-footer__navigation"
        aria-label="Footer navigation"
      >
        <div>
          <span className="landing-footer__label">
            PRODUCT
          </span>

          <a href="#top">
            Home
          </a>
        </div>

        <div>
          <span className="landing-footer__label">
            ACCOUNT
          </span>

          <Link to="/login">
            Login
          </Link>

          <Link to="/signup">
            Get Started
          </Link>
        </div>
      </nav>
    </div>

    <div className="landing-footer__bottom">
      <span>
        © {currentYear} CozyCram. Built by Ramitha Hatwar.
      </span>

      <span>
        Less panic. Better planning.
      </span>
    </div>
  </div>
</footer>
    </div>
  );
}

export default LandingPage;
