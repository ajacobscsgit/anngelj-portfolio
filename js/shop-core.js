(() => {
    const CART_KEY = "aj-shop-cart-v1";
    const CHECKOUT_URL_KEY = "AJ_CHECKOUT_API_BASE";
    let runtimeProducts = Array.isArray(window.SHOP_PRODUCTS) ? window.SHOP_PRODUCTS : [];

    const toCurrency = (value) => {
        const amount = Number(value || 0);
        return `$${amount.toFixed(2)}`;
    };

    const getProducts = () => runtimeProducts;

    const setProducts = (nextProducts) => {
        runtimeProducts = Array.isArray(nextProducts) ? nextProducts : [];
        window.SHOP_PRODUCTS = runtimeProducts;
        window.dispatchEvent(new CustomEvent("shop:products-updated", { detail: runtimeProducts }));
    };

    const findProductById = (id) => getProducts().find((item) => item.id === id) || null;

    const getEffectivePrice = (product) => {
        if (!product) {
            return 0;
        }
        if (typeof product.salePrice === "number") {
            return product.salePrice;
        }
        return Number(product.price || 0);
    };

    const readCart = () => {
        try {
            const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
            if (!Array.isArray(parsed)) {
                return [];
            }
            return parsed
                .map((entry) => ({ id: String(entry.id || ""), quantity: Math.max(1, Number(entry.quantity || 1)) }))
                .filter((entry) => entry.id);
        } catch (error) {
            return [];
        }
    };

    const writeCart = (items) => {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent("shop:cart-updated", { detail: items }));
    };

    const addToCart = (productId, quantity = 1) => {
        const product = findProductById(productId);
        if (!product) {
            return;
        }

        const items = readCart();
        const existing = items.find((entry) => entry.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            items.push({ id: productId, quantity: Math.max(1, quantity) });
        }
        writeCart(items);
    };

    const setItemQuantity = (productId, quantity) => {
        const items = readCart();
        const index = items.findIndex((entry) => entry.id === productId);
        if (index < 0) {
            return;
        }

        if (quantity <= 0) {
            items.splice(index, 1);
        } else {
            items[index].quantity = quantity;
        }

        writeCart(items);
    };

    const removeItem = (productId) => {
        const next = readCart().filter((entry) => entry.id !== productId);
        writeCart(next);
    };

    const clearCart = () => writeCart([]);

    const getCartLines = () => readCart().map((entry) => {
        const product = findProductById(entry.id);
        if (!product) {
            return null;
        }
        const unitPrice = getEffectivePrice(product);
        const lineTotal = unitPrice * entry.quantity;
        return {
            product,
            quantity: entry.quantity,
            unitPrice,
            lineTotal
        };
    }).filter(Boolean);

    const getCartTotals = () => {
        const lines = getCartLines();
        const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
        const estimatedTax = subtotal * 0.07;
        const total = subtotal + estimatedTax;
        return { lines, subtotal, estimatedTax, total };
    };

    const resolveApiBase = (storageKey, fallbackBase) => {
        const fromStorage = localStorage.getItem(storageKey);
        if (fromStorage) {
            return fromStorage;
        }

        return fallbackBase;
    };

    const getCheckoutApiBase = () => resolveApiBase(CHECKOUT_URL_KEY, "http://localhost:4242");

    const getReviewApiBase = () => {
        return "http://localhost:4242";
    };

    const setCheckoutApiBase = (value) => {
        localStorage.setItem(CHECKOUT_URL_KEY, value);
    };

    window.ShopCore = {
        CART_KEY,
        toCurrency,
        getProducts,
        setProducts,
        findProductById,
        getEffectivePrice,
        readCart,
        writeCart,
        addToCart,
        setItemQuantity,
        removeItem,
        clearCart,
        getCartLines,
        getCartTotals,
        getCheckoutApiBase,
        getReviewApiBase,
        setCheckoutApiBase
    };
})();
