using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using CoMail.Models;
using System.Runtime.Caching;
using System.Threading;

namespace CoMail.Controllers
{
  public class MailBoxesController : ApiController
  {
    // GET: api/MailBoxes
    public IHttpActionResult Get()
    {
      var CIP = new CacheItemPolicy()
      {
        AbsoluteExpiration = DateTime.Now.AddHours(16)
      };
      //Thread.Sleep(5000);
      var mailboxes = (List<PublicMailBox>)myCache.GetItem("mailboxes", CIP);
      if (mailboxes != null)
      {
        return Ok(mailboxes);
      }
      else
      {
        return InternalServerError();
      }
    }
  }
}
