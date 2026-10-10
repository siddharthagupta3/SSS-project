(() => {
  const STORAGE_KEY = "shopco_cms_v1";
  const CART_KEY = "shopco_cart_v1";

  const DEFAULTS = {
    announcement: "Sign up and get 20% off to your first order. Sign Up Now",
    hero: {
      image: "./assets/img/toposel4.jpg",
      heading: "FIND CLOTHES THAT MATCHES YOUR STYLE",
      subheading:
        "Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.",
      buttonText: "Shop Now",
    },
    stats: [
      { value: "200+", label: "International Brands" },
      { value: "2,000+", label: "High-Quality Products" },
      { value: "30,000+", label: "Happy Customers" },
    ],
    brands: [
      { name: "VERSACE", logo: "./assets/img/brand-versace.svg" },
      { name: "ZARA", logo: "./assets/img/brand-zara.svg" },
      { name: "GUCCI", logo: "./assets/img/brand-gucci.svg" },
      { name: "PRADA", logo: "./assets/img/brand-prada.svg" },
      { name: "Calvin Klein", logo: "./assets/img/brand-calvin-klein.svg" },
    ],
    arrivalsTitle: "NEW ARRIVALS",
    products: [
      {
        id: "drop-1",
        name: "Nuova Summer Drop",
        image: "./assets/img/toposel1.jpg",
        price: 180,
        oldPrice: null,
        rating: "4.7/5",
      },
      {
        id: "drop-2",
        name: "Pastel Street Hoodie",
        image: "./assets/img/toposel3.jpg",
        price: 210,
        oldPrice: 250,
        rating: "4.6/5",
      },
    ],
    viewAllText: "View All",
  };

  const parse = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "");
    } catch {
      return fallback;
    }
  };

  const migrateAssetPath = (path = "") => {
    const map = {
      "./assets/img/hero-model.svg": "./assets/img/toposel1.jpg",
      "./assets/img/hero-sleek-chic.png": "./assets/img/toposel4.jpg",
      "./assets/img/product-tee.svg": "./assets/img/toposel1.jpg",
      "./assets/img/product-nuova-yellow.png": "./assets/img/toposel1.jpg",
      "./assets/img/product-jeans.svg": "./assets/img/toposel3.jpg",
      "./assets/img/product-pastel-pink.png": "./assets/img/toposel3.jpg",
      "./assets/img/toposel2.jpg": "./assets/img/toposel4.jpg",
      "./assets/img/toposel4.jpg": "./assets/img/toposel2.jpg",
    };
    return map[path] || path;
  };

  const normalizeCMS = (stored) => {
    if (!stored || typeof stored !== "object") return structuredClone(DEFAULTS);

    const next = {
      ...structuredClone(DEFAULTS),
      ...stored,
      hero: {
        ...DEFAULTS.hero,
        ...(stored.hero || {}),
      },
    };

    next.hero.image = migrateAssetPath(next.hero.image);
    const sourceProducts = Array.isArray(stored.products) && stored.products.length ? stored.products : DEFAULTS.products;
    next.products = sourceProducts.map((p) => ({
      ...p,
      image: migrateAssetPath(p.image),
    }));

    return next;
  };

  const loadCMS = () => {
    const stored = parse(STORAGE_KEY, null);
    return normalizeCMS(stored);
  };

  const loadCart = () => parse(CART_KEY, []);
  const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

  const cms = loadCMS();

  const announcementText = document.querySelector("[data-announcement-text]");
  if (announcementText) announcementText.textContent = cms.announcement;

  const heroHeading = document.querySelector("[data-hero-heading]");
  const heroSubheading = document.querySelector("[data-hero-subheading]");
  const heroButton = document.querySelector("[data-hero-button]");
  const heroImage = document.querySelector("[data-hero-image]");

  if (heroHeading) heroHeading.textContent = cms.hero.heading;
  if (heroSubheading) heroSubheading.textContent = cms.hero.subheading;
  if (heroButton) heroButton.textContent = cms.hero.buttonText;
  if (heroImage) {
    heroImage.src = cms.hero.image;
    heroImage.onerror = () => {
      heroImage.onerror = null;
      heroImage.src = "./assets/img/hero-model.svg";
    };
  }

  const statsWrap = document.querySelector("[data-stats]");
  if (statsWrap) {
    statsWrap.innerHTML = cms.stats
      .map(
        (item) => `
      <li>
        <strong>${item.value}</strong>
        <span>${item.label}</span>
      </li>
    `
      )
      .join("");
  }

  const brandsWrap = document.querySelector("[data-brands]");
  if (brandsWrap) {
    const brands = Array.isArray(cms.brands) ? cms.brands : [];
    brandsWrap.innerHTML = brands.length
      ? brands
          .map(
            (brand) => `
      <span><img src="${brand.logo}" alt="${brand.name}" loading="lazy" /></span>
    `
          )
          .join("")
      : "<span>No brands available</span>";
  }

  const arrivalsTitle = document.querySelector("[data-arrivals-title]");
  if (arrivalsTitle) arrivalsTitle.textContent = cms.arrivalsTitle;

  const productsWrap = document.querySelector("[data-products]");
  const getVisibleProductCount = () => {
    if (window.innerWidth >= 1200) return 4;
    if (window.innerWidth >= 768) return 3;
    return 2;
  };

  const renderProducts = () => {
    if (!productsWrap) return;
    const products = Array.isArray(cms.products) ? cms.products : [];

    const getImagePosition = (product) => {
      const path = (product.image || "").toLowerCase();
      if (path.includes("pastel")) return "center 22%";
      if (path.includes("nuova") || path.includes("yellow")) return "center 18%";
      return "center top";
    };

    productsWrap.innerHTML = products
      .slice(0, getVisibleProductCount())
      .map((p, index) => {
        const old = p.oldPrice ? `<span class="price-old">$${p.oldPrice}</span><span class="price-off">-20%</span>` : "";
        const fallbackImage = index % 2 === 0 ? "./assets/img/product-tee.svg" : "./assets/img/product-jeans.svg";
        return `
        <article class="product-card" data-product-id="${p.id}">
          <div class="product-card__media">
            <img src="${p.image}" alt="${p.name}" loading="lazy" style="object-position:${getImagePosition(p)}" onerror="this.onerror=null;this.src='${fallbackImage}'" />
          </div>
          <div class="product-card__body">
            <h3>${p.name}</h3>
            <p class="product-card__rating">★★★★☆ <span>${p.rating}</span></p>
            <div class="product-card__foot">
              <p class="price">$${p.price} ${old}</p>
              <div class="product-card__actions">
                <button class="mini-btn mini-btn--light" type="button" data-like-btn>Like</button>
                <button class="mini-btn" type="button" data-add-btn>Add</button>
              </div>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
    if (!products.length) {
      productsWrap.innerHTML = '<div class="empty">No products available. Add from Settings.</div>';
    }
  };

  renderProducts();

  const viewAll = document.querySelector("[data-view-all]");
  if (viewAll) viewAll.textContent = cms.viewAllText;

  const menuBtn = document.querySelector("[data-menu-btn]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuBtn && mobileNav) {
    menuBtn.setAttribute("aria-expanded", "false");

    menuBtn.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      menuBtn.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        menuBtn.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) {
        mobileNav.classList.remove("is-open");
        menuBtn.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
      renderProducts();
    });
  }

  const searchOpen = document.querySelector("[data-search-open]");
  const searchModal = document.querySelector("[data-search-modal]");
  const searchCloseButtons = Array.from(document.querySelectorAll("[data-search-close]"));
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");

  const setSearchOpen = (open) => {
    document.body.classList.toggle("is-search-open", open);
    if (searchModal) searchModal.setAttribute("aria-hidden", open ? "false" : "true");
    if (open && searchInput) searchInput.focus();
  };

  const renderSearch = (q = "") => {
    if (!searchResults) return;
    const products = Array.isArray(cms.products) ? cms.products : [];
    const text = q.trim().toLowerCase();
    const list = text ? products.filter((p) => p.name.toLowerCase().includes(text)) : products;
    if (list.length === 0) {
      searchResults.innerHTML = '<div class="empty">No product found.</div>';
      return;
    }
    searchResults.innerHTML = list
      .map(
        (p) => `
      <button class="search-item" type="button" data-search-add="${p.id}">
        <strong>${p.name}</strong>
        <span>$${p.price}</span>
      </button>
    `
      )
      .join("");
  };

  if (searchOpen) searchOpen.addEventListener("click", () => {
    renderSearch("");
    if (searchInput) searchInput.value = "";
    setSearchOpen(true);
  });
  searchCloseButtons.forEach((btn) => btn.addEventListener("click", () => setSearchOpen(false)));
  if (searchInput) searchInput.addEventListener("input", () => renderSearch(searchInput.value));

  const likeSet = new Set();

  const cartCount = document.querySelector("[data-cart-count]");
  const cartOpen = document.querySelector("[data-cart-open]");
  const cartDrawer = document.querySelector("[data-cart-drawer]");
  const cartCloseButtons = Array.from(document.querySelectorAll("[data-cart-close]"));
  const cartItems = document.querySelector("[data-cart-items]");

  const setCartOpen = (open) => {
    document.body.classList.toggle("is-cart-open", open);
    if (cartDrawer) cartDrawer.setAttribute("aria-hidden", open ? "false" : "true");
  };

  const syncCartCount = () => {
    const count = loadCart().reduce((sum, i) => sum + i.qty, 0);
    if (cartCount) cartCount.textContent = count > 0 ? String(count) : "";
  };

  const upsertCart = (id, delta = 1) => {
    const cart = loadCart();
    const idx = cart.findIndex((item) => item.id === id);
    if (idx === -1) cart.push({ id, qty: Math.max(1, delta) });
    else cart[idx].qty += delta;
    const cleaned = cart.filter((i) => i.qty > 0);
    saveCart(cleaned);
    syncCartCount();
    renderCart();
  };

  const renderCart = () => {
    if (!cartItems) return;
    const cart = loadCart()
      .map((item) => {
        const products = Array.isArray(cms.products) ? cms.products : [];
        const product = products.find((p) => p.id === item.id);
        return product ? { ...product, qty: item.qty } : null;
      })
      .filter(Boolean);

    if (cart.length === 0) {
      cartItems.innerHTML = '<div class="empty">Your cart is empty.</div>';
      return;
    }

    cartItems.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <h4>${item.name}</h4>
        <p>$${item.price} x ${item.qty}</p>
        <div class="cart-row">
          <div class="qty">
            <button type="button" data-cart-change="-1" data-cart-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button type="button" data-cart-change="1" data-cart-id="${item.id}">+</button>
          </div>
          <button class="mini-btn mini-btn--light" type="button" data-cart-remove="${item.id}">Remove</button>
        </div>
      </div>
    `
      )
      .join("");
  };

  if (cartOpen) cartOpen.addEventListener("click", () => {
    renderCart();
    setCartOpen(true);
  });
  cartCloseButtons.forEach((btn) => btn.addEventListener("click", () => setCartOpen(false)));

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const likeBtn = target.closest("[data-like-btn]");
    if (likeBtn) {
      const card = likeBtn.closest("[data-product-id]");
      const id = card ? card.getAttribute("data-product-id") : "";
      if (!id) return;
      if (likeSet.has(id)) {
        likeSet.delete(id);
        likeBtn.classList.remove("is-liked");
        likeBtn.textContent = "Like";
      } else {
        likeSet.add(id);
        likeBtn.classList.add("is-liked");
        likeBtn.textContent = "Liked";
      }
      return;
    }

    const addBtn = target.closest("[data-add-btn]");
    if (addBtn) {
      const card = addBtn.closest("[data-product-id]");
      const id = card ? card.getAttribute("data-product-id") : "";
      if (!id) return;
      upsertCart(id, 1);
      addBtn.classList.add("is-added");
      addBtn.textContent = "Added";
      setTimeout(() => {
        addBtn.classList.remove("is-added");
        addBtn.textContent = "Add";
      }, 700);
      return;
    }

    const searchAdd = target.closest("[data-search-add]");
    if (searchAdd) {
      const id = searchAdd.getAttribute("data-search-add") || "";
      if (!id) return;
      upsertCart(id, 1);
      setSearchOpen(false);
      return;
    }

    const cartChange = target.closest("[data-cart-change]");
    if (cartChange) {
      const id = cartChange.getAttribute("data-cart-id") || "";
      const delta = Number(cartChange.getAttribute("data-cart-change") || "0");
      if (!id || !delta) return;
      upsertCart(id, delta);
      return;
    }

    const cartRemove = target.closest("[data-cart-remove]");
    if (cartRemove) {
      const id = cartRemove.getAttribute("data-cart-remove") || "";
      if (!id) return;
      const cart = loadCart().filter((item) => item.id !== id);
      saveCart(cart);
      syncCartCount();
      renderCart();
      return;
    }
  });

  const mobileLike = document.querySelector("[data-mobile-like]");
  if (mobileLike) {
    mobileLike.addEventListener("click", () => {
      const products = Array.isArray(cms.products) ? cms.products : [];
      const liked = products.filter((p) => likeSet.has(p.id));
      if (!searchResults) return;
      if (liked.length === 0) {
        searchResults.innerHTML = '<div class="empty">No liked items.</div>';
      } else {
        searchResults.innerHTML = liked
          .map((p) => `<div class="search-item"><strong>${p.name}</strong><span>$${p.price}</span></div>`)
          .join("");
      }
      setSearchOpen(true);
      if (mobileNav) {
        mobileNav.classList.remove("is-open");
        if (menuBtn) {
          menuBtn.classList.remove("is-open");
          menuBtn.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setSearchOpen(false);
    setCartOpen(false);
    if (mobileNav) mobileNav.classList.remove("is-open");
    if (menuBtn) {
      menuBtn.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  const reveal = Array.from(document.querySelectorAll("[data-reveal]"));
  const reduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    reveal.forEach((el) => el.classList.add("in-view"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.1 }
    );
    reveal.forEach((el) => io.observe(el));
  }

  syncCartCount();
})();
