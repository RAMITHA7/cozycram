import {
  Check,
  Circle,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import "./auth.css";


function ResetPasswordPage() {
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

  const [resetAttempted, setResetAttempted] =
    useState(false);


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

    setResetAttempted(true);
  };


  return (
    <section
      className="auth-page"
      aria-labelledby="reset-password-title"
    >
      <div className="auth-page__heading">
        <p className="auth-page__eyebrow">
          NEW PASSWORD
        </p>

        <h1 id="reset-password-title">
          Choose a new password.
        </h1>

        <p>
          Create a new password for your
          CozyCram account.
        </p>
      </div>


      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* NEW PASSWORD */}

        <div className="auth-field">
          <label htmlFor="reset-password">
            New password
          </label>

          <div className="auth-field__control">
            <LockKeyhole
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <input
              id="reset-password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              placeholder="Create a new password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              aria-describedby="reset-password-guidance"
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
                  ? "Hide new password"
                  : "Show new password"
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
            id="reset-password-guidance"
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
          <label htmlFor="reset-confirm-password">
            Confirm new password
          </label>

          <div className="auth-field__control">
            <LockKeyhole
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <input
              id="reset-confirm-password"
              name="confirmPassword"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              placeholder="Enter the password again"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              aria-describedby="reset-password-match"
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
            id="reset-password-match"
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


        <button
          type="submit"
          className="auth-submit"
        >
          Update password
        </button>


        {resetAttempted && (
          <div
            className="auth-status"
            role="status"
            aria-live="polite"
          >
            Password updates are not connected
            yet, so your password has not been
            changed.
          </div>
        )}


        <p className="auth-form__demo-note">
          Real password updates will be enabled
          when authentication is connected.
        </p>
      </form>


      <div className="auth-page__switch">
        <Link to="/login">
          Return to login
        </Link>
      </div>
    </section>
  );
}


export default ResetPasswordPage;