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
                throw new Error(data.error || "Unable to checkout");
            }

            sessionStorage.setItem("aj-last-order", JSON.stringify(payload.items));
            window.location.href = data.url;
        } catch (error) {
            alert("Checkout is not available yet. Start the local Stripe backend and try again.");
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
