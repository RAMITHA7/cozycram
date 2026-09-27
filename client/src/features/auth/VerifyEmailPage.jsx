import {
  ArrowLeft,
  MailCheck,
  RefreshCw,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import "./auth.css";


function VerifyEmailPage() {
  const [resendAttempted, setResendAttempted] =
    useState(false);


  const handleResend = () => {
    setResendAttempted(true);
  };


  return (
    <section
      className="auth-page"
      aria-labelledby="verify-email-title"
    >
      <div className="auth-page__heading">
        <p className="auth-page__eyebrow">
          VERIFY YOUR EMAIL
        </p>

        <h1 id="verify-email-title">
          One more step before you begin.
        </h1>

        <p>
          Email verification will help protect
          your CozyCram account once real
          authentication is connected.
        </p>
      </div>


      <div className="auth-verification">
        <div
          className="auth-verification__icon"
          aria-hidden="true"
        >
          <MailCheck
            size={28}
            strokeWidth={1.7}
          />
        </div>

        <div className="auth-verification__content">
          <h2>
            Check your inbox
          </h2>

          <p>
            In the finished authentication flow,
            CozyCram will send a verification link
            to the email used during signup.
          </p>
        </div>
      </div>


      <div className="auth-verification__actions">
        <button
          type="button"
          className="auth-secondary-action"
          onClick={handleResend}
        >
          <RefreshCw
            size={17}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          Resend verification email
        </button>


        {resendAttempted && (
          <div
            className="auth-status"
            role="status"
            aria-live="polite"
          >
            Email verification is not connected
            yet, so no new email has been sent.
          </div>
        )}
      </div>


      <p className="auth-form__demo-note">
        Verification links will become functional
        when Supabase authentication is added.
      </p>


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


export default VerifyEmailPage;