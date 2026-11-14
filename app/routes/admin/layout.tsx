import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { ExternalLink, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/store";
import { loggedOut } from "~/store/authSlice";
import { LogoMark } from "~/components/layout/Logo";

export const meta = () => [{ title: "Admin | Ambara" }, { name: "robots", content: "noindex, nofollow" }];

/** Admin frame. The sign-in token lives in this browser only; without it the visitor is sent to the sign-in page. */
export default function AdminLayout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, admin, hydrated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (hydrated && !token) navigate("/admin/login", { replace: true });
  }, [hydrated, token, navigate]);

  if (!hydrated || !token) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="skeleton h-10 w-40" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-fg/[0.07] bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/admin" className="flex items-center gap-2.5 font-display text-lg font-semibold text-star">
            <LogoMark size={26} /> Ambara <span className="rounded-md bg-gold/15 px-2 py-0.5 font-sans text-xs font-bold text-gold">Admin</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <a href="/" target="_blank" rel="noreferrer" className="btn-ghost !px-3 !py-1.5 text-xs">
              Site <ExternalLink size={13} />
            </a>
            <span className="hidden text-haze sm:inline">{admin?.email}</span>
            <button onClick={() => dispatch(loggedOut())} className="btn-ghost !px-3 !py-1.5 text-xs">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
