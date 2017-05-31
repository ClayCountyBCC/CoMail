/// <reference path="typings/es6-promise/es6-promise.d.ts" />
var CoMail;
(function (CoMail) {
    var Email = (function () {
        function Email() {
        }
        Email.prototype.Constructor = function () {
        };
        Email.prototype.Get = function (lh) {
            if (!this.CheckMailbox(lh.Mailbox))
                return;
            var s = lh.Subject.length === 0 ? "" : "subject=" + lh.Subject;
            var f = lh.From.length === 0 ? "" : "from=" + lh.From;
            var arg = "";
            if (s.length > 0)
                arg = "?" + s;
            if (f.length > 0)
                arg = arg.length === 0 ? "?" + f : arg + "&" + f;
            var x = XHR.Get("/API/EmailList/" + lh.Mailbox + "/" + (lh.Page - 1) + "/" + arg);
            return new Promise(function (resolve, reject) {
                x.then(function (response) {
                    var ar = JSON.parse(response.Text);
                    return resolve(ar);
                }).catch(function () {
                    console.log("error in Get Email");
                    return reject(null);
                });
            });
        };
        Email.prototype.GetCount = function (lh) {
            if (!this.CheckMailbox(lh.Mailbox))
                return;
            var s = lh.Subject.length === 0 ? "" : "subject=" + lh.Subject;
            var f = lh.From.length === 0 ? "" : "from=" + lh.From;
            var arg = "";
            if (s.length > 0)
                arg = "?" + s;
            if (f.length > 0)
                arg = arg.length === 0 ? "?" + f : arg + "&" + f;
            var x = XHR.Get("/API/EmailCount/" + lh.Mailbox + "/" + (lh.Page - 1) + "/" + arg);
            return new Promise(function (resolve, reject) {
                x.then(function (response) {
                    var resp = JSON.parse(response.Text);
                    return resolve(resp);
                }).catch(function () {
                    console.log("error in Get Email");
                    return reject(null);
                });
            });
        };
        Email.prototype.CheckMailbox = function (MailboxName) {
            var k = CoMail.mailboxes.filter(function (m) {
                return m.MailboxName === MailboxName;
            });
            return k.length === 1;
        };
        return Email;
    }());
    CoMail.Email = Email;
})(CoMail || (CoMail = {}));
//# sourceMappingURL=Email.js.map