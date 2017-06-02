
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
    console.log('ClearEmailList');
    let emailList: HTMLDivElement = (<HTMLDivElement>document.getElementById("EmailList"));
    clearElement(emailList);
    return emailList;
  }

  export function BuildEmailList()
  {
    console.log('BuildEmailList');
    let emailList: HTMLDivElement = ClearEmailList();
    let df: DocumentFragment = document.createDocumentFragment();
    for (let email of currentEmailList)
    {
      let edr: HTMLDivElement = document.createElement("div");
      edr.classList.add("d-flex", "col-12", "EmailDataRow"); //collapse

      let daterec: HTMLDivElement = document.createElement("div");
      daterec.classList.add("col-3", "EmailDataCell");
      daterec.appendChild(document.createTextNode(email.DateReceived_ToString));
      edr.appendChild(daterec);

      let from: HTMLDivElement = document.createElement("div");
      from.classList.add("col-3", "EmailDataCell");
      from.appendChild(document.createTextNode(email.From));
      edr.appendChild(from);

      let subject: HTMLDivElement = document.createElement("div");
      subject.classList.add("col-4", "EmailDataCell");
      subject.appendChild(document.createTextNode(email.Subject));
      edr.appendChild(subject);

      let view: HTMLDivElement = document.createElement("div");
      view.classList.add("col-2", "EmailDataCell");
      let viewButton: HTMLAnchorElement = document.createElement("a");
      viewButton.href = "#" + currentHash.AddEmailId(email.Id);
      viewButton.classList.add("btn", "btn-info", "MyInfoButton");
      //viewButton.setAttribute("data-toggle", "modal");
      //viewButton.setAttribute("data-target", "#EmailView");
      viewButton.appendChild(document.createTextNode("View"));
      view.appendChild(viewButton);
      edr.appendChild(view);

      df.appendChild(edr);
    }
    emailList.appendChild(df);
//<div class="d-flex col-12 collapse EmailDataRow">
//	<div class="col-3 EmailDataCell" style="overflow:hidden" id="DateTimeReceived">05/26/2017 10:30:58 AM</div>
//	<div class="col-3 EmailDataCell" id="From" style="overflow: hidden">jeremy.west@claycountygov.com</div>
//	<div class="col-4 EmailDataCell" id="EmailSubject">My brain is on Hiatus because of bootstrap 4</div>
//	<div class="col-2 EmailDataCell" id="ViewEmailButton">
//	<button type="button" class="btn btn-info MyInfoButton">View</button>
//	</div>
//</div>
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
    li.classList.add("d-flex", "col-sm-6", "col-xl-4", "col-xs-12");
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