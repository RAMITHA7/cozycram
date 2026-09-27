import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import "./auth.css";


function LoginPage() {
  const [showPassword, setShowPassword] =
    useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
  };


  return (
    <section
      className="auth-page"
      aria-labelledby="login-title"
    >
      <div className="auth-page__heading">
        <p className="auth-page__eyebrow">
          WELCOME BACK
        </p>

        <h1 id="login-title">
          Continue your study plan.
        </h1>

        <p>
          Log in to return to your CozyCram
          workspace.
        </p>
      </div>


      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="auth-field">
          <label htmlFor="login-email">
            Email
          </label>

          <div className="auth-field__control">
            <Mail
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
        </div>


        <div className="auth-field">
          <div className="auth-field__label-row">
            <label htmlFor="login-password">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="auth-inline-link"
            >
              Forgot password?
            </Link>
          </div>

          <div className="auth-field__control">
            <LockKeyhole
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <input
              id="login-password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="current-password"
              placeholder="Enter your password"
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
        </div>


        <div className="auth-form__options">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              name="remember"
            />

            <span>
              Keep me signed in
            </span>
          </label>
        </div>


        <button
          type="submit"
          className="auth-submit"
        >
          Log in
        </button>


        <p className="auth-form__demo-note">
          Authentication is not connected yet.
          This form is currently UI-only.
        </p>
      </form>


      <div className="auth-page__switch">
        <span>
          New to CozyCram?
        </span>

        <Link to="/signup">
          Create an account
        </Link>
      </div>
    </section>
  );
}


export default LoginPage;