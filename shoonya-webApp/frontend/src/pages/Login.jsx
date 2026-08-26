import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight } from "../components/icons";
import { api } from "../api";

export default function Login() {
  const { login, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [resetForm, setResetForm] = useState({
    email: "",
    password: "",
    confirm: "",
  });
  const [resetMode, setResetMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  // Where to land after signing in — the page the guard bounced us from.
  const dest = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : "/account/orders";

  // A stored token is still being validated — wait rather than flashing the
  // login form at someone who turns out to be signed in already.
  if (loading) {
    return (
      <div className="pd pd--loading">
        <div className="spinner" />
      </div>
    );
  }

  if (isLoggedIn) return <Navigate to={dest} replace />;

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(dest, { replace: true });
    } catch (err) {
      setApiError(err.message);
      setSubmitting(false);
    }
  };

  const submitReset = async (ev) => {
    ev.preventDefault();
    setApiError(null);
    setResetMessage(null);
    const nextErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(resetForm.email))
      nextErrors.resetEmail = "Enter a valid email";
    if (resetForm.password.length < 8)
      nextErrors.resetPassword = "At least 8 characters";
    if (resetForm.confirm !== resetForm.password)
      nextErrors.resetConfirm = "Passwords do not match";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const result = await api.resetPassword({
        email: resetForm.email,
        new_password: resetForm.password,
      });
      setResetMessage(result.message);
      setResetForm({ email: "", password: "", confirm: "" });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const checkingOut = location.state?.from?.pathname === "/checkout";

  return (
    <div className="auth">
      <div className="auth__card panel">
        <div className="auth__head">
          <span className="eyebrow">Welcome back</span>
          <h1>Log in</h1>
          <p className="muted">
            {checkingOut
              ? "Log in to place your order — your cart is saved."
              : "Access your orders, profile, and saved address."}
          </p>
        </div>

        {resetMode ? (
          <form onSubmit={submitReset} noValidate>
            <div className="fields fields--single">
              <label
                className={`field ${errors.resetEmail ? "has-error" : ""}`}
              >
                <span>Email</span>
                <input
                  type="email"
                  value={resetForm.email}
                  autoComplete="email"
                  onChange={(e) =>
                    setResetForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
                {errors.resetEmail && (
                  <em className="field__err">{errors.resetEmail}</em>
                )}
              </label>
              <label
                className={`field ${errors.resetPassword ? "has-error" : ""}`}
              >
                <span>New password</span>
                <input
                  type="password"
                  value={resetForm.password}
                  autoComplete="new-password"
                  onChange={(e) =>
                    setResetForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
                {errors.resetPassword && (
                  <em className="field__err">{errors.resetPassword}</em>
                )}
              </label>
              <label
                className={`field ${errors.resetConfirm ? "has-error" : ""}`}
              >
                <span>Confirm password</span>
                <input
                  type="password"
                  value={resetForm.confirm}
                  autoComplete="new-password"
                  onChange={(e) =>
                    setResetForm((f) => ({ ...f, confirm: e.target.value }))
                  }
                />
                {errors.resetConfirm && (
                  <em className="field__err">{errors.resetConfirm}</em>
                )}
              </label>
            </div>
            {apiError && <div className="alert">{apiError}</div>}
            {resetMessage && <div className="notice">{resetMessage}</div>}
            <button
              type="submit"
              className="btn btn--primary btn--lg btn--block"
              disabled={submitting}
            >
              {submitting ? "Resetting…" : "Reset password"}
            </button>
          </form>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="fields fields--single">
              <label className={`field ${errors.email ? "has-error" : ""}`}>
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  placeholder="priya@email.com"
                  autoComplete="email"
                  onChange={(e) => set("email", e.target.value)}
                />
                {errors.email && <em className="field__err">{errors.email}</em>}
              </label>

              <label className={`field ${errors.password ? "has-error" : ""}`}>
                <span>Password</span>
                <input
                  type="password"
                  value={form.password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onChange={(e) => set("password", e.target.value)}
                />
                {errors.password && (
                  <em className="field__err">{errors.password}</em>
                )}
              </label>
            </div>

            {apiError && <div className="alert">{apiError}</div>}

            <button
              type="submit"
              className="btn btn--primary btn--lg btn--block"
              disabled={submitting}
            >
              {submitting ? (
                "Logging in…"
              ) : (
                <>
                  Log in <ArrowRight />
                </>
              )}
            </button>
          </form>
        )}

        <p className="auth__alt">
          <button
            type="button"
            className="auth__link auth__link--button"
            onClick={() => {
              setResetMode((mode) => !mode);
              setApiError(null);
              setResetMessage(null);
              setErrors({});
            }}
          >
            {resetMode ? "Back to log in" : "Forgot password?"}
          </button>
        </p>

        <p className="auth__alt">
          New to Shoonya Farms?{" "}
          <Link to="/register" state={location.state} className="auth__link">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
