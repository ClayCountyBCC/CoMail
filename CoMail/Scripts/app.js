var CoMail;
(function (CoMail) {
    CoMail.mailboxes = [];
    CoMail.currentEmailList = [];
    CoMail.currentHash = null;
    CoMail.currentEmailCount = 0;
    CoMail.currentSection = "county";

    var loadingOperations = 0;

    function Start() {
        loadingOperations = 0;
        CoMail.Hide("Loading");
        SetLoadingModalState(false);
        CoMail.InitializeEmailModal(ModalClosed);
        window.onhashchange = HashChange;
        window.addEventListener("resize", ViewportChanged);
        GetMailBoxes();
    }
    CoMail.Start = Start;

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

        if (CoMail.currentHash === null) {
            return;
        }

        UpdateArchiveVisibility(CoMail.currentHash, false);
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
            }
        }

        if (lh.EmailId > -1) {
            GetEmail(lh.EmailId);
        }
    }

    function UpdateArchiveVisibility(lh, resetSelectionState) {
        var wideLayout = IsWideArchiveLayout();

        if (lh.Mailbox.length === 0) {
            if (resetSelectionState) {
                CoMail.ResetMailboxView();
            }

            CoMail.SetCommissionerSection(lh.Section);
            CoMail.Show("MailboxList");
            CoMail.Hide("MailboxView");
            SetArchiveModalState(false);
            window.scrollTo(0, 0);
            return;
        }

        CoMail.Show("MailboxView");
        SetArchiveModalState(wideLayout);

        var mailboxView = document.getElementById("MailboxView");
        if (mailboxView !== null) {
            mailboxView.scrollTop = 0;
        }

        CoMail.Hide("MailboxList");

        if (!wideLayout) {
            window.scrollTo(0, 0);
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
        email.Get(emailId)
            .then(function (mail) {
                try {
                    CoMail.BuildEmailView(mail);
                    CoMail.OpenEmailModal();
                }
                finally {
                    EndLoading();
                }
            }, function () {
                console.log("error getting Email");
                EndLoading();
            });
    }

    function GetEmailList(lh) {
        BeginLoading();
        CoMail.ClearEmailList();

        var email = new CoMail.Email();
        email.GetList(lh)
            .then(function (allmail) {
                try {
                    CoMail.currentEmailList = allmail;
                    CoMail.BuildEmailList();
                }
                finally {
                    EndLoading();
                }
            }, function () {
                console.log("error getting Email List");
                EndLoading();
            });
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

        a.onclick = null;
        a.href = location.hash;

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
    }
})(CoMail || (CoMail = {}));
