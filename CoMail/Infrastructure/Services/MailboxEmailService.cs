using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Results;
using CoMail.Infrastructure.Security;
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

      List<Email> emails = GetList(mailboxRecord, page, subject, from);
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

      int? count = GetCount(mailboxRecord, subject, from);
      if (!count.HasValue)
      {
        return new ResponseMessageResult(controller.Request.CreateResponse(HttpStatusCode.InternalServerError));
      }

      return new ResponseMessageResult(controller.Request.CreateResponse(HttpStatusCode.OK, count.Value));
    }

    private static List<Email> GetList(
      PublicMailBox mailboxRecord,
      int page,
      string subject,
      string from)
    {
      bool usePublicVisibilityRules = mailboxRecord == null ||
        !AppSecurity.CanViewRestrictedMailbox(mailboxRecord.MailboxName);

      return HasFilters(subject, from)
        ? Email.GetShort(mailboxRecord.Id, page, subject, from, usePublicVisibilityRules)
        : Email.GetShort(mailboxRecord.Id, page, string.Empty, string.Empty, usePublicVisibilityRules);
    }

    private static int? GetCount(
      PublicMailBox mailboxRecord,
      string subject,
      string from)
    {
      bool usePublicVisibilityRules = mailboxRecord == null ||
        !AppSecurity.CanViewRestrictedMailbox(mailboxRecord.MailboxName);
      int count = HasFilters(subject, from)
        ? Email.GetCount(mailboxRecord.Id, subject, from, usePublicVisibilityRules)
        : Email.GetCount(mailboxRecord.Id, string.Empty, string.Empty, usePublicVisibilityRules);

      return count >= 0 ? (int?)count : null;
    }

    private static bool HasFilters(string subject, string from)
    {
      return !string.IsNullOrWhiteSpace(subject) || !string.IsNullOrWhiteSpace(from);
    }
  }
}
