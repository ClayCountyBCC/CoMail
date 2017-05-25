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
  public class EmailListController : ApiController
  {
    // This query should return everything except the body of the email
    // but we should test it first to see if 20x email + body isn't bad to download, if so, that will save a query to the server.
    public IHttpActionResult Get(string Name, int Page = 0) // this needs to be modified to require a mailbox name and allow for a page number.
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
