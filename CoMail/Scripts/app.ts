/// <reference path="xhr.ts" />
/// <reference path="typings/es6-promise/es6-promise.d.ts" />

namespace CoMail
{
  export let mailboxes: Array<PublicMailBox> = [];

  export function Start(): void
  {
    GetMailBoxes();
    //GetAllEmail();
  }

  function GetAllEmail(): void
  {
    var email = new Email();
    email.Get()
      .then(
      function (allmail: Array<Email>): void
      {
        console.log("Allemail", allmail);
        let element = document.getElementById("ListMail");
        var parser = new DOMParser();
        var d = parser.parseFromString(allmail[0].Body, "text/html");        
        element.appendChild(d.documentElement);

      }, function (): void
      {
        console.log('error getting All Email');
      });
  }

  function GetMailBoxes(): void
  {
    var email = new PublicMailBox();
    email.Get()
      .then(
      function (all: Array<PublicMailBox>): void
      {
        console.log("AllMailBoxes", all);

      }, function (): void
      {
        console.log('error getting All Mailboxes');
      });
  }
}