import { SpringOptions, animate, spring } from "motion";

const SPRING_OPTIONS: SpringOptions = {
  mass: 1,
  stiffness: 120,
  damping: 19,
};

const getEl = (selector: string) =>
  document.querySelector(selector) as HTMLElement;

const els = {
  main: getEl("main"),
  toggleButton: getEl(".toggle") as HTMLButtonElement,
  closed: {
    wrapper: getEl(".closed-wrapper"),
    art: getEl(".closed-wrapper .record"),
    name: getEl(".closed-wrapper .album-name"),
    artist: getEl(".closed-wrapper .artist-name"),
    vinyl: getEl(".closed-wrapper .record-vinyl"),
  },
  open: {
    wrapper: getEl(".open-wrapper"),
    art: getEl(".open-wrapper .record"),
    name: getEl(".open-wrapper .album-name"),
    artist: getEl(".open-wrapper .artist-name"),
    vinyl: getEl(".open-wrapper .record-vinyl"),
    trackList: getEl(".open-wrapper .track-list"),
  },
};

//
// open
//
els.closed.wrapper.addEventListener("click", () => {
  const fromPos = {
    wrapper: els.closed.wrapper.getBoundingClientRect(),
    art: els.closed.art.getBoundingClientRect(),
    name: els.closed.name.getBoundingClientRect(),
    artist: els.closed.artist.getBoundingClientRect(),
  };
  els.main.classList.remove("closed");
  els.main.classList.add("open");
  els.open.trackList.style.opacity = "0";

  requestAnimationFrame(() => {
    const toPos = {
      wrapper: els.open.wrapper.getBoundingClientRect(),
      art: els.open.art.getBoundingClientRect(),
      name: els.open.name.getBoundingClientRect(),
      artist: els.open.artist.getBoundingClientRect(),
    };
    const deltas = {
      art: {
        x: fromPos.art.left - toPos.art.left,
        y: fromPos.art.top - toPos.art.top,
        scale: fromPos.art.width / toPos.art.width,
      },
      name: {
        x: fromPos.name.left - toPos.name.left,
        y: fromPos.name.top - toPos.name.top,
        scale: fromPos.name.width / toPos.name.width,
      },
      artist: {
        x: fromPos.artist.left - toPos.artist.left,
        y: fromPos.artist.top - toPos.artist.top,
        scale: fromPos.artist.width / toPos.artist.width,
      },
    };
    animate(
      els.open.art,
      {
        x: [deltas.art.x, 0],
        y: [deltas.art.y, 0],
        scale: [deltas.art.scale, 1],
        filter: [
          "drop-shadow(0px 0px 0px rgba(0,0,0,0))",
          "drop-shadow(0px 80px 40px rgba(0,0,0,0.2))",
        ],
      },
      { easing: spring(SPRING_OPTIONS) }
    );
    animate(
      els.open.name,
      {
        x: [deltas.name.x, 0],
        y: [deltas.name.y, 0],
        scale: [deltas.name.scale, 1],
      },
      { easing: spring(SPRING_OPTIONS) }
    );
    animate(
      els.open.artist,
      {
        x: [deltas.artist.x, 0],
        y: [deltas.artist.y, 0],
        scale: [deltas.artist.scale, 1],
      },
      { easing: spring(SPRING_OPTIONS) }
    );
    animate(
      els.open.vinyl,
      {
        x: [0, 100],
        rotate: [0, 180],
      },
      { delay: 0.3, easing: spring(SPRING_OPTIONS) }
    );
    animate(
      els.open.trackList,
      {
        opacity: [0, 1],
        y: [50, 0],
      },
      { delay: 0.2, easing: spring(SPRING_OPTIONS) }
    );
  });
});

//
// close
//
els.open.wrapper.addEventListener("click", async () => {
  const fromPos = {
    wrapper: els.open.wrapper.getBoundingClientRect(),
    art: els.open.art.getBoundingClientRect(),
    name: els.open.name.getBoundingClientRect(),
    artist: els.open.artist.getBoundingClientRect(),
  };

  await animate(
    els.open.trackList,
    {
      opacity: [1, 0],
    },
    { easing: "linear", duration: 0.1 }
  ).finished;

  els.main.classList.remove("open");
  els.main.classList.add("closed");

  requestAnimationFrame(() => {
    const toPos = {
      wrapper: els.closed.wrapper.getBoundingClientRect(),
      art: els.closed.art.getBoundingClientRect(),
      name: els.closed.name.getBoundingClientRect(),
      artist: els.closed.artist.getBoundingClientRect(),
    };
    const deltas = {
      art: {
        x: fromPos.art.left - toPos.art.left,
        y: fromPos.art.top - toPos.art.top,
        scale: fromPos.art.width / toPos.art.width,
      },
      name: {
        x: fromPos.name.left - toPos.name.left,
        y: fromPos.name.top - toPos.name.top,
        scale: fromPos.name.width / toPos.name.width,
      },
      artist: {
        x: fromPos.artist.left - toPos.artist.left,
        y: fromPos.artist.top - toPos.artist.top,
        scale: fromPos.artist.width / toPos.artist.width,
      },
    };
    animate(
      els.closed.art,
      {
        x: [deltas.art.x, 0],
        y: [deltas.art.y, 0],
        scale: [deltas.art.scale, 1],
      },
      {
        easing: spring(SPRING_OPTIONS),
      }
    );
    animate(
      els.closed.name,
      {
        x: [deltas.name.x, 0],
        y: [deltas.name.y, 0],
        scale: [deltas.name.scale, 1],
      },
      {
        easing: spring(SPRING_OPTIONS),
      }
    );
    animate(
      els.closed.artist,
      {
        x: [deltas.artist.x, 0],
        y: [deltas.artist.y, 0],
        scale: [deltas.artist.scale, 1],
      },
      {
        easing: spring(SPRING_OPTIONS),
      }
    );
    animate(
      els.closed.vinyl,
      {
        x: [50, 0],
        rotate: [0, 360],
      },
      {}
    );
  });
});
