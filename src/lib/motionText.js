import { SplitText } from "gsap/SplitText";

// Keep the original continuous gradient across independently animated letters.
export function splitCharacters(element, charsClass = "motion-letter") {
  const split = SplitText.create(element, { type: "chars", charsClass });
  split.chars.forEach((char, index, chars) => {
    char.style.setProperty("--letter-count", chars.length);
    char.style.setProperty("--letter-position", `${index / Math.max(1, chars.length - 1) * 100}%`);
  });
  return split;
}
