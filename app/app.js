"use strict";
const $ = (id) => document.getElementById(id);
const PATTERNS = {
  "Box (4-4-4-4)": [["Breathe in", 4], ["Hold", 4], ["Breathe out", 4], ["Hold", 4]],
  "4-7-8": [["Breathe in", 4], ["Hold", 7], ["Breathe out", 8]],
  "Calm (4-6)": [["Breathe in", 4], ["Breathe out", 6]],
};
let pattern = Object.keys(PATTERNS)[0], running = false, timers = [], endAt = 0, counter = 0;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function renderPatterns() {
  $("patterns").replaceChildren(...Object.keys(PATTERNS).map((p) => {
    const b = document.createElement("button");
    b.textContent = p;
    b.setAttribute("aria-pressed", String(p === pattern));
    b.addEventListener("click", () => { pattern = p; stop(); renderPatterns(); });
    return b;
  }));
}

function size(scale, secs) {
  $("circle").style.transition = reduce ? "none" : `transform ${secs}s ease-in-out`;
  $("circle").style.transform = `scale(${scale})`;
}

function cycle() {
  if (!running) return;
  if (Date.now() >= endAt) { stop("Well done."); return; }
  let t = 0;
  for (const [label, secs] of PATTERNS[pattern]) {
    timers.push(setTimeout(() => {
      $("circle").textContent = label;
      if (label === "Breathe in") size(2.6, secs);
      else if (label === "Breathe out") size(1, secs);
      let n = secs;
      $("count").textContent = n;
      clearInterval(counter);
      counter = setInterval(() => { n--; $("count").textContent = n > 0 ? n : ""; if (n <= 0) clearInterval(counter); }, 1000);
    }, t * 1000));
    t += secs;
  }
  timers.push(setTimeout(cycle, t * 1000));
}

function stop(msg = "Ready") {
  running = false;
  timers.forEach(clearTimeout);
  timers = [];
  clearInterval(counter);
  size(1, 0.6);
  $("circle").textContent = msg;
  $("count").textContent = "";
  $("go").textContent = "Start";
}

$("go").addEventListener("click", () => {
  if (running) return stop();
  running = true;
  endAt = Date.now() + Number($("mins").value) * 60000;
  $("go").textContent = "Stop";
  cycle();
});
renderPatterns();
