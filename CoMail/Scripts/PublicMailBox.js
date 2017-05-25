/// <reference path="typings/es6-promise/es6-promise.d.ts" />
var CoMail;
(function (CoMail) {
    var PublicMailBox = (function () {
        function PublicMailBox() {
        }
        PublicMailBox.prototype.Get = function () {
            var x = XHR.Get("/API/MailBoxes");
            return new Promise(function (resolve, reject) {
                x.then(function (response) {
                    var ar = JSON.parse(response.Text);
                    return resolve(ar);
                }).catch(function () {
                    console.log("error in GetMailBoxes");
                    return reject(null);
                });
            });
        };
        return PublicMailBox;
    }());
    CoMail.PublicMailBox = PublicMailBox;
})(CoMail || (CoMail = {}));
//# sourceMappingURL=PublicMailBox.js.map