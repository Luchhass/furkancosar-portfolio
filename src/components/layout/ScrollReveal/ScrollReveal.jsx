"use client";

import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { playRevealCounters } from "@/components/ui/RevealCounter/RevealCounter";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function isElementNode(element) {
  return element instanceof HTMLElement;
}

function getPartMasks(section, part) {
  return gsap.utils
    .toArray(section.querySelectorAll(`[data-reveal-part='${part}']`))
    .filter(isElementNode);
}

function getPartMovers(masks) {
  return masks.flatMap((mask) => {
    const explicitMovers = gsap.utils
      .toArray(mask.querySelectorAll(":scope > [data-reveal-inner]"))
      .filter(isElementNode);

    if (explicitMovers.length) return explicitMovers;

    const childMovers = Array.from(mask.children).filter(isElementNode);

    return childMovers.length ? childMovers : [mask];
  });
}

function getSequenceGroups(section) {
  const kickerMasks = getPartMasks(section, "kicker");
  const titleMasks = getPartMasks(section, "title");
  const contentMasks = getPartMasks(section, "content");

  return {
    kicker: {
      masks: kickerMasks,
      movers: getPartMovers(kickerMasks),
    },
    title: {
      masks: titleMasks,
      movers: getPartMovers(titleMasks),
    },
    content: {
      masks: contentMasks,
      movers: getPartMovers(contentMasks),
    },
  };
}

function getAllMasks(groups) {
  return [
    ...groups.kicker.masks,
    ...groups.title.masks,
    ...groups.content.masks,
  ];
}

function getAllMovers(groups) {
  return [
    ...groups.kicker.movers,
    ...groups.title.movers,
    ...groups.content.movers,
  ];
}

function killSequenceTweens(groups) {
  gsap.killTweensOf([...getAllMovers(groups), ...getAllMasks(groups)]);
}

function getHiddenState(part) {
  if (part === "kicker") {
    return {
      autoAlpha: 1,
      yPercent: 185,
      rotateX: -8,
      transformOrigin: "50% 100%",
      willChange: "transform",
    };
  }

  if (part === "title") {
    return {
      autoAlpha: 1,
      xPercent: -112,
      transformOrigin: "0% 50%",
      willChange: "transform",
    };
  }

  return {};
}

function getMaskClipPath(part, direction = "down") {
  if (part === "kicker") {
    return direction === "up"
      ? "inset(0% -40% -40% -40%)"
      : "inset(-40% -40% 0% -40%)";
  }

  if (part === "title") {
    return direction === "up"
      ? "inset(-28% 0% -28% -12%)"
      : "inset(-28% -12% -28% 0%)";
  }

  return direction === "up"
    ? "inset(0% -12% -18% -12%)"
    : "inset(-18% -12% 0% -12%)";
}

function getContentHiddenState(direction = "up") {
  return {
    autoAlpha: 1,
    y: (_index, target) => {
      const mask = target.closest("[data-reveal-part='content']");
      const maskHeight =
        mask?.getBoundingClientRect().height ||
        target.getBoundingClientRect().height;
      const distance = maskHeight + 32;

      return direction === "up" ? -distance : distance;
    },
    yPercent: 0,
    rotateX: direction === "up" ? 8 : -8,
    transformOrigin: direction === "up" ? "50% 0%" : "50% 100%",
    willChange: "transform",
  };
}

function setSequenceHidden(groups) {
  gsap.set(groups.kicker.masks, {
    clipPath: getMaskClipPath("kicker", "down"),
  });

  gsap.set(groups.title.masks, {
    clipPath: getMaskClipPath("title", "down"),
  });

  gsap.set(groups.content.masks, {
    clipPath: getMaskClipPath("content", "up"),
  });

  gsap.set(groups.kicker.movers, getHiddenState("kicker"));
  gsap.set(groups.title.movers, getHiddenState("title"));
  gsap.set(groups.content.movers, getContentHiddenState("up"));
}

function revealSequence(groups) {
  const masks = getAllMasks(groups);

  const timeline = gsap.timeline({
    defaults: {
      autoAlpha: 1,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      rotateX: 0,
      ease: "power3.out",
      overwrite: "auto",
      clearProps: "transform,opacity,visibility,willChange,transformOrigin",
    },
    onComplete: () => {
      gsap.set(masks, { clearProps: "clipPath" });
    },
  });

  // Kicker → Title → Content sırası aynen korunuyor.
  if (groups.kicker.movers.length) {
    timeline.to(groups.kicker.movers, {
      duration: 0.8,
      stagger: 0.04,
      onComplete: () => {
        gsap.set(groups.kicker.masks, { clearProps: "clipPath" });
      },
    });
  }

  if (groups.title.movers.length) {
    timeline.to(
      groups.title.movers,
      {
        duration: 1.08,
        stagger: 0.14,
        onComplete: () => {
          gsap.set(groups.title.masks, { clearProps: "clipPath" });
        },
      },
      "-=0.5",
    );
  }

  if (groups.content.movers.length) {
    timeline.to(
      groups.content.movers,
      {
        duration: 0.86,
        stagger: 0.07,
        onComplete: () => {
          gsap.set(groups.content.masks, { clearProps: "clipPath" });
        },
      },
      "-=0.46",
    );
  }

  return timeline;
}

function hideSequence(groups) {
  gsap.set(groups.kicker.masks, {
    clipPath: getMaskClipPath("kicker", "down"),
  });

  gsap.set(groups.title.masks, {
    clipPath: getMaskClipPath("title", "down"),
  });

  gsap.set(groups.content.masks, {
    clipPath: getMaskClipPath("content", "up"),
  });

  const timeline = gsap.timeline({
    defaults: {
      ease: "power2.inOut",
      overwrite: "auto",
    },
  });

  timeline.to(
    groups.content.movers,
    {
      ...getContentHiddenState("up"),
      duration: 0.4,
      stagger: {
        each: 0.03,
        from: "end",
      },
    },
    0,
  );

  timeline.to(
    groups.title.movers,
    {
      autoAlpha: 1,
      xPercent: -112,
      duration: 0.42,
    },
    0,
  );

  timeline.to(
    groups.kicker.movers,
    {
      autoAlpha: 1,
      yPercent: 185,
      rotateX: -8,
      transformOrigin: "50% 100%",
      duration: 0.36,
    },
    0,
  );

  return timeline;
}

export default function ScrollReveal() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      if (prefersReducedMotion.matches) return;

      const sections = gsap.utils
        .toArray("main section[data-scroll-reveal='sequence']")
        .filter(isElementNode);

      const triggers = [];

      sections.forEach((section) => {
        const groups = getSequenceGroups(section);
        const masks = getAllMasks(groups);
        const targets = getAllMovers(groups).filter(isElementNode);
        const controller = {
          timeline: null,
        };

        if (!targets.length) return;

        gsap.killTweensOf(targets);
        setSequenceHidden(groups);

        function stopCurrentTimeline() {
          controller.timeline?.kill();
          controller.timeline = null;
          killSequenceTweens(groups);
        }

        function playReveal() {
          stopCurrentTimeline();

          // Önemli smoothness farkı:
          // Artık tekrar reveal olurken elemanları zorla en baştaki gizli state'e
          // snap'lemiyoruz. Hangi pozisyondaysa oradan yumuşakça reveal'a döner.
          controller.timeline = revealSequence(groups);

          controller.timeline.call(() => {
            playRevealCounters(section);
          });
        }

        function playHide() {
          stopCurrentTimeline();
          controller.timeline = hideSequence(groups);
        }

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top 72%",
          end: "bottom 22%",
          onEnter: playReveal,
          onEnterBack: playReveal,
          onLeave: playHide,
          onLeaveBack: playHide,
        });

        triggers.push({ trigger, targets, masks, controller });
      });

      ScrollTrigger.refresh();

      return () => {
        triggers.forEach(({ trigger, targets, masks, controller }) => {
          trigger.kill();
          controller.timeline?.kill();
          gsap.killTweensOf(targets);

          gsap.set(targets, {
            clearProps:
              "transform,opacity,visibility,willChange,transformOrigin",
          });

          gsap.set(masks, { clearProps: "clipPath" });
        });
      };
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}