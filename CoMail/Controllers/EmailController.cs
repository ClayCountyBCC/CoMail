using System.Web.Http;
using CoMail.Models;

namespace CoMail.Controllers
{
  public class EmailController : ApiController
  {
    // GET: api/Email
    public IHttpActionResult Get(long id)
    {
      var email = Email.Get(id);
      if (email == null)
      {
        return NotFound();
      }

      return Ok(email);
    }
  }
}
