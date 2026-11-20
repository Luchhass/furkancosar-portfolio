// Coordinate existing animations by their role, without adding timed delays.
const scenes = new Map();
const pendingScenes = new Set();

function stageFor(anchor) {
  const explicit = anchor.closest("[data-reveal-order]");
  if (explicit) return Number(explicit.dataset.revealOrder);
  if (anchor.closest(".ui-section-label")) return 1;
  if (anchor.closest("h1, h2, .title-reveal-mask")) return 2;
  if (anchor.closest("[data-scene-row], [data-reveal-part='content']")) return 4;
  if (anchor.matches("[data-reading-reveal]")) return 3;
  if (anchor.closest("form")) return 5;
  return 4;
}

function schedule(records) {
  const alreadyQueued = pendingScenes.size > 0;
  pendingScenes.add(records);
  if (alreadyQueued) return;
  queueMicrotask(() => {
    const pending = [...pendingScenes];
    pendingScenes.clear();
    pending.forEach(records => {
      const visible = [...records].filter(record => record.visible && record.anchor.getClientRects().length);
      visible.forEach(record => {
        if (record.started || !record.canPlay()) return;
        if (visible.some(previous => previous.stage < record.stage && !previous.ready)) return;
        record.started = true;
        record.animation.timeScale(1).restart(true);
      });
    });
  });
}

export function sequenceReveal(animation, anchor, { canPlay = () => true, stage = stageFor(anchor) } = {}) {
  const scene = anchor.closest("section, footer") || anchor;
  let records = scenes.get(scene);
  if (!records) { records = new Set(); scenes.set(scene, records); }
  const record = { animation, anchor, stage, canPlay, visible: false, started: false, ready: false };
  records.add(record);
  const complete = animation.eventCallback("onComplete");
  const params = animation.vars.onCompleteParams || [];
  const update = animation.eventCallback("onUpdate");
  const updateParams = animation.vars.onUpdateParams || [];
  const tweens = animation.getChildren ? animation.getChildren(true, true, false) : [animation];
  animation.eventCallback("onUpdate", function () {
    update?.apply(this, updateParams);
    // Ease-out tails can continue after the motion looks settled. Hand off
    // there, preserving every tween's original speed and natural completion.
    if (record.started && !record.ready && !this.reversed() && tweens.length &&
        tweens.every(tween => tween.progress() === 1 || tween.ratio >= .995)) {
      record.ready = true;
      schedule(records);
    }
  });
  animation.eventCallback("onComplete", function () {
    complete?.apply(this, params);
    record.ready = true;
    schedule(records);
  });
  return {
    enter() { record.visible = true; schedule(records); },
    exit() { record.visible = false; record.started = false; record.ready = false; schedule(records); },
    refresh() { schedule(records); },
    replay() { record.started = false; record.ready = false; schedule(records); },
    dispose() {
      records.delete(record);
      if (!records.size) scenes.delete(scene);
      animation.eventCallback("onComplete", complete, params);
      animation.eventCallback("onUpdate", update, updateParams);
      if (records.size) schedule(records);
    },
  };
}
