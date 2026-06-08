using System.Web.Http;
using CoMail.Infrastructure;

namespace CoMail.Controllers
{
  public class EmailListController : ApiController
  {
    // This query should return everything except the body of the email
    // but we should test it first to see if 20x email + body isn't bad to download, if so, that will save a query to the server.
    public IHttpActionResult Get(
      string mailbox,
      int page = 0,
      string subject = "",
      string from = ""
      )
    {
      return MailboxEmailService.GetListResponse(this, mailbox, page, subject, from);
    }
  }
}
