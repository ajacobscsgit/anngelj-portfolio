(() => {
    const form = document.querySelector('form[data-form-type="launch"]');
    if (!form) {
        return;
    }

    const options = Array.from(form.querySelectorAll("[data-page-option]"));
    const hiddenField = form.querySelector("[data-requested-pages]");
    const helper = form.querySelector("[data-page-choice-help]");
    const errorNode = form.querySelector("[data-form-error]");

    if (!options.length || !hiddenField) {
        return;
    }

    const updateState = () => {
        const checked = options.filter((input) => input.checked);
        const selectedCount = checked.length;

        hiddenField.value = checked.map((input) => input.value).join(", ");

        options.forEach((input) => {
            const optionLabel = input.closest(".launch-choice-option");
            const shouldDisable = selectedCount >= 2 && !input.checked;

            input.disabled = shouldDisable;
            if (optionLabel) {
                optionLabel.classList.toggle("is-disabled", shouldDisable);
            }
        });

        if (helper) {
            helper.textContent = selectedCount === 2
                ? `Selected: ${hiddenField.value}`
                : "Select exactly two pages.";
        }
    };

    options.forEach((input) => {
        input.addEventListener("change", updateState);
    });

    form.addEventListener("submit", (event) => {
        const checked = options.filter((input) => input.checked);
        if (checked.length !== 2) {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (errorNode) {
                errorNode.textContent = "Please select exactly two page options before submitting.";
                errorNode.classList.add("visible");
                errorNode.classList.remove("success");
            }

            const firstOption = options[0];
            if (firstOption) {
                firstOption.focus();
            }
            return;
        }

        if (errorNode && errorNode.textContent.includes("select exactly two")) {
            errorNode.textContent = "";
            errorNode.classList.remove("visible");
        }
    });

    updateState();
})();