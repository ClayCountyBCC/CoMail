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
  }

  export class LocationHash// implements ILocationHash
  {
    public Mailbox: string = "";
    public Page: number = 0;
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

  }


}