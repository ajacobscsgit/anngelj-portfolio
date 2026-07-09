(function () {
    // Reusable configuration constants for current provider setup.
    // Replace these endpoint placeholders with your real provider URLs.
    var CONTACT_FORM_ENDPOINT = "https://formspree.io/f/mqevvpjk";
    var SERVICE_FORM_ENDPOINT = "https://formspree.io/f/mzdllewe";

    // Keep provider switch centralized so implementation can move from Formspree to Supabase later.
    var BACKEND_PROVIDER = "formspree";

    var serviceSelect = document.getElementById("service-requested");

    function collectFormData(form) {
        var formData = new FormData(form);
        var data = {};

        formData.forEach(function (value, key) {
            data[key] = typeof value === "string" ? value.trim() : value;
        });

        return data;
    }

    function validateForm(form) {
        var requiredFields = form.querySelectorAll("[required]");
        var isValid = true;
        var firstInvalidField = null;

        requiredFields.forEach(function (field) {
            var value = field.value.trim();
            field.classList.remove("field-error");

            if (!value) {
                isValid = false;
                field.classList.add("field-error");
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }

            if (field.type === "email" && value && !field.validity.valid) {
                isValid = false;
                field.classList.add("field-error");
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });

        return {
            isValid: isValid,
            firstInvalidField: firstInvalidField
        };
    }

    function resolveSubmissionEndpoint(formType) {
        if (formType === "contact") {
            return CONTACT_FORM_ENDPOINT;
        }

        if (formType === "service" || formType === "launch") {
            return SERVICE_FORM_ENDPOINT;
        }

        return CONTACT_FORM_ENDPOINT;
    }

    function resolveContactEmailHint(formType) {
        if (formType === "contact") {
            return "hello@anngelj.com";
        }

        if (formType === "service" || formType === "launch") {
            return "services@anngelj.com";
        }

        return "hello@anngelj.com";
    }

    function resolveThankYouType(formType) {
        if (formType === "contact") {
            return "contact";
        }

        if (formType === "service") {
            return "service";
        }

        if (formType === "launch") {
            return "launch";
        }

        return "default";
    }

    function getCurrentPageName() {
        var path = window.location.pathname || "";
        var segments = path.split("/").filter(Boolean);
        return segments.length ? segments[segments.length - 1] : "index.html";
    }

    function setHiddenField(form, name, value) {
        var field = form.querySelector("input[name='" + name + "']");
        if (!field) {
            return;
        }

        field.value = value;
    }

    function syncFormMetadata(form, formType) {
        var serviceFromQuery = new URLSearchParams(window.location.search).get("service") || "";
        var selectedService = serviceSelect ? serviceSelect.value : "";

        setHiddenField(form, "source_page", getCurrentPageName());

        if (formType === "service") {
            setHiddenField(form, "service_requested", selectedService || serviceFromQuery || "unspecified-service");
        } else if (formType === "launch") {
            setHiddenField(form, "service_requested", "launch-promotion");
        } else {
            setHiddenField(form, "service_requested", "general-inquiry");
        }
    }

    async function postToFormspree(endpoint, data) {
        var response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        var payload = {};
        try {
            payload = await response.json();
        } catch (error) {
            payload = {};
        }

        if (!response.ok) {
            throw new Error(payload.error || "Form submission failed");
        }

        return payload;
    }

    async function postToSupabase(endpoint, data) {
        // TODO: Add Supabase insert logic when backend provider is switched.
        // Never place secret keys in frontend code. Use only publishable/anon keys.
        var response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Supabase submission failed");
        }

        return {};
    }

    async function submitForm(formType, data) {
        var endpoint = resolveSubmissionEndpoint(formType);

        // TODO: backend provider can be switched between Formspree and Supabase.
        // Never place secret/private API keys in frontend code.
        // If using Supabase, only use publishable/anon keys in frontend.

        if (!endpoint || endpoint.indexOf("_ENDPOINT") >= 0) {
            throw new Error("Missing form endpoint configuration");
        }

        var payload;
        if (BACKEND_PROVIDER === "supabase") {
            payload = await postToSupabase(endpoint, data);
        } else {
            payload = await postToFormspree(endpoint, data);
        }

        return {
            ok: true,
            payload: payload,
            destination: resolveContactEmailHint(formType)
        };
    }

    function redirectToThankYou(type) {
        var safeType = type || "default";
        window.location.href = "thank-you.html?type=" + encodeURIComponent(safeType);
    }

    function showError(form, message) {
        var errorContainer = form.querySelector("[data-form-error]");
        if (!errorContainer) {
            return;
        }

        errorContainer.textContent = message;
        errorContainer.classList.remove("success");
        errorContainer.classList.add("visible");
    }

    function showSuccess(form, message) {
        var errorContainer = form.querySelector("[data-form-error]");
        if (!errorContainer) {
            return;
        }

        errorContainer.textContent = message;
        errorContainer.classList.add("visible");
        errorContainer.classList.add("success");
    }

    function clearError(form) {
        var errorContainer = form.querySelector("[data-form-error]");
        if (!errorContainer) {
            return;
        }

        errorContainer.textContent = "";
        errorContainer.classList.remove("visible");
        errorContainer.classList.remove("success");
    }

    function setLoadingState(form, isLoading) {
        var submitButton = form.querySelector("button[type='submit']");
        if (!submitButton) {
            return;
        }

        var defaultLabel = submitButton.getAttribute("data-submit-label") || "Submit";
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? "Sending..." : defaultLabel;
    }

    function prefillServiceFromQuery() {
        if (!serviceSelect) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var serviceFromQuery = params.get("service");

        if (!serviceFromQuery) {
            return;
        }

        var matchingOption = serviceSelect.querySelector("option[value='" + serviceFromQuery + "']");
        if (matchingOption) {
            serviceSelect.value = serviceFromQuery;
        }
    }

    function setupFormSubmission(form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            clearError(form);

            var validation = validateForm(form);
            if (!validation.isValid) {
                showError(form, "Please complete all required fields before submitting.");
                if (validation.firstInvalidField) {
                    validation.firstInvalidField.focus();
                }
                return;
            }

            var formType = form.getAttribute("data-form-type") || "default";
            var thankYouType = resolveThankYouType(formType);
            syncFormMetadata(form, formType);
            var data = collectFormData(form);

            try {
                setLoadingState(form, true);
                var response = await submitForm(formType, data);

                if (!response.ok) {
                    throw new Error("Submission failed");
                }

                showSuccess(form, "Submission received. Redirecting...");
                window.setTimeout(function () {
                    redirectToThankYou(thankYouType);
                }, 350);
            } catch (error) {
                showError(form, "Something went wrong while submitting. Please verify your details and try again.");
            } finally {
                setLoadingState(form, false);
            }
        });
    }

    function init() {
        prefillServiceFromQuery();

        var forms = document.querySelectorAll("form[data-form-type]");
        forms.forEach(function (form) {
            setupFormSubmission(form);
        });
    }

    document.addEventListener("DOMContentLoaded", init);
}());
