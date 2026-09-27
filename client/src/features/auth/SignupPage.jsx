import {
  Check,
  Circle,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import "./auth.css";


function SignupPage() {
  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  const hasMinimumLength =
    password.length >= 8;

  const hasLetter =
    /[A-Za-z]/.test(password);

  const hasNumber =
    /\d/.test(password);

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;


  const handleSubmit = (event) => {
    event.preventDefault();
  };


  return (
    <section
      className="auth-page"
      aria-labelledby="signup-title"
    >
      <div className="auth-page__heading">
        <p className="auth-page__eyebrow">
          CREATE YOUR ACCOUNT
        </p>

        <h1 id="signup-title">
          Start with a calmer study plan.
        </h1>

        <p>
          Create your CozyCram account and
          prepare your workspace for subjects,
          tasks and focused study.
        </p>
      </div>


      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* FULL NAME */}

        <div className="auth-field">
          <label htmlFor="signup-name">
            Full name
          </label>

          <div className="auth-field__control">
            <UserRound
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
            />
          </div>
        </div>


        {/* EMAIL */}

        <div className="auth-field">
          <label htmlFor="signup-email">
            Email
          </label>

          <div className="auth-field__control">
            <Mail
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
        </div>


        {/* PASSWORD */}

        <div className="auth-field">
          <label htmlFor="signup-password">
            Password
          </label>

          <div className="auth-field__control">
            <LockKeyhole
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <input
              id="signup-password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              aria-describedby="password-guidance"
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              )}
            </button>
          </div>


          <div
            id="password-guidance"
            className="auth-password-guidance"
          >
            <p>
              Use a password with:
            </p>

            <div
              className={
                hasMinimumLength
                  ? "auth-password-rule auth-password-rule--passed"
                  : "auth-password-rule"
              }
            >
              {hasMinimumLength ? (
                <Check
                  size={14}
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  size={10}
                  aria-hidden="true"
                />
              )}

              <span>
                At least 8 characters
              </span>
            </div>

            <div
              className={
                hasLetter
                  ? "auth-password-rule auth-password-rule--passed"
                  : "auth-password-rule"
              }
            >
              {hasLetter ? (
                <Check
                  size={14}
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  size={10}
                  aria-hidden="true"
                />
              )}

              <span>
                At least one letter
              </span>
            </div>

            <div
              className={
                hasNumber
                  ? "auth-password-rule auth-password-rule--passed"
                  : "auth-password-rule"
              }
            >
              {hasNumber ? (
                <Check
                  size={14}
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  size={10}
                  aria-hidden="true"
                />
              )}

              <span>
                At least one number
              </span>
            </div>
          </div>
        </div>


        {/* CONFIRM PASSWORD */}

        <div className="auth-field">
          <label htmlFor="signup-confirm-password">
            Confirm password
          </label>

          <div className="auth-field__control">
            <LockKeyhole
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              placeholder="Enter password again"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              aria-describedby="password-match-status"
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() =>
                setShowConfirmPassword(
                  (current) => !current
                )
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirmed password"
                  : "Show confirmed password"
              }
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? (
                <EyeOff
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              )}
            </button>
          </div>


          <p
            id="password-match-status"
            className={
              confirmPassword.length === 0
                ? "auth-match-status"
                : passwordsMatch
                  ? "auth-match-status auth-match-status--success"
                  : "auth-match-status auth-match-status--error"
            }
            aria-live="polite"
          >
            {confirmPassword.length === 0
              ? "Enter the same password again."
              : passwordsMatch
                ? "Passwords match."
                : "Passwords do not match yet."}
          </p>
        </div>


        {/* SUBMIT */}

        <button
          type="submit"
          className="auth-submit"
        >
          Create account
        </button>


        <p className="auth-form__demo-note">
          Account creation is not connected yet.
          This form is currently UI-only.
        </p>
      </form>


      <div className="auth-page__switch">
        <span>
          Already have an account?
        </span>

        <Link to="/login">
          Log in
        </Link>
      </div>
    </section>
  );
}


export default SignupPage;