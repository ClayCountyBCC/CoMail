var CoMail;
(function (CoMail) {
    var emailModalRoot = null;
    var restoreFocusTo = null;
    var closeRequestHandler = null;
    var initialized = false;
    var inlineImageModalRoot = null;
    var inlineImageRestoreFocusTo = null;
    var inlineImageInitialized = false;

    function InitializeEmailModal(onCloseRequest) {
        closeRequestHandler = onCloseRequest;
        emailModalRoot = document.getElementById("EmailView");

        if (initialized || emailModalRoot === null) {
            return;
        }

        var closeTargets = emailModalRoot.querySelectorAll("[data-email-modal-close]");
        for (var i = 0; i < closeTargets.length; i++) {
            closeTargets[i].addEventListener("click", handleCloseRequest);
        }

        emailModalRoot.addEventListener("keydown", handleKeyDown);
        emailModalRoot.setAttribute("aria-hidden", "true");
        initialized = true;
    }

    function InitializeInlineImageModal() {
        inlineImageModalRoot = document.getElementById("InlineImageModal");

        if (inlineImageInitialized || inlineImageModalRoot === null) {
            return;
        }

        var closeTargets = inlineImageModalRoot.querySelectorAll("[data-inline-image-modal-close]");
        for (var i = 0; i < closeTargets.length; i++) {
            closeTargets[i].addEventListener("click", handleInlineImageCloseRequest);
        }

        inlineImageModalRoot.addEventListener("keydown", handleInlineImageKeyDown);
        inlineImageModalRoot.setAttribute("aria-hidden", "true");
        inlineImageInitialized = true;
    }

    function OpenEmailModal() {
        if (emailModalRoot === null) {
            InitializeEmailModal(closeRequestHandler);
        }

        if (emailModalRoot === null) {
            return;
        }

        var activeElement = document.activeElement;
        restoreFocusTo = activeElement instanceof HTMLElement ? activeElement : null;

        resetScrollPosition();

        emailModalRoot.classList.add("is-active");
        emailModalRoot.setAttribute("aria-hidden", "false");
        UpdateModalClippingState();
        resetScrollPosition();
        scheduleScrollReset();

        var focusTarget = emailModalRoot.querySelector("[data-email-modal-initial-focus]");
        if (focusTarget === null) {
            focusTarget = getFocusableElements(emailModalRoot)[0];
        }

        if (focusTarget !== undefined && focusTarget !== null) {
            if (typeof focusTarget.focus === "function") {
                try {
                    focusTarget.focus({ preventScroll: true });
                }
                catch (err) {
                    focusTarget.focus();
                }
            }
        }
    }

    function CloseEmailModal() {
        if (emailModalRoot === null) {
            return;
        }

        CloseInlineImageModal(null, true);
        emailModalRoot.classList.remove("is-active");
        emailModalRoot.setAttribute("aria-hidden", "true");
        UpdateModalClippingState();
        resetScrollPosition();
        scheduleScrollReset();

        if (restoreFocusTo !== null && typeof restoreFocusTo.focus === "function") {
            restoreFocusTo.focus();
        }

        restoreFocusTo = null;
    }

    function OpenInlineImageModal(attachment, triggerElement) {
        if (attachment === null || attachment === undefined) {
            return;
        }

        if (inlineImageModalRoot === null) {
            InitializeInlineImageModal();
        }

        if (inlineImageModalRoot === null) {
            return;
        }

        inlineImageRestoreFocusTo = triggerElement instanceof HTMLElement ? triggerElement : (document.activeElement instanceof HTMLElement ? document.activeElement : null);

        var titleElement = inlineImageModalRoot.querySelector("#InlineImageModalTitle");
        var descriptionElement = inlineImageModalRoot.querySelector("#InlineImageModalDescription");
        var imageElement = inlineImageModalRoot.querySelector("#InlineImageModalImage");
        var captionElement = inlineImageModalRoot.querySelector("#InlineImageModalCaption");
        var downloadElement = inlineImageModalRoot.querySelector("#InlineImageModalDownload");
        var imageUrl = resolveAttachmentUrl(attachment);
        var filename = attachment.Filename || "Inline image";

        if (titleElement !== null) {
            titleElement.textContent = "Image Preview";
        }

        if (descriptionElement !== null) {
            descriptionElement.textContent = "Preview the inline image before deciding whether to download it.";
        }

        if (imageElement !== null) {
            imageElement.setAttribute("src", imageUrl);
            imageElement.setAttribute("alt", filename);
            imageElement.setAttribute("title", filename);
            imageElement.setAttribute("loading", "eager");
            imageElement.setAttribute("decoding", "async");
        }

        if (captionElement !== null) {
            captionElement.textContent = filename;
        }

        if (downloadElement !== null) {
            downloadElement.setAttribute("href", imageUrl);
            downloadElement.setAttribute("aria-label", "Download inline image " + filename);
        }

        inlineImageModalRoot.hidden = false;
        inlineImageModalRoot.classList.add("is-active");
        inlineImageModalRoot.setAttribute("aria-hidden", "false");
        UpdateModalClippingState();
        resetInlineImageScrollPosition();
        scheduleInlineImageScrollReset();

        var focusTarget = inlineImageModalRoot.querySelector("[data-inline-image-modal-initial-focus]");
        if (focusTarget === null) {
            focusTarget = getFocusableElements(inlineImageModalRoot)[0];
        }

        if (focusTarget !== undefined && focusTarget !== null && typeof focusTarget.focus === "function") {
            try {
                focusTarget.focus({ preventScroll: true });
            }
            catch (err) {
                focusTarget.focus();
            }
        }
    }

    function CloseInlineImageModal(evt, suppressRestoreFocus) {
        if (evt !== undefined && evt !== null) {
            evt.preventDefault();
        }

        if (inlineImageModalRoot === null) {
            return;
        }

        inlineImageModalRoot.classList.remove("is-active");
        inlineImageModalRoot.hidden = true;
        inlineImageModalRoot.setAttribute("aria-hidden", "true");

        var imageElement = inlineImageModalRoot.querySelector("#InlineImageModalImage");
        var downloadElement = inlineImageModalRoot.querySelector("#InlineImageModalDownload");
        if (imageElement !== null) {
            imageElement.removeAttribute("src");
            imageElement.removeAttribute("alt");
            imageElement.removeAttribute("title");
        }

        if (downloadElement !== null) {
            downloadElement.removeAttribute("href");
        }

        UpdateModalClippingState();
        resetInlineImageScrollPosition();
        scheduleInlineImageScrollReset();

        if (!suppressRestoreFocus && inlineImageRestoreFocusTo !== null && typeof inlineImageRestoreFocusTo.focus === "function") {
            inlineImageRestoreFocusTo.focus();
        }

        inlineImageRestoreFocusTo = null;
    }

    function handleInlineImageCloseRequest(evt) {
        evt.preventDefault();
        CloseInlineImageModal(evt, false);
    }

    function handleInlineImageKeyDown(evt) {
        if (inlineImageModalRoot === null || !inlineImageModalRoot.classList.contains("is-active")) {
            return;
        }

        if (evt.key === "Escape") {
            evt.preventDefault();
            CloseInlineImageModal(evt, false);
            return;
        }

        if (evt.key !== "Tab") {
            return;
        }

        var focusable = getFocusableElements(inlineImageModalRoot);
        if (focusable.length === 0) {
            return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        var active = document.activeElement;

        if (evt.shiftKey) {
            if (active === first) {
                evt.preventDefault();
                last.focus();
            }
        }
        else if (active === last) {
            evt.preventDefault();
            first.focus();
        }
    }

    function handleCloseRequest(evt) {
        evt.preventDefault();
        requestClose(evt);
    }

    function handleKeyDown(evt) {
        if (emailModalRoot === null || !emailModalRoot.classList.contains("is-active")) {
            return;
        }

        if (evt.key === "Escape") {
            evt.preventDefault();
            requestClose(evt);
            return;
        }

        if (evt.key !== "Tab") {
            return;
        }

        var focusable = getFocusableElements(emailModalRoot);
        if (focusable.length === 0) {
            return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        var active = document.activeElement;

        if (evt.shiftKey) {
            if (active === first) {
                evt.preventDefault();
                last.focus();
            }
        }
        else if (active === last) {
            evt.preventDefault();
            first.focus();
        }
    }

    function requestClose(evt) {
        if (closeRequestHandler !== null) {
            closeRequestHandler(evt);
            return;
        }

        CloseEmailModal();
    }

    function getFocusableElements(root) {
        var selectors = "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";
        var elements = root.querySelectorAll(selectors);
        var result = [];

        for (var i = 0; i < elements.length; i++) {
            var element = elements.item(i);
            if (element !== null) {
                result.push(element);
            }
        }

        return result;
    }

    function resetScrollPosition() {
        if (emailModalRoot === null) {
            return;
        }

        emailModalRoot.scrollTop = 0;

        var modalBody = emailModalRoot.querySelector(".modal-card-body");
        if (modalBody !== null) {
            modalBody.scrollTop = 0;

            var emailMessage = modalBody.querySelector(".email-message");
            if (emailMessage !== null) {
                emailMessage.scrollTop = 0;
            }
        }
    }

    function scheduleScrollReset() {
        if (typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(function () {
                resetScrollPosition();
            });
            return;
        }

        setTimeout(resetScrollPosition, 0);
    }

    function resetInlineImageScrollPosition() {
        if (inlineImageModalRoot === null) {
            return;
        }

        inlineImageModalRoot.scrollTop = 0;

        var modalBody = inlineImageModalRoot.querySelector(".modal-card-body");
        if (modalBody !== null) {
            modalBody.scrollTop = 0;
        }
    }

    function scheduleInlineImageScrollReset() {
        if (typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(function () {
                resetInlineImageScrollPosition();
            });
            return;
        }

        setTimeout(resetInlineImageScrollPosition, 0);
    }

    function resolveAttachmentUrl(attachment) {
        if (attachment === null || attachment === undefined) {
            return "";
        }

        if (CoMail.BuildAttachmentAccessUrl !== undefined) {
            return CoMail.BuildAttachmentAccessUrl(attachment.URL || "");
        }

        return attachment.URL || "";
    }

    function UpdateModalClippingState() {
        var emailModalActive = emailModalRoot !== null && emailModalRoot.classList.contains("is-active");
        var inlineImageModalActive = inlineImageModalRoot !== null && inlineImageModalRoot.classList.contains("is-active");
        var administrativeModal = document.getElementById("AdministrativeAccountsModal");
        var administrativeModalActive = administrativeModal !== null && administrativeModal.classList.contains("is-active");
        var isClipped = emailModalActive || inlineImageModalActive || administrativeModalActive;

        document.documentElement.classList.toggle("is-clipped", isClipped);
    }

    CoMail.InitializeEmailModal = InitializeEmailModal;
    CoMail.InitializeInlineImageModal = InitializeInlineImageModal;
    CoMail.OpenEmailModal = OpenEmailModal;
    CoMail.CloseEmailModal = CloseEmailModal;
    CoMail.OpenInlineImageModal = OpenInlineImageModal;
    CoMail.CloseInlineImageModal = CloseInlineImageModal;
    CoMail.UpdateModalClippingState = UpdateModalClippingState;
})(CoMail || (CoMail = {}));
