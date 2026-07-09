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

    const lines = (() => {
        try {
            const stored = JSON.parse(sessionStorage.getItem("aj-last-order") || "[]");
            if (!Array.isArray(stored) || stored.length === 0) {
                return [];
            }
            return stored.map((item) => {
                const product = ShopCore.findProductById(item.id);
                return {
                    id: item.id,
                    title: item.title,
                    quantity: Number(item.quantity || 1),
                    price: Number(item.unitAmount || 0) / 100,
                    product
                };
            });
        } catch (error) {
            return [];
        }
    })();

    const renderDownloadButton = (item) => {
        const link = document.createElement("a");
        link.className = "button primary-button";
        link.href = "#";
        link.textContent = `Download ${item.title}`;
        link.addEventListener("click", (event) => {
            event.preventDefault();
            alert("Download delivery endpoint can be connected here after secure file hosting is configured.");
        });
        return link;
    };

    if (lines.length === 0) {
        host.innerHTML = "<article class='shop-note-card'><h3>No order details found</h3><p>Your payment is successful. Download links will appear here when checkout session details are available.</p></article>";
        return;
    }

    const summary = document.createElement("div");
    summary.className = "success-order-grid";

    lines.forEach((item) => {
        const card = document.createElement("article");
        card.className = "success-order-item";
        card.innerHTML = `
            <div>
                <h3>${item.title}</h3>
                <p>Quantity: ${item.quantity}</p>
                <p>Paid: ${ShopCore.toCurrency(item.price * item.quantity)}</p>
            </div>
        `;
        card.appendChild(renderDownloadButton(item));
        summary.appendChild(card);
    });

    host.appendChild(summary);
    if (downloadAll) {
        downloadAll.addEventListener("click", () => {
            alert("Batch download endpoint can be connected here once secure file storage is configured.");
        });
    }
    ShopCore.clearCart();
})();
