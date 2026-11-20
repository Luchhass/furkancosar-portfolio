"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PageIntroStage from "./PageIntroStage";

export default function PageIntroAnimation() {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState(null);
  useEffect(() => {
    const begin = event => setPendingPath(event.detail);
    window.addEventListener("page-navigation:start", begin);
    return () => window.removeEventListener("page-navigation:start", begin);
  }, []);
  if (pendingPath !== null && pendingPath.pathname === pathname) setPendingPath(null);
  const targetPath = pendingPath?.pathname || pathname;

  return <PageIntroForRoute key={targetPath} pathname={targetPath} routeReady={targetPath === pathname} origin={pendingPath?.origin} />;
}

function PageIntroForRoute({ pathname, routeReady, origin }) {
  const [mounted, setMounted] = useState(() => typeof window === "undefined" || window.__pageIntroDoneForPath !== pathname);
  const [entryOrigin] = useState(origin);
  const finish = useCallback(() => setMounted(false), []);

  return mounted ? <PageIntroStage pathname={pathname} routeReady={routeReady} origin={entryOrigin} onFinished={finish} /> : null;
}
