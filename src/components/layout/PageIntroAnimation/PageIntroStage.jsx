import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { siteConfig } from "@/data/site";
import usePageIntroTimeline from "./usePageIntroTimeline";
import styles from "./PageIntroStage.module.css";

function getFromY(index) {
  return index % 2 === 0 ? 130 : -130;
}

function Letter({ char, index, dataKey }) {
  const fromY = getFromY(index);
  const attr = { [dataKey]: "" };

  return (
    <span
      className={styles.letterMask}
    >
      <span
        {...attr}
        data-from-y={fromY}
        className={styles.letter}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    </span>
  );
}

function Word({
  text,
  wordRef,
  lettersRef,
  dataKey,
  isBrand = false,
  children,
}) {
  const { t } = useLanguage();
  return (
    <span
      ref={wordRef}
      className={isBrand ? `${styles.word} ${styles.brand}` : styles.word}
    >
      <span
        ref={lettersRef}
        className={styles.letters}
      >
        {t(text).split("").map((char, i) => (
          <Letter key={i} char={char} index={i} dataKey={dataKey} />
        ))}
      </span>

      {children}
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
  const brandRef = useRef(null);
  const brandTextRef = useRef(null);
  const regRef = useRef(null);
  usePageIntroTimeline({ pathname, routeReady, origin, onFinished, overlayRef, whiteLeftRef, whiteRightRef, bgRef, stageRef, welcomeRef, brandRef, brandTextRef, regRef });

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
        <Word text="WELCOME!" wordRef={welcomeRef} dataKey="data-wl" />

        <Word
          text={siteConfig.brand}
          wordRef={brandRef}
          lettersRef={brandTextRef}
          dataKey="data-bl"
          isBrand
        >
          <span
            ref={regRef}
            aria-hidden="true"
            className={styles.registered}
          >
            ®
          </span>
        </Word>
      </div>
    </div>
  );
}
