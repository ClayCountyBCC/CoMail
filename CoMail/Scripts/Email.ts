/// <reference path="typings/es6-promise/es6-promise.d.ts" />

namespace CoMail
{
  interface IEmail
  {
    Subject: string;
    EmailTo: string;
    DateReceived: Date;
    DateReceived_ToString: string;
    Body: string;
    AttachmentCount: number;
    Recipients: string;

    Get(): Promise<Array<Email>>;
  
  }

  export class Email implements IEmail
  {
    public Subject: string;
    public EmailTo: string;
    public DateReceived: Date;
    public DateReceived_ToString: string;
    public Body: string;
    public AttachmentCount: number;
    public Recipients: string;

    Constructor()
    {
    }

    public Get(): Promise<Array<Email>>
    {
      var x = XHR.Get("/API/Mail");
      return new Promise<Array<Email>>(function (resolve, reject)
      {
        x.then(function (response)
        {
          let ar: Array<Email> = JSON.parse(response.Text);
          return resolve(ar);
        }).catch(function ()
        {
          console.log("error in Get Email");
          return reject(null);
        });
      });
    }
  }
}