using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Dapper;
using CoMail.Infrastructure;
using Newtonsoft.Json;

namespace CoMail.Models
{
  public class Email
  {
    private const int PageSize = 20;
    private List<Attachment> _attachments = new List<Attachment>();
    private bool _usePublicVisibilityRules = true;

    public long Id { get; set; }
    public int OriginalArcId { get; set; }

    // Backward-compatibility shim so older proc aliases that still return OriginalId
    // continue to hydrate the canonical OriginalArcId property until every environment is updated.
    [JsonIgnore]
    public int OriginalId
    {
      get
      {
        return OriginalArcId;
      }
      set
      {
        OriginalArcId = value;
      }
    }
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
      Normalize(email);
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
      Normalize(emails);
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

      int updated = Database.ScalarInt(
        "dbo.UpdateEmailIgnoreFamily",
        parameters,
        commandType: CommandType.StoredProcedure);

      if (updated > 0 || HasIgnoreValue(emailId, ignore))
      {
        return updated > 0 ? updated : 1;
      }

      return SetIgnoreFamilyFallback(emailId, ignore);
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

    private static void Normalize(Email email)
    {
      if (email == null)
      {
        return;
      }

      email.Subject = TextEncodingRepair.Normalize(email.Subject);
      email.From = TextEncodingRepair.Normalize(email.From);
      email.CC = TextEncodingRepair.Normalize(email.CC);
      email.To = TextEncodingRepair.Normalize(email.To);
      email.Body = TextEncodingRepair.Normalize(email.Body);
    }

    private static void Normalize(IEnumerable<Email> emails)
    {
      if (emails == null)
      {
        return;
      }

      foreach (Email email in emails)
      {
        Normalize(email);
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

      return emails.Where(email => email != null && IsVisibleToPublic(email)).ToList();
    }

    internal static Email FilterVisibleEmail(Email email, bool usePublicVisibilityRules = true)
    {
      if (email == null)
      {
        return null;
      }

      if (usePublicVisibilityRules && !IsVisibleToPublic(email))
      {
        return null;
      }

      return email;
    }

    // Keep an app-side visibility guard in sync with the stored procedures so
    // public users never see ignored or still-embargoed emails during partial deployments.
    private static bool IsVisibleToPublic(Email email)
    {
      if (email == null)
      {
        return false;
      }

      return !email.Ignore && email.DateReceived < GetPublicVisibilityCutoffDate();
    }

    private static DateTime GetPublicVisibilityCutoffDate()
    {
      return DateTime.Today.AddDays(-2);
    }

    private static bool HasIgnoreValue(long emailId, bool ignore)
    {
      const string sql = @"
SELECT COUNT(1)
FROM dbo.email
WHERE id = @EmailId
  AND ISNULL(ignore, 0) = @Ignore;";

      int matchCount = Database.ScalarInt(sql, new
      {
        EmailId = emailId,
        Ignore = ignore
      });

      return matchCount > 0;
    }

    private static int SetIgnoreFamilyFallback(long emailId, bool ignore)
    {
      const string sql = @"
DECLARE @OriginalArcId INT;
SELECT @OriginalArcId = originalArcId
FROM dbo.email
WHERE id = @EmailId;

IF @OriginalArcId IS NULL
BEGIN
  SELECT 0;
  RETURN;
END;

UPDATE dbo.email
SET ignore = @Ignore
WHERE originalArcId = @OriginalArcId;

SELECT @@ROWCOUNT;";

      int updated = Database.ScalarInt(sql, new
      {
        EmailId = emailId,
        Ignore = ignore
      });

      if (updated > 0 || HasIgnoreValue(emailId, ignore))
      {
        return updated > 0 ? updated : 1;
      }

      return updated;
    }
  }
}
