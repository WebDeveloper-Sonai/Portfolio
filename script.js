(() => {
  "use strict";

  const frameIds = [
    "00003","00005","00010","00013","00018","00023","00027","00030","00035","00038",
    "00043","00047","00050","00055","00057","00061","00065","00070","00073","00078",
    "00081","00087","00090","00093","00098","00101","00107","00110","00113","00118",
    "00121","00125","00130","00135","00138","00141","00147","00150","00153","00158",
    "00161","00167","00170","00173","00177","00181","00185","00190","00193","00197",
    "00201","00207","00210","00213","00218","00221","00227","00230","00235","00238",
    "00243","00245","00250","00255","00257","00263","00265","00270","00273","00278",
    "00281","00287","00289","00293","00298","00303","00307","00310","00313","00318",
    "00321","00327","00330","00335","00338","00341","00347","00350","00353","00357",
    "00363","00367","00370","00373","00377","00381","00387","00390","00393","00397",
    "00402","00405","00410","00413","00418","00421","00427","00430","00435","00438",
    "00443","00447","00450","00453","00457","00463","00467","00470","00473","00477",
    "00481","00487","00490","00493","00497","00501","00505","00510","00513","00518",
    "00523","00527","00530","00535","00538","00543","00547","00550","00553","00557",
    "00563","00567","00570","00573","00578","00581","00587","00590","00593","00598",
    "00602","00607","00610","00613","00618","00621","00625","00630","00635","00638",
    "00643","00647","00649","00653","00657","00661","00667","00670","00673","00678",
    "00681","00687","00690","00693","00697","00701","00705","00709","00713","00717",
    "00721","00725","00729","00733","00737","00741"
  ];

  const canvas = document.getElementById("sequence");
  const context = canvas.getContext("2d", { alpha: false });
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderProgress = document.getElementById("loader-progress");
  const loaderMessage = document.getElementById("loader-message");
  const chapterElements = Array.from(document.querySelectorAll(".chapter"));
  const imageCache = new Map();
  const inFlight = new Set();
  const failedFrames = new Set();
  const queue = new Map();
  const maxConcurrentLoads = 4;
  const maxCachedImages = 15;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeLoads = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let desiredIndex = 0;
  let drawnIndex = -1;
  let canvasNeedsDraw = true;
  let scrollDirty = true;
  let lastTime = performance.now();
  let activeChapterIndex = -1;
  let toastTimer;

  const detailContent = {
    skills: {
      web: {
        index: "CAPABILITY / 01",
        title: "Web & digital",
        copy: "Web development, HTML, CSS, digital services, and digital marketing are among the areas named in the original portfolio.",
        tags: ["WEB DEVELOPMENT", "HTML / CSS", "DIGITAL MARKETING"]
      },
      analysis: {
        index: "CAPABILITY / 02",
        title: "Data & computing",
        copy: "The original site lists data analysis, Python, Java, C++, C, computer applications, hardware, and networking.",
        tags: ["DATA ANALYSIS", "PYTHON", "COMPUTER APPLICATIONS"]
      },
      creative: {
        index: "CAPABILITY / 03",
        title: "Design & media",
        copy: "Graphic design tools named in the source portfolio include Photoshop and CorelDraw.",
        tags: ["PHOTOSHOP", "CORELDRAW", "BRANDING"]
      },
      people: {
        index: "CAPABILITY / 04",
        title: "People & language",
        copy: "The site mentions communication, office management, team leading, and Bengali, English, and Hindi.",
        tags: ["COMMUNICATION", "TEAM LEADING", "BENGALI / ENGLISH / HINDI"]
      }
    },
    journey: {
      bca: {
        index: "EDUCATION / 2022—2025",
        title: "Bachelor of Computer Applications",
        subtitle: "MAKAUT",
        copy: "The source portfolio lists BCA studies at MAKAUT from 2022 to 2025.",
        image: "assets/images/Makaut.png",
        alt: "MAKAUT logo"
      },
      english: {
        index: "EDUCATION / 2017—2020",
        title: "Art & Culture with English Honours",
        subtitle: "WBSU",
        copy: "The source portfolio describes this period as Art & Culture with English Honours at WBSU.",
        image: "assets/images/hons.jpg",
        alt: "English Honours related image"
      },
      teaching: {
        index: "EDUCATION / 2020—2022",
        title: "Computer Teacher Training",
        subtitle: "NCES",
        copy: "The source lists a Diploma in Computer Teacher Training (2020–2021) and a Post Graduate Diploma in Computer Teacher Training (2021–2022).",
        image: ""
      },
      work: {
        index: "WORK & FOUNDATIONS / 2009—PRESENT",
        title: "Experience beyond the classroom",
        subtitle: "COMMUNITY · BUSINESS · STUDY",
        copy: "The original portfolio also lists work at Dhuturdaha Gram Panchayat (2021–2022), The Shiv Durga Hotel & Restaurants (2010–present), a Diploma in Computer Application (2014–2017), and school education at Dhuturdaha K.P. High School (2009–2016).",
        image: ""
      }
    },
    services: {
      design: {
        index: "SERVICE / 01",
        title: "Web design",
        copy: "Thoughtful web design is one of the services listed in my portfolio. Reach out to share what you have in mind.",
        link: "mailto:dassonai743425@gmail.com?subject=Web%20design%20enquiry",
        linkText: "DISCUSS THIS SERVICE"
      },
      brand: {
        index: "SERVICE / 02",
        title: "Branding",
        copy: "Branding appears in the original service list. Contact me to talk through the brief and what you need.",
        link: "mailto:dassonai743425@gmail.com?subject=Branding%20enquiry",
        linkText: "DISCUSS THIS SERVICE"
      },
      development: {
        index: "SERVICE / 03",
        title: "Web development",
        copy: "Web development is listed among my services. Share your project details by email to start a conversation.",
        link: "mailto:dassonai743425@gmail.com?subject=Web%20development%20enquiry",
        linkText: "DISCUSS THIS SERVICE"
      },
      digital: {
        index: "SERVICE / 04",
        title: "Digital services",
        copy: "Digital services are part of the work named in the portfolio, including work associated with Das Digital Service.",
        link: "mailto:dassonai743425@gmail.com?subject=Digital%20services%20enquiry",
        linkText: "DISCUSS THIS SERVICE"
      },
      food: {
        index: "SERVICE / 05",
        title: "Food services",
        copy: "The source portfolio lists food services and The Shiv Durga Hotel & Restaurants. Contact me for current details.",
        link: "mailto:dassonai743425@gmail.com?subject=Food%20services%20enquiry",
        linkText: "ASK FOR DETAILS"
      },
      teaching: {
        index: "SERVICE / 06",
        title: "Teaching",
        copy: "Teaching is listed among my services. The original portfolio links to a teaching enquiry form.",
        link: "https://docs.google.com/forms/d/e/1FAIpQLSc0I3u7xMBek5j4SA3Gnhy2ry993k-6u9WDnA7Cm2hyOmVDMg/viewform?usp=sf_link",
        linkText: "OPEN TEACHING ENQUIRY FORM",
        external: true
      }
    },
    work: {
      panchayat: {
        index: "WORK / 01",
        title: "Dhuturdaha Gram Panchayat",
        copy: "The source portfolio describes work at the Gram Panchayat and service across different fields.",
        image: "assets/images/DGP.jpg",
        alt: "Dhuturdaha Gram Panchayat related image",
        link: "https://drive.google.com/file/d/1eKDLHTRqJxE_3CSvVXYCAuOJXQXkm3kT/view?usp=drivesdk",
        linkText: "VIEW SOURCE LINK",
        external: true
      },
      digital: {
        index: "WORK / 02",
        title: "Das Digital Service",
        copy: "A digital service/business referenced in the original portfolio, with supplied identity graphics.",
        image: "assets/images/Das_digital.png",
        alt: "Das Digital Service graphic"
      },
      academy: {
        index: "WORK / 03",
        title: "Jatiya Yuva Computer",
        copy: "Computer education organization featured in the original portfolio. Its website is available for more information.",
        image: "assets/images/jycsm_card.png",
        alt: "Jatiya Yuva Computer graphic",
        link: "https://www.jycsm.com/",
        linkText: "VISIT JATIYA YUVA COMPUTER",
        external: true
      },
      school: {
        index: "WORK / 04",
        title: "School community",
        copy: "The original portfolio reflects on school life at Dhuturdaha K.P. High School and the teachers who helped shape that experience.",
        image: "assets/images/kkjhs_project.jpg",
        alt: "School-related project image"
      }
    },
    business: {
      hotel: {
        index: "BUSINESS / 01",
        title: "The Shiv Durga Hotel & Restaurants",
        copy: "The portfolio describes this as an own business, running since 2010, and a place to learn about hospitality, cooking, and customer communication.",
        image: "assets/images/wallview.jpg",
        alt: "The Shiv Durga Hotel and Restaurant"
      },
      das: {
        index: "BUSINESS / 02",
        title: "Das Digital Service",
        copy: "A digital service business featured in the source portfolio, with original business artwork included in the archive.",
        image: "assets/images/wallpaper.jpg",
        alt: "Das Digital Service wallpaper",
        link: "https://www.facebook.com/dassonai743425",
        linkText: "VISIT FACEBOOK PROFILE",
        external: true
      },
      jycsm: {
        index: "BUSINESS / 03",
        title: "Jatiya Yuva Computer",
        copy: "A computer education organization shown in the source portfolio. Visit its existing website for current information.",
        image: "assets/images/jycsm_banner.jpg",
        alt: "Jatiya Yuva Computer banner",
        link: "https://www.jycsm.com/",
        linkText: "VISIT WEBSITE",
        external: true
      }
    },
    creative: {
      motivation: {
        index: "CREATIVE / 01",
        title: "Stay Self-Motivated",
        date: "20 JULY 2023",
        copy: "A video entry published on the original portfolio.",
        image: "assets/images/Video_icon.jpg",
        alt: "Video thumbnail from the original portfolio",
        video: "assets/images/my_video.mp4"
      },
      macbeth: {
        index: "CREATIVE / 03",
        title: "Macbeth with classmates",
        date: "2018",
        copy: "A YouTube video entry from 2018, linked from the original portfolio.",
        image: "assets/images/award.png",
        alt: "Award graphic shown on the original portfolio",
        link: "https://youtu.be/NLttoP2kwvI",
        linkText: "WATCH ON YOUTUBE",
        external: true
      }
    }
  };

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width * dpr));
    const height = Math.max(1, Math.round(bounds.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvasNeedsDraw = true;
    }
  }

  function getCurrentScrollProgress() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return Math.max(0, Math.min(1, window.scrollY / maxScroll));
  }

  function keepOnlyNearbyQueuedFrames(center) {
    for (const index of queue.keys()) {
      if (Math.abs(index - center) > 12) queue.delete(index);
    }
  }

  function scheduleFrames(center) {
    keepOnlyNearbyQueuedFrames(center);
    const candidates = [center];
    for (let distance = 1; distance <= 8; distance += 1) {
      candidates.push(center - distance, center + distance);
    }
    for (const index of candidates) {
      if (index < 0 || index >= frameIds.length) continue;
      if (!imageCache.has(index) && !inFlight.has(index) && !failedFrames.has(index)) {
        queue.set(index, Math.abs(index - center));
      }
    }
    pumpQueue();
  }

  function pumpQueue() {
    while (activeLoads < maxConcurrentLoads && queue.size > 0) {
      const next = Array.from(queue.entries()).sort((a, b) => a[1] - b[1])[0][0];
      queue.delete(next);
      loadFrame(next);
    }
  }

  function loadFrame(index) {
    activeLoads += 1;
    inFlight.add(index);
    const image = new Image();
    image.decoding = "async";
    image.src = `video2img/img_${frameIds[index]}.jpg`;

    const finish = async (loaded) => {
      if (loaded && typeof image.decode === "function") {
        try {
          await image.decode();
        } catch {
          // A loaded image remains drawable when optional decoding is unavailable.
        }
      }
      if (loaded) {
        imageCache.set(index, image);
        canvasNeedsDraw = true;
        trimImageCache();
      } else {
        failedFrames.add(index);
      }
      inFlight.delete(index);
      activeLoads -= 1;
      if (imageCache.size > 0) {
        loaderBar.style.width = "100%";
        loaderProgress.textContent = "100%";
        loaderMessage.textContent = "Sequence preview ready";
        window.setTimeout(() => loader.classList.add("is-hidden"), 220);
      } else if (failedFrames.size >= Math.min(6, frameIds.length) && activeLoads === 0) {
        loaderMessage.textContent = "Sequence unavailable — portfolio content remains accessible";
        loaderProgress.textContent = "—";
        window.setTimeout(() => loader.classList.add("is-hidden"), 1800);
      }
      scheduleFrames(desiredIndex);
      pumpQueue();
    };

    image.onload = () => finish(true);
    image.onerror = () => finish(false);
  }

  function trimImageCache() {
    const keepDistance = 9;
    for (const index of imageCache.keys()) {
      if (imageCache.size <= maxCachedImages) break;
      if (Math.abs(index - desiredIndex) > keepDistance) imageCache.delete(index);
    }
    while (imageCache.size > maxCachedImages) {
      const farthest = Array.from(imageCache.keys()).sort((a, b) =>
        Math.abs(b - desiredIndex) - Math.abs(a - desiredIndex)
      )[0];
      imageCache.delete(farthest);
    }
  }

  function nearestReadyIndex(index) {
    if (imageCache.has(index)) return index;
    for (let distance = 1; distance < frameIds.length; distance += 1) {
      const previous = index - distance;
      const next = index + distance;
      if (previous >= 0 && imageCache.has(previous)) return previous;
      if (next < frameIds.length && imageCache.has(next)) return next;
    }
    return -1;
  }

  function drawFrame(index) {
    const image = imageCache.get(index);
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;
    context.fillStyle = "#0a090b";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, x, y, width, height);
  }

  function updateActiveChapter() {
    const midpoint = window.innerHeight * 0.48;
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    chapterElements.forEach((chapter, index) => {
      const rect = chapter.getBoundingClientRect();
      const distance = Math.abs((rect.top + Math.min(rect.height, window.innerHeight) / 2) - midpoint);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    if (nearestIndex === activeChapterIndex) return;
    activeChapterIndex = nearestIndex;
    chapterElements.forEach((chapter, index) => chapter.classList.toggle("is-active", index === nearestIndex));
    const chapter = chapterElements[nearestIndex];
    const current = document.getElementById("current-chapter");
    const title = document.getElementById("chapter-name");
    current.textContent = String(nearestIndex + 1).padStart(2, "0");
    title.textContent = chapter.dataset.title.toUpperCase();
    document.querySelectorAll(".chapter-menu > a").forEach((link) => {
      link.classList.toggle("is-current", link.getAttribute("href") === `#${chapter.id}`);
    });
    document.getElementById("drawer-title").textContent =
      `${String(nearestIndex + 1).padStart(2, "0")} / ${chapter.dataset.title.toUpperCase()}`;
    return chapter;
  }

  function updateDetails(group, value, root) {
    const data = detailContent[group] && detailContent[group][value];
    if (!data) return;
    const scope = root || document;
    const detail = scope.querySelector(`[data-detail-group="${group}"]`);
    if (!detail) return;
    const index = detail.querySelector(".detail-index");
    const title = detail.querySelector("[data-detail-title]");
    const copy = detail.querySelector("[data-detail-copy]");
    if (index) index.textContent = data.index;
    if (title) title.textContent = data.title;
    if (copy) copy.textContent = data.copy;

    const subtitle = detail.querySelector(".detail-subtitle");
    if (data.subtitle) {
      const element = subtitle || document.createElement("p");
      element.className = "detail-subtitle";
      element.textContent = data.subtitle;
      if (!subtitle && title) title.after(element);
    } else if (subtitle) {
      subtitle.remove();
    }

    let date = detail.querySelector(".detail-date");
    if (data.date) {
      if (!date) {
        date = document.createElement("p");
        date.className = "detail-date";
        title.after(date);
      }
      date.textContent = data.date;
    } else if (date) {
      date.remove();
    }

    let image = detail.querySelector(".detail-image");
    if (data.image) {
      if (!image) {
        image = document.createElement("img");
        image.className = group === "work" || group === "business" || group === "creative"
          ? "detail-image work-image"
          : "detail-image";
        image.loading = "lazy";
        if (index) index.after(image);
      }
      image.src = data.image;
      image.alt = data.alt || "";
      image.hidden = false;
      if (title && (group === "work" || group === "business" || group === "creative")) {
        title.before(image);
      }
    } else if (image) {
      image.remove();
    }

    let tags = detail.querySelector("[data-detail-tags]");
    if (data.tags) {
      if (!tags) {
        tags = document.createElement("div");
        tags.className = "tag-list";
        tags.dataset.detailTags = "";
        if (copy) copy.after(tags);
      }
      tags.replaceChildren(...data.tags.map((tag) => {
        const element = document.createElement("span");
        element.textContent = tag;
        return element;
      }));
    } else if (tags) {
      tags.remove();
    }

    let link = detail.querySelector("[data-detail-link]");
    let videoButton = detail.querySelector("[data-video]");
    if (data.link) {
      if (!link) {
        link = document.createElement("a");
        link.className = "text-link";
        link.dataset.detailLink = "";
        if (copy) copy.after(link);
      }
      link.href = data.link;
      link.textContent = `${data.linkText || "OPEN LINK"} `;
      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      link.append(arrow);
      if (data.external) {
        link.target = "_blank";
        link.rel = "noopener";
      } else {
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
      link.hidden = false;
    } else if (link) {
      link.hidden = true;
      link.removeAttribute("href");
    }

    if (data.video) {
      if (!videoButton) {
        videoButton = document.createElement("button");
        videoButton.type = "button";
        videoButton.className = "text-link video-trigger";
        videoButton.innerHTML = 'PLAY VIDEO <span aria-hidden="true">▶</span>';
        if (copy) copy.after(videoButton);
      }
      videoButton.dataset.video = data.video;
      videoButton.hidden = false;
    } else if (videoButton) {
      videoButton.hidden = true;
      delete videoButton.dataset.video;
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function closeMenu() {
    const menu = document.getElementById("chapter-menu");
    const toggle = document.querySelector(".menu-toggle");
    menu.classList.remove("is-open");
    menu.inert = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  }

  document.querySelectorAll(".selector").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-selected")));
  });

  function onAnimationFrame(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    if (scrollDirty) {
      scrollDirty = false;
      targetProgress = getCurrentScrollProgress();
      const progressIndicator = document.getElementById("experience-progress");
      progressIndicator.style.width = `${(targetProgress * 100).toFixed(2)}%`;
      updateActiveChapter();
      const nextIndex = Math.round(targetProgress * (frameIds.length - 1));
      if (nextIndex !== desiredIndex) {
        desiredIndex = nextIndex;
        scheduleFrames(desiredIndex);
        trimImageCache();
      }
    }

    const easing = reducedMotion ? 1 : 1 - Math.exp(-11 * dt);
    currentProgress += (targetProgress - currentProgress) * easing;
    if (Math.abs(targetProgress - currentProgress) < 0.00005) currentProgress = targetProgress;
    const frameIndex = Math.round(currentProgress * (frameIds.length - 1));
    const availableIndex = nearestReadyIndex(frameIndex);
    if (availableIndex !== -1 && (canvasNeedsDraw || availableIndex !== drawnIndex)) {
      drawFrame(availableIndex);
      drawnIndex = availableIndex;
      canvasNeedsDraw = false;
    }
    requestAnimationFrame(onAnimationFrame);
  }

  document.addEventListener("click", (event) => {
    const selector = event.target.closest("[data-group][data-value]");
    if (selector) {
      const { group, value } = selector.dataset;
      const root = selector.closest(".chapter-layout") || selector.closest(".drawer-content");
      root.querySelectorAll(`[data-group="${group}"]`).forEach((button) => {
        button.classList.toggle("is-selected", button === selector);
        button.setAttribute("aria-pressed", button === selector ? "true" : "false");
      });
      updateDetails(group, value, root);
      return;
    }

    const videoButton = event.target.closest("[data-video]");
    if (videoButton) {
      const mediaDialog = document.getElementById("media-dialog");
      const video = mediaDialog.querySelector("video");
      video.src = videoButton.dataset.video;
      mediaDialog.showModal();
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => showToast("Press play in the video controls to start"));
      }
      return;
    }

    const copyButton = event.target.closest("[data-copy]");
    if (copyButton) {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        showToast("Copy unavailable — select the email address instead");
        return;
      }
      navigator.clipboard.writeText(copyButton.dataset.copy)
        .then(() => showToast("Email address copied"))
        .catch(() => showToast("Copy unavailable — select the email address instead"));
    }
  });

  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("chapter-menu");
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    menu.inert = !open;
    if (open) menu.querySelector("a").focus();
  });
  document.querySelector(".menu-close").addEventListener("click", closeMenu);
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  const drawer = document.getElementById("detail-drawer");
  const drawerContent = drawer.querySelector(".drawer-content");
  document.querySelector(".mobile-details-button").addEventListener("click", () => {
    const chapter = chapterElements[activeChapterIndex] || chapterElements[0];
    drawerContent.replaceChildren(chapter.querySelector(".chapter-layout").cloneNode(true));
    drawer.showModal();
  });
  document.querySelector(".drawer-close").addEventListener("click", () => drawer.close());
  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) drawer.close();
  });

  const mediaDialog = document.getElementById("media-dialog");
  const mediaVideo = mediaDialog.querySelector("video");
  document.querySelector(".media-close").addEventListener("click", () => mediaDialog.close());
  mediaDialog.addEventListener("close", () => {
    mediaVideo.pause();
    mediaVideo.removeAttribute("src");
    mediaVideo.load();
  });
  mediaDialog.addEventListener("click", (event) => {
    if (event.target === mediaDialog) mediaDialog.close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
  });
  window.addEventListener("scroll", () => { scrollDirty = true; }, { passive: true });
  window.addEventListener("resize", () => {
    resizeCanvas();
    scrollDirty = true;
  }, { passive: true });
  window.addEventListener("load", resizeCanvas, { once: true });

  resizeCanvas();
  scheduleFrames(0);
  requestAnimationFrame(onAnimationFrame);
})();
