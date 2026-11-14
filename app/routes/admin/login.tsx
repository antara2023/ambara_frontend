import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Loader2, LogIn } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/store";
import { useLoginMutation, errorMessage } from "~/store/api";
import { loggedIn } from "~/store/authSlice";
import { Field } from "~/components/form/Field";
import { Wordmark } from "~/components/layout/Logo";

export const meta = () => [{ title: "Admin sign in | Ambara" }, { name: "robots", content: "noindex, nofollow" }];

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, hydrated } = useAppSelector((s) => s.auth);
  const [login, { isLoading, error }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (hydrated && token) navigate("/admin", { replace: true });
  }, [hydrated, token, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login({ email: email.trim(), password });
    if ("data" in res && res.data) {
      dispatch(loggedIn(res.data));
      navigate("/admin", { replace: true });
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={submit}
        className="panel w-full max-w-sm p-7"
        noValidate
      >
        <Wordmark />
        <h1 className="mt-6 font-display text-2xl font-semibold text-star">Admin sign in</h1>
        <div className="mt-6 grid gap-4">
          <Field id="email" label="Email">
            {(a) => <input {...a} type="email" autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required />}
          </Field>
          <Field id="password" label="Password">
            {(a) => <input {...a} type="password" autoComplete="current-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} required />}
          </Field>
        </div>
        {error && (
          <p role="alert" className="mt-4 text-sm font-semibold text-ember">
            {errorMessage(error, { network: "Can't reach the server.", tooMany: "Too many attempts. Try again in 15 minutes.", generic: "Sign in failed." })}
          </p>
        )}
        <button type="submit" className="btn-primary mt-6 w-full" disabled={isLoading || !email || !password}>
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />} Sign in
        </button>
      </motion.form>
    </main>
  );
}
