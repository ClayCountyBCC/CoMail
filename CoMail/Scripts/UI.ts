
namespace CoMail
{
  export function BuildEmailView(e: Email)
  {
    SetValue("EmailSubject", e.Subject);
    SetValue("EmailDateReceived", e.DateReceived_ToString);
    SetValue("EmailFrom", e.From);
    SetValue("EmailTo", e.To);
    SetValue("EmailCc", e.CC);

    let parser = new DOMParser();
    var d = parser.parseFromString(e.Body, "text/html");
    let EmailMessage = document.getElementById("EmailMessage");
    clearElement(EmailMessage);
    EmailMessage.appendChild(d.documentElement);
    AddAttachments(e.Attachments);
  }

  function AddAttachments(attachments: Array<any>)
  {
    let EA: HTMLDivElement = <HTMLDivElement>document.getElementById("EmailAttachments");
    clearElement(EA);
    for (let a of attachments)
    {
      let k: HTMLAnchorElement = document.createElement("a");
      k.style.marginRight = "1em";
      k.href = a.URL;
      k.appendChild(document.createTextNode(a.Filename));
      EA.appendChild(k);
    }
  }
  
  function SetValue(id: string, value: string)
  {
    let e: HTMLElement = document.getElementById(id);
    clearElement(e);
    e.appendChild(document.createTextNode(value));
  }

  export function UpdateMailboxName(MailboxName: string)
  {
    let k = mailboxes.filter(function (m)
    {
      return m.MailboxName === MailboxName;
    });
    let mbn = document.getElementById("MailboxName");
    clearElement(mbn);
    if (k.length === 1)
    {
      mbn.appendChild(document.createTextNode(k[0].Name));
    }
  }

  export function ClearEmailList() : HTMLDivElement
  {
    let emailList: HTMLDivElement = (<HTMLDivElement>document.getElementById("EmailList"));
    clearElement(emailList);
    return emailList;
  }

  export function BuildEmailList()
  {
    let emailList: HTMLDivElement = ClearEmailList();
    let df: DocumentFragment = document.createDocumentFragment();
    for (let email of currentEmailList)
    {
      let edr: HTMLDivElement = document.createElement("div");
      edr.classList.add("d-flex");
      edr.classList.add("col-12");
      edr.classList.add("flex-row");
      edr.classList.add("EmailDataRow");
      edr.classList.add("flex-wrap"); //collapse

      let daterec = CreateEmailListElement("3", email.DateReceived_ToString);
      edr.appendChild(daterec);

      let from: HTMLDivElement = CreateEmailListElement("3", email.From);
      edr.appendChild(from);

      let subject: HTMLDivElement = CreateEmailListElement("4", email.Subject);

      edr.appendChild(subject);

      let view: HTMLDivElement = CreateEmailListElement("2", "");
      view.classList.add("CenterButton");
      let viewButton: HTMLAnchorElement = document.createElement("a");
      viewButton.href = "#" + currentHash.AddEmailId(email.Id);      
      viewButton.classList.add("btn");
      viewButton.classList.add("btn-info");
      viewButton.classList.add("MyInfoButton");
      viewButton.appendChild(document.createTextNode("View"));
      view.appendChild(viewButton);
      edr.appendChild(view);
      df.appendChild(edr);
    }
    emailList.appendChild(df);
  }
  function CreateEmailListElement(size: string, text: string): HTMLDivElement
  {
    let e: HTMLDivElement = document.createElement("div");
    e.classList.add("col-" + size);
    e.classList.add("EmailDataCell");
    if(text.length > 0) e.appendChild(document.createTextNode(text));
    return e;
  }

  export function BuildMailboxes()
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

  export function BuildMailboxItem(mailbox: string, name: string, title: string): HTMLLIElement
  {
    let li: HTMLLIElement = document.createElement("li");
    li.classList.add("d-flex");
    li.classList.add("col-sm-6");
    li.classList.add("col-xl-4");
    li.classList.add("col-xs-12");
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

  export function clearElement(node: HTMLElement): void
  { // this function just emptys an element of all its child nodes.
    while (node.firstChild)
    {
      node.removeChild(node.firstChild);
    }
  }

  export function Show(id: string): void
  {
    let e = document.getElementById(id);
    e.style.display = "block";
  }

  export function Hide(id: string): void
  {
    let e = document.getElementById(id);
    e.style.display = "none";
  }
}