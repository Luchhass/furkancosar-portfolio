import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// One native listener per distinct query, explicitly removed after its last user.
// Animation contexts remain local to each component and are reverted on changes.
const queries = new Map();
let refreshFrame = 0;

function subscribe(query, update) {
  let entry = queries.get(query);
  if (!entry) {
    const media = window.matchMedia(query);
    const subscribers = new Set();
    const change = () => {
      for (const subscriber of Array.from(subscribers)) subscriber();
      if (!refreshFrame) refreshFrame = requestAnimationFrame(() => { refreshFrame = 0; ScrollTrigger.refresh(); });
    };
    media.addEventListener("change", change);
    entry = { media, subscribers, change };
    queries.set(query, entry);
  }
  entry.subscribers.add(update);
  return {
    media: entry.media,
    remove() {
      entry.subscribers.delete(update);
      if (entry.subscribers.size === 0) {
        entry.media.removeEventListener("change", entry.change);
        queries.delete(query);
      }
      if (queries.size === 0 && refreshFrame) { cancelAnimationFrame(refreshFrame); refreshFrame = 0; }
    },
  };
}

export function createMotionMedia() {
  const selector = gsap.context()?.selector;
  const registrations = new Set();
  return {
    add(conditions, callback) {
      const definitions = typeof conditions === "string" ? { matches: conditions } : conditions;
      const subscriptions = new Map();
      let context = null;
      let signature = "";
      let disposed = false;
      function update() {
        if (disposed) return;
        const matches = Object.fromEntries(Object.keys(definitions).map((name) => [name, name === "all" || subscriptions.get(name).media.matches]));
        const next = JSON.stringify(matches);
        if (signature === next) return;
        signature = next;
        context?.revert();
        context = null;
        if (Object.values(matches).some(Boolean)) {
          context = gsap.context((self) => {
            self.selector = selector;
            self.conditions = matches;
            return callback(self, (fn) => self.add(null, fn));
          });
          context.selector = selector;
        }
      }
      Object.entries(definitions).forEach(([name, query]) => { if (name !== "all") subscriptions.set(name, subscribe(query, update)); });
      const dispose = () => { disposed = true; context?.revert(); context = null; subscriptions.forEach((subscription) => subscription.remove()); subscriptions.clear(); };
      registrations.add(dispose);
      update();
      return this;
    },
    revert() { registrations.forEach((dispose) => dispose()); registrations.clear(); },
  };
}
