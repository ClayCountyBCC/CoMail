/// <reference path="locationhash.ts" />
/// <reference path="xhr.ts" />
/// <reference path="typings/es6-promise/es6-promise.d.ts" />
var CoMail;
(function (CoMail) {
    CoMail.mailboxes = [];
    CoMail.currentEmail = [];
    function Start() {
        window.onhashchange = HashChange;
        // let's check the current hash to make sure we don't need to start on a given mailbox / page / email
        GetMailBoxes();
        //GetEmail("wayne.bolla", 0, "", "Troy.Nagle");
    }
    CoMail.Start = Start;
    function HashChange() {
        var hash = location.hash;
        var h = new CoMail.LocationHash(location.hash.substring(1));
        var oldMailbox = CoMail.currentMailbox;
        CoMail.currentMailbox = h.Mailbox;
        CoMail.currentPage = h.Page;
        CoMail.currentEmailId = h.EmailId;
        if (h.EmailId === -1) {
            GetEmail(h);
        }
        else {
            // we load the specific email
        }
    }
    CoMail.HashChange = HashChange;
    function GetEmail(lh) {
        var email = new CoMail.Email();
        email.Get(lh)
            .then(function (allmail) {
            console.log("email", allmail);
            CoMail.currentEmail = allmail;
            //let element = document.getElementById("ListMail");
            //var parser = new DOMParser();
            //var d = parser.parseFromString(allmail[0].Body, "text/html");
            //element.appendChild(d.documentElement);
        }, function () {
            console.log('error getting All Email');
        });
    }
    function GetMailBoxes() {
        var email = new CoMail.PublicMailBox();
        email.Get()
            .then(function (all) {
            console.log("AllMailBoxes", all);
            CoMail.mailboxes = all;
            BuildMailboxes();
        }, function () {
            console.log('error getting All Mailboxes');
        });
    }
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
    function BuildMailboxItem(mailbox, name, title) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#mailbox=" + mailbox;
        a.appendChild(document.createTextNode(name + " " + title));
        li.appendChild(a);
        return li;
    }
})(CoMail || (CoMail = {}));
//# sourceMappingURL=app.js.map