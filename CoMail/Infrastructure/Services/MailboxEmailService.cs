using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Results;
using CoMail.Models;

namespace CoMail.Infrastructure
{
  public static class MailboxEmailService
  {
    public static IHttpActionResult GetListResponse(
      ApiController controller,
      string mailbox,
      int page = 0,
      string subject = "",
      string from = "")
    {
      PublicMailBox mailboxRecord = MailboxLookup.Find(mailbox);
      if (mailboxRecord == null)
      {
        return new ResponseMessageResult(controller.Request.CreateResponse(HttpStatusCode.NotFound));
      }

      List<Email> emails = GetList(mailboxRecord.Id, page, subject, from);
      if (emails == null)
      {
        return new ResponseMessageResult(controller.Request.CreateResponse(HttpStatusCode.InternalServerError));
      }

      return new ResponseMessageResult(controller.Request.CreateResponse(HttpStatusCode.OK, emails));
    }

    public static IHttpActionResult GetCountResponse(
      ApiController controller,
      string mailbox,
      string subject = "",
      string from = "")
    {
      PublicMailBox mailboxRecord = MailboxLookup.Find(mailbox);
      if (mailboxRecord == null)
      {
        return new ResponseMessageResult(controller.Request.CreateResponse(HttpStatusCode.NotFound));
      }

      int? count = GetCount(mailboxRecord.Id, subject, from);
      if (!count.HasValue)
      {
        return new ResponseMessageResult(controller.Request.CreateResponse(HttpStatusCode.InternalServerError));
      }

      return new ResponseMessageResult(controller.Request.CreateResponse(HttpStatusCode.OK, count.Value));
    }

    private static List<Email> GetList(
      int personId,
      int page,
      string subject,
      string from)
    {
      return HasFilters(subject, from)
        ? Email.GetShort(personId, page, subject, from)
        : Email.GetShort(personId, page);
    }

    private static int? GetCount(
      int personId,
      string subject,
      string from)
    {
      int count = HasFilters(subject, from)
        ? Email.GetCount(personId, subject, from)
        : Email.GetCount(personId);

      return count >= 0 ? (int?)count : null;
    }

    private static bool HasFilters(string subject, string from)
    {
      return !string.IsNullOrWhiteSpace(subject) || !string.IsNullOrWhiteSpace(from);
    }
  }
}
