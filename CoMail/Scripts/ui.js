var CoMail;
(function (CoMail) {
    function BuildEmailView(e) {
        SetValue("EmailSubject", e.Subject);
        SetValue("EmailDateReceived", e.DateReceived_ToString);
        SetValue("EmailFrom", e.From);
        SetValue("EmailTo", e.To);
        SetValue("EmailCc", e.CC);

        var emailMessage = document.getElementById("EmailMessage");
        if (emailMessage !== null) {
            clearElement(emailMessage);

            var bodyWrapper = document.createElement("div");
            bodyWrapper.classList.add("email-body");

            var parser = new DOMParser();
            var parsed = parser.parseFromString(e.Body || "", "text/html");
            var html = parsed.body !== null && parsed.body.innerHTML.length > 0 ? parsed.body.innerHTML : (e.Body || "");
            bodyWrapper.innerHTML = html;

            emailMessage.appendChild(bodyWrapper);
        }

        AddAttachments(e.Attachments || []);
    }
    CoMail.BuildEmailView = BuildEmailView;

    function AddAttachments(attachments) {
        var attachmentContainer = document.getElementById("EmailAttachments");
        if (attachmentContainer === null) {
            return;
        }

        clearElement(attachmentContainer);

        if (attachments.length === 0) {
            var none = document.createElement("span");
            none.classList.add("has-text-grey");
            none.textContent = "None";
            attachmentContainer.appendChild(none);
            return;
        }

        var tags = document.createElement("div");
        tags.classList.add("tags");

        for (var i = 0; i < attachments.length; i++) {
            var a = attachments[i];
            var tag = document.createElement("a");
            tag.classList.add("tag", "is-link", "is-light", "attachment-tag");
            tag.href = a.URL;
            tag.setAttribute("aria-label", "Open attachment " + a.Filename);

            var icon = document.createElement("span");
            icon.classList.add("icon", "is-small");
            icon.setAttribute("aria-hidden", "true");
            icon.appendChild(CreatePaperclipIcon());

            var label = document.createElement("span");
            label.textContent = a.Filename;

            tag.appendChild(icon);
            tag.appendChild(label);
            tags.appendChild(tag);
        }

        attachmentContainer.appendChild(tags);
    }

    function SetValue(id, value) {
        var e = document.getElementById(id);
        if (e === null) {
            return;
        }

        e.textContent = value || "";
    }

    function UpdateMailboxName(mailboxName) {
        var mailbox = CoMail.mailboxes.filter(function (m) {
            return m.MailboxName === mailboxName;
        });

        var mailboxNameElement = document.getElementById("MailboxName");
        if (mailboxNameElement === null) {
            return;
        }

        mailboxNameElement.textContent = mailbox.length === 1 ? mailbox[0].Name : "";
    }
    CoMail.UpdateMailboxName = UpdateMailboxName;

    function ClearEmailList() {
        var emailList = document.getElementById("EmailList");
        if (emailList === null) {
            return null;
        }

        clearElement(emailList);
        return emailList;
    }
    CoMail.ClearEmailList = ClearEmailList;

    function BuildEmailList() {
        var emailList = ClearEmailList();
        if (emailList === null) {
            return;
        }

        var fragment = document.createDocumentFragment();

        for (var i = 0; i < CoMail.currentEmailList.length; i++) {
            var email = CoMail.currentEmailList[i];
            var emailHref = CoMail.currentHash === null ? "#" : "#" + CoMail.currentHash.AddEmailId(email.Id);

            var row = document.createElement("tr");
            row.classList.add("email-row", "email-row--clickable");
            row.addEventListener("click", CreateEmailRowClickHandler(emailHref));

            row.appendChild(CreateEmailDateCell(email.DateReceived_ToString, email.DateReceived_DateOnlyString));
            row.appendChild(CreateEmailListCell("email-from-cell", email.From));

            var subjectCell = CreateEmailListCell("email-subject-cell", email.Subject);
            subjectCell.title = email.Subject;
            row.appendChild(subjectCell);

            var actionCell = CreateEmailListCell("email-action-cell", "");
            actionCell.classList.add("has-text-centered");

            var viewButton = document.createElement("a");
            viewButton.classList.add("button", "is-link", "is-light", "is-small", "email-view-button");
            viewButton.href = emailHref;
            viewButton.setAttribute("aria-label", "View email: " + email.Subject);
            viewButton.setAttribute("aria-haspopup", "dialog");
            viewButton.setAttribute("aria-controls", "EmailView");

            var buttonIcon = document.createElement("span");
            buttonIcon.classList.add("icon", "is-small");
            buttonIcon.setAttribute("aria-hidden", "true");
            buttonIcon.appendChild(CreateEnvelopeIcon());

            var buttonLabel = document.createElement("span");
            buttonLabel.textContent = "View";

            viewButton.appendChild(buttonIcon);
            viewButton.appendChild(buttonLabel);
            actionCell.appendChild(viewButton);
            row.appendChild(actionCell);
            fragment.appendChild(row);
        }

        emailList.appendChild(fragment);
    }
    CoMail.BuildEmailList = BuildEmailList;

    function CreateEmailDateCell(fullText, mobileText) {
        var cell = document.createElement("td");
        cell.classList.add("email-date-cell");
        cell.title = fullText || mobileText || "";

        var desktopValue = document.createElement("span");
        desktopValue.classList.add("email-date-cell__full");
        desktopValue.textContent = fullText || "";

        var mobileValue = document.createElement("span");
        mobileValue.classList.add("email-date-cell__short");
        mobileValue.textContent = mobileText || fullText || "";

        cell.appendChild(desktopValue);
        cell.appendChild(mobileValue);
        return cell;
    }

    function CreateEmailListCell(className, text) {
        var cell = document.createElement("td");
        cell.classList.add(className);

        if (text !== null && text !== undefined && text.length > 0) {
            cell.textContent = text;
        }

        return cell;
    }

    function CreateEmailRowClickHandler(emailHref) {
        return function () {
            if (emailHref.length > 1) {
                location.hash = emailHref.substring(1);
            }
        };
    }

    function IsFormerCommissioner(title) {
        var normalizedTitle = (title || "").toLowerCase();
        return normalizedTitle.indexOf("commissioner") > -1;
    }

    function GetMailboxDistrict(mailbox) {
        if (mailbox === null || mailbox === undefined) {
            return 0;
        }

        var district = parseInt(mailbox.District, 10);
        if (!isNaN(district) && district > 0) {
            return district;
        }

        var title = mailbox.Title || "";
        var match = /District\s+(\d+)/i.exec(title);
        return match !== null ? parseInt(match[1], 10) || 0 : 0;
    }

    function GetMailboxFinalTermYear(mailbox) {
        if (mailbox === null || mailbox === undefined) {
            return 0;
        }

        var finalTermYear = parseInt(mailbox.FinalTermYear, 10);
        return isNaN(finalTermYear) ? 0 : finalTermYear;
    }

    function CompareFormerCommissioners(left, right) {
        var leftYear = GetMailboxFinalTermYear(left);
        var rightYear = GetMailboxFinalTermYear(right);

        if (leftYear !== rightYear) {
            return leftYear - rightYear;
        }

        var leftName = (left.Name || "").toLowerCase();
        var rightName = (right.Name || "").toLowerCase();
        if (leftName !== rightName) {
            return leftName.localeCompare(rightName);
        }

        var leftMailbox = (left.MailboxName || "").toLowerCase();
        var rightMailbox = (right.MailboxName || "").toLowerCase();
        return leftMailbox.localeCompare(rightMailbox);
    }

    function SetCommissionerSection(section) {
        var normalizedSection = NormalizeSection(section);
        CoMail.currentSection = normalizedSection;

        var county = document.getElementById("CountyCommissionersSection");
        var former = document.getElementById("FormerCommissionersSection");
        var countyButton = document.getElementById("CountyCommissionersButton");
        var formerButton = document.getElementById("FormerCommissionersButton");

        if (county !== null) {
            var countyHidden = normalizedSection !== "county";
            county.hidden = countyHidden;
            county.classList.toggle("is-hidden", countyHidden);
            county.setAttribute("aria-hidden", countyHidden ? "true" : "false");
            county.style.display = countyHidden ? "none" : "";
        }

        if (former !== null) {
            var formerHidden = normalizedSection !== "former";
            former.hidden = formerHidden;
            former.classList.toggle("is-hidden", formerHidden);
            former.setAttribute("aria-hidden", formerHidden ? "true" : "false");
            former.style.display = formerHidden ? "none" : "";
        }

        UpdateSectionButton(countyButton, normalizedSection === "county");
        UpdateSectionButton(formerButton, normalizedSection === "former");
    }
    CoMail.SetCommissionerSection = SetCommissionerSection;

    function UpdateReturnLink(section) {
        var link = document.getElementById("ReturnToSection");
        var close = document.getElementById("CloseMailboxView");
        if (link === null) {
            if (close !== null) {
                close.href = "#section=" + encodeURIComponent(NormalizeSection(section));
                close.setAttribute("aria-label", "Close mailbox archive");
            }
            return;
        }

        var normalizedSection = NormalizeSection(section);
        var href = "#section=" + encodeURIComponent(normalizedSection);
        link.href = href;
        link.textContent = normalizedSection === "former"
            ? "Return to Former Commissioners"
            : "Return to County Commissioners";
        link.setAttribute("aria-label", link.textContent);

        if (close !== null) {
            close.href = href;
            close.setAttribute("aria-label", "Close mailbox archive");
        }
    }
    CoMail.UpdateReturnLink = UpdateReturnLink;

    function ResetMailboxView() {
        SetValue("MailboxName", "");
        SetValue("TotalPageCount", "");

        var prev = document.getElementById("PreviousPage");
        if (prev !== null) {
            prev.href = "#";
            prev.classList.add("is-disabled");
            prev.setAttribute("aria-disabled", "true");
            prev.tabIndex = -1;
        }

        var next = document.getElementById("NextPage");
        if (next !== null) {
            next.href = "#";
            next.classList.add("is-disabled");
            next.setAttribute("aria-disabled", "true");
            next.tabIndex = -1;
        }

        clearElement(document.getElementById("EmailList"));
    }
    CoMail.ResetMailboxView = ResetMailboxView;

    function UpdateSectionButton(button, isSelected) {
        if (button === null) {
            return;
        }

        button.classList.toggle("is-active", isSelected);
        button.setAttribute("aria-selected", isSelected ? "true" : "false");
    }

    function NormalizeSection(section) {
        return (section || "").toLowerCase() === "former" ? "former" : "county";
    }

    function BuildMailboxes() {
        var commissioners = document.getElementById("Commissioners");
        var former = document.getElementById("FormerCommissioners");
        var other = document.getElementById("OtherPublic");
        var formerCommissioners = [];

        if (commissioners === null || former === null || other === null) {
            return;
        }

        clearElement(commissioners);
        clearElement(former);
        clearElement(other);

        for (var i = 0; i < CoMail.mailboxes.length; i++) {
            var m = CoMail.mailboxes[i];
            if (m.Active === 0) {
                if (IsFormerCommissioner(m.Title)) {
                    formerCommissioners.push(m);
                }
                else {
                    other.appendChild(BuildMailboxItem(m, CoMail.currentSection || "county", false));
                }
            }
            else {
                commissioners.appendChild(BuildMailboxItem(m, "county", true));
            }
        }

        BuildFormerCommissionerSections(former, formerCommissioners);
        SyncFormerCommissionerDistricts();
        SetCommissionerSection(CoMail.currentSection || "county");
        Show("MailboxList");
        Hide("MailboxView");
    }
    CoMail.BuildMailboxes = BuildMailboxes;

    function BuildFormerCommissionerSections(container, mailboxes) {
        var formerMailboxes = mailboxes.slice(0);
        formerMailboxes.sort(CompareFormerCommissioners);
        var mobileLayout = IsMobileFormerCommissionerLayout();

        for (var district = 1; district <= 5; district++) {
            var districtSection = document.createElement("details");
            districtSection.classList.add("former-commissioners__district");
            districtSection.id = "FormerCommissionersDistrict" + district;
            districtSection.open = !mobileLayout;
            var cardsId = districtSection.id + "Cards";

            districtSection.addEventListener("toggle", (function (section) {
                return function () {
                    var summary = section.querySelector(".former-commissioners__district-header");
                    var status = section.querySelector(".former-commissioners__district-status");
                    if (summary !== null) {
                        summary.setAttribute("aria-expanded", section.open ? "true" : "false");
                    }
                    if (status !== null) {
                        status.textContent = section.open
                            ? "expanded, click to collapse section to hide commissioners"
                            : "collapsed, click to expand section to view commissioners";
                    }

                    if (!IsMobileFormerCommissionerLayout()) {
                        return;
                    }

                    section.setAttribute("data-mobile-open", section.open ? "true" : "false");
                };
            })(districtSection));

            var districtHeader = document.createElement("summary");
            districtHeader.classList.add("former-commissioners__district-header", "former-commissioners__district-summary");
            districtHeader.setAttribute("aria-controls", cardsId);
            districtHeader.setAttribute("aria-expanded", districtSection.open ? "true" : "false");

            var heading = document.createElement("h3");
            heading.classList.add("title", "is-5", "former-commissioners__district-title");

            var headingDesktop = document.createElement("span");
            headingDesktop.classList.add("former-commissioners__district-label", "former-commissioners__district-label--desktop");
            headingDesktop.textContent = "Former Commissioners for District " + district;

            var headingMobile = document.createElement("span");
            headingMobile.classList.add("former-commissioners__district-label", "former-commissioners__district-label--mobile");
            headingMobile.textContent = "District " + district;

            heading.appendChild(headingDesktop);
            heading.appendChild(headingMobile);

            var status = document.createElement("span");
            status.classList.add("is-sr-only", "former-commissioners__district-status");
            status.textContent = districtSection.open
                ? "expanded, click to collapse section to hide commissioners"
                : "collapsed, click to expand section to view commissioners";

            var cards = document.createElement("div");
            cards.id = cardsId;
            cards.classList.add("columns", "is-multiline", "is-variable", "is-4", "former-commissioners__cards");

            for (var i = 0; i < formerMailboxes.length; i++) {
                var mailbox = formerMailboxes[i];
                if (GetMailboxDistrict(mailbox) !== district) {
                    continue;
                }

                cards.appendChild(BuildMailboxItem(mailbox, "former", true));
            }

            districtHeader.appendChild(heading);
            districtHeader.appendChild(status);
            districtHeader.appendChild(CreateFormerCommissionerChevron());
            districtSection.appendChild(districtHeader);
            districtSection.appendChild(cards);
            container.appendChild(districtSection);
        }
    }
    CoMail.BuildFormerCommissionerSections = BuildFormerCommissionerSections;

    function SyncFormerCommissionerDistricts() {
        var sections = document.querySelectorAll(".former-commissioners__district");
        if (sections === null || sections.length === 0) {
            return;
        }

        var mobileLayout = IsMobileFormerCommissionerLayout();
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var summary = section.querySelector(".former-commissioners__district-header");
            var status = section.querySelector(".former-commissioners__district-status");
            if (mobileLayout) {
                var isOpen = section.getAttribute("data-mobile-open");
                section.open = isOpen === null ? false : isOpen === "true";
            }
            else {
                section.open = true;
            }

            if (summary !== null) {
                summary.setAttribute("aria-expanded", section.open ? "true" : "false");
            }
            if (status !== null) {
                status.textContent = section.open
                    ? "expanded, click to collapse section to hide commissioners"
                    : "collapsed, click to expand section to view commissioners";
            }
        }
    }
    CoMail.SyncFormerCommissionerDistricts = SyncFormerCommissionerDistricts;

    function IsMobileFormerCommissionerLayout() {
        if (window.matchMedia === undefined) {
            return false;
        }

        return window.matchMedia("(max-width: 768px)").matches;
    }
    CoMail.IsMobileFormerCommissionerLayout = IsMobileFormerCommissionerLayout;

    function CreateFormerCommissionerChevron() {
        var icon = document.createElement("span");
        icon.classList.add("icon", "is-small", "former-commissioners__district-icon");
        icon.setAttribute("aria-hidden", "true");
        icon.appendChild(CreateChevronDownIcon());
        return icon;
    }

    function BuildMailboxItem(mailbox, section, isCommissionerCard) {
        var column = document.createElement("div");
        column.classList.add("column", "is-half-tablet", "is-one-third-desktop");

        var sectionKind = NormalizeSection(section || CoMail.currentSection || "county");
        var cardHref = "#section=" + encodeURIComponent(sectionKind)
            + "&mailbox=" + encodeURIComponent(mailbox.MailboxName)
            + "&page=1";

        var card = document.createElement("a");
        card.classList.add("card", "mailbox-card", "mailbox-card--link");
        if (isCommissionerCard) {
            card.classList.add("mailbox-card--commissioner");
        }
        card.href = cardHref;
        card.setAttribute("aria-label", BuildMailboxCardLabel(mailbox, sectionKind, isCommissionerCard));

        var content = document.createElement("div");
        content.classList.add("card-content", "mailbox-card__content");

        var details = document.createElement("div");
        details.classList.add("mailbox-card__details");

        var heading = document.createElement("h3");
        heading.classList.add("title", "is-5", "mailbox-card__name");
        heading.textContent = mailbox.Name;

        if (isCommissionerCard && sectionKind === "county") {
            var district = GetMailboxDistrict(mailbox);
            var meta = document.createElement("p");
            meta.classList.add("mailbox-card__meta");
            meta.textContent = district > 0 ? "District " + district : "District";
            details.appendChild(meta);
        }

        var headline = document.createElement("div");
        headline.classList.add("mailbox-card__headline");

        headline.appendChild(heading);

        if (isCommissionerCard) {
            var icon = document.createElement("span");
            icon.classList.add("icon", "is-small", "mailbox-card__icon");
            icon.setAttribute("aria-hidden", "true");
            icon.appendChild(CreateEnvelopeIcon());
            headline.appendChild(icon);
        }

        details.appendChild(headline);
        content.appendChild(details);
        card.appendChild(content);
        column.appendChild(card);
        return column;
    }
    CoMail.BuildMailboxItem = BuildMailboxItem;

    function BuildMailboxCardLabel(mailbox, sectionKind, isCommissionerCard) {
        var district = GetMailboxDistrict(mailbox);
        var districtLabel = district > 0 ? "District " + district : "District";

        if (isCommissionerCard && sectionKind === "former") {
            return "View emails for Former " + districtLabel + " Commissioner " + mailbox.Name;
        }

        return "View emails for " + districtLabel + " Commissioner " + mailbox.Name;
    }

    function clearElement(node) {
        if (node === null) {
            return;
        }

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
    CoMail.clearElement = clearElement;

    function CreateEnvelopeIcon() {
        var svg = CreateInlineIcon();
        var body = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        body.setAttribute("x", "3");
        body.setAttribute("y", "5");
        body.setAttribute("width", "18");
        body.setAttribute("height", "14");
        body.setAttribute("rx", "1.75");
        body.setAttribute("fill", "none");
        body.setAttribute("stroke", "currentColor");
        body.setAttribute("stroke-width", "1.75");

        var flap = document.createElementNS("http://www.w3.org/2000/svg", "path");
        flap.setAttribute("d", "M3.75 6.5L12 12.5L20.25 6.5");
        flap.setAttribute("fill", "none");
        flap.setAttribute("stroke", "currentColor");
        flap.setAttribute("stroke-width", "1.75");

        var lower = document.createElementNS("http://www.w3.org/2000/svg", "path");
        lower.setAttribute("d", "M3.75 18.25L9.9 12.85");
        lower.setAttribute("fill", "none");
        lower.setAttribute("stroke", "currentColor");
        lower.setAttribute("stroke-width", "1.75");

        var lowerRight = document.createElementNS("http://www.w3.org/2000/svg", "path");
        lowerRight.setAttribute("d", "M20.25 18.25L14.1 12.85");
        lowerRight.setAttribute("fill", "none");
        lowerRight.setAttribute("stroke", "currentColor");
        lowerRight.setAttribute("stroke-width", "1.75");

        svg.appendChild(body);
        svg.appendChild(flap);
        svg.appendChild(lower);
        svg.appendChild(lowerRight);
        return svg;
    }

    function CreatePaperclipIcon() {
        var svg = CreateInlineIcon();
        var clip = document.createElementNS("http://www.w3.org/2000/svg", "path");
        clip.setAttribute("d", "M14 6.5V14a4 4 0 1 1-8 0V8a2.5 2.5 0 1 1 5 0v5.5a1 1 0 1 1-2 0V8.75");
        clip.setAttribute("fill", "none");
        clip.setAttribute("stroke", "currentColor");
        clip.setAttribute("stroke-width", "1.75");
        svg.appendChild(clip);
        return svg;
    }

    function CreateChevronDownIcon() {
        var svg = CreateInlineIcon();
        var chevron = document.createElementNS("http://www.w3.org/2000/svg", "path");
        chevron.setAttribute("d", "M6.5 9.5L12 15l5.5-5.5");
        chevron.setAttribute("fill", "none");
        chevron.setAttribute("stroke", "currentColor");
        chevron.setAttribute("stroke-width", "1.9");
        svg.appendChild(chevron);
        return svg;
    }

    function CreateInlineIcon() {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        svg.setAttribute("role", "presentation");
        svg.classList.add("inline-icon-svg");
        return svg;
    }

    function Show(id) {
        var e = document.getElementById(id);
        if (e === null) {
            return;
        }

        e.hidden = false;
        e.setAttribute("aria-hidden", "false");

        if (id === "MailboxView") {
            e.classList.add("mailbox-archive--open");
        }
    }
    CoMail.Show = Show;

    function Hide(id) {
        var e = document.getElementById(id);
        if (e === null) {
            return;
        }

        e.hidden = true;
        e.setAttribute("aria-hidden", "true");

        if (id === "MailboxView") {
            e.classList.remove("mailbox-archive--open");
        }
    }
    CoMail.Hide = Hide;
})(CoMail || (CoMail = {}));
