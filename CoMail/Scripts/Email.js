/// <reference path="typings/es6-promise/es6-promise.d.ts" />
var CoMail;
(function (CoMail) {
    var Email = (function () {
        function Email() {
        }
        Email.prototype.Constructor = function () {
        };
        Email.prototype.Get = function () {
            var x = XHR.Get("/API/Mail");
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
        return Email;
    }());
    CoMail.Email = Email;
})(CoMail || (CoMail = {}));
//# sourceMappingURL=Email.js.map