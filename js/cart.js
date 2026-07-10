(() => {
    const { ShopCore } = window;
    if (!ShopCore) {
        return;
    }

    const itemsHost = document.querySelector("[data-cart-page-items]");
    const subtotalNode = document.querySelector("[data-summary-subtotal]");
    const taxNode = document.querySelector("[data-summary-tax]");
    const totalNode = document.querySelector("[data-summary-total]");
    const checkoutBtn = document.querySelector("[data-cart-page-checkout]");
    const promoBtn = document.querySelector("[data-apply-promo]");
    const promoFeedback = document.querySelector("[data-promo-feedback]");
    const promoInput = document.getElementById("promo-code");

    if (!itemsHost || !subtotalNode || !taxNode || !totalNode || !checkoutBtn || !promoBtn || !promoFeedback || !promoInput) {
        return;
    }

    let discountRate = 0;
    const PUBLIC_CONFIG = window.AJ_PUBLIC_CONFIG || {};
    const SUPABASE_URL = String(PUBLIC_CONFIG.SUPABASE_URL || "").trim();
    const SUPABASE_ANON_KEY = String(PUBLIC_CONFIG.SUPABASE_ANON_KEY || "").trim();
    const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

    const render = () => {
        const { lines, subtotal, estimatedTax, total } = ShopCore.getCartTotals();

        itemsHost.innerHTML = "";
        if (lines.length === 0) {
            itemsHost.innerHTML = "<article class='shop-note-card'><h3>Your cart is empty</h3><p>Add digital resources from the shop to continue.</p></article>";
        } else {
            lines.forEach((line) => {
                const row = document.createElement("article");
                row.className = "cart-page-line";
                row.innerHTML = `
                    <div>
                        <h3>${line.product.title}</h3>
                        <p>${line.product.collectionLabel}</p>
                        <div class="cart-line-controls">
                            <button type="button" data-line-dec="${line.product.id}" aria-label="Decrease quantity">-</button>
                            <span>${line.quantity}</span>
                            <button type="button" data-line-inc="${line.product.id}" aria-label="Increase quantity">+</button>
                            <button type="button" data-line-remove="${line.product.id}">Remove</button>
                        </div>
                    </div>
                    <strong>${ShopCore.toCurrency(line.lineTotal)}</strong>
                `;
                itemsHost.appendChild(row);
            });
        }

        const discountedSubtotal = subtotal * (1 - discountRate);
        const discountedTax = estimatedTax * (1 - discountRate);
        const discountedTotal = total * (1 - discountRate);

        subtotalNode.textContent = ShopCore.toCurrency(discountedSubtotal);
        taxNode.textContent = ShopCore.toCurrency(discountedTax);
        totalNode.textContent = ShopCore.toCurrency(discountedTotal);
    };

    const startCheckout = async () => {
        const lines = ShopCore.getCartLines();
        if (lines.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        if (!hasSupabaseConfig) {
            alert("Checkout is temporarily unavailable. Missing public checkout configuration.");
            return;
        }

        checkoutBtn.disabled = true;
        checkoutBtn.textContent = "Opening secure checkout...";

        const cart = lines.map((line) => ({
            productId: line.product.id,
            quantity: line.quantity
        }));

        try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    cart
                })
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.error || result.message || "Checkout could not be started.");
            }

            if (!result.checkoutUrl) {
                throw new Error("No checkout URL was returned.");
            }

            sessionStorage.setItem("aj-last-order", JSON.stringify(cart));
            window.location.href = result.checkoutUrl;
        } catch (error) {
            console.error("Checkout error:", error);
            alert(error instanceof Error ? error.message : "Checkout could not be started.");
        } finally {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = "Checkout";
        }
    };

    promoBtn.addEventListener("click", () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === "LAUNCH10") {
            discountRate = 0.1;
            promoFeedback.textContent = "Promo applied: 10% launch discount.";
            promoFeedback.classList.add("is-success");
        } else if (code) {
            discountRate = 0;
            promoFeedback.textContent = "Promo code invalid.";
            promoFeedback.classList.remove("is-success");
        } else {
            discountRate = 0;
            promoFeedback.textContent = "Enter a promo code to apply.";
            promoFeedback.classList.remove("is-success");
        }
        render();
    });

    checkoutBtn.addEventListener("click", startCheckout);

    document.addEventListener("click", (event) => {
        const inc = event.target.closest("[data-line-inc]");
        if (inc) {
            const id = inc.dataset.lineInc;
            const line = ShopCore.getCartLines().find((entry) => entry.product.id === id);
            if (line) {
                ShopCore.setItemQuantity(id, line.quantity + 1);
            }
            return;
        }

        const dec = event.target.closest("[data-line-dec]");
        if (dec) {
            const id = dec.dataset.lineDec;
            const line = ShopCore.getCartLines().find((entry) => entry.product.id === id);
            if (line) {
                ShopCore.setItemQuantity(id, line.quantity - 1);
            }
            return;
        }

        const remove = event.target.closest("[data-line-remove]");
        if (remove) {
            ShopCore.removeItem(remove.dataset.lineRemove);
        }
    });

    window.addEventListener("shop:cart-updated", render);

    render();
})();
