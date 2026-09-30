(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasObserver = "IntersectionObserver" in window;

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  const navToggle = $(".nav-toggle");
  const nav = $(".nav");

  if (navToggle && nav) {
    const setMenu = (open) => {
      nav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    const isOpen = () => nav.classList.contains("open");

    navToggle.addEventListener("click", () => setMenu(!isOpen()));
    $$("a", nav).forEach((link) => link.addEventListener("click", () => setMenu(false)));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        setMenu(false);
        navToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (isOpen() && !nav.contains(event.target) && !navToggle.contains(event.target)) {
        setMenu(false);
      }
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal, and skill bars that fill when they are actually seen
     ------------------------------------------------------------------ */
  const reveals = $$(".reveal");
  const skillCards = $$(".skill-card");

  if (hasObserver) {
    const once = (className, options) =>
      new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(className);
            observer.unobserve(entry.target);
          }
        });
      }, options);

    const revealObserver = once("visible", { threshold: 0, rootMargin: "0px 0px -10% 0px" });
    const barObserver = once("in", { threshold: 0.35 });

    reveals.forEach((el) => revealObserver.observe(el));
    skillCards.forEach((el) => barObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
    skillCards.forEach((el) => el.classList.add("in"));
  }

  /* ------------------------------------------------------------------
     Active nav link
     ------------------------------------------------------------------ */
  const navLinks = $$(".nav a");
  const sections = $$("main section[id]");

  if (hasObserver && navLinks.length && sections.length) {
    const linkById = new Map(navLinks.map((a) => [a.getAttribute("href").slice(1), a]));

    const setActive = (id) => {
      navLinks.forEach((link) => {
        if (link === linkById.get(id)) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => sectionObserver.observe(section));
    setActive(sections[0].id);
  }

  /* ------------------------------------------------------------------
     Cursor glow: a ring that eases after the pointer.
     The real cursor is never hidden. Mouse and trackpad only.
     ------------------------------------------------------------------ */
  const ring = $(".cursor-ring");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (ring && finePointer && !reduceMotion) {
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let frame = null;

    const tick = () => {
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const settled = Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1;
      frame = settled ? null : requestAnimationFrame(tick);
    };

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch") return;
        targetX = event.clientX;
        targetY = event.clientY;
        if (!ring.classList.contains("on")) {
          x = targetX;
          y = targetY;
          ring.classList.add("on");
        }
        if (!frame) frame = requestAnimationFrame(tick);
      },
      { passive: true }
    );

    document.documentElement.addEventListener("mouseleave", () => ring.classList.remove("on"));

    document.addEventListener("pointerover", (event) => {
      ring.classList.toggle("active", Boolean(event.target.closest("a, button")));
    });
  }

  /* ------------------------------------------------------------------
     Poster viewer
     ------------------------------------------------------------------ */
  const dialog = $(".lightbox");
  const triggers = $$("[data-lightbox]");

  if (dialog && typeof dialog.showModal === "function" && triggers.length) {
    const image = $(".lb-img", dialog);
    const caption = $(".lb-caption", dialog);
    let index = 0;

    const show = (next) => {
      index = (next + triggers.length) % triggers.length;
      const trigger = triggers[index];
      image.src = trigger.dataset.full;
      image.alt = $("img", trigger).alt;
      caption.textContent = `${trigger.dataset.title} (${index + 1} of ${triggers.length})`;

      const upcoming = new Image();
      upcoming.src = triggers[(index + 1) % triggers.length].dataset.full;
    };

    triggers.forEach((trigger, i) => {
      trigger.addEventListener("click", () => {
        show(i);
        dialog.showModal();
        document.documentElement.style.overflow = "hidden";
      });
    });

    $(".lb-close", dialog).addEventListener("click", () => dialog.close());
    $(".lb-prev", dialog).addEventListener("click", () => show(index - 1));
    $(".lb-next", dialog).addEventListener("click", () => show(index + 1));

    // Clicking the dimmed area (the dialog itself) closes the viewer
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "ArrowRight") show(index + 1);
    });

    dialog.addEventListener("close", () => {
      document.documentElement.style.overflow = "";
    });
  }

  /* ------------------------------------------------------------------
     Save CV as PDF (print styles show only the CV)
     ------------------------------------------------------------------ */
  const printButton = $("[data-print]");
  if (printButton) printButton.addEventListener("click", () => window.print());
})();
