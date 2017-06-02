/// <reference path="locationhash.ts" />
/// <reference path="xhr.ts" />
/// <reference path="ui.ts" />
/// <reference path="typings/es6-promise/es6-promise.d.ts" />
declare var $: any;

namespace CoMail
{
  export let mailboxes: Array<PublicMailBox> = [];
  export let currentEmailList: Array<Email> = [];
  export let currentHash: LocationHash = null;
  export let currentEmailCount: number;

  export function Start(): void
  {
    window.onhashchange = HashChange;    
    // let's check the current hash to make sure we don't need to start on a given mailbox / page / email
    GetMailBoxes();
  }
  
  export function ModalClosed(evt:Event)
  {
    location.hash = currentHash.RemoveEmailId();
    let emailMessage = document.getElementById("EmailMessage");
    clearElement(emailMessage);
  }

  export function HashChange()
  {
    HandleHash();
  }

  function HandleHash()
  {
    let hash = location.hash;
    let oldHash = currentHash;
    currentHash = new LocationHash(location.hash.substring(1));
    ShowMenu(currentHash, oldHash);
  }

  function ShowMenu(lh:LocationHash, oh:LocationHash)
  {
    if (lh.Mailbox.length === 0)
    {
      Show("MailboxList");
      ClearEmailList();
      Hide("MailboxView");
    }
    else
    {
      if (oh === null || oh.Mailbox !== lh.Mailbox || oh.Page !== lh.Page)
      {
        UpdateMailboxName(lh.Mailbox);
        GetEmailList(currentHash);
        GetEmailCount(currentHash);
      }
      Hide("MailboxList");
      Show("MailboxView");
    }
    if (lh.EmailId > -1)
    {
      GetEmail(lh.EmailId);
    }
    
  }

  function GetEmail(EmailId: number): void
  {
    Show("Loading");
    let email = new Email();
    email.Get(EmailId)
      .then(
      function (mail: Email): void
      {
        BuildEmailView(mail);
        $('#EmailView').modal('show');
        Hide("Loading");
      }, function (): void
      {
        console.log('error getting Email');
        Hide("EmailLoading");
      });
  }

  function GetEmailList(lh:LocationHash): void
  {
    Show("Loading");
    let EmailList = document.getElementById("EmailList");
    clearElement(EmailList);
    let email = new Email();
    email.GetList(lh)
      .then(
      function (allmail: Array<Email>): void
      {
        currentEmailList = allmail;
        BuildEmailList();
        Hide("Loading");
      }, function (): void
      {
        console.log('error getting Email List');
        Hide("Loading");
      });
  }

  function GetEmailCount(lh: LocationHash): void
  {
    let email = new Email();
    email.GetCount(lh)
      .then(
      function (emailCount: number): void
      {
        currentEmailCount = emailCount;
        BuildPaging();
      }, function (): void
      {
        console.log('error getting Email Count');
      });
  }

  function BuildPaging()
  {
    // first let's update the totalpagecount
    let tpc = document.getElementById("TotalPageCount");
    clearElement(tpc);
    let max = Math.floor(currentEmailCount / 20);
    tpc.appendChild(document.createTextNode("Page " + currentHash.Page + " of " + max));

    let prev = (<HTMLAnchorElement>document.getElementById("PreviousPage"));
    prev.href = location.hash;
    UpdatePage(prev, currentHash.Page - 1, max);

    let next = (<HTMLAnchorElement>document.getElementById("NextPage"));
    UpdatePage(next, currentHash.Page + 1, max);
  }

  function UpdatePage(a: HTMLAnchorElement, page:number, max:number)
  {
    a.href = location.hash;
    if (page < max && page > 0)
    {
      if (a.href.indexOf("page=") > -1)
      {
        a.href = a.href.replace("page=" + currentHash.Page, "page=" + page);
      } else
      {
        a.href += "&page=" + page;
      }
    }
  }

  function GetMailBoxes(): void
  {
    let mb = new PublicMailBox();
    mb.Get()
      .then(
      function (all: Array<PublicMailBox>): void
      {
        mailboxes = all;
        BuildMailboxes();
        Hide("Loading");
        if (location.hash.substring(1).length > 0) HandleHash();
      }, function (): void
      {
        console.log('error getting All Mailboxes');
      });
  }


}