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
        return LocationHash;
    }());
    CoMail.LocationHash = LocationHash;
})(CoMail || (CoMail = {}));
//# sourceMappingURL=locationhash.js.map