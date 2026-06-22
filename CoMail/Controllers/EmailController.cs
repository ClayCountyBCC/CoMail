using System.Net;
using System.Web.Http;
using CoMail.Infrastructure.Security;
using CoMail.Models;

namespace CoMail.Controllers
{
  [RoutePrefix("API/Email")]
  public class EmailController : ApiController
  {
    // GET: api/Email
    [HttpGet]
    [Route("{id:long}")]
    public IHttpActionResult Get(long id, string mailbox = "")
    {
      bool usePublicVisibilityRules = !AppSecurity.CanViewRestrictedEmail(id, mailbox);
      var email = Email.Get(id, usePublicVisibilityRules: usePublicVisibilityRules);
      if (email == null)
      {
        return NotFound();
      }

      return Ok(email);
    }

    [HttpPut]
    [Route("{id:long}")]
    public IHttpActionResult Put(long id, [FromUri] bool ignore = true)
    {
      return UpdateIgnoreFamily(id, ignore);
    }

    [HttpPut]
    [ActionName("Ignore")]
    [Route("{id:long}/Ignore")]
    public IHttpActionResult Ignore(long id, [FromUri] bool ignore = true)
    {
      return UpdateIgnoreFamily(id, ignore);
    }

    private IHttpActionResult UpdateIgnoreFamily(long id, bool ignore)
    {
      if (!AppSecurity.IsInternalUser())
      {
        return StatusCode(HttpStatusCode.Forbidden);
      }

      int updated = Email.SetIgnoreFamily(id, ignore);
      var email = Email.Get(id, usePublicVisibilityRules: false);
      if (email == null)
      {
        return NotFound();
      }

      if (email.Ignore != ignore)
      {
        return Content(
          HttpStatusCode.InternalServerError,
          "Failed to update the ignore setting. Ensure dbo.UpdateEmailIgnoreFamily is deployed and CoMail_User can execute it.");
      }

      return Ok(updated > 0 ? updated : 1);
    }
  }
}
