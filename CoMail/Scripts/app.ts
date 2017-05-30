/// <reference path="locationhash.ts" />
/// <reference path="xhr.ts" />
/// <reference path="typings/es6-promise/es6-promise.d.ts" />

namespace CoMail
{
  export let mailboxes: Array<PublicMailBox> = [];
  export let currentEmail: Array<Email> = [];
  export let currentMailbox: string;
  export let currentEmailId: number;
  export let currentPage: number;

  export function Start(): void
  {
    window.onhashchange = HashChange;
    // let's check the current hash to make sure we don't need to start on a given mailbox / page / email
    GetMailBoxes();
    //GetEmail("wayne.bolla", 0, "", "Troy.Nagle");
  }
  export function HashChange()
  {
    let hash = location.hash;
    let h: LocationHash = new LocationHash(location.hash.substring(1));
    let oldMailbox = currentMailbox;
    currentMailbox = h.Mailbox;
    currentPage = h.Page;
    currentEmailId = h.EmailId;
    if (h.EmailId === -1)
    {
      GetEmail(h);
    } else
    {
      // we load the specific email
    }
  }

  function GetEmail(lh:LocationHash): void
  {
    var email = new Email();
    email.Get(lh)
      .then(
      function (allmail: Array<Email>): void
      {
        console.log("email", allmail);
        currentEmail = allmail;
        //let element = document.getElementById("ListMail");
        //var parser = new DOMParser();
        //var d = parser.parseFromString(allmail[0].Body, "text/html");
        //element.appendChild(d.documentElement);

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
        mailboxes = all;
        BuildMailboxes();
      }, function (): void
      {
        console.log('error getting All Mailboxes');
      });
  }

  function BuildMailboxes()
  {
    let comm: HTMLUListElement = (<HTMLUListElement>document.getElementById("Commissioners"));
    let former: HTMLUListElement = (<HTMLUListElement>document.getElementById("FormerCommissioners"));
    let other: HTMLUListElement = (<HTMLUListElement>document.getElementById("OtherPublic"));

    for (let m of CoMail.mailboxes)
    {
      if (m.Active === 0)
      {
        if (m.Title.indexOf("ommiss") !== -1) // they are a former commissioner
        {
          former.appendChild(BuildMailboxItem(m.MailboxName, m.Name, m.Title))
        }
        else // they are other than a commissioner
        {
          other.appendChild(BuildMailboxItem(m.MailboxName, m.Name, m.Title))
        }
      }
      else
      {
        comm.appendChild(BuildMailboxItem(m.MailboxName, m.Name, m.Title))
      }
    }
    document.getElementById("MailboxList").style.display = "block";    
  }

  function BuildMailboxItem(mailbox: string, name: string, title: string): HTMLLIElement
  {
    let li: HTMLLIElement = document.createElement("li");
    let a: HTMLAnchorElement = document.createElement("a");
    a.href = "#mailbox=" + mailbox;
    a.appendChild(document.createTextNode(name + " " + title));

    li.appendChild(a);
    return li;
  }
}