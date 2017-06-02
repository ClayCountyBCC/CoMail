/// <reference path="typings/es6-promise/es6-promise.d.ts" />

namespace CoMail
{
  interface IEmail
  {
    Id: number;
    Subject: string;
    To: string;
    From: string;
    CC: string;
    DateReceived: Date;
    DateReceived_ToString: string;
    DateSent: Date;
    DateSent_ToString: string;
    Body: string;
    AttachmentCount: number;
    Attachments: Array<any>;
    Get(EmailId: number): Promise<Email>;
    GetList(lh: LocationHash): Promise<Array<Email>>;
    GetCount(lh: LocationHash): Promise<number>;
    CheckMailbox(MailboxName: string): boolean;
  
  }

  export class Email implements IEmail
  {
    public Id: number;
    public Subject: string;
    public To: string;
    public CC: string;
    public From: string;
    public DateReceived: Date;
    public DateReceived_ToString: string;
    public DateSent: Date;
    public DateSent_ToString: string;
    public Body: string;
    public AttachmentCount: number;
    Attachments: Array<any>;

    Constructor()
    {
    }

    public Get(EmailId:number): Promise<Email>
    {
      var x = XHR.Get("/API/Email/" + EmailId.toString());
      return new Promise<Email>(function (resolve, reject)
      {
        x.then(function (response)
        {
          let ar: Email = JSON.parse(response.Text);
          return resolve(ar);
        }).catch(function ()
        {
          console.log("error in Get Email");
          return reject(null);
        });
      });
    }
    
    public GetList(lh: LocationHash): Promise<Array<Email>>
    {
      if (!this.CheckMailbox(lh.Mailbox)) return;

      let s = lh.Subject.length === 0 ? "" : "subject=" + lh.Subject;
      let f = lh.From.length === 0 ? "" : "from=" + lh.From;
      let arg = "";
      if (s.length > 0) arg = "?" + s;
      if (f.length > 0) arg = arg.length === 0 ? "?" + f : arg + "&" + f;
      var x = XHR.Get("/API/EmailList/" + lh.Mailbox + "/" + (lh.Page - 1) + "/" + arg);
      return new Promise<Array<Email>>(function (resolve, reject)
      {
        x.then(function (response)
        {
          let ar: Array<Email> = JSON.parse(response.Text);
          return resolve(ar);
        }).catch(function ()
        {
          console.log("error in Get EmailList");
          return reject(null);
        });
      });
    }

    public GetCount(lh: LocationHash): Promise<number>
    {
      if (!this.CheckMailbox(lh.Mailbox)) return;
      let s = lh.Subject.length === 0 ? "" : "subject=" + lh.Subject;
      let f = lh.From.length === 0 ? "" : "from=" + lh.From;
      let arg = "";
      if (s.length > 0) arg = "?" + s;
      if (f.length > 0) arg = arg.length === 0 ? "?" + f : arg + "&" + f;
      var x = XHR.Get("/API/EmailCount/?mailbox=" + lh.Mailbox + arg);
      return new Promise<number>(function (resolve, reject)
      {
        x.then(function (response)
        {
          let resp:number = JSON.parse(response.Text);
          return resolve(resp);
        }).catch(function ()
        {
          console.log("error in Get EmailCount");
          return reject(null);
        });
      });
    }

    CheckMailbox(MailboxName: string): boolean
    {
      let k = mailboxes.filter(function (m)
      {
        return m.MailboxName === MailboxName;
      });
      return k.length === 1;
    }

  }
}