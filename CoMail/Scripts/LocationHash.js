var CoMail;
(function (CoMail) {
    function LocationHash(locationHash) {
        this.Mailbox = "";
        this.Page = 1;
        this.EmailId = -1;
        this.Subject = "";
        this.From = "";
        this.Section = "county";

        var segments = locationHash.split("&");
        for (var i = 0; i < segments.length; i++) {
            var parts = segments[i].split("=");
            switch (parts[0].toLowerCase()) {
                case "mailbox":
                    this.Mailbox = decodeValue(parts);
                    break;
                case "page":
                    this.Page = parseInt(parts[1], 10);
                    break;
                case "emailid":
                    this.EmailId = parseInt(parts[1], 10);
                    break;
                case "from":
                    this.From = decodeValue(parts);
                    break;
                case "subject":
                    this.Subject = decodeValue(parts);
                    break;
                case "section":
                    this.Section = normalizeSection(decodeValue(parts));
                    break;
            }
        }
    }

    LocationHash.prototype.AddEmailId = function (emailId) {
        var hash = "";
        if (this.Section.length > 0) {
            hash += "&section=" + encodeURIComponent(this.Section);
        }
        if (this.Mailbox.length > 0) {
            hash += "&mailbox=" + encodeURIComponent(this.Mailbox);
        }
        if (this.Page > -1) {
            hash += "&page=" + this.Page.toString();
        }
        if (this.Subject.length > 0) {
            hash += "&subject=" + encodeURIComponent(this.Subject);
        }
        if (this.From.length > 0) {
            hash += "&from=" + encodeURIComponent(this.From);
        }
        hash += "&emailid=" + emailId.toString();
        return hash.substring(1);
    };

    LocationHash.prototype.RemoveEmailId = function () {
        var hash = "";
        if (this.Section.length > 0) {
            hash += "&section=" + encodeURIComponent(this.Section);
        }
        if (this.Mailbox.length > 0) {
            hash += "&mailbox=" + encodeURIComponent(this.Mailbox);
        }
        if (this.Page > -1) {
            hash += "&page=" + this.Page.toString();
        }
        if (this.Subject.length > 0) {
            hash += "&subject=" + encodeURIComponent(this.Subject);
        }
        if (this.From.length > 0) {
            hash += "&from=" + encodeURIComponent(this.From);
        }
        return hash.substring(1);
    };

    LocationHash.prototype.ToSectionHash = function () {
        return "section=" + encodeURIComponent(this.Section);
    };

    function decodeValue(parts) {
        if (parts.length < 2) {
            return "";
        }

        return decodeURIComponent(parts[1]);
    }

    function normalizeSection(section) {
        return (section || "").toLowerCase() === "former" ? "former" : "county";
    }

    CoMail.LocationHash = LocationHash;
})(CoMail || (CoMail = {}));
