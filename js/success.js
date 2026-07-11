(() => {
    const { ShopCore } = window;
    if (!ShopCore) {
        return;
    }

    const host = document.querySelector("[data-success-order-list]");
    const downloadAll = document.querySelector("[data-download-all]");
    if (!host) {
        return;
    }

    const apiBase = ShopCore.getCheckoutApiBase();
    const params = new URLSearchParams(window.location.search);
    const checkoutSessionId = String(params.get("session_id") || params.get("sessionId") || "").trim();

    const escapeHtml = (value) => String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const readLocalOrder = () => {
        try {
            const stored = JSON.parse(sessionStorage.getItem("aj-last-order") || "[]");
            if (!Array.isArray(stored) || stored.length === 0) {
                return [];
            }

            return stored.map((item) => {
                const id = String(item.productId || item.id || "").trim();
                const product = ShopCore.findProductById(id);
                return {
                    id,
                    title: item.title || product?.title || "Digital Product",
                    quantity: Number(item.quantity || 1),
                    price: Number(item.unitAmount || Math.round((ShopCore.getEffectivePrice(product) || 0) * 100)) / 100,
                    downloadReady: false,
                    downloadLabel: "Pending"
                };
            });
        } catch (error) {
            return [];
        }
    };

    const fetchProtectedDownloads = async (sessionId) => {
        if (!sessionId) {
            return [];
        }

        const response = await fetch(`${apiBase}/api/orders/${encodeURIComponent(sessionId)}/downloads`);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !Array.isArray(payload.items)) {
            throw new Error(payload.error || "Downloads are not available yet.");
        }

        return payload.items.map((item) => ({
            id: String(item.id || item.productId || "").trim(),
            title: String(item.title || item.name || "Digital Product").trim(),
            quantity: Math.max(1, Number(item.quantity || 1)),
            price: Number(item.price || item.unitAmount || 0) / (Number(item.unitAmount) > 0 ? 100 : 1),
            downloadReady: Boolean(item.downloadReady || item.download_ready),
            downloadLabel: String(item.downloadLabel || "Ready")
        }));
    };

    let lines = readLocalOrder();

    const renderDownloadButton = (item, sessionId) => {
        const link = document.createElement("a");
        link.className = "button primary-button";
        link.href = "#";
        link.textContent = item.downloadReady ? `Download ${item.title}` : `${item.downloadLabel || "Pending"} ${item.title}`;
        if (!item.downloadReady || !sessionId) {
            link.setAttribute("aria-disabled", "true");
            return link;
        }

        link.addEventListener("click", async (event) => {
            event.preventDefault();
            try {
                const response = await fetch(`${apiBase}/api/orders/${encodeURIComponent(sessionId)}/downloads/${encodeURIComponent(item.id)}`);
                const payload = await response.json().catch(() => ({}));
                if (!response.ok || !payload.url) {
                    throw new Error(payload.error || "Download link is not available yet.");
                }

                window.location.href = payload.url;
            } catch (error) {
                alert(error instanceof Error ? error.message : "Download link is not available yet.");
            }
        });
        return link;
    };

    const renderSummary = (sessionId) => {
        host.innerHTML = "";

        if (lines.length === 0) {
            host.innerHTML = "<article class='shop-note-card'><h3>No order details found</h3><p>Your payment is successful. Downloads appear here after the order is confirmed.</p></article>";
            return;
        }

        const summary = document.createElement("div");
        summary.className = "success-order-grid";

        lines.forEach((item) => {
            const card = document.createElement("article");
            card.className = "success-order-item";
            card.innerHTML = `
                <div>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Paid: ${ShopCore.toCurrency(item.price * item.quantity)}</p>
                </div>
            `;
            card.appendChild(renderDownloadButton(item, sessionId));
            summary.appendChild(card);
        });

        host.appendChild(summary);
    };

    const init = async () => {
        try {
            if (checkoutSessionId) {
                const remoteLines = await fetchProtectedDownloads(checkoutSessionId);
                if (remoteLines.length > 0) {
                    lines = remoteLines;
                }
            }
        } catch (_error) {
            // Keep local fallback summary when protected endpoint is not ready.
        }

        renderSummary(checkoutSessionId);

        if (downloadAll) {
            downloadAll.addEventListener("click", async () => {
                if (!checkoutSessionId) {
                    alert("Download links will be available after order confirmation.");
                    return;
                }

                try {
                    const response = await fetch(`${apiBase}/api/orders/${encodeURIComponent(checkoutSessionId)}/downloads/all`);
                    const payload = await response.json().catch(() => ({}));
                    if (!response.ok || !payload.url) {
                        throw new Error(payload.error || "Batch download is not available yet.");
                    }
                    window.location.href = payload.url;
                } catch (error) {
                    alert(error instanceof Error ? error.message : "Batch download is not available yet.");
                }
            });
        }

        ShopCore.clearCart();
    };

    init();
})();
