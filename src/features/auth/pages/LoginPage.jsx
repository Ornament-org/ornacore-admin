import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Gem,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { BrandMark } from "../../../components/common/BrandMark.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { FormField } from "../../../components/common/FormField.jsx";
import { env } from "../../../config/env.js";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { authService } from "../../../services/authService.js";
import { authActions, loginAdmin, loginAdminWithGoogle, loginAdminWithOtp } from "../store/authSlice.js";
import "../Auth.scss";

const emailSchema = z.email("Enter a valid email address");

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

const emptyOtp = ["", "", "", ""];

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(emptyOtp);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const otpInputRefs = useRef([]);
  const googleButtonRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const email = watch("email");
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const navigateAfterLogin = useCallback(
    (user) => {
      navigate(user.mustChangePassword ? "/change-password" : "/dashboard", { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    if (!env.googleClientId || !googleButtonRef.current) return;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;

      window.__ornaAdminGoogleLoginCallback = async (credentialResponse) => {
        if (!credentialResponse?.credential) {
          setGoogleError("Google did not return a login credential. Please try again.");
          return;
        }
        setGoogleError("");
        const result = await dispatch(loginAdminWithGoogle({ idToken: credentialResponse.credential }));
        if (loginAdminWithGoogle.fulfilled.match(result)) {
          navigateAfterLogin(result.payload.user);
        }
      };

      if (window.__ornaAdminGoogleClientId !== env.googleClientId) {
        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          callback: (credentialResponse) =>
            window.__ornaAdminGoogleLoginCallback?.(credentialResponse),
        });
        window.__ornaAdminGoogleClientId = env.googleClientId;
      }

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: Math.min(360, googleButtonRef.current.offsetWidth || 320),
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", initializeGoogle, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => setGoogleError("Unable to load Google login. Please try again.");
    document.head.appendChild(script);
  }, [dispatch, navigateAfterLogin]);

  if (status === "authenticated") return <Navigate to="/dashboard" replace />;

  const submit = async (values) => {
    const result = await dispatch(
      loginAdmin({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }),
    );
    if (loginAdmin.fulfilled.match(result)) navigateAfterLogin(result.payload.user);
  };

  const requestOtp = async () => {
    setOtpError("");
    setOtpMessage("");
    dispatch(authActions.clearAuthError());

    const parsed = emailSchema.safeParse(normalizedEmail);
    if (!parsed.success) {
      setOtpError("Enter a valid admin email before sending OTP.");
      return;
    }

    setOtpSending(true);
    try {
      const data = await authService.requestOtpLogin({ email: parsed.data });
      setOtpSent(true);
      setOtpDigits(emptyOtp);
      setOtpMessage(`OTP sent to ${data.destination}.`);
      window.setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
    } catch (requestError) {
      setOtpSent(false);
      setOtpError(apiErrorMessage(requestError));
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError("");
    const parsed = emailSchema.safeParse(normalizedEmail);
    if (!parsed.success) {
      setOtpError("Enter a valid admin email before verifying OTP.");
      return;
    }
    const otp = otpDigits.join("");
    if (!/^[0-9]{4}$/.test(otp)) {
      setOtpError("Enter the 4 digit OTP sent to your email.");
      return;
    }
    const result = await dispatch(loginAdminWithOtp({ email: parsed.data, otp }));
    if (loginAdminWithOtp.fulfilled.match(result)) navigateAfterLogin(result.payload.user);
  };

  const setOtpDigit = (index) => (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(-1);
    setOtpDigits((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
    setOtpError("");
    if (value && index < emptyOtp.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const pasteOtpDigits = (index) => (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, emptyOtp.length - index);
    if (!pasted) return;
    event.preventDefault();
    setOtpDigits((current) => {
      const next = [...current];
      pasted.split("").forEach((digit, offset) => {
        next[index + offset] = digit;
      });
      return next;
    });
    otpInputRefs.current[Math.min(index + pasted.length, emptyOtp.length - 1)]?.focus();
  };

  const handleOtpKeyDown = (index) => (event) => {
    if (event.key !== "Backspace" || otpDigits[index]) return;
    otpInputRefs.current[index - 1]?.focus();
  };

  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="login-showcase__glow login-showcase__glow--one" />
        <div className="login-showcase__glow login-showcase__glow--two" />
        <BrandMark inverse />
        <div className="login-showcase__content">
          <span className="login-kicker">
            <Sparkles size={15} /> The operating system for jewelry wholesale
          </span>
          <h1>
            Every order, every gram,
            <br />
            <em>beautifully controlled.</em>
          </h1>
          <p>
            Run shopkeeper approvals, catalog, pricing, inventory, orders, collections, and
            financial ledgers from one secure toolbox.
          </p>
          <div className="login-benefits">
            <div>
              <span>
                <ShieldCheck size={20} />
              </span>
              <strong>Permission aware</strong>
              <small>Granular RBAC for every operational action.</small>
            </div>
            <div>
              <span>
                <Gem size={20} />
              </span>
              <strong>Jewelry native</strong>
              <small>Designed around variants, purity, weight, MOQ, and pricing.</small>
            </div>
          </div>
        </div>
        <p className="login-showcase__footer">OrnaCore · Admin Toolbox · Secure B2B Operations</p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card__brand">
            <BrandMark />
          </div>
          <div className="login-card__heading">
            <span className="login-card__eyebrow">Secure administration</span>
            <h2>Sign in to your account</h2>
            <p>Use your OrnaCore administrator account to continue.</p>
          </div>

          <form onSubmit={handleSubmit(submit)} className="login-form" noValidate>
            {location.state?.message && (
              <div className="auth-success" role="status">
                <ShieldCheck size={17} />
                <span>{location.state.message}</span>
              </div>
            )}
            {error && <FormAlert icon={LockKeyhole}>{error}</FormAlert>}
            {otpError && <FormAlert icon={LockKeyhole}>{otpError}</FormAlert>}
            {googleError && <FormAlert icon={LockKeyhole}>{googleError}</FormAlert>}
            {otpMessage && (
              <div className="auth-success" role="status">
                <CheckCircle2 size={17} />
                <span>{otpMessage}</span>
              </div>
            )}

            <FormField label="Email address" icon={Mail} error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@ornacore.com"
                {...register("email")}
              />
            </FormField>

            <div className="otp-inline-action">
              <button
                className="otp-text-button"
                type="button"
                disabled={otpSending || loading}
                onClick={requestOtp}
              >
                {otpSending ? "Sending OTP..." : otpSent ? "Send OTP again" : "Send OTP"}
              </button>
            </div>

            {otpSent && (
              <div className="otp-verify-block otp-verify-block--standalone">
                <span>Email OTP</span>
                <div className="otp-boxes">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpInputRefs.current[index] = element;
                      }}
                      value={digit}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      aria-label={`OTP digit ${index + 1}`}
                      maxLength={1}
                      onChange={setOtpDigit(index)}
                      onPaste={pasteOtpDigits(index)}
                      onKeyDown={handleOtpKeyDown(index)}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  loading={loading}
                  icon={CheckCircle2}
                  className="login-submit"
                  onClick={verifyOtp}
                >
                  Verify OTP
                </Button>
              </div>
            )}

            <FormField
              label="Password"
              icon={LockKeyhole}
              error={errors.password?.message}
              trailing={
                <button
                  type="button"
                  className="field-action"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            >
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register("password")}
              />
            </FormField>
            <div className="login-form__options">
              <label className="checkbox-label">
                <input type="checkbox" {...register("remember")} />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-button" title="Password reset API is pending">
                Forgot password?
              </button>
            </div>
            <Button type="submit" loading={loading} icon={ArrowRight} className="login-submit">
              Sign in with Password
            </Button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            {env.googleClientId ? (
              <div className="google-login-button" ref={googleButtonRef} />
            ) : (
              <button className="google-login-fallback" type="button" disabled>
                <span>G</span>
                Google login not configured
              </button>
            )}
          </form>
          <div className="login-card__security">
            <ShieldCheck size={15} />
            Protected by short-lived access tokens and rotating refresh sessions.
          </div>
        </div>
      </section>
    </main>
  );
}
