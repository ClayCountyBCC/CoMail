var CoMail;
(function (CoMail) {
    CoMail.mailboxes = [];
    CoMail.currentEmailList = [];
    CoMail.currentHash = null;
    CoMail.currentEmailCount = 0;
    CoMail.currentSection = "county";
    CoMail.siteState = null;
    CoMail.shouldAutoSelectFirstEmail = false;

    var loadingOperations = 0;
    var mailboxDrawerInitialized = false;
    var mailboxDrawerCollapsed = false;
    var mailboxDrawerStorageKey = "CoMail.MailboxDrawerCollapsed";
    var administrativeModalInitialized = false;
    var administrativeModalReturnFocus = null;

    function Start() {
        loadingOperations = 0;
        CoMail.shouldAutoSelectFirstEmail = false;
        CoMail.Hide("Loading");
        SetLoadingModalState(false);
        UpdateEmailListDescriptions();
        CoMail.InitializeEmailModal(ModalClosed);
        InitializeMailboxDrawer();
        InitializeAdministrativeAccountsModal();
        window.onhashchange = HashChange;
        window.addEventListener("resize", ViewportChanged);
        GetMailBoxes();

        if (location.hash.substring(1).length === 0) {
            FocusBrandLink();
        }
    }
    CoMail.Start = Start;

    function UpdateEmailListDescriptions() {
        var isInternal = CoMail.siteState !== null && CoMail.siteState.IsInternalUser === true;

        var description = document.getElementById("EmailListDescription");
        if (description !== null) {
            description.textContent = isInternal
                ? "Internal email list for the selected mailbox. Ignored emails are marked with an Ignored badge. Each row shows the email date and sender on the first line, with the subject preview beneath. Move through the email rows or click or press Enter on a row to review the full message."
                : "Public email list for the selected mailbox. Each row shows the email date and sender on the first line, with the subject preview beneath. Move through the email rows or click or press Enter on a row to review the full message.";
        }

        var caption = document.querySelector(".email-table caption");
        if (caption !== null) {
            caption.textContent = isInternal
                ? "Internal emails in the selected mailbox"
                : "Public emails in the selected mailbox";
        }
    }

    function ModalClosed(evt) {
        if (evt !== undefined && evt !== null) {
            evt.preventDefault();
        }

        if (CoMail.currentHash !== null) {
            location.hash = CoMail.currentHash.RemoveEmailId();
        }

        var emailMessage = document.getElementById("EmailMessage");
        CoMail.clearElement(emailMessage);
        CoMail.CloseEmailModal();
    }
    CoMail.ModalClosed = ModalClosed;

    function HashChange() {
        HandleHash();
    }
    CoMail.HashChange = HashChange;

    function ViewportChanged() {
        if (CoMail.SyncFormerCommissionerDistricts !== undefined) {
            CoMail.SyncFormerCommissionerDistricts();
        }

        SyncMailboxDrawer();

        if (CoMail.currentHash === null) {
            return;
        }

        UpdateArchiveVisibility(CoMail.currentHash, false);

        if (CoMail.currentHash.EmailId > -1) {
            GetEmail(CoMail.currentHash.EmailId);
        }
    }

    function HandleHash() {
        var oldHash = CoMail.currentHash;
        CoMail.currentHash = new CoMail.LocationHash(location.hash.substring(1));
        CoMail.currentSection = CoMail.currentHash.Section;
        ShowMenu(CoMail.currentHash, oldHash);
    }

    function ShowMenu(lh, oh) {
        if (lh.Mailbox.length === 0) {
            UpdateArchiveVisibility(lh, true);
            CoMail.CloseEmailModal();
        }
        else {
            if (HasMailboxViewChanged(lh, oh)) {
                CoMail.UpdateMailboxName(lh.Mailbox);
                GetEmailList(CoMail.currentHash);
                GetEmailCount(CoMail.currentHash);
            }

            CoMail.UpdateReturnLink(lh.Section);
            UpdateArchiveVisibility(lh, false);

            if (lh.EmailId < 0) {
                CoMail.CloseEmailModal();
                if (CoMail.ClearEmailPreview !== undefined) {
                    CoMail.ClearEmailPreview();
                }
                FocusMailboxName();
            }
        }

        if (lh.EmailId > -1) {
            GetEmail(lh.EmailId);
        }
    }

    function UpdateArchiveVisibility(lh, resetSelectionState) {
        var wideLayout = IsWideArchiveLayout();

        if (lh.Mailbox.length === 0) {
            document.body.classList.remove("mailbox-view-open");
            document.documentElement.classList.remove("mailbox-view-open");

            if (resetSelectionState) {
                CoMail.ResetMailboxView();
            }

            CoMail.SetCommissionerSection(lh.Section);
            CoMail.Show("MailboxList");
            CoMail.Hide("MailboxView");
            SetArchiveModalState(false);
            SyncMailboxDrawer();
            window.scrollTo(0, 0);
            return;
        }

        document.body.classList.add("mailbox-view-open");
        document.documentElement.classList.add("mailbox-view-open");

        CoMail.Show("MailboxView");
        SetArchiveModalState(!wideLayout);

        var mailboxView = document.getElementById("MailboxView");
        if (mailboxView !== null) {
            mailboxView.scrollTop = 0;
        }

        if (wideLayout) {
            CoMail.Show("MailboxList");
        }
        else {
            CoMail.Hide("MailboxList");
        }

        SyncMailboxDrawer();

        if (!wideLayout) {
            window.scrollTo(0, 0);
        }
    }

    function FocusMailboxName() {
        var mailboxName = document.getElementById("MailboxName");
        if (mailboxName === null || typeof mailboxName.focus !== "function") {
            return;
        }

        try {
            mailboxName.focus({ preventScroll: true });
        }
        catch (err) {
            mailboxName.focus();
        }
    }

    function FocusBrandLink() {
        var brandLink = document.getElementById("SiteBrandLink");
        if (brandLink === null || typeof brandLink.focus !== "function") {
            return;
        }

        if (typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(function () {
                try {
                    brandLink.focus({ preventScroll: true });
                }
                catch (err) {
                    brandLink.focus();
                }
            });
            return;
        }

        try {
            brandLink.focus({ preventScroll: true });
        }
        catch (err) {
            brandLink.focus();
        }
    }

    function SetArchiveModalState(isOpen) {
        document.body.classList.toggle("archive-modal-open", isOpen);
        document.documentElement.classList.toggle("archive-modal-open", isOpen);
    }

    function IsWideArchiveLayout() {
        if (window.matchMedia === undefined) {
            return true;
        }

        return window.matchMedia("(min-width: 769px)").matches;
    }

    function IsDrawerLayout() {
        if (window.matchMedia === undefined) {
            return true;
        }

        return window.matchMedia("(min-width: 1024px)").matches;
    }

    function InitializeMailboxDrawer() {
        var toggle = document.getElementById("MailboxDrawerToggle");
        mailboxDrawerCollapsed = ReadMailboxDrawerPreference();

        if (toggle !== null && !mailboxDrawerInitialized) {
            toggle.addEventListener("click", function () {
                SetMailboxDrawerCollapsed(!mailboxDrawerCollapsed, true);
            });
            mailboxDrawerInitialized = true;
        }

        SyncMailboxDrawer();
    }

    function SyncMailboxDrawer() {
        var toggle = document.getElementById("MailboxDrawerToggle");
        var drawer = document.getElementById("MailboxList");
        var drawerLayout = IsDrawerLayout();

        if (toggle !== null) {
            toggle.hidden = !drawerLayout;
        }

        document.body.classList.toggle("mailbox-drawer-available", drawerLayout);
        SetMailboxDrawerCollapsed(mailboxDrawerCollapsed, false);

        if (drawer !== null && !drawerLayout && !drawer.hidden) {
            drawer.setAttribute("aria-hidden", "false");
        }
    }

    function SetMailboxDrawerCollapsed(isCollapsed, persist) {
        var toggle = document.getElementById("MailboxDrawerToggle");
        var drawer = document.getElementById("MailboxList");
        var drawerLayout = IsDrawerLayout();

        mailboxDrawerCollapsed = isCollapsed;
        document.body.classList.toggle("mailbox-drawer-collapsed", drawerLayout && isCollapsed);

        if (toggle !== null) {
            toggle.setAttribute("aria-expanded", drawerLayout && !isCollapsed ? "true" : "false");
            toggle.setAttribute("aria-label", isCollapsed ? "Show commissioner selection" : "Hide commissioner selection");
        }

        if (drawer !== null && drawerLayout && !drawer.hidden) {
            drawer.setAttribute("aria-hidden", isCollapsed ? "true" : "false");
        }

        if (persist) {
            SaveMailboxDrawerPreference(isCollapsed);
        }
    }

    function ReadMailboxDrawerPreference() {
        try {
            return window.localStorage.getItem(mailboxDrawerStorageKey) === "true";
        }
        catch (err) {
            return false;
        }
    }

    function SaveMailboxDrawerPreference(isCollapsed) {
        try {
            window.localStorage.setItem(mailboxDrawerStorageKey, isCollapsed ? "true" : "false");
        }
        catch (err) {
            // Preference persistence is helpful, but not required for the drawer to work.
        }
    }

    function InitializeAdministrativeAccountsModal() {
        if (administrativeModalInitialized) {
            return;
        }

        var openButton = document.getElementById("AdministrativeAccountsButton");
        var modal = document.getElementById("AdministrativeAccountsModal");
        if (openButton === null || modal === null) {
            return;
        }

        openButton.addEventListener("click", OpenAdministrativeAccountsModal);

        var closeButtons = modal.querySelectorAll("[data-administrative-modal-close]");
        for (var i = 0; i < closeButtons.length; i++) {
            closeButtons[i].addEventListener("click", CloseAdministrativeAccountsModal);
        }

        modal.addEventListener("keydown", HandleAdministrativeAccountsModalKeydown);
        administrativeModalInitialized = true;
    }

    function OpenAdministrativeAccountsModal() {
        var modal = document.getElementById("AdministrativeAccountsModal");
        if (modal === null) {
            return;
        }

        var active = document.activeElement;
        administrativeModalReturnFocus = active instanceof HTMLElement ? active : null;

        modal.hidden = false;
        modal.classList.add("is-active");
        modal.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add("is-clipped");

        var close = modal.querySelector("button[data-administrative-modal-close]");
        if (close !== null && typeof close.focus === "function") {
            close.focus();
        }
    }

    function CloseAdministrativeAccountsModal(evt) {
        if (evt !== undefined && evt !== null) {
            evt.preventDefault();
        }

        var modal = document.getElementById("AdministrativeAccountsModal");
        if (modal === null) {
            return;
        }

        modal.classList.remove("is-active");
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("is-clipped");

        if (administrativeModalReturnFocus !== null &&
            typeof administrativeModalReturnFocus.focus === "function") {
            administrativeModalReturnFocus.focus();
        }

        administrativeModalReturnFocus = null;
    }

    function HandleAdministrativeAccountsModalKeydown(evt) {
        if (evt.key === "Escape") {
            CloseAdministrativeAccountsModal(evt);
            return;
        }

        if (evt.key !== "Tab") {
            return;
        }

        var modal = document.getElementById("AdministrativeAccountsModal");
        if (modal === null || !modal.classList.contains("is-active")) {
            return;
        }

        var focusable = modal.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])");
        if (focusable.length === 0) {
            return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        var active = document.activeElement;

        if (evt.shiftKey && active === first) {
            evt.preventDefault();
            last.focus();
        }
        else if (!evt.shiftKey && active === last) {
            evt.preventDefault();
            first.focus();
        }
    }

    function HasMailboxViewChanged(lh, oh) {
        if (oh === null) {
            return true;
        }

        return oh.Mailbox !== lh.Mailbox ||
            oh.Page !== lh.Page ||
            oh.Subject !== lh.Subject ||
            oh.From !== lh.From;
    }

    function GetEmail(emailId) {
        BeginLoading();
        var email = new CoMail.Email();
        var mailboxName = CoMail.currentHash === null ? "" : CoMail.currentHash.Mailbox;
        email.Get(emailId, mailboxName)
            .then(function (mail) {
                try {
                    if (mail === null || mail === undefined) {
                        if (IsWideArchiveLayout() && CoMail.ShowEmailPreviewStatus !== undefined) {
                            CoMail.ShowEmailPreviewStatus("Email unavailable", "The selected email could not be loaded.");
                        }

                        return;
                    }

                    if (IsWideArchiveLayout()) {
                        CoMail.BuildEmailPreview(mail);
                        CoMail.CloseEmailModal();
                    }
                    else {
                        CoMail.BuildEmailView(mail);
                        CoMail.OpenEmailModal();
                    }

                    if (CoMail.SelectEmailRow !== undefined) {
                        CoMail.SelectEmailRow(emailId);
                    }
                    else if (CoMail.HighlightSelectedEmail !== undefined) {
                        CoMail.HighlightSelectedEmail(emailId);
                    }
                }
                finally {
                    EndLoading();
                }
            }, function () {
                console.log("error getting Email");
                if (IsWideArchiveLayout() && CoMail.ShowEmailPreviewStatus !== undefined) {
                    CoMail.ShowEmailPreviewStatus("Email unavailable", "The selected email could not be loaded.");
                }
                EndLoading();
            });
    }

    function GetEmailList(lh) {
        BeginLoading();
        CoMail.ClearEmailList();
        if (CoMail.ClearEmailPreview !== undefined && lh.EmailId < 0) {
            CoMail.ClearEmailPreview();
        }

        var email = new CoMail.Email();
        email.GetList(lh)
            .then(function (allmail) {
                try {
                    if (!IsCurrentMailboxRequest(lh)) {
                        return;
                    }

                    CoMail.currentEmailList = allmail || [];
                    CoMail.BuildEmailList();
                    if (SelectFirstEmailIfNeeded(lh)) {
                        return;
                    }

                    if (CoMail.SelectCurrentEmailRow !== undefined) {
                        CoMail.SelectCurrentEmailRow();
                        if (typeof window.requestAnimationFrame === "function") {
                            window.requestAnimationFrame(function () {
                                if (CoMail.SelectCurrentEmailRow !== undefined) {
                                    CoMail.SelectCurrentEmailRow();
                                }
                            });
                        }
                    }
                    else if (CoMail.HighlightSelectedEmail !== undefined && CoMail.currentHash !== null) {
                        CoMail.HighlightSelectedEmail(CoMail.currentHash.EmailId);
                    }
                }
                finally {
                    EndLoading();
                }
            }, function () {
                console.log("error getting Email List");
                EndLoading();
            });
    }

    function IsCurrentMailboxRequest(lh) {
        return CoMail.currentHash !== null &&
            CoMail.currentHash.Section === lh.Section &&
            CoMail.currentHash.Mailbox === lh.Mailbox &&
            CoMail.currentHash.Page === lh.Page &&
            CoMail.currentHash.Subject === lh.Subject &&
            CoMail.currentHash.From === lh.From;
    }

    function SelectFirstEmailIfNeeded(lh) {
        var shouldAutoSelect = CoMail.shouldAutoSelectFirstEmail ||
            (IsWideArchiveLayout() && lh.Mailbox.length > 0 && lh.EmailId < 0);

        if (!IsCurrentMailboxRequest(lh) || !shouldAutoSelect) {
            return false;
        }

        CoMail.shouldAutoSelectFirstEmail = false;

        if (lh.EmailId > -1 || CoMail.currentEmailList.length === 0) {
            return false;
        }

        var firstEmail = CoMail.currentEmailList[0];
        if (firstEmail === null || firstEmail === undefined || firstEmail.Id === undefined || firstEmail.Id === null) {
            return false;
        }

        location.hash = CoMail.currentHash.AddEmailId(firstEmail.Id);
        return true;
    }

    function GetEmailCount(lh) {
        var email = new CoMail.Email();
        email.GetCount(lh)
            .then(function (emailCount) {
                CoMail.currentEmailCount = emailCount;
                BuildPaging();
            }, function () {
                console.log("error getting Email Count");
            });
    }

    function ToggleEmailIgnore(emailId, ignore) {
        if (CoMail.ConfigureEmailIgnoreAction !== undefined) {
            CoMail.ConfigureEmailIgnoreAction({ Id: emailId, Ignore: !ignore }, true);
        }

        BeginLoading();
        var email = new CoMail.Email();
        email.SetIgnoreFamily(emailId, ignore)
            .then(function () {
                try {
                    if (CoMail.ConfigureEmailIgnoreAction !== undefined) {
                        CoMail.ConfigureEmailIgnoreAction({ Id: emailId, Ignore: ignore }, false);
                    }

                    if (CoMail.currentHash !== null) {
                        GetEmailList(CoMail.currentHash);
                        GetEmailCount(CoMail.currentHash);
                        if (CoMail.currentHash.EmailId === emailId) {
                            GetEmail(emailId);
                        }
                    }
                }
                finally {
                    EndLoading();
                }
            }, function (error) {
                console.log("error updating Email Ignore", error && error.Text ? error.Text : error);
                if (CoMail.ConfigureEmailIgnoreAction !== undefined) {
                    CoMail.ConfigureEmailIgnoreAction({ Id: emailId, Ignore: !ignore }, false);
                }
                EndLoading();
            });
    }
    CoMail.ToggleEmailIgnore = ToggleEmailIgnore;

    function BuildPaging() {
        if (CoMail.currentHash === null) {
            return;
        }

        var totalPageCount = document.getElementById("TotalPageCount");
        if (totalPageCount !== null) {
            CoMail.clearElement(totalPageCount);
            var max = Math.max(Math.ceil(CoMail.currentEmailCount / CoMail.PageSize), 1);
            totalPageCount.textContent = "Page " + CoMail.currentHash.Page + " of " + max;

            var prev = document.getElementById("PreviousPage");
            UpdatePage(prev, CoMail.currentHash.Page - 1, max);

            var next = document.getElementById("NextPage");
            UpdatePage(next, CoMail.currentHash.Page + 1, max);
        }
    }

    function UpdatePage(a, page, max) {
        if (a === null) {
            return;
        }

        var disabled = page < 1 || page > max;
        a.classList.toggle("is-disabled", disabled);
        a.setAttribute("aria-disabled", disabled ? "true" : "false");
        a.tabIndex = disabled ? -1 : 0;

        if (disabled) {
            a.href = location.hash || "#";
            a.onclick = function (evt) {
                evt.preventDefault();
                return false;
            };
            return;
        }

        a.onclick = function () {
            CoMail.shouldAutoSelectFirstEmail = true;
        };
        a.href = "#" + CoMail.currentHash.RemoveEmailId();

        if (a.href.indexOf("page=") > -1) {
            a.href = a.href.replace("page=" + CoMail.currentHash.Page, "page=" + page);
        }
        else {
            a.href += "&page=" + page;
        }
    }

    function GetMailBoxes() {
        BeginLoading();
        var mb = new CoMail.PublicMailBox();
        mb.Get()
            .then(function (all) {
                try {
                    CoMail.mailboxes = all;
                    if (location.hash.substring(1).length > 0) {
                        var initialHash = new CoMail.LocationHash(location.hash.substring(1));
                        CoMail.currentSection = initialHash.Section;
                    }

                    CoMail.BuildMailboxes();
                    SyncMailboxDrawer();
                }
                finally {
                    EndLoading();
                }

                if (location.hash.substring(1).length > 0) {
                    HandleHash();
                }
            }, function () {
                console.log("error getting All Mailboxes");
                EndLoading();
            });
    }

    function BeginLoading() {
        if (loadingOperations === 0) {
            CoMail.Show("Loading");
            SetLoadingModalState(true);
        }

        loadingOperations++;
    }

    function EndLoading() {
        if (loadingOperations > 0) {
            loadingOperations--;
        }

        if (loadingOperations === 0) {
            CoMail.Hide("Loading");
            SetLoadingModalState(false);
        }
    }

    function SetLoadingModalState(isOpen) {
        document.body.classList.toggle("loading-modal-open", isOpen);
        document.documentElement.classList.toggle("loading-modal-open", isOpen);
        var main = document.getElementById("main-content");
        if (main !== null) {
            if (isOpen) {
                main.setAttribute("aria-busy", "true");
            }
            else {
                main.removeAttribute("aria-busy");
            }
        }
    }
})(CoMail || (CoMail = {}));
