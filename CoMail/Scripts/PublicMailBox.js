var CoMail;
(function (CoMail) {
    function PublicMailBox() {
    }

    PublicMailBox.prototype.Get = function () {
        var request = XHR.Get("API/MailBoxes");

        return new Promise(function (resolve, reject) {
            request.then(function (response) {
                resolve(JSON.parse(response.Text));
            }).catch(function () {
                console.log("error in GetMailBoxes");
                reject(null);
            });
        });
    };

    CoMail.PublicMailBox = PublicMailBox;
})(CoMail || (CoMail = {}));
