using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Dapper;
using CoMail.Infrastructure;

namespace CoMail.Models
{
  public class Email
  {
    private const int PageSize = 20;
    private List<Attachment> _attachments = new List<Attachment>();
    private bool _usePublicVisibilityRules = true;

    public long Id { get; set; }
    public int OriginalId { get; set; }
    public string Subject { get; set; }
    public string From { get; set; }
    public string CC { get; set; }
    public string To { get; set; }
    public DateTime DateReceived { get; set; } // DatesTimes from GFI are in UTC
    public DateTime DateSent { get; set; }
    public string DateReceived_ToString
    {
      get
      {
        return DateReceived.ToString();
      }
    }
    public string DateReceived_DateOnlyString
    {
      get
      {
        return DateReceived.ToString("M/d/yyyy");
      }
    }
    public string DateSent_ToString
    {
      get
      {
        return DateSent.ToString();
      }
    }
    public string Body { get; set; }
    public int AttachmentCount { get; set; }
    public bool Ignore { get; set; }
    public List<Attachment> Attachments
    {
      get
      {
        if (_attachments.Count == 0 && AttachmentCount > 0)
        {
          _attachments = Attachment.Get(Id, _usePublicVisibilityRules) ?? new List<Attachment>();
        }

        return _attachments;
      }
    }

    public Email()
    {

    }

    public static Email Get(long emailId, bool usePublicVisibilityRules = true)
    {
      DynamicParameters parameters = new DynamicParameters();
      parameters.Add("@EmailId", emailId);

      if (!usePublicVisibilityRules)
      {
        parameters.Add("@UsePublicVisibilityRules", false);
      }

      Email email = Database.QuerySingleOrDefault<Email>(
        "dbo.GetEmail",
        parameters,
        commandType: CommandType.StoredProcedure);
      SetVisibilityRules(email == null ? null : new[] { email }, usePublicVisibilityRules);
      return FilterVisibleEmail(email, usePublicVisibilityRules);
    }

    public static List<Email> GetShort(
      int personId,
      int page = 0,
      string subject = "",
      string from = "",
      bool usePublicVisibilityRules = true)
    {
      DynamicParameters parameters = BuildSearchParameters(personId, page, subject, from, usePublicVisibilityRules);
      List<Email> emails = Database.Query<Email>(
        "dbo.GetEmailList",
        parameters,
        commandType: CommandType.StoredProcedure);
      SetVisibilityRules(emails, usePublicVisibilityRules);
      return FilterVisibleEmails(emails, usePublicVisibilityRules);
    }

    public static int GetCount(
      int personId,
      string subject = "",
      string from = "",
      bool usePublicVisibilityRules = true)
    {
      DynamicParameters parameters = BuildCountParameters(personId, subject, from, usePublicVisibilityRules);
      return Database.ScalarInt(
        "dbo.GetEmailCount",
        parameters,
        commandType: CommandType.StoredProcedure);
    }

    public static int SetIgnoreFamily(long emailId, bool ignore)
    {
      DynamicParameters parameters = new DynamicParameters();
      parameters.Add("@EmailId", emailId);
      parameters.Add("@Ignore", ignore);

      return Database.ScalarInt(
        "dbo.UpdateEmailIgnoreFamily",
        parameters,
        commandType: CommandType.StoredProcedure);
    }

    private static DynamicParameters BuildSearchParameters(
      int personId,
      int page,
      string subject,
      string from,
      bool usePublicVisibilityRules)
    {
      DynamicParameters parameters = new DynamicParameters();
      parameters.Add("@PersonId", personId);
      parameters.Add("@Page", Math.Max(page, 0) * PageSize);

      if (!usePublicVisibilityRules)
      {
        parameters.Add("@UsePublicVisibilityRules", false);
      }

      if (!string.IsNullOrWhiteSpace(subject))
      {
        parameters.Add("@Subject", subject);
      }

      if (!string.IsNullOrWhiteSpace(from))
      {
        parameters.Add("@From", from);
      }

      return parameters;
    }

    private static DynamicParameters BuildCountParameters(
      int personId,
      string subject,
      string from,
      bool usePublicVisibilityRules)
    {
      DynamicParameters parameters = new DynamicParameters();
      parameters.Add("@PersonId", personId);

      if (!usePublicVisibilityRules)
      {
        parameters.Add("@UsePublicVisibilityRules", false);
      }

      if (!string.IsNullOrWhiteSpace(subject))
      {
        parameters.Add("@Subject", subject);
      }

      if (!string.IsNullOrWhiteSpace(from))
      {
        parameters.Add("@From", from);
      }

      return parameters;
    }

    private void SetVisibilityRules(bool usePublicVisibilityRules)
    {
      _usePublicVisibilityRules = usePublicVisibilityRules;
    }

    private static void SetVisibilityRules(IEnumerable<Email> emails, bool usePublicVisibilityRules)
    {
      if (emails == null)
      {
        return;
      }

      foreach (Email email in emails)
      {
        if (email != null)
        {
          email.SetVisibilityRules(usePublicVisibilityRules);
        }
      }
    }

    internal static List<Email> FilterVisibleEmails(IEnumerable<Email> emails, bool usePublicVisibilityRules = true)
    {
      if (emails == null)
      {
        return new List<Email>();
      }

      if (!usePublicVisibilityRules)
      {
        return emails.Where(email => email != null).ToList();
      }

      return emails.Where(email => email != null && !email.Ignore).ToList();
    }

    internal static Email FilterVisibleEmail(Email email, bool usePublicVisibilityRules = true)
    {
      if (email == null)
      {
        return null;
      }

      if (usePublicVisibilityRules && email.Ignore)
      {
        return null;
      }

      return email;
    }
  }
}
