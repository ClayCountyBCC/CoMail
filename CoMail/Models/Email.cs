using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Dapper;
using CoMail.Infrastructure;

namespace CoMail.Models
{
  public class Email
  {
    private const int PageSize = 20;
    private List<Attachment> _attachments = new List<Attachment>();

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
          _attachments = Attachment.Get(Id) ?? new List<Attachment>();
        }

        return _attachments;
      }
    }

    public Email()
    {

    }

    public static List<Email> Get(
      int personId,
      int page = 0,
      string subject = "",
      string from = "")
    {
      DynamicParameters parameters = BuildSearchParameters(personId, page, subject, from);
      string query = BuildEmailQuery(false, subject, from);
      return FilterVisibleEmails(Database.Query<Email>(query, parameters));
    }

    public static Email Get(long emailId)
    {
      DynamicParameters parameters = new DynamicParameters();
      parameters.Add("@EmailId", emailId);

      string query = @"
        SELECT 
          id Id,
          fromAddress 'From',
          toAddress 'To',
          ccAddress CC,
          originalArcId OriginalId,
          dateReceived DateReceived,
          dateSent DateSent,
          subject Subject,
          body Body,
          attachmentCount AttachmentCount,
          ignore Ignore
        FROM email
        WHERE 
          ignore = 0 AND
          id = @EmailId;";

      return FilterVisibleEmail(Database.QuerySingleOrDefault<Email>(query, parameters));
    }

    public static List<Email> GetShort(
      int personId,
      int page = 0,
      string subject = "",
      string from = "")
    {
      DynamicParameters parameters = BuildSearchParameters(personId, page, subject, from);
      string query = BuildEmailQuery(true, subject, from);
      return FilterVisibleEmails(Database.Query<Email>(query, parameters));
    }

    public static int GetCount(
      int personId,
      string subject = "",
      string from = "")
    {
      DynamicParameters parameters = BuildCountParameters(personId, subject, from);
      string query = BuildCountQuery(subject, from);
      return Database.ScalarInt(query, parameters);
    }

    private static DynamicParameters BuildSearchParameters(
      int personId,
      int page,
      string subject,
      string from)
    {
      DynamicParameters parameters = new DynamicParameters();
      parameters.Add("@PersonId", personId);
      parameters.Add("@Page", Math.Max(page, 0) * PageSize);

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
      string from)
    {
      DynamicParameters parameters = new DynamicParameters();
      parameters.Add("@PersonId", personId);

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

    internal static List<Email> FilterVisibleEmails(IEnumerable<Email> emails)
    {
      if (emails == null)
      {
        return new List<Email>();
      }

      return emails.Where(email => email != null && !email.Ignore).ToList();
    }

    internal static Email FilterVisibleEmail(Email email)
    {
      if (email == null || email.Ignore)
      {
        return null;
      }

      return email;
    }

    internal static string BuildEmailQuery(
      bool shortView,
      string subject,
      string from)
    {
      StringBuilder sql = new StringBuilder();
      sql.AppendLine("SELECT");
      sql.AppendLine("  E.id Id,");
      sql.AppendLine("  fromAddress 'From',");

      if (shortView)
      {
        sql.AppendLine("  '' 'To',");
        sql.AppendLine("  '' CC,");
        sql.AppendLine("  0 OriginalId,");
      }
      else
      {
        sql.AppendLine("  toAddress 'To',");
        sql.AppendLine("  ccAddress CC,");
        sql.AppendLine("  originalArcId OriginalId,");
      }

      sql.AppendLine("  dateReceived DateReceived,");
      sql.AppendLine("  dateSent DateSent,");
      sql.AppendLine("  subject Subject,");
      sql.AppendLine(shortView ? "  '' Body," : "  body Body,");
      sql.AppendLine("  attachmentCount AttachmentCount,");
      sql.AppendLine("  E.ignore Ignore");
      sql.AppendLine("FROM email E");
      sql.AppendLine("INNER JOIN emailMailboxLookup EML ON E.id = EML.emailId");
      sql.AppendLine("INNER JOIN person P ON P.id = EML.personId");
      sql.AppendLine("WHERE");
      sql.AppendLine("  E.ignore = 0 AND");
      sql.AppendLine("  P.id = @PersonId");
      sql.Append(BuildSearchFilter(subject, from));
      sql.AppendLine("ORDER BY E.dateReceived DESC");
      sql.AppendLine("OFFSET @Page ROWS FETCH NEXT " + PageSize + " ROWS ONLY;");

      return sql.ToString();
    }

    internal static string BuildCountQuery(string subject, string from)
    {
      StringBuilder sql = new StringBuilder();
      sql.AppendLine("SELECT");
      sql.AppendLine("  COUNT(*)");
      sql.AppendLine("FROM email E");
      sql.AppendLine("INNER JOIN emailMailboxLookup EML ON E.id = EML.emailId");
      sql.AppendLine("INNER JOIN person P ON P.id = EML.personId");
      sql.AppendLine("WHERE");
      sql.AppendLine("  E.ignore = 0 AND");
      sql.AppendLine("  P.id = @PersonId");
      sql.Append(BuildSearchFilter(subject, from));
      sql.Append(";");
      return sql.ToString();
    }

    internal static string BuildSearchFilter(string subject, string from)
    {
      List<string> filters = new List<string>();

      if (!string.IsNullOrWhiteSpace(subject))
      {
        filters.Add("  AND subject LIKE '%' + @Subject + '%'");
      }

      if (!string.IsNullOrWhiteSpace(from))
      {
        filters.Add("  AND fromAddress LIKE '%' + @From + '%'");
      }

      if (filters.Count == 0)
      {
        return string.Empty;
      }

      return Environment.NewLine + string.Join(Environment.NewLine, filters);
    }
  }
}
