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
    }
    CoMail.Start = Start;
    function HashChange() {
        HandleHash();
    }
    CoMail.HashChange = HashChange;
    function HandleHash() {
        if (location.hash.length <= 1)
            return;
        var hash = location.hash;
        var h = new CoMail.LocationHash(location.hash.substring(1));
        var oldMailbox = CoMail.currentMailbox;
        CoMail.currentMailbox = h.Mailbox;
        CoMail.currentPage = h.Page;
        CoMail.currentEmailId = h.EmailId;
        if (h.EmailId === -1) {
            GetEmail(h);
            GetEmailCount(h);
        }
        else {
            // we load the specific email
        }
    }
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
    function GetEmailCount(lh) {
        var email = new CoMail.Email();
        email.GetCount(lh)
            .then(function (emailCount) {
            console.log("emailCount", emailCount);
            CoMail.currentEmailCount = emailCount;
            BuildPaging();
            //let element = document.getElementById("ListMail");
            //var parser = new DOMParser();
            //var d = parser.parseFromString(allmail[0].Body, "text/html");
            //element.appendChild(d.documentElement);
        }, function () {
            console.log('error getting All Email');
        });
    }
    function BuildPaging() {
        // first let's update the totalpagecount
        var tpc = document.getElementById("TotalPageCount");
        clearElement(tpc);
        var max = Math.floor(CoMail.currentEmailCount / 20);
        tpc.appendChild(document.createTextNode("Page " + CoMail.currentPage + " of " + max));
        var prev = document.getElementById("PreviousPage");
        prev.href = location.hash;
        if (CoMail.currentPage > 1) {
            if (prev.href.indexOf("page=") > -1) {
                prev.href = prev.href.replace("page=" + CoMail.currentPage, "page=" + (CoMail.currentPage - 1));
            }
            else {
                prev.href += "&page=" + (CoMail.currentPage - 1);
            }
        }
        var next = document.getElementById("NextPage");
        next.href = location.hash;
        if (CoMail.currentPage < max) {
            if (next.href.indexOf("page=") > -1) {
                next.href = next.href.replace("page=" + CoMail.currentPage, "page=" + (CoMail.currentPage + 1));
            }
            else {
                next.href += "&page=" + (CoMail.currentPage + 1);
            }
        }
    }
    function clearElement(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
    CoMail.clearElement = clearElement;
    function GetMailBoxes() {
        var mb = new CoMail.PublicMailBox();
        mb.Get()
            .then(function (all) {
            console.log("AllMailBoxes", all);
            CoMail.mailboxes = all;
            BuildMailboxes();
            if (location.hash.substring(1).length > 0)
                HandleHash();
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
})(CoMail || (CoMail = {}));
//# sourceMappingURL=app.js.map