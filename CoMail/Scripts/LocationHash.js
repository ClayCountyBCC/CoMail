var CoMail;
(function (CoMail) {
    var LocationHash // implements ILocationHash
     = (function () {
        function LocationHash(locationHash) {
            this.Mailbox = "";
            this.Page = 1;
            this.EmailId = -1;
            this.Subject = "";
            this.From = "";
            var ha = locationHash.split("&");
            for (var i = 0; i < ha.length; i++) {
                var k = ha[i].split("=");
                switch (k[0].toLowerCase()) {
                    case "mailbox":
                        this.Mailbox = k[1];
                        break;
                    case "page":
                        this.Page = parseInt(k[1]);
                        break;
                    case "emailid":
                        this.EmailId = parseInt(k[1]);
                        break;
                    case "from":
                        this.From = k[1];
                        break;
                    case "subject":
                        this.Subject = k[1];
                }
            }
        }
        LocationHash.prototype.AddEmailId = function (EmailId) {
            // and using its current properties, going to emit an updated hash
            // with a new EmailId.
            var h = "";
            if (this.Mailbox.length > 0)
                h += "&mailbox=" + this.Mailbox;
            if (this.Page > -1)
                h += "&page=" + this.Page.toString();
            if (this.Subject.length > 0)
                h += "&subject=" + this.Subject;
            if (this.From.length > 0)
                h += "&from=" + this.From;
            h += "&emailid=" + EmailId.toString();
            return h.substring(1);
        };
        LocationHash.prototype.RemoveEmailId = function () {
            // and using its current properties, going to emit an updated hash
            // with a new EmailId.
            var h = "";
            if (this.Mailbox.length > 0)
                h += "&mailbox=" + this.Mailbox;
            if (this.Page > -1)
                h += "&page=" + this.Page.toString();
            if (this.Subject.length > 0)
                h += "&subject=" + this.Subject;
            if (this.From.length > 0)
                h += "&from=" + this.From;
            return h.substring(1);
        };
        return LocationHash;
    }());
    CoMail.LocationHash = LocationHash;
})(CoMail || (CoMail = {}));
//# sourceMappingURL=locationhash.js.map