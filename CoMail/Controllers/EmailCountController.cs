using System.Web.Http;
using CoMail.Infrastructure;

namespace CoMail.Controllers
{
  [RoutePrefix("API/EmailCount")]
  public class EmailCountController : ApiController
  {
    // GET: api/EmailCount
    [HttpGet]
    public IHttpActionResult Get(
      string mailbox,
      string subject = "",
      string from = ""
      )
    {
      return MailboxEmailService.GetCountResponse(this, mailbox, subject, from);
    }
  }
}
