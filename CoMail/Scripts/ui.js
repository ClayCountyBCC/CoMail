var CoMail;
(function (CoMail) {
    function BuildEmailView(e) {
        SetValue("EmailSubject", e.Subject);
        SetValue("EmailDateReceived", e.DateReceived_ToString);
        SetValue("EmailFrom", e.From);
        SetValue("EmailTo", e.To);
        SetValue("EmailCc", e.CC);
        var parser = new DOMParser();
        var d = parser.parseFromString(e.Body, "text/html");
        var EmailMessage = document.getElementById("EmailMessage");
        clearElement(EmailMessage);
        EmailMessage.appendChild(d.documentElement);
        AddAttachments(e.Attachments);
    }
    CoMail.BuildEmailView = BuildEmailView;
    function AddAttachments(attachments) {
        var EA = document.getElementById("EmailAttachments");
        clearElement(EA);
        for (var _i = 0, attachments_1 = attachments; _i < attachments_1.length; _i++) {
            var a = attachments_1[_i];
            var k = document.createElement("a");
            k.style.marginRight = "1em";
            k.href = a.URL;
            k.appendChild(document.createTextNode(a.Filename));
            EA.appendChild(k);
        }
    }
    function SetValue(id, value) {
        var e = document.getElementById(id);
        clearElement(e);
        e.appendChild(document.createTextNode(value));
    }
    function UpdateMailboxName(MailboxName) {
        var k = CoMail.mailboxes.filter(function (m) {
            return m.MailboxName === MailboxName;
        });
        var mbn = document.getElementById("MailboxName");
        clearElement(mbn);
        if (k.length === 1) {
            mbn.appendChild(document.createTextNode(k[0].Name));
        }
    }
    CoMail.UpdateMailboxName = UpdateMailboxName;
    function ClearEmailList() {
        var emailList = document.getElementById("EmailList");
        clearElement(emailList);
        return emailList;
    }
    CoMail.ClearEmailList = ClearEmailList;
    function BuildEmailList() {
        var emailList = ClearEmailList();
        var df = document.createDocumentFragment();
        for (var _i = 0, currentEmailList_1 = CoMail.currentEmailList; _i < currentEmailList_1.length; _i++) {
            var email = currentEmailList_1[_i];
            var edr = document.createElement("div");
            edr.classList.add("d-flex");
            edr.classList.add("col-12");
            edr.classList.add("flex-row");
            edr.classList.add("EmailDataRow");
            edr.classList.add("flex-wrap"); //collapse
            var daterec = CreateEmailListElement("3", email.DateReceived_ToString);
            edr.appendChild(daterec);
            var from = CreateEmailListElement("3", email.From);
            edr.appendChild(from);
            var subject = CreateEmailListElement("4", email.Subject);
            edr.appendChild(subject);
            var view = CreateEmailListElement("2", "");
            view.classList.add("CenterButton");
            var viewButton = document.createElement("a");
            viewButton.href = "#" + CoMail.currentHash.AddEmailId(email.Id);
            viewButton.classList.add("btn");
            viewButton.classList.add("btn-info");
            viewButton.classList.add("MyInfoButton");
            viewButton.appendChild(document.createTextNode("View"));
            view.appendChild(viewButton);
            edr.appendChild(view);
            df.appendChild(edr);
        }
        emailList.appendChild(df);
    }
    CoMail.BuildEmailList = BuildEmailList;
    function CreateEmailListElement(size, text) {
        var e = document.createElement("div");
        e.classList.add("col-" + size);
        e.classList.add("EmailDataCell");
        if (text.length > 0)
            e.appendChild(document.createTextNode(text));
        return e;
    }
    function BuildMailboxes() {
        var comm = document.getElementById("Commissioners");
        var former = document.getElementById("FormerCommissioners");
        var other = document.getElementById("OtherPublic");
        for (var _i = 0, _a = CoMail.mailboxes; _i < _a.length; _i++) {
            var m = _a[_i];
            if (m.Active === 0) {
                if (m.Title.indexOf("ommiss") !== -1) // they are a former commissioner
                 {
                    former.appendChild(BuildMailboxItem(m.MailboxName, m.Name, m.Title));
                }
                else // they are other than a commissioner
                 {
                    other.appendChild(BuildMailboxItem(m.MailboxName, m.Name, m.Title));
                }
            }
            else {
                comm.appendChild(BuildMailboxItem(m.MailboxName, m.Name, m.Title));
            }
        }
        document.getElementById("MailboxList").style.display = "block";
    }
    CoMail.BuildMailboxes = BuildMailboxes;
    function BuildMailboxItem(mailbox, name, title) {
        var li = document.createElement("li");
        li.classList.add("d-flex");
        li.classList.add("col-sm-6");
        li.classList.add("col-xl-4");
        li.classList.add("col-xs-12");
        var sp = document.createElement("span");
        sp.style.marginRight = "1em";
        sp.appendChild(document.createTextNode(title.replace("Commissioner of ", "").replace("Former", "")));
        li.appendChild(sp);
        var a = document.createElement("a");
        a.href = "#mailbox=" + mailbox + "&page=1";
        a.appendChild(document.createTextNode(name));
        li.appendChild(a);
        return li;
    }
    CoMail.BuildMailboxItem = BuildMailboxItem;
    function clearElement(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
    CoMail.clearElement = clearElement;
    function Show(id) {
        var e = document.getElementById(id);
        e.style.display = "block";
    }
    CoMail.Show = Show;
    function Hide(id) {
        var e = document.getElementById(id);
        e.style.display = "none";
    }
    CoMail.Hide = Hide;
})(CoMail || (CoMail = {}));
//# sourceMappingURL=UI.js.map