/// <reference path="typings/es6-promise/es6-promise.d.ts" />

namespace CoMail
{
  interface IPublicMailBox
  {
    EmailAddress: string;
    Title: string;
    Name: string;
    Active: number;
    MailboxName: string;
    Get(): Promise<Array<PublicMailBox>>;
  }
  export class PublicMailBox implements IPublicMailBox
  {
    public EmailAddress: string;
    public Title: string;
    public Name: string;
    public Active: number;
    public MailboxName: string;
    Get(): Promise<Array<PublicMailBox>>
    {
      var x = XHR.Get("API/MailBoxes");
      return new Promise<Array<PublicMailBox>>(function (resolve, reject)
      {
        x.then(function (response)
        {
          let ar: Array<PublicMailBox> = JSON.parse(response.Text);
          return resolve(ar);
        }).catch(function ()
        {
          console.log("error in GetMailBoxes");
          return reject(null);
        });
      });
    }
  }
}