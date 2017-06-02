namespace CoMail
{
  interface ILocationHash
  {
    Mailbox: string;
    Page: number;
    EmailId: number;
    Subject: string;
    From: string;
    constructor(locationHash: string);
    AddEmailId(EmailId: number): string;
  }

  export class LocationHash// implements ILocationHash
  {
    public Mailbox: string = "";
    public Page: number = 1;
    public EmailId: number = -1;
    public Subject: string = "";
    public From: string = "";


    constructor(locationHash: string)
    {
      let ha: Array<string> = locationHash.split("&")
      for (let i = 0; i < ha.length; i++)
      {
        let k: Array<string> = ha[i].split("=");
        switch (k[0].toLowerCase())
        {
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

    public AddEmailId(EmailId: number): string
    { // this function is going to take the current LocationHash
      // and using its current properties, going to emit an updated hash
      // with a new EmailId.
      let h: string = "";
      if (this.Mailbox.length > 0) h += "&mailbox=" + this.Mailbox;
      if (this.Page > -1) h += "&page=" + this.Page.toString();
      if (this.Subject.length > 0) h += "&subject=" + this.Subject;
      if (this.From.length > 0) h += "&from=" + this.From;
      h += "&emailid=" + EmailId.toString();
      return h.substring(1);
    }

    public RemoveEmailId(): string
    { // this function is going to take the current LocationHash
      // and using its current properties, going to emit an updated hash
      // with a new EmailId.
      let h: string = "";
      if (this.Mailbox.length > 0) h += "&mailbox=" + this.Mailbox;
      if (this.Page > -1) h += "&page=" + this.Page.toString();
      if (this.Subject.length > 0) h += "&subject=" + this.Subject;
      if (this.From.length > 0) h += "&from=" + this.From;
      return h.substring(1);
    }


  }


}