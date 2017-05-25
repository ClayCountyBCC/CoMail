using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Runtime.Caching;
using CoMail.Models;

namespace CoMail.Controllers
{
  public class EmailController : ApiController
  {
    // GET: api/Email
    public IHttpActionResult Get(long EmailId)
    {
      var CIP = new CacheItemPolicy()
      {
        AbsoluteExpiration = DateTime.Now.AddHours(1)
      };
      var email = (List<Email>)myCache.GetItem("email");
      if (email != null)
      {
        return Ok(email);
      }
      else
      {
        return InternalServerError();
      }
    }

  }
}
