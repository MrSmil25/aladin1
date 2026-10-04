import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { LayoutGroup, MotionConfig, motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppProvider } from "@/lib/store";
import { StepSheet } from "@/components/app/StepSheet";
import { BottomNav } from "@/components/app/BottomNav";
import { dur, easeOut, motionCss } from "@/lib/motion";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Halaman tidak ditemukan</h2>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Halaman gagal dimuat</h1>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Coba lagi</button>
          <a href="/" className="rounded-full border px-4 py-2 text-sm font-medium text-foreground">Ke Beranda</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aladin · Ala Impian Haji STEP" },
      { name: "description", content: "Prototipe konsep Ala Impian Haji dengan program STEP di app Aladin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head><HeadContent /></head>
      <body style={motionCss}><AppProvider>{children}</AppProvider><Scripts /></body>
    </html>
  );
}

const depth = (p: string) => p.split("/").filter(Boolean).length;

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prev = useRef(pathname);
  const dir = depth(pathname) < depth(prev.current) ? -1 : 1;
  useEffect(() => { prev.current = pathname; }, [pathname]);
  const showNav = pathname === "/" || pathname === "/keuangan" || pathname === "/impian-haji";
  const isPitch = pathname === "/pitch";

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <div className={isPitch ? "h-dvh" : "flex min-h-screen items-center justify-center sm:py-6"}>
          <div className={isPitch ? "relative h-dvh w-full overflow-hidden bg-background" : "relative h-[100dvh] w-full overflow-hidden bg-background sm:h-[844px] sm:w-[390px] sm:rounded-[44px] sm:shadow-[var(--shadow-navy)]"}>
            <LayoutGroup>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, x: isPitch ? 0 : 24 * dir }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: dur.emphasis, ease: easeOut }}
                id="app-scroll" className={isPitch ? "h-full overflow-hidden" : "no-scrollbar h-full overflow-y-auto"}
              >
                <Outlet />
              </motion.div>
            </LayoutGroup>
            {showNav && <BottomNav />}
            <div id="sheet-root" />
            <StepSheet />
            <Toaster position="top-center" toastOptions={{ className: "font-sans" }} style={{ position: "absolute" }} />
          </div>
        </div>
      </MotionConfig>
    </QueryClientProvider>
  );
}
