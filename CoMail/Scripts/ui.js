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
        console.log('ClearEmailList');
        var emailList = document.getElementById("EmailList");
        clearElement(emailList);
        return emailList;
    }
    CoMail.ClearEmailList = ClearEmailList;
    function BuildEmailList() {
        console.log('BuildEmailList');
        var emailList = ClearEmailList();
        var df = document.createDocumentFragment();
        for (var _i = 0, currentEmailList_1 = CoMail.currentEmailList; _i < currentEmailList_1.length; _i++) {
            var email = currentEmailList_1[_i];
            var edr = document.createElement("div");
            edr.classList.add("d-flex", "col-12", "EmailDataRow"); //collapse
            var daterec = document.createElement("div");
            daterec.classList.add("col-3", "EmailDataCell");
            daterec.appendChild(document.createTextNode(email.DateReceived_ToString));
            edr.appendChild(daterec);
            var from = document.createElement("div");
            from.classList.add("col-3", "EmailDataCell");
            from.appendChild(document.createTextNode(email.From));
            edr.appendChild(from);
            var subject = document.createElement("div");
            subject.classList.add("col-4", "EmailDataCell");
            subject.appendChild(document.createTextNode(email.Subject));
            edr.appendChild(subject);
            var view = document.createElement("div");
            view.classList.add("col-2", "EmailDataCell");
            var viewButton = document.createElement("a");
            viewButton.href = "#" + CoMail.currentHash.AddEmailId(email.Id);
            viewButton.classList.add("btn", "btn-info", "MyInfoButton");
            //viewButton.setAttribute("data-toggle", "modal");
            //viewButton.setAttribute("data-target", "#EmailView");
            viewButton.appendChild(document.createTextNode("View"));
            view.appendChild(viewButton);
            edr.appendChild(view);
            df.appendChild(edr);
        }
        emailList.appendChild(df);
        //<div class="d-flex col-12 collapse EmailDataRow">
        //	<div class="col-3 EmailDataCell" style="overflow:hidden" id="DateTimeReceived">05/26/2017 10:30:58 AM</div>
        //	<div class="col-3 EmailDataCell" id="From" style="overflow: hidden">jeremy.west@claycountygov.com</div>
        //	<div class="col-4 EmailDataCell" id="EmailSubject">My brain is on Hiatus because of bootstrap 4</div>
        //	<div class="col-2 EmailDataCell" id="ViewEmailButton">
        //	<button type="button" class="btn btn-info MyInfoButton">View</button>
        //	</div>
        //</div>
    }
    CoMail.BuildEmailList = BuildEmailList;
    function BuildMailboxes() {
        var comm = document.getElementById("Commissioners");
        var former = document.getElementById("FormerCommissioners");
        var other = document.getElementById("OtherPublic");
        for (var _i = 0, _a = CoMail.mailboxes; _i < _a.length; _i++) {
            var m = _a[_i];
            if (m.Active === 0) {
                if (m.Title.indexOf("ommiss") !== -1) {
                    former.appendChild(BuildMailboxItem(m.MailboxName, m.Name, m.Title));
                }
                else {
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
        li.classList.add("d-flex", "col-sm-6", "col-xl-4", "col-xs-12");
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