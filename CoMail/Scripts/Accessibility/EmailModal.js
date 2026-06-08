var CoMail;
(function (CoMail) {
    var emailModalRoot = null;
    var restoreFocusTo = null;
    var closeRequestHandler = null;
    var initialized = false;

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
        document.documentElement.classList.add("is-clipped");
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

        emailModalRoot.classList.remove("is-active");
        emailModalRoot.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("is-clipped");
        resetScrollPosition();
        scheduleScrollReset();

        if (restoreFocusTo !== null && typeof restoreFocusTo.focus === "function") {
            restoreFocusTo.focus();
        }

        restoreFocusTo = null;
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

    CoMail.InitializeEmailModal = InitializeEmailModal;
    CoMail.OpenEmailModal = OpenEmailModal;
    CoMail.CloseEmailModal = CloseEmailModal;
})(CoMail || (CoMail = {}));
