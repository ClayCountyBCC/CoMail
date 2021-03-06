﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Runtime.Caching;
using CoMail.Models;

namespace CoMail.Controllers
{
  [RoutePrefix("API/EmailCount")]
  public class EmailCountController : ApiController
  {
    // GET: api/EmailCount
    [HttpGet]
    public IHttpActionResult Get(
      string mailbox,
      string subject = "",
      string from = ""
      ) // this needs to be modified to require a mailbox name and allow for a page number.
    {

      var pl = (List<PublicMailBox>)myCache.GetItem(
        "mailboxes",
        new CacheItemPolicy() { AbsoluteExpiration = DateTime.Now.AddHours(16) });

      pl = (from p in pl
            where p.MailboxName == mailbox
            select p).ToList();
      if (pl.Count == 1) // If we don't have exactly one record here, we have a problem.
      {
        var pId = pl.First().Id;
        if (subject.Length == 0 && from.Length == 0)
        {
          var i = DateTime.Now.Minute * 60 + DateTime.Now.Second;
          var CIP = new CacheItemPolicy()
          {
            // this will set the expiration to always expire at the top of the hour.
            AbsoluteExpiration = DateTime.Now.AddSeconds(3600 - i)
          };

          var count = (int)myCache.GetItem(
            "emailcount," + pId.ToString(), CIP);

          if (count != -1)
          {
            return Ok(count);
          }
          else
          {
            return InternalServerError();
          }
        }
        else
        {
          // If they include a subject or from, we want to do a raw query 
          // and return 
          var e = Email.GetCount(pId, subject, from);
          if (e > -1)
          {
            return Ok(e);
          }
          else
          {
            return InternalServerError();
          }
        }
      }
      else
      {
        return BadRequest();
      }
    }
  }
}
