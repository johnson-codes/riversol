(() => {
  const countdown = document.getElementById("countdown");
  const toast = document.getElementById("toast");
  const header = document.querySelector("[data-header]");
  const announcement = document.querySelector("[data-announcement]");
  const mobileCta = document.querySelector("[data-mobile-cta]");
  const hero = document.querySelector(".hero");
  const shop = document.getElementById("shop");

  function syncChromeHeight() {
    if (!announcement) return;
    const height = Math.ceil(announcement.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--announce-h", `${height}px`);
  }

  function getSaleEnd() {
    const end = new Date();
    const day = end.getDay();
    const daysUntilSunday = (7 - day) % 7 || 7;
    end.setDate(end.getDate() + daysUntilSunday);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  const saleEnd = getSaleEnd();

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    if (!countdown) return;
    const diff = Math.max(0, saleEnd.getTime() - Date.now());
    const values = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
    };

    Object.entries(values).forEach(([unit, value]) => {
      const el = countdown.querySelector(`[data-unit="${unit}"]`);
      if (el) el.textContent = pad(value);
    });
  }

  tick();
  setInterval(tick, 1000);

  // Header solidifies once the hero is mostly out of view
  function updateHeader() {
    if (!header || !hero) return;
    const heroBottom = hero.getBoundingClientRect().bottom;
    header.classList.toggle("is-solid", heroBottom < window.innerHeight * 0.55);
  }

  // Mobile sticky CTA appears after hero, hides while shop is in view
  function updateMobileCta() {
    if (!mobileCta || !hero || !shop || window.matchMedia("(min-width: 720px)").matches) {
      if (mobileCta) {
        mobileCta.hidden = true;
        mobileCta.classList.remove("is-visible");
      }
      return;
    }

    const heroBottom = hero.getBoundingClientRect().bottom;
    const pastHero = heroBottom < window.innerHeight * 0.35;
    const shopRect = shop.getBoundingClientRect();
    const shopInView = shopRect.top < window.innerHeight * 0.75 && shopRect.bottom > 120;
    const show = pastHero && !shopInView;

    mobileCta.hidden = !show;
    requestAnimationFrame(() => {
      mobileCta.classList.toggle("is-visible", show);
    });
  }

  function onScroll() {
    updateHeader();
    updateMobileCta();
  }

  function onResize() {
    syncChromeHeight();
    onScroll();
  }

  syncChromeHeight();
  updateHeader();
  updateMobileCta();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  // Add-to-bag feedback with named product + button state
  const bagIcon = `<svg class="icon icon--btn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
  const checkIcon = `<svg class="icon icon--btn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

  let toastTimer;
  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name") || "Item";
      const original = btn.innerHTML;

      btn.classList.add("is-added");
      btn.innerHTML = `${checkIcon} Added`;

      if (toast) {
        toast.textContent = `${name} added`;
        toast.hidden = false;
        requestAnimationFrame(() => toast.classList.add("is-visible"));
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toast.classList.remove("is-visible");
          setTimeout(() => {
            toast.hidden = true;
          }, 320);
        }, 2200);
      }

      setTimeout(() => {
        btn.classList.remove("is-added");
        btn.innerHTML = original.includes("icon--btn") ? original : `${bagIcon} Add to bag`;
      }, 1600);
    });
  });

  // Scroll reveals
  const revealNodes = document.querySelectorAll(
    ".offer__copy, .deal-card, .product-card, .why-grid li, .steps li, .proof-marquee, .faq-item, .finale__panel"
  );
  revealNodes.forEach((el) => el.classList.add("reveal"));

  // FAQ: keep one item open at a time
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    revealNodes.forEach((el) => io.observe(el));
  } else {
    revealNodes.forEach((el) => el.classList.add("is-in"));
  }
})();
