import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import usePageIntroTimeline from "./usePageIntroTimeline";
import styles from "./PageIntroStage.module.css";

function getFromY(index) {
  return index % 2 === 0 ? 130 : -130;
}

function Letter({ char, index }) {
  return (
    <span className={styles.letterMask}>
      <span data-wl data-from-y={getFromY(index)} className={styles.letter}>
        {char === " " ? "\u00A0" : char}
      </span>
    </span>
  );
}

function Welcome({ wordRef }) {
  const { t } = useLanguage();
  return (
    <span
      ref={wordRef}
      className={styles.word}
    >
      <span
        className={styles.letters}
      >
        {t("WELCOME!").split("").map((char, i) => (
          <Letter key={i} char={char} index={i} />
        ))}
      </span>
    </span>
  );
}

export default function PageIntroStage({ pathname, routeReady, origin, onFinished }) {
  const overlayRef = useRef(null);
  const whiteLeftRef = useRef(null);
  const whiteRightRef = useRef(null);
  const bgRef = useRef(null);
  const stageRef = useRef(null);
  const welcomeRef = useRef(null);
  usePageIntroTimeline({ pathname, routeReady, origin, onFinished, overlayRef, whiteLeftRef, whiteRightRef, bgRef, stageRef, welcomeRef });

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      data-page-intro
      className={styles.overlay}
    >
      <div
        ref={whiteLeftRef}
        className={`${styles.panel} ${styles.left}`}
      />

      <div
        ref={whiteRightRef}
        className={`${styles.panel} ${styles.right}`}
      />

      <div
        ref={bgRef}
        className={`gradient-bg-flow ${styles.gradient}`}
      />

      <div
        ref={stageRef}
        className={styles.stage}
      >
        <Welcome wordRef={welcomeRef} />
      </div>
    </div>
  );
}
