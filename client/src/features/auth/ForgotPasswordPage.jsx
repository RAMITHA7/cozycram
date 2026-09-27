import {
  ArrowLeft,
  Mail,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import "./auth.css";


function ForgotPasswordPage() {
  const [requestAttempted, setRequestAttempted] =
    useState(false);


  const handleSubmit = (event) => {
    event.preventDefault();

    setRequestAttempted(true);
  };


  return (
    <section
      className="auth-page"
      aria-labelledby="forgot-password-title"
    >
      <div className="auth-page__heading">
        <p className="auth-page__eyebrow">
          PASSWORD RECOVERY
        </p>

        <h1 id="forgot-password-title">
          Reset your password.
        </h1>

        <p>
          Enter the email connected to your
          CozyCram account.
        </p>
      </div>


      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="auth-field">
          <label htmlFor="forgot-email">
            Email
          </label>

          <div className="auth-field__control">
            <Mail
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
        </div>


        <button
          type="submit"
          className="auth-submit"
        >
          Send reset link
        </button>


        {requestAttempted && (
          <div
            className="auth-status"
            role="status"
            aria-live="polite"
          >
            Password recovery is not connected
            yet, so no email has been sent.
          </div>
        )}


        <p className="auth-form__demo-note">
          Email recovery will be connected when
          authentication is implemented.
        </p>
      </form>


      <div className="auth-page__switch">
        <Link
          to="/login"
          className="auth-back-link"
        >
          <ArrowLeft
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          Back to login
        </Link>
      </div>
    </section>
  );
}


export default ForgotPasswordPage;