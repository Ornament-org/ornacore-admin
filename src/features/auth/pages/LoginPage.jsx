import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Gem,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { z } from "zod";
import { BrandMark } from "../../../components/common/BrandMark.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { FormField } from "../../../components/common/FormField.jsx";
import { loginAdmin } from "../store/authSlice.js";
import "../Auth.scss";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  if (status === "authenticated") return <Navigate to="/dashboard" replace />;

  const submit = async (values) => {
    const result = await dispatch(
      loginAdmin({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }),
    );
    if (loginAdmin.fulfilled.match(result)) {
      navigate(result.payload.user.mustChangePassword ? "/change-password" : "/dashboard", {
        replace: true,
      });
    }
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
            <p>Use your OrnaCore administrator credentials to continue.</p>
          </div>
          <form onSubmit={handleSubmit(submit)} className="login-form" noValidate>
            {location.state?.message && (
              <div className="auth-success" role="status">
                <ShieldCheck size={17} />
                <span>{location.state.message}</span>
              </div>
            )}
            {error && <FormAlert icon={LockKeyhole}>{error}</FormAlert>}
            <FormField label="Email address" icon={Mail} error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@ornacore.com"
                {...register("email")}
              />
            </FormField>
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
              Sign in
            </Button>
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
