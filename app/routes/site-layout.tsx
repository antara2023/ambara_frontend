import { Outlet, useLocation, useNavigation } from "react-router";
import { motion } from "motion/react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { useMountedAfterHydration } from "~/lib/hydration";


function PageBody() {
  // Pages opened by client navigation slide in; the first server-rendered page is shown immediately.
  const animate = useMountedAfterHydration();
  return (
    <motion.main
      id="main"
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <Outlet />
    </motion.main>
  );
}

/** Public site frame: header, animated page body, footer, and a thin progress bar while a page loads. */
export default function SiteLayout() {
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const busy = navigation.state === "loading" && navigation.location?.pathname !== pathname;

  return (
    // .pop: the public site's design (styles in app.css, light and dark)
    <div className="pop flex min-h-dvh flex-col">
      <div
        aria-hidden
        className={`fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-gradient-to-r from-gold-soft via-gold to-ember transition-[transform,opacity] duration-500 ${
          busy ? "scale-x-75 opacity-100" : "scale-x-100 opacity-0"
        }`}
      />
      <Header />
      <div className="flex-1">
        <PageBody key={pathname} />
      </div>
      <Footer />
    </div>
  );
}
