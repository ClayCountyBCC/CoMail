using System.Web.Http;
using CoMail.Models;

namespace CoMail.Controllers
{
  [AllowAnonymous]
  public class SiteStateController : ApiController
  {
    // GET: api/SiteState
    public IHttpActionResult Get()
    {
      return Ok(SiteState.Get());
    }
  }
}
