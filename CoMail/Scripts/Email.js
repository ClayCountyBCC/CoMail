var CoMail;
(function (CoMail) {
    function Email() {
    }

    Email.prototype.Get = function (emailId) {
        var request = XHR.Get("API/Email/" + emailId.toString());

        return new Promise(function (resolve, reject) {
            request.then(function (response) {
                resolve(JSON.parse(response.Text));
            }).catch(function () {
                console.log("error in Get Email");
                reject(null);
            });
        });
    };

    Email.prototype.GetList = function (lh) {
        if (!this.CheckMailbox(lh.Mailbox)) {
            return Promise.reject(new Error("Invalid mailbox"));
        }

        var query = buildSearchQuery(lh);
        var page = Math.max(lh.Page - 1, 0);
        var url = "API/EmailList/" + encodeURIComponent(lh.Mailbox) + "/" + page.toString() + "/" + (query.length > 0 ? "?" + query : "");
        var request = XHR.Get(url);

        return new Promise(function (resolve, reject) {
            request.then(function (response) {
                resolve(JSON.parse(response.Text));
            }).catch(function () {
                console.log("error in Get EmailList");
                reject(null);
            });
        });
    };

    Email.prototype.GetCount = function (lh) {
        if (!this.CheckMailbox(lh.Mailbox)) {
            return Promise.reject(new Error("Invalid mailbox"));
        }

        var query = buildSearchQuery(lh);
        var url = "API/EmailCount/?mailbox=" + encodeURIComponent(lh.Mailbox) + (query.length > 0 ? "&" + query : "");
        var request = XHR.Get(url);

        return new Promise(function (resolve, reject) {
            request.then(function (response) {
                resolve(JSON.parse(response.Text));
            }).catch(function () {
                console.log("error in Get EmailCount");
                reject(null);
            });
        });
    };

    Email.prototype.SetIgnoreFamily = function (emailId, ignore) {
        var request = XHR.Put("API/Email/" + emailId.toString() + "/Ignore?ignore=" + (ignore ? "true" : "false"));

        return new Promise(function (resolve, reject) {
            request.then(function (response) {
                resolve(JSON.parse(response.Text));
            }).catch(function () {
                console.log("error in Set Email Ignore");
                reject(null);
            });
        });
    };

    Email.prototype.CheckMailbox = function (mailboxName) {
        return CoMail.mailboxes.some(function (m) {
            return m.MailboxName === mailboxName;
        });
    };

    function buildSearchQuery(lh) {
        var query = [];

        if (lh.Subject.length > 0) {
            query.push("subject=" + encodeURIComponent(lh.Subject));
        }

        if (lh.From.length > 0) {
            query.push("from=" + encodeURIComponent(lh.From));
        }

        return query.join("&");
    }

    CoMail.Email = Email;
})(CoMail || (CoMail = {}));
