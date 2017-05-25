using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using CoMail.Models;
using System.Runtime.Caching;

namespace CoMail.Controllers
{
  public class MailController : ApiController
  {
    // GET: api/Mail
    public IHttpActionResult Get()
    {
      var CIP = new CacheItemPolicy()
      {
        AbsoluteExpiration = DateTime.Now.AddHours(1)
      };
      var email = (List<Email>)myCache.GetItem("email");
      if(email != null)
      {
        return Ok(email);
      }
      else
      {
        return InternalServerError();
      }
    }

    // GET: api/Mail/5
  }
}
