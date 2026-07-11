(() => {
  // ---------- helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- dynamic background focus ----------
  const onPointerMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty("--mx", `${x}%`);
    document.documentElement.style.setProperty("--my", `${y}%`);
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  // ---------- year ----------
  const y = new Date().getFullYear();
  $$("[data-year]").forEach((el) => (el.textContent = String(y)));

  // ---------- mobile nav ----------
  const toggle = $("[data-nav-toggle]");
  const links = $("[data-nav-links]");
  if (toggle && links) {
    const closeMenu = () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const open = !links.classList.contains("is-open");
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    links.addEventListener("click", (e) => {
      if (e.target && e.target.matches("a")) closeMenu();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) closeMenu();
    });
  }

  // ---------- toast ----------
  const toast = $("[data-toast]");
  const toastText = $("[data-toast-text]");
  let toastTimer = null;

  const showToast = (msg = "Скопировано") => {
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.hidden = false;
    toast.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.opacity = "0";
      toastTimer = setTimeout(() => (toast.hidden = true), 200);
    }, 1800);
  };

  // ---------- copy ----------
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Скопировано ✅");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("Скопировано ✅");
    }
  };

  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-copy") || "";
      if (!value) return;
      copyText(value);
    });
  });

  $$("[data-copy-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sel = btn.getAttribute("data-copy-target");
      if (!sel) return;
      const el = $(sel);
      if (!el) return;
      copyText(el.value || el.textContent || "");
    });
  });

  // ---------- reveal on scroll ----------
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- certificates lightbox ----------
  const certLinks = $$(".cert__img");
  if (certLinks.length) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Закрыть">✕</button><img class="lightbox__img" alt="" />';
    document.body.appendChild(box);

    const boxImg = $(".lightbox__img", box);
    const closeBox = () => {
      box.hidden = true;
      document.body.style.overflow = "";
    };

    certLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const thumb = $("img", link);
        boxImg.src = link.getAttribute("href");
        boxImg.alt = thumb ? thumb.alt : "";
        box.hidden = false;
        document.body.style.overflow = "hidden";
      });
    });

    box.addEventListener("click", (e) => {
      if (e.target !== boxImg) closeBox();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !box.hidden) closeBox();
    });
  }

  // ---------- result galleries (cases) ----------
  const galleryBtns = $$("[data-gallery]");
  if (galleryBtns.length) {
    const gbox = document.createElement("div");
    gbox.className = "lightbox lightbox--gallery";
    gbox.hidden = true;
    gbox.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Закрыть">✕</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Назад">‹</button>' +
      '<img class="lightbox__img" alt="Результат" />' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Вперёд">›</button>' +
      '<div class="lightbox__count" aria-hidden="true"></div>';
    document.body.appendChild(gbox);

    const gImg = $(".lightbox__img", gbox);
    const gPrev = $(".lightbox__nav--prev", gbox);
    const gNext = $(".lightbox__nav--next", gbox);
    const gCount = $(".lightbox__count", gbox);
    let imgs = [];
    let idx = 0;

    const render = () => {
      gImg.src = imgs[idx];
      const multi = imgs.length > 1;
      gPrev.hidden = !multi;
      gNext.hidden = !multi;
      gCount.hidden = !multi;
      gCount.textContent = idx + 1 + " / " + imgs.length;
    };
    const openGallery = (list) => {
      imgs = list;
      idx = 0;
      render();
      gbox.hidden = false;
      document.body.style.overflow = "hidden";
    };
    const closeGallery = () => {
      gbox.hidden = true;
      document.body.style.overflow = "";
    };
    const step = (d) => {
      idx = (idx + d + imgs.length) % imgs.length;
      render();
    };

    galleryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const list = (btn.getAttribute("data-gallery") || "")
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);
        if (list.length) openGallery(list);
      });
    });

    gPrev.addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
    gNext.addEventListener("click", (e) => { e.stopPropagation(); step(1); });
    gbox.addEventListener("click", (e) => {
      if (e.target !== gImg && !e.target.closest(".lightbox__nav")) closeGallery();
    });
    window.addEventListener("keydown", (e) => {
      if (gbox.hidden) return;
      if (e.key === "Escape") closeGallery();
      else if (e.key === "ArrowLeft" && imgs.length > 1) step(-1);
      else if (e.key === "ArrowRight" && imgs.length > 1) step(1);
    });
  }

  // ---------- brief builder ----------
  const form = $("[data-brief-form]");
  const buildBtn = $("[data-brief-build]");
  const mailto = $("[data-mailto]");
  const result = $("#result");

  const buildMessage = () => {
    if (!form) return "";
    const data = new FormData(form);

    const type = data.get("type") || "";
    const goal = data.get("goal") || "";
    const deadline = data.get("deadline") || "";
    const budget = data.get("budget") || "";
    const links = data.get("links") || "";
    const comment = data.get("comment") || "";

    const lines = [
      "Привет! Хочу обсудить задачу 👇",
      "",
      `Тип: ${type}`,
      goal ? `Цель: ${goal}` : null,
      deadline ? `Срок: ${deadline}` : null,
      budget ? `Бюджет: ${budget}` : null,
      links ? `Ссылки/референсы: ${links}` : null,
      comment ? `Комментарий: ${comment}` : null,
      "",
      "Формат связи: Telegram / Email",
    ].filter(Boolean);

    return lines.join("\n");
  };

  const updateMailto = (body) => {
    if (!mailto) return;
    const email = "mamont861@yandex.ru";
    const subject = encodeURIComponent("Запрос на разработку / правки");
    const mailBody = encodeURIComponent(body);
    mailto.href = `mailto:${email}?subject=${subject}&body=${mailBody}`;
  };

  if (buildBtn && result) {
    buildBtn.addEventListener("click", () => {
      const msg = buildMessage();
      result.value = msg;
      updateMailto(msg);
      copyText(msg);
    });
  }

  if (form && result) {
    form.addEventListener("reset", () => {
      setTimeout(() => {
        result.value = "";
        updateMailto("");
      }, 0);
    });
  }
})();
