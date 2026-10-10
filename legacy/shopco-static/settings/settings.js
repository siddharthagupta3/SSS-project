(() => {
  const STORAGE_KEY = "shopco_cms_v1";

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

  const parse = (value, fallback) => {
    try {
      return JSON.parse(value || "");
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
    const stored = parse(localStorage.getItem(STORAGE_KEY), null);
    return normalizeCMS(stored);
  };

  const saveCMS = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  const form = document.querySelector("[data-settings-form]");
  const status = document.querySelector("[data-status]");
  const announcementInput = document.querySelector("[data-announcement-input]");
  const heroImageInput = document.querySelector("[data-hero-image-input]");
  const heroHeadingInput = document.querySelector("[data-hero-heading-input]");
  const heroSubheadingInput = document.querySelector("[data-hero-subheading-input]");
  const heroButtonInput = document.querySelector("[data-hero-button-input]");
  const brandsEditor = document.querySelector("[data-brands-editor]");
  const productsEditor = document.querySelector("[data-products-editor]");
  const addBrandBtn = document.querySelector("[data-add-brand]");
  const addProductBtn = document.querySelector("[data-add-product]");
  const resetBtn = document.querySelector("[data-reset-defaults]");

  const model = loadCMS();

  const showStatus = (text, danger = false) => {
    if (!status) return;
    status.textContent = text;
    status.style.color = danger ? "#9e2d2d" : "#2f6d3d";
  };

  const renderBrands = () => {
    if (!brandsEditor) return;
    brandsEditor.className = "editor-list";
    if (model.brands.length === 0) {
      brandsEditor.innerHTML = '<p class="status">No brands. Use "Add Brand".</p>';
      return;
    }
    brandsEditor.innerHTML = model.brands
      .map(
        (brand, index) => `
      <div class="editor-item" data-brand-row="${index}">
        <div class="editor-item__head">
          <strong>Brand ${index + 1}</strong>
          <button type="button" class="remove-btn" data-remove-brand="${index}">Remove</button>
        </div>
        <div class="grid-2">
          <label>Name<input type="text" data-brand-name="${index}" value="${brand.name.replace(/"/g, "&quot;")}" required /></label>
          <label>Logo path<input type="text" data-brand-logo="${index}" value="${brand.logo.replace(/"/g, "&quot;")}" required /></label>
        </div>
      </div>
    `
      )
      .join("");
  };

  const renderProducts = () => {
    if (!productsEditor) return;
    productsEditor.className = "editor-list";
    if (model.products.length === 0) {
      productsEditor.innerHTML = '<p class="status">No products. Use "Add Product".</p>';
      return;
    }
    productsEditor.innerHTML = model.products
      .map(
        (product, index) => `
      <div class="editor-item" data-product-row="${index}">
        <div class="editor-item__head">
          <strong>Product ${index + 1}</strong>
          <button type="button" class="remove-btn" data-remove-product="${index}">Remove</button>
        </div>
        <label>Name<input type="text" data-product-name="${index}" value="${product.name.replace(/"/g, "&quot;")}" required /></label>
        <div class="grid-2">
          <label>Image path<input type="text" data-product-image="${index}" value="${product.image.replace(/"/g, "&quot;")}" required /></label>
          <label>Price<input type="number" min="0" step="1" data-product-price="${index}" value="${product.price}" required /></label>
        </div>
      </div>
    `
      )
      .join("");
  };

  const renderForm = () => {
    if (announcementInput) announcementInput.value = model.announcement;
    if (heroImageInput) heroImageInput.value = model.hero.image;
    if (heroHeadingInput) heroHeadingInput.value = model.hero.heading;
    if (heroSubheadingInput) heroSubheadingInput.value = model.hero.subheading;
    if (heroButtonInput) heroButtonInput.value = model.hero.buttonText;
    renderBrands();
    renderProducts();
  };

  const collectRows = () => {
    const brands = Array.from(document.querySelectorAll("[data-brand-row]"))
      .map((row) => {
        const i = Number(row.getAttribute("data-brand-row"));
        const name = row.querySelector(`[data-brand-name="${i}"]`)?.value.trim() || "";
        const logo = row.querySelector(`[data-brand-logo="${i}"]`)?.value.trim() || "";
        if (!name || !logo) return null;
        return { name, logo };
      })
      .filter(Boolean);

    const products = Array.from(document.querySelectorAll("[data-product-row]"))
      .map((row) => {
        const i = Number(row.getAttribute("data-product-row"));
        const name = row.querySelector(`[data-product-name="${i}"]`)?.value.trim() || "";
        const image = row.querySelector(`[data-product-image="${i}"]`)?.value.trim() || "";
        const priceText = row.querySelector(`[data-product-price="${i}"]`)?.value || "0";
        const price = Math.max(0, Number(priceText));
        if (!name || !image) return null;
        return {
          id: `p-${Date.now()}-${i}`,
          name,
          image,
          price,
          oldPrice: null,
          rating: "4.0/5",
        };
      })
      .filter(Boolean);

    return { brands, products };
  };

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const removeBrand = target.closest("[data-remove-brand]");
    if (removeBrand) {
      const index = Number(removeBrand.getAttribute("data-remove-brand"));
      model.brands.splice(index, 1);
      renderBrands();
      return;
    }

    const removeProduct = target.closest("[data-remove-product]");
    if (removeProduct) {
      const index = Number(removeProduct.getAttribute("data-remove-product"));
      model.products.splice(index, 1);
      renderProducts();
      return;
    }
  });

  if (addBrandBtn) {
    addBrandBtn.addEventListener("click", () => {
      model.brands.push({ name: "NEW BRAND", logo: "./assets/img/brand-zara.svg" });
      renderBrands();
    });
  }

  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      model.products.push({
        id: `p-${Date.now()}`,
        name: "New Product",
        image: "./assets/img/product-tee.svg",
        price: 100,
        oldPrice: null,
        rating: "4.0/5",
      });
      renderProducts();
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const { brands, products } = collectRows();

      const next = {
        ...model,
        announcement: announcementInput?.value.trim() || DEFAULTS.announcement,
        hero: {
          image: heroImageInput?.value.trim() || DEFAULTS.hero.image,
          heading: heroHeadingInput?.value.trim() || DEFAULTS.hero.heading,
          subheading: heroSubheadingInput?.value.trim() || DEFAULTS.hero.subheading,
          buttonText: heroButtonInput?.value.trim() || DEFAULTS.hero.buttonText,
        },
        brands,
        products,
      };

      saveCMS(next);
      Object.assign(model, next);
      showStatus("Saved. Homepage content updated.");
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      saveCMS(DEFAULTS);
      Object.assign(model, structuredClone(DEFAULTS));
      renderForm();
      showStatus("Defaults restored.");
    });
  }

  renderForm();
})();
