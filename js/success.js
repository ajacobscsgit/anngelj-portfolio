(() => {
    const host = document.querySelector("[data-success-order-list]");
    const downloadAllButton = document.querySelector("[data-download-all]");
    const emailNote = document.querySelector("[data-success-email-note]");

    if (!host) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const sessionId = String(
        params.get("session_id") ||
        params.get("sessionId") ||
        ""
    ).trim();

    const publicConfig = window.AJ_PUBLIC_CONFIG || {};
    const supabaseUrl = String(publicConfig.supabaseUrl || "").trim();
    const supabaseAnonKey = String(
        publicConfig.supabaseAnonKey ||
        publicConfig.SUPABASE_ANON_KEY ||
        ""
    ).trim();

    let downloads = [];

    function showMessage(title, message) {
        host.innerHTML = "";

        const card = document.createElement("article");
        card.className = "shop-note-card";

        const heading = document.createElement("h3");
        heading.textContent = title;

        const paragraph = document.createElement("p");
        paragraph.textContent = message;

        card.append(heading, paragraph);
        host.appendChild(card);
    }

    function createDownloadCard(item) {
        const card = document.createElement("article");
        card.className = "success-order-item";

        const content = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = item.name || "Digital Product";

        const details = document.createElement("p");
        const format = item.fileFormat || "Digital file";
        details.textContent =
            `${format} • Secure link expires in 1 hour`;

        if (Number(item.quantity) > 1) {
            const quantity = document.createElement("p");
            quantity.textContent = `Quantity: ${item.quantity}`;
            content.append(title, details, quantity);
        } else {
            content.append(title, details);
        }

        const link = document.createElement("a");
        link.className = "button primary-button";
        link.href = item.url;
        link.textContent = `Download ${item.name || "File"}`;
        link.rel = "noopener";
        link.setAttribute("download", "");

        card.append(content, link);
        return card;
    }

    function renderDownloads() {
        host.innerHTML = "";

        if (downloads.length === 0) {
            showMessage(
                "No files available",
                "No downloadable files are currently attached to this order."
            );
            return;
        }

        const grid = document.createElement("div");
        grid.className = "success-order-grid";

        downloads.forEach((item) => {
            grid.appendChild(createDownloadCard(item));
        });

        host.appendChild(grid);
    }

    async function requestDownloads() {
        if (!sessionId) {
            throw new Error(
                "No Stripe Checkout Session was found in this page URL."
            );
        }

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error(
                "The public Supabase configuration is missing."
            );
        }

        const endpoint =
            `${supabaseUrl}/functions/v1/get-order-downloads`;

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": supabaseAnonKey,
                "Authorization": `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({
                sessionId
            })
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                payload.error ||
                "Your downloads could not be prepared."
            );
        }

        if (!Array.isArray(payload.downloads)) {
            throw new Error(
                "The fulfillment service returned an invalid response."
            );
        }

        return payload;
    }

    function downloadAllFiles() {
        if (downloads.length === 0) {
            alert("No downloads are ready yet.");
            return;
        }

        downloads.forEach((item, index) => {
            window.setTimeout(() => {
                const link = document.createElement("a");
                link.href = item.url;
                link.rel = "noopener";
                link.setAttribute("download", "");
                document.body.appendChild(link);
                link.click();
                link.remove();
            }, index * 500);
        });
    }

    async function initialize() {
        showMessage(
            "Preparing your order",
            "Confirming payment and creating secure download links..."
        );

        if (downloadAllButton) {
            downloadAllButton.disabled = true;
        }

        try {
            const payload = await requestDownloads();

            downloads = payload.downloads;
            renderDownloads();

            if (emailNote) {
                emailNote.textContent = payload.customerEmail
                    ? `Payment confirmed for ${payload.customerEmail}. Your secure links expire in one hour.`
                    : "Payment confirmed. Your secure links expire in one hour.";
            }

            if (downloadAllButton) {
                downloadAllButton.disabled = false;
                downloadAllButton.addEventListener(
                    "click",
                    downloadAllFiles
                );
            }

            // Clear the cart only after paid-order verification succeeds.
            if (window.ShopCore?.clearCart) {
                window.ShopCore.clearCart();
            } else {
                localStorage.removeItem("shopCart");
            }

            sessionStorage.removeItem("aj-last-order");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Your files could not be prepared.";

            showMessage("Downloads not ready", message);

            if (emailNote) {
                emailNote.textContent =
                    "Your cart has not been cleared. Refresh shortly if your payment was just completed.";
            }

            if (downloadAllButton) {
                downloadAllButton.disabled = true;
            }
        }
    }

    initialize();
})();