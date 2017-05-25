/// <reference path="xhr.ts" />
/// <reference path="typings/es6-promise/es6-promise.d.ts" />
var CoMail;
(function (CoMail) {
    CoMail.mailboxes = [];
    function Start() {
        GetMailBoxes();
        //GetAllEmail();
    }
    CoMail.Start = Start;
    function GetAllEmail() {
        var email = new CoMail.Email();
        email.Get()
            .then(function (allmail) {
            console.log("Allemail", allmail);
            var element = document.getElementById("ListMail");
            var parser = new DOMParser();
            var d = parser.parseFromString(allmail[0].Body, "text/html");
            element.appendChild(d.documentElement);
        }, function () {
            console.log('error getting All Email');
        });
    }
    function GetMailBoxes() {
        var email = new CoMail.PublicMailBox();
        email.Get()
            .then(function (all) {
            console.log("AllMailBoxes", all);
        }, function () {
            console.log('error getting All Mailboxes');
        });
    }
})(CoMail || (CoMail = {}));
//# sourceMappingURL=app.js.map