using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
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
      HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, SiteState.Get());
      response.Headers.CacheControl = new CacheControlHeaderValue
      {
        NoCache = true,
        NoStore = true,
        MustRevalidate = true
      };
      response.Headers.Pragma.Add(new NameValueHeaderValue("no-cache"));
      response.Content.Headers.Expires = DateTimeOffset.UtcNow;
      return ResponseMessage(response);
    }
  }
}
