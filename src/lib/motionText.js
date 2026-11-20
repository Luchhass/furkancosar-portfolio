import { SplitText } from "gsap/SplitText";

export function splitCharacters(element, charsClass = "motion-letter") {
  return SplitText.create(element, { type: "chars", charsClass });
}
