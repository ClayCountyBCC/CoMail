/// <reference path="locationhash.ts" />
/// <reference path="xhr.ts" />
/// <reference path="ui.ts" />
/// <reference path="typings/es6-promise/es6-promise.d.ts" />
var CoMail;
(function (CoMail) {
    CoMail.mailboxes = [];
    CoMail.currentEmailList = [];
    CoMail.currentHash = null;
    function Start() {
        window.onhashchange = HashChange;
        // let's check the current hash to make sure we don't need to start on a given mailbox / page / email
        GetMailBoxes();
    }
    CoMail.Start = Start;
    function ModalClosed(evt) {
        location.hash = CoMail.currentHash.RemoveEmailId();
        var emailMessage = document.getElementById("EmailMessage");
        CoMail.clearElement(emailMessage);
    }
    CoMail.ModalClosed = ModalClosed;
    function HashChange() {
        HandleHash();
    }
    CoMail.HashChange = HashChange;
    function HandleHash() {
        var hash = location.hash;
        var oldHash = CoMail.currentHash;
        CoMail.currentHash = new CoMail.LocationHash(location.hash.substring(1));
        ShowMenu(CoMail.currentHash, oldHash);
    }
    function ShowMenu(lh, oh) {
        if (lh.Mailbox.length === 0) {
            CoMail.Show("MailboxList");
            CoMail.ClearEmailList();
            CoMail.Hide("MailboxView");
        }
        else {
            if (oh === null || oh.Mailbox !== lh.Mailbox || oh.Page !== lh.Page) {
                CoMail.UpdateMailboxName(lh.Mailbox);
                GetEmailList(CoMail.currentHash);
                GetEmailCount(CoMail.currentHash);
            }
            CoMail.Hide("MailboxList");
            CoMail.Show("MailboxView");
        }
        if (lh.EmailId > -1) {
            GetEmail(lh.EmailId);
        }
    }
    function GetEmail(EmailId) {
        CoMail.Show("Loading");
        var email = new CoMail.Email();
        email.Get(EmailId)
            .then(function (mail) {
            CoMail.BuildEmailView(mail);
            $('#EmailView').modal('show');
            CoMail.Hide("Loading");
        }, function () {
            console.log('error getting Email');
            CoMail.Hide("EmailLoading");
        });
    }
    function GetEmailList(lh) {
        CoMail.Show("Loading");
        var EmailList = document.getElementById("EmailList");
        CoMail.clearElement(EmailList);
        var email = new CoMail.Email();
        email.GetList(lh)
            .then(function (allmail) {
            CoMail.currentEmailList = allmail;
            CoMail.BuildEmailList();
            CoMail.Hide("Loading");
        }, function () {
            console.log('error getting Email List');
            CoMail.Hide("Loading");
        });
    }
    function GetEmailCount(lh) {
        var email = new CoMail.Email();
        email.GetCount(lh)
            .then(function (emailCount) {
            CoMail.currentEmailCount = emailCount;
            console.log('current email count', CoMail.currentEmailCount);
            BuildPaging();
        }, function () {
            console.log('error getting Email Count');
        });
    }
    function BuildPaging() {
        // first let's update the totalpagecount
        var tpc = document.getElementById("TotalPageCount");
        CoMail.clearElement(tpc);
        var max = Math.max(Math.floor(CoMail.currentEmailCount / 20), 1);
        tpc.appendChild(document.createTextNode("Page " + CoMail.currentHash.Page + " of " + max));
        var prev = document.getElementById("PreviousPage");
        prev.href = location.hash;
        UpdatePage(prev, CoMail.currentHash.Page - 1, max);
        var next = document.getElementById("NextPage");
        UpdatePage(next, CoMail.currentHash.Page + 1, max);
    }
    function UpdatePage(a, page, max) {
        a.href = location.hash;
        if (page < max && page > 0) {
            if (a.href.indexOf("page=") > -1) {
                a.href = a.href.replace("page=" + CoMail.currentHash.Page, "page=" + page);
            }
            else {
                a.href += "&page=" + page;
            }
        }
    }
    function GetMailBoxes() {
        var mb = new CoMail.PublicMailBox();
        mb.Get()
            .then(function (all) {
            CoMail.mailboxes = all;
            CoMail.BuildMailboxes();
            CoMail.Hide("Loading");
            if (location.hash.substring(1).length > 0)
                HandleHash();
        }, function () {
            console.log('error getting All Mailboxes');
        });
    }
})(CoMail || (CoMail = {}));
//# sourceMappingURL=app.js.map