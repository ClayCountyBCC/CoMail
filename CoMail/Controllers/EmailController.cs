using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Runtime.Caching;
using CoMail.Models;
using System.Threading;

namespace CoMail.Controllers
{
  public class EmailController : ApiController
  {
    // GET: api/Email
    public IHttpActionResult Get(long id)
    {
      //Thread.Sleep(5000);
      var CIP = new CacheItemPolicy()
      {
        AbsoluteExpiration = DateTime.Now.AddHours(1)
      };
      var email = Email.Get(id);
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
