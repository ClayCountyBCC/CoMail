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
  export let currentEmailCount: number;

  export function Start(): void
  {
    window.onhashchange = HashChange;    
    // let's check the current hash to make sure we don't need to start on a given mailbox / page / email
    GetMailBoxes();
  }
  export function HashChange()
  {
    HandleHash();
  }

  function HandleHash()
  {
    if (location.hash.length <= 1) return;
    let hash = location.hash;
    let h: LocationHash = new LocationHash(location.hash.substring(1));
    let oldMailbox = currentMailbox;
    currentMailbox = h.Mailbox;
    currentPage = h.Page;
    currentEmailId = h.EmailId;
    if (h.EmailId === -1)
    {
      GetEmail(h);
      GetEmailCount(h);
    } else
    {
      // we load the specific email
    }
  }


  function GetEmail(lh:LocationHash): void
  {
    let email = new Email();
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

  function GetEmailCount(lh: LocationHash): void
  {
    let email = new Email();
    email.GetCount(lh)
      .then(
      function (emailCount: number): void
      {
        console.log("emailCount", emailCount);
        currentEmailCount = emailCount;
        BuildPaging();
        //let element = document.getElementById("ListMail");
        //var parser = new DOMParser();
        //var d = parser.parseFromString(allmail[0].Body, "text/html");
        //element.appendChild(d.documentElement);

      }, function (): void
      {
        console.log('error getting All Email');
      });
  }

  function BuildPaging()
  {
    // first let's update the totalpagecount
    let tpc = document.getElementById("TotalPageCount");
    clearElement(tpc);
    let max = Math.floor(currentEmailCount / 20);
    tpc.appendChild(document.createTextNode("Page " + currentPage + " of " + max));

    let prev = (<HTMLAnchorElement>document.getElementById("PreviousPage"));
    prev.href = location.hash;
    if (currentPage > 1)
    {
      if (prev.href.indexOf("page=") > -1)
      {
        prev.href = prev.href.replace("page=" + currentPage, "page=" + (currentPage - 1));
      } else
      {
        prev.href += "&page=" + (currentPage - 1);
      }
    }

    let next = (<HTMLAnchorElement>document.getElementById("NextPage"));
    next.href = location.hash;
    if (currentPage < max)
    {
      if (next.href.indexOf("page=") > -1)
      {
        next.href = next.href.replace("page=" + currentPage, "page=" + (currentPage + 1));
      } else
      {
        next.href += "&page=" + (currentPage + 1);
      }
    }
  }

  export function clearElement(node: HTMLElement): void
  { // this function just emptys an element of all its child nodes.
    while (node.firstChild)
    {
      node.removeChild(node.firstChild);
    }
  }

  function GetMailBoxes(): void
  {
    let mb = new PublicMailBox();
    mb.Get()
      .then(
      function (all: Array<PublicMailBox>): void
      {
        console.log("AllMailBoxes", all);
        mailboxes = all;
        BuildMailboxes();
        if (location.hash.substring(1).length > 0) HandleHash();
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
    let sp: HTMLSpanElement = document.createElement("span");
    sp.style.marginRight = "1em";
    sp.appendChild(document.createTextNode(title.replace("Commissioner of ", "").replace("Former", "")));
    li.appendChild(sp);
    let a: HTMLAnchorElement = document.createElement("a");
    a.href = "#mailbox=" + mailbox + "&page=1";
    a.appendChild(document.createTextNode(name));
    li.appendChild(a);
    return li;
  }
}