using System.Net;
using System.Web.Http;
using CoMail.Infrastructure.Security;
using CoMail.Models;

namespace CoMail.Controllers
{
  public class EmailController : ApiController
  {
    // GET: api/Email
    public IHttpActionResult Get(long id)
    {
      var email = Email.Get(id, usePublicVisibilityRules: !AppSecurity.IsInternalUser());
      if (email == null)
      {
        return NotFound();
      }

      return Ok(email);
    }

    [HttpPut]
    [Route("API/Email/{id:long}/Ignore")]
    public IHttpActionResult Put(long id, bool ignore = true)
    {
      if (!AppSecurity.CanManageIgnoredEmails())
      {
        return StatusCode(HttpStatusCode.Forbidden);
      }

      int updated = Email.SetIgnoreFamily(id, ignore);
      if (updated < 1)
      {
        return NotFound();
      }

      return Ok(updated);
    }
  }
}
