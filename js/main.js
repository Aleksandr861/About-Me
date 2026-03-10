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
