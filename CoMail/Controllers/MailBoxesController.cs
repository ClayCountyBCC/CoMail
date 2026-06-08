using System;
using System.Web.Http;
using CoMail.Infrastructure;
using CoMail.Models;

namespace CoMail.Controllers
{
  public class MailBoxesController : ApiController
  {
    // GET: api/MailBoxes
    public IHttpActionResult Get()
    {
      var mailboxes = CacheStore.GetOrAdd(
        "mailboxes",
        PublicMailBox.Get,
        CacheStore.CreateAbsoluteExpirationPolicy(TimeSpan.FromHours(16)));

      if (mailboxes == null)
      {
        return InternalServerError();
      }

      return Ok(mailboxes);
    }
  }
}
