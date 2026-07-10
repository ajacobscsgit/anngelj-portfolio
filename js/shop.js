(() => {
    const { ShopCore } = window;
    if (!ShopCore) {
        return;
    }

    const WISHLIST_KEY = "aj-shop-wishlist-v1";
    const RECENT_KEY = "aj-shop-recent-v1";
    const CONFETTI_KEY = "aj-shop-confetti-session";

    const grid = document.getElementById("shop-grid");
    const countNode = document.querySelector("[data-product-count]");
    const categoryHost = document.querySelector("[data-category-filters]");
    const searchInput = document.getElementById("shop-search");
    const clearSearchBtn = document.querySelector("[data-clear-search]");
    const sidebarSort = document.getElementById("sidebar-sort");
    const toolbarSort = document.getElementById("toolbar-sort");
    const freeOnly = document.getElementById("free-only");
    const saleOnly = document.getElementById("sale-only");
    const highestRated = document.getElementById("highest-rated");
    const bundlesOnly = document.getElementById("bundles-only");
    const recentOnly = document.getElementById("recent-only");
    const instantDownload = document.getElementById("instant-download");
    const lifetimeUpdates = document.getElementById("lifetime-updates");
    const filterToggle = document.querySelector("[data-filter-toggle]");
    const filterPanel = document.querySelector(".shop-filter-panel");
    const cartDrawer = document.querySelector("[data-cart-drawer]");
    const cartItems = document.querySelector("[data-cart-items]");
    const cartSubtotal = document.querySelector("[data-cart-subtotal]");
    const cartTax = document.querySelector("[data-cart-tax]");
    const cartTotal = document.querySelector("[data-cart-total]");
    const cartCountBadges = document.querySelectorAll("[data-cart-count]");
    const checkoutBtn = document.querySelector("[data-checkout]");
    const priceFilters = Array.from(document.querySelectorAll('input[name="price-filter"]'));
    const typeFilters = Array.from(document.querySelectorAll('input[name="type-filter"]'));
    const ratingFilters = Array.from(document.querySelectorAll('input[name="rating-filter"]'));
    const sidebarTotal = document.querySelector("[data-sidebar-total]");
    const sidebarFree = document.querySelector("[data-sidebar-free]");
    const sidebarBundles = document.querySelector("[data-sidebar-bundles]");
    const recentHost = document.querySelector("[data-recently-viewed]");
    const featuredReviewCards = document.querySelector("[data-featured-review-cards]");
    const openReviewFormButtons = document.querySelectorAll("[data-open-review-form]");
    const openAllReviewsButtons = document.querySelectorAll("[data-open-all-reviews]");
    const reviewModal = document.querySelector("[data-review-modal]");
    const reviewForm = document.querySelector("[data-review-form]");
    const reviewStarsHost = document.querySelector("[data-review-stars]");
    const reviewRatingValue = document.querySelector("[data-review-rating-value]");
    const allReviewsModal = document.querySelector("[data-all-reviews-modal]");
    const allReviewsList = document.querySelector("[data-all-reviews-list]");
    const allReviewsSummary = document.querySelector("[data-all-reviews-summary]");
    const shopHeader = document.querySelector(".shop-top-header");
    const shopMain = document.querySelector(".shop-page-layout");
    const shopFooter = document.querySelector(".shop-footer");

    const previewModal = document.querySelector("[data-preview-modal]");
    const previewCover = document.querySelector("[data-preview-cover]");
    const previewCategory = document.querySelector("[data-preview-category]");
    const previewTitle = document.querySelector("[data-preview-title]");
    const previewDescription = document.querySelector("[data-preview-description]");
    const previewReviews = document.querySelector("[data-preview-reviews]");
    const previewIncludes = document.querySelector("[data-preview-includes]");
    const previewGallery = document.querySelector("[data-preview-gallery]");
    const previewPages = document.querySelector("[data-preview-pages]");
    const previewRelated = document.querySelector("[data-preview-related]");
    const previewPrice = document.querySelector("[data-preview-price]");
    const previewAdd = document.querySelector("[data-preview-add]");
    const previewBuy = document.querySelector("[data-preview-buy]");

    if (!grid || !searchInput || !sidebarSort || !toolbarSort || !categoryHost || !cartDrawer || !previewModal) {
        return;
    }

    const state = {
        search: "",
        category: "all",
        sort: "featured",
        price: "all",
        type: "all",
        minRating: "all",
        freeOnly: false,
        saleOnly: false,
        highestRated: false,
        bundlesOnly: false,
        recentOnly: false,
        instantDownload: false,
        lifetimeUpdates: false,
        previewProductId: null
    };

    const collections = window.SHOP_COLLECTIONS || {};
    let products = ShopCore.getProducts();
    const sharedReviewApiBase = ShopCore.getReviewApiBase();
    const SUPABASE_URL = "https://zyoozdgdiwopgwstiugu.supabase.co".trim();
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5b296ZGdkaXdvcGd3c3RpdWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzAyNDMsImV4cCI6MjA5MzYwNjI0M30.T32uwCGaZo1YkqzIaRN_7eyjzPshXdmcHPFDdM7MH7w".trim();
    const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
    const supabaseClient = hasSupabaseConfig && window.supabase && typeof window.supabase.createClient === "function"
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            },
            global: {
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        })
        : null;
    const hasSupabaseClient = Boolean(supabaseClient);
    const featuredIds = new Set(products.filter((item) => item.featuredSale).map((item) => item.id));
    const categoryOrder = ["all", ...Object.keys(collections)];
    const categoryIcons = {
        study: "📚",
        cs: "💻",
        analytics: "📊",
        career: "💼",
        faith: "🕌",
        health: "🏀",
        creator: "🎨"
    };

    const defaultReviews = [
        {
            id: "default-review-1",
            name: "Hana M.",
            title: "Polished from start to finish",
            body: "This shop feels incredibly polished. The planner bundle is clean, practical, and beautiful to use.",
            rating: 5,
            createdAt: "2026-06-22T10:00:00Z",
            source: "curated"
        },
        {
            id: "default-review-2",
            name: "Devon R.",
            title: "Premium resources I wish I had earlier",
            body: "The SQL and dashboard downloads are the kind of premium resources I wish I had earlier.",
            rating: 5,
            createdAt: "2026-06-20T10:00:00Z",
            source: "curated"
        },
        {
            id: "default-review-3",
            name: "Amina K.",
            title: "Elegant branding and smooth checkout",
            body: "Elegant branding, fast checkout flow, and the product previews make browsing easy.",
            rating: 5,
            createdAt: "2026-06-18T10:00:00Z",
            source: "curated"
        }
    ];

    let serverReviews = [];

    const mapApiProduct = (entry) => {
        const id = String(entry.id || "").trim();
        const title = String(entry.title || "Digital Product").trim();
        const description = String(entry.description || "Premium digital resource.").trim();
        const category = String(entry.category || "creator").trim() || "creator";
        const unitAmount = Math.max(0, Number(entry.unit_amount || 0));
        const price = Number((unitAmount / 100).toFixed(2));
        const metadata = entry.metadata && typeof entry.metadata === "object" ? entry.metadata : {};
        const productType = String(metadata.productType || metadata.product_type || "template");
        const fileFormat = String(metadata.fileFormat || metadata.file_format || "PDF");
        const includes = Array.isArray(metadata.includes)
            ? metadata.includes.map((item) => String(item))
            : ["Download file", "Quick-start guide"];

        return {
            id,
            title,
            category,
            description,
            price,
            free: price === 0,
            isNew: false,
            rating: 4.8,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
            collectionLabel: collections[category] || "General",
            productType,
            fileFormat,
            readingTime: String(metadata.readingTime || metadata.reading_time || "20 min read"),
            instantDownload: true,
            lifetimeUpdates: Boolean(metadata.lifetimeUpdates || metadata.lifetime_updates),
            isBundle: Boolean(metadata.isBundle || metadata.is_bundle),
            includes,
            creator: String(metadata.creator || "Created by Anngel Jacobs")
        };
    };

    const loadProducts = async () => {
        try {
            const base = ShopCore.getCheckoutApiBase();
            const response = await fetch(`${base}/api/products`);
            if (!response.ok) {
                throw new Error("Unable to load products.");
            }

            const payload = await response.json();
            if (!Array.isArray(payload.products)) {
                throw new Error("Invalid products payload.");
            }

            const loadedProducts = payload.products
                .map(mapApiProduct)
                .filter((product) => product.id && product.title);

            if (loadedProducts.length > 0) {
                products = loadedProducts;
                ShopCore.setProducts(loadedProducts);
                renderSidebarSummary();
                renderRecentlyViewed();
                renderProducts();
                updateCartSummary();
            }
        } catch (_error) {
            // Keep static products as fallback when backend products are unavailable.
        }
    };

    const mapSupabaseReview = (entry) => {
        if (!entry) {
            return null;
        }

        return {
            id: entry.id,
            name: entry.name,
            title: entry.title,
            body: entry.body,
            rating: Number(entry.rating) || 5,
            createdAt: entry.created_at || new Date().toISOString(),
            source: entry.source || "user"
        };
    };

    const loadReviews = async () => {
        try {
            if (hasSupabaseClient) {
                const { data: rows, error } = await supabaseClient
                    .from("reviews")
                    .select("id,name,title,body,rating,created_at,source,is_public")
                    .eq("is_public", true)
                    .order("created_at", { ascending: false })
                    .limit(500);

                if (error) {
                    throw new Error(error.message || "Unable to load Supabase reviews.");
                }

                serverReviews = Array.isArray(rows)
                    ? rows.map(mapSupabaseReview).filter(Boolean)
                    : [];
            } else {
                const response = await fetch(`${sharedReviewApiBase}/api/reviews`);
                if (!response.ok) {
                    throw new Error("Unable to load reviews.");
                }

                const data = await response.json();
                serverReviews = Array.isArray(data.reviews) ? data.reviews.filter(Boolean) : [];
            }
            renderReviewSummary();
            renderFeaturedReviewCards();
            renderAllReviewsList();
        } catch (_error) {
            renderReviewSummary();
            renderFeaturedReviewCards();
            renderAllReviewsList();
        }
    };

    const getAllReviews = () => {
        return [...defaultReviews, ...serverReviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    const toStarString = (rating) => {
        const rounded = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
        return `${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}`;
    };

    const escapeHtml = (value) => String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const averageReviews = (reviews) => {
        if (reviews.length === 0) return 0;
        return reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length;
    };

    const renderReviewStarsPicker = (rating = 5) => {
        if (!reviewStarsHost) return;
        reviewStarsHost.innerHTML = Array.from({ length: 5 }, (_value, index) => {
            const starValue = index + 1;
            return `
                <button type="button" class="shop-star-button ${starValue <= rating ? "is-active" : ""}" data-review-star="${starValue}" role="radio" aria-checked="${starValue === rating ? "true" : "false"}" aria-label="${starValue} star${starValue === 1 ? "" : "s"}">★</button>
            `;
        }).join("");
        if (reviewRatingValue) reviewRatingValue.value = String(rating);
    };

    const setReviewBackdropState = (isOpen) => {
        document.body.classList.toggle("shop-reviews-open", Boolean(isOpen));
        [shopHeader, shopMain, shopFooter].forEach((element) => {
            if (!element) return;
            if (isOpen) {
                element.style.filter = "grayscale(0.32) blur(1px) brightness(0.86)";
                element.style.opacity = "0.72";
                element.style.pointerEvents = "none";
            } else {
                element.style.filter = "";
                element.style.opacity = "";
                element.style.pointerEvents = "";
            }
        });
    };

    const renderReviewSummary = () => {
        const reviews = getAllReviews();
        const average = averageReviews(reviews);
        if (document.querySelector("[data-shop-rating]")) {
            document.querySelector("[data-shop-rating]").textContent = average ? average.toFixed(1) : "0.0";
        }
        if (document.querySelector("[data-shop-review-stars]")) {
            document.querySelector("[data-shop-review-stars]").textContent = toStarString(average);
        }
        if (document.querySelector("[data-shop-review-count]")) {
            document.querySelector("[data-shop-review-count]").textContent = `${reviews.length} Review${reviews.length === 1 ? "" : "s"}`;
        }
    };

    const renderFeaturedReviewCards = () => {
        if (!featuredReviewCards) return;
        const reviews = getAllReviews().slice(0, 3);
        featuredReviewCards.innerHTML = reviews.map((review) => `
            <article class="shop-review-card">
                <div class="shop-review-card-top">
                    <strong>${escapeHtml(review.name)}</strong>
                    <span>${escapeHtml(toStarString(review.rating))}</span>
                </div>
                <p class="shop-review-title">${escapeHtml(review.title)}</p>
                <p>${escapeHtml(review.body)}</p>
            </article>
        `).join("");
    };

    const renderAllReviewsList = () => {
        if (!allReviewsList) return;
        const reviews = getAllReviews();
        if (allReviewsSummary) {
            const average = averageReviews(reviews);
            allReviewsSummary.textContent = `${reviews.length} reviews, ${average ? average.toFixed(1) : "0.0"} average rating.`;
        }
        allReviewsList.innerHTML = reviews.map((review) => `
            <article class="shop-review-list-item">
                <div class="shop-review-list-top">
                    <div>
                        <strong>${escapeHtml(review.name)}</strong>
                        <span>${new Date(review.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <p>${escapeHtml(toStarString(review.rating))}</p>
                </div>
                <h3>${escapeHtml(review.title)}</h3>
                <p>${escapeHtml(review.body)}</p>
            </article>
        `).join("");
    };

    const openReviewModal = () => {
        if (!reviewModal) return;
        renderReviewStarsPicker(5);
        reviewModal.classList.add("is-open");
        reviewModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-page-scroll");
        setReviewBackdropState(true);
        const firstField = reviewForm?.querySelector('input[name="reviewName"]');
        if (firstField) firstField.focus({ preventScroll: true });
    };

    const closeReviewModal = () => {
        if (!reviewModal) return;
        reviewModal.classList.remove("is-open");
        reviewModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-page-scroll");
        setReviewBackdropState(false);
    };

    const openAllReviewsModal = () => {
        if (!allReviewsModal) return;
        renderAllReviewsList();
        allReviewsModal.classList.add("is-open");
        allReviewsModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-page-scroll");
        setReviewBackdropState(true);
    };

    const closeAllReviewsModal = () => {
        if (!allReviewsModal) return;
        allReviewsModal.classList.remove("is-open");
        allReviewsModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-page-scroll");
        setReviewBackdropState(false);
    };

    const getWishlist = () => {
        try {
            const parsed = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
            return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
        } catch (_error) {
            return new Set();
        }
    };

    const saveWishlist = (set) => {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(Array.from(set)));
    };

    const getRecent = () => {
        try {
            const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
            return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch (_error) {
            return [];
        }
    };

    const saveRecent = (ids) => {
        localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, 6)));
    };

    const wishlist = getWishlist();
    let recentViewed = getRecent();

    const getReviewText = (item) => {
        if (typeof item.rating !== "number" || item.reviewCount <= 0) {
            return "★★★★★ (Coming soon)";
        }
        return `★★★★★ (${item.reviewCount})`;
    };

    const renderSidebarSummary = () => {
        if (sidebarTotal) sidebarTotal.textContent = String(products.length);
        if (sidebarFree) sidebarFree.textContent = String(products.filter((item) => item.free).length);
        if (sidebarBundles) sidebarBundles.textContent = String(products.filter((item) => item.isBundle).length);
    };

    const renderRecentlyViewed = () => {
        if (!recentHost) return;

        const mapped = recentViewed
            .map((id) => products.find((item) => item.id === id))
            .filter(Boolean)
            .slice(0, 4);

        if (mapped.length === 0) {
            recentHost.textContent = "Browse products to build this list.";
            return;
        }

        recentHost.innerHTML = mapped.map((item) => `<p class="recent-item">${item.title}</p>`).join("");
    };

    const syncSearchClear = () => {
        if (!clearSearchBtn) return;
        clearSearchBtn.hidden = !searchInput.value.trim();
    };

    const getCoverTheme = (item) => {
        const source = `${item.title} ${item.category}`.toLowerCase();
        if (/sql|javascript|python|git|html|css|code|cheat/.test(source)) return "code";
        if (/dashboard|metrics|analytics|excel|sop|business/.test(source)) return "dashboard";
        if (/journal|faith|ramadan|quran|dhikr|gratitude/.test(source)) return "faith";
        if (/resume|linkedin|interview|career|portfolio/.test(source)) return "career";
        if (/workout|health|habit|wellness|basketball/.test(source)) return "wellness";
        if (/bundle/.test(source)) return "bundle";
        if (/planner|study|assignment|exam|tracker|notes|time/.test(source)) return "planner";
        return "editorial";
    };

    const getCardBadges = (item) => {
        const badges = [];
        if (item.free) badges.push('<span class="shop-badge shop-badge-free">Free</span>');
        if (item.isNew) badges.push('<span class="shop-badge shop-badge-new">New</span>');
        if (item.isBundle) badges.push('<span class="shop-badge shop-badge-bundle">Bundle</span>');
        if (item.featuredSale) badges.push('<span class="shop-badge shop-badge-best">Best Seller</span>');
        if (item.recentlyUpdated) badges.push('<span class="shop-badge shop-badge-updated">Recently Updated</span>');
        if (typeof item.salePrice === "number") badges.push('<span class="shop-badge shop-badge-sale">50% OFF</span>');
        return badges.join("");
    };

    const getProductHighlights = (item) => {
        const highlights = ["Instant Download", item.fileFormat];
        if (item.lifetimeUpdates) highlights.push("Lifetime Updates");
        return highlights.map((label) => `<span>${label}</span>`).join("");
    };

    const matchesPriceFilter = (item) => {
        const amount = ShopCore.getEffectivePrice(item);
        if (state.price === "under-10") return amount < 10;
        if (state.price === "10-15") return amount >= 10 && amount <= 15;
        if (state.price === "16-20") return amount >= 16 && amount <= 20;
        if (state.price === "20-plus") return amount >= 20;
        return true;
    };

    const matchesRatingFilter = (item) => {
        if (state.minRating === "all") return true;
        return (item.rating || 0) >= Number(state.minRating || 0);
    };

    const filterProducts = () => products.filter((item) => {
        const query = state.search.trim().toLowerCase();
        const searchable = `${item.title} ${item.description} ${item.collectionLabel} ${item.productType} ${item.fileFormat}`.toLowerCase();

        if (query && !searchable.includes(query)) return false;
        if (state.category !== "all" && item.category !== state.category) return false;
        if (state.type !== "all" && item.productType !== state.type) return false;
        if (!matchesPriceFilter(item) || !matchesRatingFilter(item)) return false;
        if (state.freeOnly && !item.free) return false;
        if (state.saleOnly && typeof item.salePrice !== "number") return false;
        if (state.highestRated && !(typeof item.rating === "number" && item.rating >= 4.5)) return false;
        if (state.bundlesOnly && !item.isBundle) return false;
        if (state.recentOnly && !item.isNew) return false;
        if (state.instantDownload && !item.instantDownload) return false;
        if (state.lifetimeUpdates && !item.lifetimeUpdates) return false;
        return true;
    });

    const sortProducts = (list) => {
        const copy = [...list];
        const priceOf = (item) => ShopCore.getEffectivePrice(item);

        if (state.sort === "newest") return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (state.sort === "rating-desc") return copy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        if (state.sort === "price-asc") return copy.sort((a, b) => priceOf(a) - priceOf(b));
        if (state.sort === "price-desc") return copy.sort((a, b) => priceOf(b) - priceOf(a));
        if (state.sort === "title-asc") return copy.sort((a, b) => a.title.localeCompare(b.title));
        return copy.sort((a, b) => Number(featuredIds.has(b.id)) - Number(featuredIds.has(a.id)));
    };

    const groupByCategory = (list) => {
        const grouped = new Map();
        list.forEach((item) => {
            if (!grouped.has(item.category)) grouped.set(item.category, []);
            grouped.get(item.category).push(item);
        });
        return grouped;
    };

    const makeDiscountRibbon = (item) => {
        if (typeof item.salePrice !== "number") return "";
        return `<span class="discount-ribbon" aria-label="Discount">50% OFF</span>`;
    };

    const makeCover = (item) => {
        const theme = getCoverTheme(item);
        return `
            <div class="shop-product-preview cover-theme-${theme}" data-cover-key="${item.category}" aria-hidden="true">
                <div class="shop-cover-art">
                    <span class="shop-cover-orb"></span>
                    <span class="shop-cover-panel"></span>
                    <span class="shop-cover-card"></span>
                    <span class="shop-cover-lines"></span>
                    <span class="shop-cover-grid"></span>
                </div>
                ${makeDiscountRibbon(item)}
            </div>
        `;
    };

    const renderCard = (item) => {
        const card = document.createElement("article");
        card.className = "shop-product-card";
        card.dataset.id = item.id;

        const effectivePrice = ShopCore.getEffectivePrice(item);
        const hasDiscount = typeof item.salePrice === "number";
        const priceMarkup = hasDiscount
            ? `<div class="shop-price-stack"><span class="original">${ShopCore.toCurrency(item.price)}</span><strong>${ShopCore.toCurrency(effectivePrice)}</strong></div>`
            : `<div class="shop-price-stack"><strong>${ShopCore.toCurrency(effectivePrice)}</strong></div>`;

        const wishlistGlyph = wishlist.has(item.id) ? "♥" : "♡";

        card.innerHTML = `
            <div class="shop-product-media">
                ${makeCover(item)}
                <button type="button" class="wishlist-toggle ${wishlist.has(item.id) ? "is-active" : ""}" data-wishlist="${item.id}" aria-label="Save to wishlist">${wishlistGlyph}</button>
            </div>
            <div class="shop-product-content">
                <p class="shop-category-badge">${item.collectionLabel}</p>
                <h3>${item.title}</h3>
                <p class="shop-description">${item.description}</p>
                <p class="shop-reviews-row" aria-label="Reviews">${getReviewText(item)}</p>
                <div class="shop-card-tags">${getProductHighlights(item)}</div>
                <div class="shop-card-badges">${getCardBadges(item)}</div>
                ${priceMarkup}
                <div class="shop-card-actions">
                    <button type="button" class="button primary-button" data-add-cart="${item.id}">Add to Cart</button>
                    <button type="button" class="button secondary-button" data-quick-view="${item.id}">View Details</button>
                </div>
            </div>
        `;

        return card;
    };

    const renderProducts = () => {
        const filtered = sortProducts(filterProducts());
        const grouped = groupByCategory(filtered);
        grid.innerHTML = "";

        if (filtered.length === 0) {
            const empty = document.createElement("article");
            empty.className = "shop-note-card";
            empty.innerHTML = "<h3>No products match your filters</h3><p>Try clearing one or more filters to see more results.</p>";
            grid.appendChild(empty);
        } else {
            const sectionOrder = ["study", "cs", "analytics", "career", "faith", "health", "creator"];
            sectionOrder.forEach((key) => {
                const items = grouped.get(key) || [];
                if (items.length === 0) return;

                const section = document.createElement("section");
                section.className = "shop-collection-section";
                section.innerHTML = `
                    <header class="shop-collection-header">
                        <p>${categoryIcons[key] || "•"} ${collections[key] || "Collection"}</p>
                    </header>
                `;

                const row = document.createElement("div");
                row.className = "shop-grid";
                items.forEach((item) => row.appendChild(renderCard(item)));
                section.appendChild(row);
                grid.appendChild(section);
            });
        }

        countNode.textContent = `${filtered.length} product${filtered.length === 1 ? "" : "s"}`;
    };

    const renderCategoryFilters = () => {
        categoryHost.innerHTML = "";
        categoryOrder.forEach((key) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `shop-chip ${key === state.category ? "is-active" : ""}`;
            button.dataset.category = key;
            button.textContent = key === "all" ? "All" : collections[key];
            categoryHost.appendChild(button);
        });
    };

    const openCart = () => {
        cartDrawer.classList.add("is-open");
        cartDrawer.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-page-scroll");
    };

    const closeCart = () => {
        cartDrawer.classList.remove("is-open");
        cartDrawer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-page-scroll");
    };

    const animateCartCount = () => {
        cartCountBadges.forEach((node) => {
            node.classList.remove("cart-bounce");
            requestAnimationFrame(() => node.classList.add("cart-bounce"));
        });
    };

    const maybeConfetti = (originButton) => {
        if (sessionStorage.getItem(CONFETTI_KEY) === "true") return;
        sessionStorage.setItem(CONFETTI_KEY, "true");

        const rect = originButton.getBoundingClientRect();
        const host = document.createElement("div");
        host.className = "confetti-host";
        host.style.left = `${rect.left + rect.width / 2}px`;
        host.style.top = `${rect.top + window.scrollY}px`;

        for (let i = 0; i < 16; i += 1) {
            const piece = document.createElement("span");
            piece.className = "confetti-piece";
            piece.style.setProperty("--dx", `${(Math.random() - 0.5) * 120}px`);
            piece.style.setProperty("--dy", `${-30 - Math.random() * 90}px`);
            piece.style.setProperty("--delay", `${Math.random() * 120}ms`);
            host.appendChild(piece);
        }

        document.body.appendChild(host);
        setTimeout(() => host.remove(), 1100);
    };

    const updateCartSummary = () => {
        const { lines, subtotal, estimatedTax, total } = ShopCore.getCartTotals();

        cartItems.innerHTML = "";
        if (lines.length === 0) {
            cartItems.innerHTML = "<p class='cart-empty'>Your cart is empty. Add a resource to continue.</p>";
        } else {
            lines.forEach((line) => {
                const item = document.createElement("article");
                item.className = "cart-line";
                item.innerHTML = `
                    <div>
                        <h3>${line.product.title}</h3>
                        <p>${ShopCore.toCurrency(line.unitPrice)} x ${line.quantity}</p>
                        <div class="cart-line-controls">
                            <button type="button" data-qty-dec="${line.product.id}" aria-label="Decrease quantity">-</button>
                            <span>${line.quantity}</span>
                            <button type="button" data-qty-inc="${line.product.id}" aria-label="Increase quantity">+</button>
                            <button type="button" data-remove-item="${line.product.id}">Remove</button>
                        </div>
                    </div>
                    <strong>${ShopCore.toCurrency(line.lineTotal)}</strong>
                `;
                cartItems.appendChild(item);
            });
        }

        cartSubtotal.textContent = ShopCore.toCurrency(subtotal);
        cartTax.textContent = ShopCore.toCurrency(estimatedTax);
        cartTotal.textContent = ShopCore.toCurrency(total);

        const totalQty = lines.reduce((sum, line) => sum + line.quantity, 0);
        cartCountBadges.forEach((node) => {
            node.textContent = String(totalQty);
        });
    };

    const updateButtonAddedState = (button) => {
        const original = button.textContent;
        button.textContent = "Added ✓";
        button.disabled = true;
        setTimeout(() => {
            button.textContent = original;
            button.disabled = false;
        }, 1000);
    };

    const appendRecentView = (id) => {
        recentViewed = [id, ...recentViewed.filter((value) => value !== id)].slice(0, 6);
        saveRecent(recentViewed);
        renderRecentlyViewed();
    };

    const openPreview = (productId) => {
        const product = ShopCore.findProductById(productId);
        if (!product) return;

        state.previewProductId = product.id;
        previewCover.innerHTML = makeCover(product);

        if (previewGallery) {
            const theme = getCoverTheme(product);
            previewGallery.innerHTML = ["Overview", "Detail", "Use Case"].map((label) => `
                <div class="shop-preview-thumb shop-preview-thumb-${theme}">
                    <span>${label}</span>
                </div>
            `).join("");
        }

        if (previewPages) {
            previewPages.innerHTML = ["01", "02", "03"].map((pageNumber) => `
                <div class="shop-preview-page"><strong>${pageNumber}</strong><span>Sample page</span></div>
            `).join("");
        }

        if (previewRelated) {
            const relatedItems = products.filter((entry) => entry.category === product.category && entry.id !== product.id).slice(0, 3);
            previewRelated.innerHTML = relatedItems.length === 0
                ? '<p class="shop-preview-empty">More resources in this collection will appear here soon.</p>'
                : relatedItems.map((entry) => `
                    <article class="shop-related-item">
                        <span>${entry.collectionLabel}</span>
                        <strong>${entry.title}</strong>
                    </article>
                `).join("");
        }

        previewCategory.textContent = product.collectionLabel;
        previewTitle.textContent = product.title;
        previewDescription.textContent = product.description;
        previewReviews.textContent = `${getReviewText(product)} • ${product.fileFormat}`;
        previewIncludes.innerHTML = product.includes.map((line) => `<li>${line}</li>`).join("");

        const effectivePrice = ShopCore.getEffectivePrice(product);
        previewPrice.innerHTML = typeof product.salePrice === "number"
            ? `<span class="original">${ShopCore.toCurrency(product.price)}</span><strong>${ShopCore.toCurrency(effectivePrice)}</strong>`
            : `<strong>${ShopCore.toCurrency(effectivePrice)}</strong>`;

        appendRecentView(product.id);
        previewModal.classList.add("is-open");
        previewModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-page-scroll");
    };

    const closePreview = () => {
        previewModal.classList.remove("is-open");
        previewModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-page-scroll");
    };

    const startCheckout = async () => {
        const lines = ShopCore.getCartLines();
        if (lines.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        checkoutBtn.disabled = true;
        checkoutBtn.textContent = "Redirecting...";

        const base = ShopCore.getCheckoutApiBase();
        const payload = {
            items: lines.map((line) => ({
                id: line.product.id,
                quantity: line.quantity
            })),
            successUrl: `${window.location.origin}/success.html`,
            cancelUrl: `${window.location.origin}/cart.html`
        };

        try {
            const response = await fetch(`${base}/api/create-checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok || !data.url) {
                throw new Error(data.error || "Unable to start checkout.");
            }

            sessionStorage.setItem("aj-last-order", JSON.stringify(payload.items));
            window.location.href = data.url;
        } catch (_error) {
            alert("Checkout is not available yet. Start the local Stripe backend and try again.");
        } finally {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = "Checkout";
        }
    };

    const submitReview = async (form) => {
        const formData = new FormData(form);
        const name = String(formData.get("reviewName") || "").trim();
        const title = String(formData.get("reviewTitle") || "").trim();
        const body = String(formData.get("reviewBody") || "").trim();
        const rating = Math.max(1, Math.min(5, Number(formData.get("reviewRating") || 5)));
        const submitButton = form.querySelector('button[type="submit"]');
        const submitLabel = submitButton ? submitButton.textContent : "Submit Review";

        if (!name || !title || !body) {
            alert("Please complete your name, title, rating, and review.");
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        try {
            let createdReview = null;

            if (hasSupabaseClient) {
                const { data, error } = await supabaseClient
                    .from("reviews")
                    .insert({
                        name,
                        title,
                        body,
                        rating,
                        source: "user",
                        is_public: true
                    })
                    .select("id,name,title,body,rating,created_at,source")
                    .single();

                if (error || !data) {
                    throw new Error((error && error.message) || "Unable to submit review.");
                }

                createdReview = mapSupabaseReview(data);
            } else {
                const response = await fetch(`${sharedReviewApiBase}/api/reviews`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, title, body, rating })
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok || !data.review) {
                    throw new Error(data.error || "Unable to submit review.");
                }

                createdReview = data.review;
            }

            serverReviews = [createdReview, ...serverReviews.filter((entry) => entry.id !== createdReview.id)];
            renderReviewSummary();
            renderFeaturedReviewCards();
            renderAllReviewsList();

            form.reset();
            renderReviewStarsPicker(5);
            closeReviewModal();
            openAllReviewsModal();
        } catch (error) {
            alert(error.message || "Unable to submit review right now.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = submitLabel;
            }
        }
    };

    const syncSort = (value, source) => {
        state.sort = value;
        sidebarSort.value = value;
        toolbarSort.value = value;
        renderProducts();

        if (source === "sidebar") {
            toolbarSort.focus({ preventScroll: true });
        } else if (source === "toolbar") {
            sidebarSort.focus({ preventScroll: true });
        }
    };

    document.addEventListener("click", (event) => {
        const categoryBtn = event.target.closest("[data-category]");
        if (categoryBtn) {
            state.category = categoryBtn.dataset.category || "all";
            renderCategoryFilters();
            renderProducts();
            return;
        }

        if (event.target.closest("[data-open-cart]")) {
            openCart();
            return;
        }

        if (event.target.closest("[data-close-cart]")) {
            closeCart();
            closePreview();
            return;
        }

        if (event.target.closest("[data-close-preview]")) {
            closePreview();
            return;
        }

        const addBtn = event.target.closest("[data-add-cart]");
        if (addBtn) {
            ShopCore.addToCart(addBtn.dataset.addCart, 1);
            updateButtonAddedState(addBtn);
            animateCartCount();
            maybeConfetti(addBtn);
            openCart();
            return;
        }

        const quickBtn = event.target.closest("[data-quick-view]");
        if (quickBtn) {
            openPreview(quickBtn.dataset.quickView);
            return;
        }

        const openReviewBtn = event.target.closest("[data-open-review-form]");
        if (openReviewBtn) {
            openReviewModal();
            return;
        }

        const openAllReviewsBtn = event.target.closest("[data-open-all-reviews]");
        if (openAllReviewsBtn) {
            openAllReviewsModal();
            return;
        }

        const reviewStarBtn = event.target.closest("[data-review-star]");
        if (reviewStarBtn && reviewStarsHost) {
            const rating = Number(reviewStarBtn.dataset.reviewStar || 5);
            renderReviewStarsPicker(rating);
            return;
        }

        const wishBtn = event.target.closest("[data-wishlist]");
        if (wishBtn) {
            const id = wishBtn.dataset.wishlist;
            if (!id) return;

            if (wishlist.has(id)) {
                wishlist.delete(id);
                wishBtn.classList.remove("is-active");
                wishBtn.textContent = "♡";
            } else {
                wishlist.add(id);
                wishBtn.classList.add("is-active");
                wishBtn.textContent = "♥";
            }
            saveWishlist(wishlist);
            return;
        }

        const incBtn = event.target.closest("[data-qty-inc]");
        if (incBtn) {
            const id = incBtn.dataset.qtyInc;
            const line = ShopCore.getCartLines().find((entry) => entry.product.id === id);
            if (line) {
                ShopCore.setItemQuantity(id, line.quantity + 1);
                animateCartCount();
            }
            return;
        }

        const decBtn = event.target.closest("[data-qty-dec]");
        if (decBtn) {
            const id = decBtn.dataset.qtyDec;
            const line = ShopCore.getCartLines().find((entry) => entry.product.id === id);
            if (line) {
                ShopCore.setItemQuantity(id, line.quantity - 1);
                animateCartCount();
            }
            return;
        }

        const removeBtn = event.target.closest("[data-remove-item]");
        if (removeBtn) {
            ShopCore.removeItem(removeBtn.dataset.removeItem);
            animateCartCount();
        }
    });

    searchInput.addEventListener("input", () => {
        state.search = searchInput.value;
        syncSearchClear();
        renderProducts();
    });

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            searchInput.value = "";
            state.search = "";
            syncSearchClear();
            renderProducts();
            searchInput.focus();
        });
    }

    if (filterToggle && filterPanel) {
        if (window.matchMedia("(max-width: 980px)").matches) {
            filterPanel.classList.add("is-collapsed");
            filterToggle.setAttribute("aria-expanded", "false");
        }

        filterToggle.addEventListener("click", () => {
            const collapsed = !filterPanel.classList.contains("is-collapsed");
            filterPanel.classList.toggle("is-collapsed", collapsed);
            filterToggle.setAttribute("aria-expanded", String(!collapsed));
        });
    }

    sidebarSort.addEventListener("change", () => syncSort(sidebarSort.value, "sidebar"));
    toolbarSort.addEventListener("change", () => syncSort(toolbarSort.value, "toolbar"));

    priceFilters.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.checked) {
                state.price = radio.value;
                renderProducts();
            }
        });
    });

    typeFilters.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.checked) {
                state.type = radio.value;
                renderProducts();
            }
        });
    });

    ratingFilters.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.checked) {
                state.minRating = radio.value;
                renderProducts();
            }
        });
    });

    freeOnly.addEventListener("change", () => {
        state.freeOnly = freeOnly.checked;
        renderProducts();
    });

    saleOnly.addEventListener("change", () => {
        state.saleOnly = saleOnly.checked;
        renderProducts();
    });

    highestRated.addEventListener("change", () => {
        state.highestRated = highestRated.checked;
        renderProducts();
    });

    bundlesOnly.addEventListener("change", () => {
        state.bundlesOnly = bundlesOnly.checked;
        renderProducts();
    });

    recentOnly.addEventListener("change", () => {
        state.recentOnly = recentOnly.checked;
        renderProducts();
    });

    instantDownload.addEventListener("change", () => {
        state.instantDownload = instantDownload.checked;
        renderProducts();
    });

    lifetimeUpdates.addEventListener("change", () => {
        state.lifetimeUpdates = lifetimeUpdates.checked;
        renderProducts();
    });

    if (previewAdd) {
        previewAdd.addEventListener("click", () => {
            if (!state.previewProductId) return;
            ShopCore.addToCart(state.previewProductId, 1);
            animateCartCount();
            closePreview();
            openCart();
        });
    }

    if (previewBuy) {
        previewBuy.addEventListener("click", () => {
            if (!state.previewProductId) return;
            ShopCore.addToCart(state.previewProductId, 1);
            animateCartCount();
            closePreview();
            startCheckout();
        });
    }

    checkoutBtn.addEventListener("click", startCheckout);

    if (reviewModal) {
        reviewModal.addEventListener("click", (event) => {
            if (event.target.matches("[data-close-review-form]")) {
                closeReviewModal();
            }
        });
    }

    if (allReviewsModal) {
        allReviewsModal.addEventListener("click", (event) => {
            if (event.target.matches("[data-close-all-reviews]")) {
                closeAllReviewsModal();
            }
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await submitReview(reviewForm);
        });
    }

    window.addEventListener("shop:cart-updated", updateCartSummary);
    window.addEventListener("shop:products-updated", (event) => {
        products = Array.isArray(event.detail) ? event.detail : products;
        renderSidebarSummary();
        renderRecentlyViewed();
        renderProducts();
        updateCartSummary();
    });

    renderCategoryFilters();
    renderSidebarSummary();
    renderRecentlyViewed();
    syncSearchClear();
    renderProducts();
    renderReviewSummary();
    renderFeaturedReviewCards();
    renderAllReviewsList();
    renderReviewStarsPicker(5);
    loadReviews();
    loadProducts();
    updateCartSummary();
})();
