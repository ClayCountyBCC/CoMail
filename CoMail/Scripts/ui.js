var CoMail;
(function (CoMail) {
    var selectedEmail = null;

    function BuildEmailView(e) {
        BuildEmailSurface(e, {
            subject: "EmailSubject",
            dateReceived: "EmailDateReceived",
            from: "EmailFrom",
            to: "EmailTo",
            cc: "EmailCc",
            attachments: "EmailAttachments",
            message: "EmailMessage"
        });
        ConfigureEmailSaveAction(e);
        ConfigureEmailIgnoreAction(e, false);
    }
    CoMail.BuildEmailView = BuildEmailView;

    function BuildEmailPreview(e) {
        if (e === null || e === undefined) {
            ShowEmailPreviewStatus("Email unavailable", "The selected email could not be loaded.");
            return;
        }

        var empty = document.getElementById("EmailPreviewEmpty");
        var content = document.getElementById("EmailPreviewContent");
        if (empty !== null) {
            empty.hidden = true;
        }

        if (content !== null) {
            content.hidden = false;
        }

        BuildEmailSurface(e, {
            subject: "PreviewEmailSubject",
            dateReceived: "PreviewEmailDateReceived",
            from: "PreviewEmailFrom",
            to: "PreviewEmailTo",
            cc: "PreviewEmailCc",
            attachments: "PreviewEmailAttachments",
            message: "PreviewEmailMessage"
        });
        ResetEmailPreviewScroll();
        ConfigureEmailSaveAction(e);
        ConfigureEmailIgnoreAction(e, false);
    }
    CoMail.BuildEmailPreview = BuildEmailPreview;

    function ShowEmailPreviewStatus(title, message) {
        var empty = document.getElementById("EmailPreviewEmpty");
        var content = document.getElementById("EmailPreviewContent");
        var titleElement = document.getElementById("EmailPreviewTitle");
        var messageElement = empty === null ? null : empty.querySelector(".help");

        if (content !== null) {
            content.hidden = true;
        }

        if (empty !== null) {
            empty.hidden = false;
        }

        if (titleElement !== null) {
            titleElement.textContent = title;
        }

        if (messageElement !== null) {
            messageElement.textContent = message;
        }

        ResetEmailPreviewScroll();
        ConfigureEmailSaveAction(null);
        ConfigureEmailIgnoreAction(null, false);
    }
    CoMail.ShowEmailPreviewStatus = ShowEmailPreviewStatus;

    function ClearEmailPreview() {
        ShowEmailPreviewStatus("Select an email", "No message selected.");

        SetValue("PreviewEmailSubject", "");
        SetValue("PreviewEmailDateReceived", "");
        SetValue("PreviewEmailFrom", "");
        SetValue("PreviewEmailTo", "");
        SetValue("PreviewEmailCc", "");
        clearElement(document.getElementById("PreviewEmailAttachments"));
        clearElement(document.getElementById("PreviewEmailMessage"));
        ResetEmailPreviewScroll();
        ConfigureEmailSaveAction(null);
        HighlightSelectedEmail(-1);
    }
    CoMail.ClearEmailPreview = ClearEmailPreview;

    function BuildEmailSurface(e, target) {
        var attachments = e.Attachments || [];

        SetValue(target.subject, e.Subject);
        SetValue(target.dateReceived, e.DateReceived_ToString);
        SetValue(target.from, e.From);
        SetValue(target.to, e.To);
        SetValue(target.cc, e.CC);

        var emailMessage = document.getElementById(target.message);
        if (emailMessage !== null) {
            clearElement(emailMessage);

            var bodyWrapper = document.createElement("div");
            bodyWrapper.classList.add("email-body");
            bodyWrapper.innerHTML = BuildResolvedEmailBodyHtml(e.Body || "", attachments, false);
            emailMessage.appendChild(bodyWrapper);
        }

        AddAttachments(attachments, target.attachments);
    }

    function BuildResolvedEmailBodyHtml(body, attachments, useAbsoluteUrls) {
        var parser = new DOMParser();
        var parsed = parser.parseFromString(body || "", "text/html");
        if (parsed.body !== null && parsed.body.innerHTML.length > 0) {
            ResolveInlineCidImages(parsed.body, attachments);

            if (useAbsoluteUrls) {
                SanitizePrintableContent(parsed.body);
                ConvertRelativeUrlsToAbsolute(parsed.body);
            }
        }

        return parsed.body !== null && parsed.body.innerHTML.length > 0 ? parsed.body.innerHTML : (body || "");
    }

    function ResetEmailPreviewScroll() {
        var previewPane = document.getElementById("EmailPreviewPane");
        if (previewPane !== null) {
            previewPane.scrollTop = 0;
        }

        var previewContent = document.getElementById("EmailPreviewContent");
        if (previewContent !== null) {
            previewContent.scrollTop = 0;
        }

        var previewMessage = document.getElementById("PreviewEmailMessage");
        if (previewMessage !== null) {
            previewMessage.scrollTop = 0;
        }

        if (typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(function () {
                if (previewPane !== null) {
                    previewPane.scrollTop = 0;
                }

                if (previewContent !== null) {
                    previewContent.scrollTop = 0;
                }

                if (previewMessage !== null) {
                    previewMessage.scrollTop = 0;
                }
            });
        }
    }

    function ResolveInlineCidImages(root, attachments) {
        if (root === null || root === undefined || attachments === null || attachments === undefined || attachments.length === 0) {
            ReplaceUnmatchedCidImages(root);
            return;
        }

        var images = root.querySelectorAll("img[src]");
        for (var i = 0; i < images.length; i++) {
            var image = images[i];
            var src = image.getAttribute("src") || "";
            if (!IsCidUrl(src)) {
                continue;
            }

            var attachment = FindAttachmentForCid(src, attachments);
            if (attachment === null) {
                ReplaceCidImageWithPlaceholder(image);
                continue;
            }

            ConvertCidImageToThumbnail(image, attachment);
        }
    }

    function ReplaceUnmatchedCidImages(root) {
        if (root === null || root === undefined) {
            return;
        }

        var images = root.querySelectorAll("img[src]");
        for (var i = 0; i < images.length; i++) {
            var image = images[i];
            var src = image.getAttribute("src") || "";
            if (IsCidUrl(src)) {
                ReplaceCidImageWithPlaceholder(image);
            }
        }
    }

    function IsCidUrl(src) {
        return typeof src === "string" && src.toLowerCase().indexOf("cid:") === 0;
    }

    function FindAttachmentForCid(src, attachments) {
        var cidFilename = NormalizeCidFilename(src);
        if (cidFilename.length === 0) {
            return null;
        }

        for (var i = 0; i < attachments.length; i++) {
            var attachment = attachments[i];
            if (NormalizeFilename(attachment.Filename) === cidFilename) {
                return attachment;
            }
        }

        return null;
    }

    function NormalizeCidFilename(src) {
        var value = src.substring(4).replace(/[<>]/g, "").trim();
        try {
            value = decodeURIComponent(value);
        }
        catch (err) {
            // Keep the original CID if it was not URL encoded.
        }

        var atIndex = value.indexOf("@");
        if (atIndex > -1) {
            value = value.substring(0, atIndex);
        }

        return NormalizeFilename(value);
    }

    function NormalizeFilename(filename) {
        if (filename === null || filename === undefined) {
            return "";
        }

        var value = filename.toString().trim().toLowerCase();
        var slashIndex = Math.max(value.lastIndexOf("/"), value.lastIndexOf("\\"));
        if (slashIndex > -1) {
            value = value.substring(slashIndex + 1);
        }

        return value;
    }

    function ConvertCidImageToThumbnail(image, attachment) {
        image.setAttribute("src", BuildAttachmentAccessUrl(attachment.URL));
        image.classList.add("email-inline-image");
        image.setAttribute("loading", "lazy");
        image.setAttribute("decoding", "async");
        image.setAttribute("title", attachment.Filename);

        if ((image.getAttribute("alt") || "").trim().length === 0) {
            image.setAttribute("alt", "Inline image: " + attachment.Filename);
        }

        var existingLink = FindAncestorLink(image);
        if (existingLink !== null) {
            ConfigureInlineImageLink(existingLink, attachment);
            return;
        }

        var document = image.ownerDocument;
        var parent = image.parentNode;
        if (document === null || parent === null) {
            return;
        }

        var link = document.createElement("a");
        ConfigureInlineImageLink(link, attachment);
        parent.replaceChild(link, image);
        link.appendChild(image);
    }

    function ConfigureInlineImageLink(link, attachment) {
        link.href = BuildAttachmentAccessUrl(attachment.URL);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.classList.add("email-inline-image-link");
        link.setAttribute("aria-label", "Open inline image " + attachment.Filename + " in a new window");
    }

    function FindAncestorLink(element) {
        var current = element.parentNode;
        while (current !== null) {
            if (current.tagName !== undefined && current.tagName.toLowerCase() === "a") {
                return current;
            }

            current = current.parentNode;
        }

        return null;
    }

    function ReplaceCidImageWithPlaceholder(image) {
        var document = image.ownerDocument;
        var parent = image.parentNode;
        if (document === null || parent === null) {
            image.removeAttribute("src");
            image.setAttribute("alt", "Inline image unavailable");
            return;
        }

        var placeholder = document.createElement("span");
        placeholder.classList.add("email-inline-image-placeholder");
        placeholder.setAttribute("role", "img");
        placeholder.setAttribute("aria-label", "Inline image unavailable");
        placeholder.textContent = "Inline image unavailable";
        parent.replaceChild(placeholder, image);
    }

    function SanitizePrintableContent(root) {
        if (root === null || root === undefined) {
            return;
        }

        var blockedElements = root.querySelectorAll("script, iframe, object, embed, form, input, button, select, textarea, link, meta, base");
        for (var i = 0; i < blockedElements.length; i++) {
            var element = blockedElements[i];
            if (element.parentNode !== null) {
                element.parentNode.removeChild(element);
            }
        }

        var elements = root.querySelectorAll("*");
        for (var j = 0; j < elements.length; j++) {
            RemoveDangerousAttributes(elements[j]);
        }
    }

    function RemoveDangerousAttributes(element) {
        if (element === null || element === undefined || element.attributes === undefined) {
            return;
        }

        for (var i = element.attributes.length - 1; i >= 0; i--) {
            var attribute = element.attributes[i];
            var name = attribute.name.toLowerCase();
            var value = attribute.value || "";

            if (name.indexOf("on") === 0) {
                element.removeAttribute(attribute.name);
                continue;
            }

            if ((name === "href" || name === "src") && value.trim().toLowerCase().indexOf("javascript:") === 0) {
                element.removeAttribute(attribute.name);
            }
        }
    }

    function ConvertRelativeUrlsToAbsolute(root) {
        if (root === null || root === undefined) {
            return;
        }

        var elements = root.querySelectorAll("[href], [src]");
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            NormalizeUrlAttribute(element, "href");
            NormalizeUrlAttribute(element, "src");
        }
    }

    function NormalizeUrlAttribute(element, attributeName) {
        if (element === null || element === undefined || !element.hasAttribute(attributeName)) {
            return;
        }

        var value = element.getAttribute(attributeName);
        if (value === null || value === undefined || value.trim().length === 0) {
            return;
        }

        element.setAttribute(attributeName, ToAbsoluteUrl(value));
    }

    function ConfigureEmailSaveAction(email) {
        selectedEmail = email === null || email === undefined ? null : email;

        var buttons = [
            document.getElementById("EmailSaveAction"),
            document.getElementById("EmailPreviewSaveAction")
        ];

        for (var i = 0; i < buttons.length; i++) {
            ConfigureEmailSaveButton(buttons[i], selectedEmail);
        }
    }
    CoMail.ConfigureEmailSaveAction = ConfigureEmailSaveAction;

    function ConfigureEmailSaveButton(button, email) {
        if (button === null) {
            return;
        }

        if (email === null || email === undefined) {
            button.hidden = true;
            button.disabled = true;
            button.setAttribute("aria-hidden", "true");
            button.onclick = null;
            return;
        }

        button.hidden = false;
        button.disabled = false;
        button.setAttribute("aria-hidden", "false");
        button.setAttribute("aria-label", "Save this email as a PDF");
        button.onclick = function () {
            SaveEmailAsPdf(email);
        };
    }

    function SaveEmailAsPdf(email) {
        if (email === null || email === undefined) {
            return;
        }

        var printWindow = window.open("", "_blank");
        if (printWindow === null) {
            window.alert("The browser blocked the PDF window. Please allow pop-ups for this site and try again.");
            return;
        }

        var documentTitle = BuildPrintableDocumentTitle(email);
        var mailboxName = GetCurrentMailboxDisplayName();
        var printDocument = BuildEmailPrintDocument(email, mailboxName, documentTitle);

        printWindow.document.open();
        printWindow.document.write(printDocument);
        printWindow.document.close();

        try {
            printWindow.opener = null;
            printWindow.focus();
        }
        catch (err) {
            // Some browsers restrict opener access or focus control.
        }
    }
    CoMail.SaveEmailAsPdf = SaveEmailAsPdf;

    function BuildEmailPrintDocument(email, mailboxName, documentTitle) {
        var attachmentsMarkup = BuildPrintableAttachmentsMarkup(email.Attachments || []);
        var bodyMarkup = BuildResolvedEmailBodyHtml(email.Body || "", email.Attachments || [], true);
        var filename = BuildPrintableFileName(email);
        var printScript = "(function(){function p(){try{window.focus();window.print();}catch(e){}}function c(){setTimeout(function(){try{window.close();}catch(e){}},150);}function w(){var i=Array.prototype.slice.call(document.images||[]);if(i.length===0){setTimeout(p,120);return;}var r=i.length;var d=false;function f(){if(d){return;}d=true;setTimeout(p,120);}function m(){r--;if(r<=0){f();}}setTimeout(f,1500);for(var x=0;x<i.length;x++){if(i[x].complete){m();continue;}i[x].addEventListener('load',m,{once:true});i[x].addEventListener('error',m,{once:true});}}window.addEventListener('load',w,{once:true});window.addEventListener('afterprint',c,{once:true});})();";

        return "<!DOCTYPE html>" +
            "<html lang=\"en\"><head><meta charset=\"utf-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
            "<title>" + EscapeHtml(documentTitle) + "</title>" +
            "<style>" + BuildEmailPrintStyles() + "</style>" +
            "</head><body>" +
            "<main class=\"print-email\" aria-label=\"Printable email\">" +
            "<header class=\"print-email__header\">" +
            "<p class=\"print-email__eyebrow\">Save Email</p>" +
            "<h1 class=\"print-email__subject\">" + EscapeHtml(email.Subject || "(No subject)") + "</h1>" +
            "<p class=\"print-email__meta\">Use your browser print dialog destination set to Save as PDF to download this email.</p>" +
            "</header>" +
            "<section class=\"print-email__summary\" aria-label=\"Email details\">" +
            BuildPrintableDetail("Mailbox", mailboxName) +
            BuildPrintableDetail("Date", email.DateReceived_ToString) +
            BuildPrintableDetail("From", email.From) +
            BuildPrintableDetail("To", email.To) +
            BuildPrintableDetail("Cc", email.CC) +
            BuildPrintableDetail("File name", filename) +
            "</section>" +
            "<section class=\"print-email__attachments-section\" aria-label=\"Attachments\">" +
            "<h2>Attachments</h2>" +
            attachmentsMarkup +
            "</section>" +
            "<section class=\"print-email__message-section\" aria-label=\"Message\">" +
            "<h2>Message</h2>" +
            "<div class=\"print-email__message email-body\">" + bodyMarkup + "</div>" +
            "</section>" +
            "</main>" +
            "<script>" + printScript + "</script>" +
            "</body></html>";
    }

    function BuildPrintableAttachmentsMarkup(attachments) {
        if (attachments === null || attachments === undefined || attachments.length === 0) {
            return "<p class=\"print-email__empty\">None</p>";
        }

        var items = [];
        for (var i = 0; i < attachments.length; i++) {
            var attachment = attachments[i];
            items.push(
                "<li><a href=\"" + EscapeAttribute(BuildAttachmentAccessUrl(attachment.URL || "")) + "\">" +
                EscapeHtml(attachment.Filename || "Attachment") +
                "</a></li>");
        }

        return "<ul class=\"print-email__attachments\">" + items.join("") + "</ul>";
    }

    function BuildPrintableDetail(label, value) {
        var safeValue = value === null || value === undefined || value === "" ? "None" : value;
        return "<div class=\"print-email__detail\"><dt>" +
            EscapeHtml(label) +
            "</dt><dd>" +
            EscapeHtml(safeValue) +
            "</dd></div>";
    }

    function BuildPrintableDocumentTitle(email) {
        var parts = ["Public Email"];
        if (email !== null && email !== undefined && (email.Subject || "").trim().length > 0) {
            parts.push(email.Subject.trim());
        }

        if (email !== null && email !== undefined && (email.DateReceived_DateOnlyString || "").trim().length > 0) {
            parts.push(email.DateReceived_DateOnlyString.trim());
        }

        return parts.join(" - ");
    }

    function BuildPrintableFileName(email) {
        var subject = email === null || email === undefined ? "" : (email.Subject || "");
        var date = email === null || email === undefined ? "" : (email.DateReceived_DateOnlyString || "");
        var safeSubject = subject.replace(/[\\\\/:*?\"<>|]+/g, " ").replace(/\s+/g, " ").trim();
        var safeDate = date.replace(/[\\\\/:*?\"<>|]+/g, "-").trim();
        var parts = ["PublicEmail"];

        if (safeDate.length > 0) {
            parts.push(safeDate);
        }

        if (safeSubject.length > 0) {
            parts.push(safeSubject);
        }

        return parts.join(" - ");
    }

    function GetCurrentMailboxDisplayName() {
        var mailboxName = document.getElementById("MailboxName");
        if (mailboxName === null) {
            return "";
        }

        return mailboxName.textContent || "";
    }

    function BuildAttachmentAccessUrl(url) {
        if (url === null || url === undefined || url === "") {
            return "";
        }

        var absoluteUrl = ToAbsoluteUrl(url);
        var mailboxName = CoMail.currentHash === null ? "" : (CoMail.currentHash.Mailbox || "");
        if (mailboxName.length === 0) {
            return absoluteUrl;
        }

        try {
            var resolved = new URL(absoluteUrl, window.location.href);
            if (!resolved.searchParams.has("mailbox")) {
                resolved.searchParams.set("mailbox", mailboxName);
            }

            return resolved.toString();
        }
        catch (err) {
            var separator = absoluteUrl.indexOf("?") > -1 ? "&" : "?";
            return absoluteUrl + separator + "mailbox=" + encodeURIComponent(mailboxName);
        }
    }

    function ToAbsoluteUrl(url) {
        if (url === null || url === undefined || url === "") {
            return "";
        }

        try {
            return new URL(url, window.location.href).href;
        }
        catch (err) {
            return url;
        }
    }

    function EscapeHtml(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return value
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function EscapeAttribute(value) {
        return EscapeHtml(value);
    }

    function BuildEmailPrintStyles() {
        return "html,body{margin:0;padding:0;background:#eef3f8;color:#1e2a35;font-family:'Segoe UI','Segoe UI Variable','Helvetica Neue',Arial,sans-serif;line-height:1.5;}body{padding:1.25rem;}a{color:#143d64;word-break:break-word;}main.print-email{max-width:8.5in;margin:0 auto;padding:1.25rem 1.35rem;border:1px solid #d7e1ec;border-radius:0.75rem;background:#fff;box-shadow:0 0.35rem 1.2rem rgba(20,36,56,0.10);} .print-email__header{margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #d7e1ec;} .print-email__eyebrow{margin:0 0 0.3rem;font-size:0.82rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#475569;} .print-email__subject{margin:0 0 0.45rem;font-size:1.8rem;line-height:1.2;color:#0d2740;overflow-wrap:anywhere;} .print-email__meta{margin:0;color:#415266;font-size:0.95rem;} .print-email__summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.75rem;margin-bottom:1.1rem;} .print-email__detail{padding:0.75rem 0.9rem;border:1px solid #d7e1ec;border-radius:0.65rem;background:#f7fafc;} .print-email__detail dt{margin:0 0 0.2rem;font-size:0.75rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0d2740;} .print-email__detail dd{margin:0;overflow-wrap:anywhere;} .print-email__attachments-section,.print-email__message-section{margin-top:1rem;} .print-email__attachments-section h2,.print-email__message-section h2{margin:0 0 0.55rem;font-size:1.05rem;color:#0d2740;} .print-email__attachments{margin:0;padding-left:1.2rem;} .print-email__attachments li + li{margin-top:0.25rem;} .print-email__empty{margin:0;color:#415266;} .print-email__message{padding:1rem;border:1px solid #d7e1ec;border-radius:0.65rem;background:#fff;overflow-wrap:anywhere;} .print-email__message img{max-width:100%;height:auto;} .print-email__message table{max-width:100%;border-collapse:collapse;} @media print{html,body{background:#fff;}body{padding:0;}main.print-email{max-width:none;margin:0;padding:0;border:0;border-radius:0;box-shadow:none;} .print-email__meta{color:#1e2a35;} a{color:#143d64;text-decoration:underline;}} @media (max-width: 720px){body{padding:0.6rem;} main.print-email{padding:1rem;} .print-email__summary{grid-template-columns:1fr;} .print-email__subject{font-size:1.45rem;}}";
    }

    function ConfigureEmailIgnoreAction(email, isBusy) {
        var buttons = [
            document.getElementById("EmailIgnoreAction"),
            document.getElementById("EmailPreviewIgnoreAction")
        ];

        for (var i = 0; i < buttons.length; i++) {
            ConfigureEmailIgnoreButton(buttons[i], email, isBusy);
        }
    }
    CoMail.ConfigureEmailIgnoreAction = ConfigureEmailIgnoreAction;

    function ConfigureEmailIgnoreButton(button, email, isBusy) {
        if (button === null) {
            return;
        }

        var canManage = CoMail.siteState !== null && CoMail.siteState.CanManageIgnoredEmails === true;
        if (!canManage || email === null || email === undefined) {
            button.hidden = true;
            button.disabled = true;
            button.setAttribute("aria-hidden", "true");
            button.removeAttribute("aria-busy");
            button.onclick = null;
            return;
        }

        var isIgnored = email.Ignore === true;
        button.hidden = false;
        button.disabled = !!isBusy;
        button.setAttribute("aria-hidden", "false");

        if (isBusy) {
            button.setAttribute("aria-busy", "true");
            button.textContent = "Updating...";
            button.setAttribute("aria-label", "Updating email family ignore status");
        }
        else {
            button.removeAttribute("aria-busy");
            button.textContent = isIgnored ? "Restore family" : "Ignore family";
            button.setAttribute(
                "aria-label",
                isIgnored ? "Restore this email family" : "Ignore this email family");
        }

        button.onclick = function () {
            if (button.disabled) {
                return;
            }

            if (CoMail.ToggleEmailIgnore !== undefined) {
                CoMail.ToggleEmailIgnore(email.Id, !isIgnored);
            }
        };
    }

    function AddAttachments(attachments, containerId) {
        var attachmentContainer = document.getElementById(containerId);
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
            var attachmentUrl = BuildAttachmentAccessUrl(a.URL);
            var attachmentName = a.Filename;
            var tag = document.createElement("a");
            tag.classList.add("tag", "is-link", "is-light", "attachment-tag");
            tag.href = attachmentUrl;
            tag.target = "_blank";
            tag.rel = "noopener noreferrer";
            tag.setAttribute("aria-label", "Open attachment " + attachmentName + " in a new window");

            var icon = document.createElement("span");
            icon.classList.add("icon", "is-small");
            icon.setAttribute("aria-hidden", "true");
            icon.appendChild(CreatePaperclipIcon());

            var label = document.createElement("span");
            label.textContent = attachmentName;

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
            row.setAttribute("data-email-id", email.Id.toString());
            row.setAttribute("role", "link");
            row.setAttribute("aria-label", BuildEmailRowLabel(email));
            row.tabIndex = 0;
            if (email.Ignore) {
                row.classList.add("email-row--ignored");
            }
            if (CoMail.currentHash !== null && CoMail.currentHash.EmailId === email.Id) {
                row.classList.add("email-row--selected");
                row.setAttribute("aria-current", "true");
            }
            row.addEventListener("click", CreateEmailRowClickHandler(emailHref));
            row.addEventListener("keydown", CreateEmailRowKeyHandler(emailHref));

            row.appendChild(CreateEmailDateCell(email.DateReceived_ToString, email.DateReceived_DateOnlyString));
            row.appendChild(CreateEmailListCell("email-from-cell", email.From));

            var subjectCell = CreateEmailListCell("email-subject-cell", "");
            subjectCell.title = email.Subject;

            var subjectText = document.createElement("span");
            subjectText.classList.add("email-subject-cell__subject");
            subjectText.textContent = email.Subject;
            subjectCell.appendChild(subjectText);

            var subjectMeta = document.createElement("span");
            subjectMeta.classList.add("email-subject-cell__meta");
            subjectMeta.textContent = email.From || "";
            subjectCell.appendChild(subjectMeta);

            if (email.Ignore) {
                var ignoredTag = document.createElement("span");
                ignoredTag.classList.add("tag", "is-warning", "is-light", "is-small", "ml-2");
                ignoredTag.textContent = "Ignored";
                ignoredTag.setAttribute("aria-label", "Ignored email");
                subjectCell.appendChild(ignoredTag);
            }

            row.appendChild(subjectCell);

            fragment.appendChild(row);
        }

        emailList.appendChild(fragment);
    }
    CoMail.BuildEmailList = BuildEmailList;

    function HighlightSelectedEmail(emailId) {
        var rows = document.querySelectorAll(".email-row[data-email-id]");
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var isSelected = row.getAttribute("data-email-id") === emailId.toString();
            row.classList.toggle("email-row--selected", isSelected);
            if (isSelected) {
                row.setAttribute("aria-current", "true");
            }
            else {
                row.removeAttribute("aria-current");
            }
        }
    }
    CoMail.HighlightSelectedEmail = HighlightSelectedEmail;

    function SelectEmailRow(emailId) {
        if (emailId === null || emailId === undefined || isNaN(emailId) || emailId < 0) {
            HighlightSelectedEmail(-1);
            return null;
        }

        var row = document.querySelector('.email-row[data-email-id="' + emailId.toString() + '"]');
        if (row === null) {
            HighlightSelectedEmail(-1);
            return null;
        }

        HighlightSelectedEmail(emailId);
        EnsureEmailRowIsVisible(row);
        return row;
    }
    CoMail.SelectEmailRow = SelectEmailRow;

    function SelectCurrentEmailRow() {
        if (CoMail.currentHash === null) {
            HighlightSelectedEmail(-1);
            return null;
        }

        return SelectEmailRow(CoMail.currentHash.EmailId);
    }
    CoMail.SelectCurrentEmailRow = SelectCurrentEmailRow;

    function EnsureEmailRowIsVisible(row) {
        if (row === null || row === undefined) {
            return;
        }

        var container = row.closest(".table-container");
        if (container === null) {
            return;
        }

        var rowRect = row.getBoundingClientRect();
        var containerRect = container.getBoundingClientRect();

        if (rowRect.top < containerRect.top) {
            container.scrollTop -= (containerRect.top - rowRect.top);
            return;
        }

        if (rowRect.bottom > containerRect.bottom) {
            container.scrollTop += (rowRect.bottom - containerRect.bottom);
        }
    }

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

    function CreateEmailRowKeyHandler(emailHref) {
        return function (event) {
            if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") {
                return;
            }

            event.preventDefault();
            if (emailHref.length > 1) {
                location.hash = emailHref.substring(1);
            }
        };
    }

    // The row itself is the open control, so the label should describe the email.
    // The row itself is the open control, so the label should describe the email.
    function BuildEmailRowLabel(email) {
        var parts = ["Open email"];

        if (email.Subject !== null && email.Subject !== undefined && email.Subject.length > 0) {
            parts.push(email.Subject);
        }

        if (email.From !== null && email.From !== undefined && email.From.length > 0) {
            parts.push("from " + email.From);
        }

        if (email.DateReceived_ToString !== null && email.DateReceived_ToString !== undefined && email.DateReceived_ToString.length > 0) {
            parts.push("dated " + email.DateReceived_ToString);
        }

        if (email.Ignore) {
            parts.push("ignored");
        }

        return parts.join(", ");
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
        ClearEmailPreview();
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
            card.addEventListener("click", function () {
                CoMail.shouldAutoSelectFirstEmail = true;
            });
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
