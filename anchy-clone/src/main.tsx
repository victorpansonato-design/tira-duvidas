import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import Workspace from "./Workspace";
import "./original.css";
import "./styles.css";
const LegacyRoute = lazy(() => import("./LegacyRoute"));
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<div role="status">Abrindo Tira-dúvidas…</div>}>
        {location.pathname === "/original" ? <LegacyRoute /> : <Workspace />}
      </Suspense>
    </MotionConfig>
  </React.StrictMode>,
);
