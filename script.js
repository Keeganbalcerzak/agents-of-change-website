/* ==========================================================================
   Agents of Change - Interactive Functionality
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all components
  initScrollProgress();
  initNavigation();
  initScrollReveal();
  initStatsCounter();
  initTestimonialsCarousel();
  initFAQAccordion();
  initSmoothScroll();
  initParticles();
  initCursorGlow();
  initButtonRipple();
  initHeroParallax();
});

/* --------------------------------------------------------------------------
   Scroll Progress Bar
   -------------------------------------------------------------------------- */
function initScrollProgress() {
  const progressBar = document.getElementById("scrollProgress");

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + "%";
  });
}

/* --------------------------------------------------------------------------
   Navigation
   -------------------------------------------------------------------------- */
function initNavigation() {
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  // Scroll behavior for navbar
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
    document.body.style.overflow = navMenu.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close menu when clicking a link
  const navLinks = navMenu.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target) && navMenu.classList.contains("active")) {
      navToggle.classList.remove("active");
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

/* --------------------------------------------------------------------------
   Scroll Reveal Animation
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  // Standard scroll-reveal
  const revealElements = document.querySelectorAll(".scroll-reveal");
  // Direction variants
  const directionElements = document.querySelectorAll(
    ".scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale"
  );

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(
          entry.target.parentElement.querySelectorAll(
            ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale"
          )
        );
        const siblingIndex = siblings.indexOf(entry.target);

        setTimeout(() => {
          entry.target.classList.add("revealed");
        }, siblingIndex * 100);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
  directionElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

/* --------------------------------------------------------------------------
   Animated Stats Counter
   -------------------------------------------------------------------------- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll(".stat-number");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  statNumbers.forEach((stat) => {
    statsObserver.observe(stat);
  });
}

function animateCounter(element) {
  const target = parseInt(element.dataset.target);
  const suffix = element.dataset.suffix || "";
  const duration = 2000;
  const frameDuration = 1000 / 60;
  const totalFrames = Math.round(duration / frameDuration);

  let frame = 0;

  const counter = setInterval(() => {
    frame++;
    const progress = easeOutQuart(frame / totalFrames);
    const currentValue = Math.round(target * progress);

    element.textContent = formatNumber(currentValue) + suffix;

    if (frame === totalFrames) {
      clearInterval(counter);
      element.textContent = formatNumber(target) + suffix;
    }
  }, frameDuration);
}

function easeOutQuart(x) {
  return 1 - Math.pow(1 - x, 4);
}

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "k";
  }
  return num.toString();
}

/* --------------------------------------------------------------------------
   Testimonials Carousel
   -------------------------------------------------------------------------- */
function initTestimonialsCarousel() {
  const track = document.getElementById("testimonialsTrack");
  const prevBtn = document.getElementById("prevTestimonial");
  const nextBtn = document.getElementById("nextTestimonial");
  const dotsContainer = document.getElementById("testimonialsDots");

  if (!track) return;

  const cards = track.querySelectorAll(".testimonial-card");
  let currentIndex = 0;
  let autoPlayInterval;

  // Create dots
  cards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");
    dot.setAttribute("aria-label", `Go to testimonial ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll(".dot");

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
    resetAutoPlay();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  }

  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  prevBtn.addEventListener("click", () => {
    prevSlide();
    resetAutoPlay();
  });

  nextBtn.addEventListener("click", () => {
    nextSlide();
    resetAutoPlay();
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );

  track.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true },
  );

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetAutoPlay();
    }
  }

  // Pause on hover
  track.addEventListener("mouseenter", () => clearInterval(autoPlayInterval));
  track.addEventListener("mouseleave", startAutoPlay);

  // Start autoplay
  startAutoPlay();
}

/* --------------------------------------------------------------------------
   FAQ Accordion
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all other items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
        }
      });

      // Toggle current item
      item.classList.toggle("active", !isActive);
    });
  });
}

/* --------------------------------------------------------------------------
   Smooth Scroll
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href === "#") return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();

        const navbarHeight = document.getElementById("navbar").offsetHeight;
        const targetPosition =
          target.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Floating Particles (Hero Background)
   -------------------------------------------------------------------------- */
function initParticles() {
  const container = document.getElementById("heroParticles");
  if (!container) return;

  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // Random positioning
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 4 + 1;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;

    particle.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            animation: float ${duration}s ease-in-out ${delay}s infinite;
        `;

    container.appendChild(particle);
  }

  // Add floating animation
  const style = document.createElement("style");
  style.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translate(0, 0);
                opacity: 0.5;
            }
            25% {
                transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px);
                opacity: 1;
            }
            50% {
                transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px);
                opacity: 0.5;
            }
            75% {
                transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px);
                opacity: 1;
            }
        }
    `;
  document.head.appendChild(style);
}

/* --------------------------------------------------------------------------
   Utility: Throttle function for performance
   -------------------------------------------------------------------------- */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/* --------------------------------------------------------------------------
   Utility: Debounce function for performance
   -------------------------------------------------------------------------- */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/* --------------------------------------------------------------------------
   Cursor Glow Follow
   -------------------------------------------------------------------------- */
function initCursorGlow() {
  const glow = document.getElementById("cursorGlow");
  if (!glow) return;

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth follow with lerp
  function animate() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + "px";
    glow.style.top = glowY + "px";
    requestAnimationFrame(animate);
  }
  animate();

  // Hide glow when mouse leaves window
  document.addEventListener("mouseleave", () => {
    glow.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    glow.style.opacity = "1";
  });
}

/* --------------------------------------------------------------------------
   Button Ripple Effect
   -------------------------------------------------------------------------- */
function initButtonRipple() {
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      ripple.classList.add("ripple");

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";

      btn.appendChild(ripple);

      ripple.addEventListener("animationend", () => {
        ripple.remove();
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Hero Parallax Effect
   -------------------------------------------------------------------------- */
function initHeroParallax() {
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero-content");
  const orbs = document.querySelectorAll(".hero-orb");
  if (!hero || !heroContent) return;

  window.addEventListener("scroll", throttle(() => {
    const scrolled = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrolled < heroHeight) {
      const parallaxAmount = scrolled * 0.3;
      heroContent.style.transform = `translateY(${parallaxAmount}px)`;
      heroContent.style.opacity = 1 - (scrolled / heroHeight) * 0.8;

      orbs.forEach((orb, i) => {
        const speed = 0.1 + (i * 0.05);
        orb.style.transform = `translateY(${scrolled * speed}px)`;
      });
    }
  }, 16));
}
