(() => {
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hasFinePointer) {
        return;
    }

    const selectors = [
        ".launch-portfolio-card img",
        ".about-arch-frame img",
        ".about-story-photo img",
        ".moment-grid img"
    ].join(", ");

    const targets = Array.from(document.querySelectorAll(selectors));
    if (!targets.length) {
        return;
    }

    let preview = null;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const removePreview = () => {
        if (!preview) {
            return;
        }

        preview.remove();
        preview = null;
    };

    const movePreview = (event) => {
        if (!preview) {
            return;
        }

        const rect = preview.getBoundingClientRect();
        const margin = 14;
        const rawX = event.clientX + 22;
        const rawY = event.clientY + 18;
        const x = clamp(rawX, margin, window.innerWidth - rect.width - margin);
        const y = clamp(rawY, margin, window.innerHeight - rect.height - margin);

        preview.style.left = `${x}px`;
        preview.style.top = `${y}px`;
    };

    const showPreview = (event) => {
        const source = event.currentTarget;
        if (!(source instanceof HTMLImageElement)) {
            return;
        }

        removePreview();

        preview = document.createElement("img");
        preview.className = "image-hover-preview";
        preview.src = source.currentSrc || source.src;
        preview.alt = source.alt || "Image preview";

        document.body.appendChild(preview);
        movePreview(event);

        window.requestAnimationFrame(() => {
            if (preview) {
                preview.classList.add("is-visible");
            }
        });
    };

    targets.forEach((image) => {
        image.addEventListener("mouseenter", showPreview);
        image.addEventListener("mousemove", movePreview);
        image.addEventListener("mouseleave", removePreview);
    });

    document.addEventListener("scroll", removePreview, { passive: true });
    window.addEventListener("blur", removePreview);
})();