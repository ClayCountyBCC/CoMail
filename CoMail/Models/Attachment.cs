using System.Collections.Generic;
using System.Data;
using Dapper;
using CoMail.Infrastructure;

namespace CoMail.Models
{
  public class Attachment
  {
    // all I want to emit to the client is the Filename and URL
    public string Filename { get; set; }
    private long MailId { get; set; }
    private long ParentEmailId { get; set; }
    private int Size { get; set; }
    private string Guid { get; set; }
    private string AttachmentId { get; set; }
    public string URL
    {
      get
      {
        // id = mail id
        // connectionId=dbGuid
        // aid = attachment id (ie starts at 0)
        //MailArchiver/attachment.aspx?id=-2147457683&connectionId=6ebdf11b-3527-4423-8f93-b5928a27a303&aid=0
        string url = $"API/File?id={MailId}&Guid={Guid}&AttachmentId={AttachmentId}";
        if (ParentEmailId > 0)
        {
          url += $"&emailId={ParentEmailId}";
        }

        return url;
      }
    }

    public Attachment()
    {

    }

    public static List<Attachment> Get(long mailId, bool usePublicVisibilityRules = true)
    {
      DynamicParameters parameters = new DynamicParameters();
      parameters.Add("@MailId", mailId);

      if (!usePublicVisibilityRules)
      {
        parameters.Add("@UsePublicVisibilityRules", false);
      }

      List<Attachment> attachments = Database.Query<Attachment>(
        "dbo.GetAttachmentsForEmail",
        parameters,
        commandType: CommandType.StoredProcedure);
      StampParentEmailId(attachments, mailId);
      Normalize(attachments);
      return attachments;
    }

    public static bool CanAccess(
      int originalArcId,
      int attachmentId,
      long emailId = 0,
      string mailboxName = "",
      bool usePublicVisibilityRules = true)
    {
      PublicMailBox mailbox = MailboxLookup.Find(mailboxName);

      if (emailId > 0)
      {
        const string emailSql = @"
SELECT COUNT(1)
FROM dbo.email e
WHERE e.id = @EmailId
  AND (
    @PersonId IS NULL
    OR EXISTS (
      SELECT 1
      FROM dbo.emailMailboxLookup eml
      WHERE eml.emailId = e.id
        AND eml.personId = @PersonId
    )
  )
  AND (
    @UsePublicVisibilityRules = 0
    OR (
      ISNULL(e.ignore, 0) = 0
      AND e.dateReceived < CAST(DATEADD(DAY, -2, GETDATE()) AS date)
    )
  );";

        int emailMatchCount = Database.ScalarInt(emailSql, new
        {
          EmailId = emailId,
          PersonId = mailbox?.Id,
          UsePublicVisibilityRules = usePublicVisibilityRules
        });

        return emailMatchCount > 0;
      }

      const string sql = @"
SELECT COUNT(1)
FROM dbo.email e
INNER JOIN dbo.attachments a
  ON a.emailId = e.id
WHERE (
    (@EmailId > 0 AND e.id = @EmailId)
    OR (@EmailId <= 0 AND e.originalArcId = @OriginalArcId)
  )
  AND a.attachmentId = @AttachmentId
  AND (
    @PersonId IS NULL
    OR EXISTS (
      SELECT 1
      FROM dbo.emailMailboxLookup eml
      WHERE eml.emailId = e.id
        AND eml.personId = @PersonId
    )
  )
  AND (
    @UsePublicVisibilityRules = 0
    OR (
      ISNULL(e.ignore, 0) = 0
      AND e.dateReceived < CAST(DATEADD(DAY, -2, GETDATE()) AS date)
    )
  );";

      int matchCount = Database.ScalarInt(sql, new
      {
        OriginalArcId = originalArcId,
        AttachmentId = attachmentId,
        EmailId = emailId,
        PersonId = mailbox?.Id,
        UsePublicVisibilityRules = usePublicVisibilityRules
      });

      return matchCount > 0;
    }

    private static void StampParentEmailId(IEnumerable<Attachment> attachments, long emailId)
    {
      if (attachments == null)
      {
        return;
      }

      foreach (Attachment attachment in attachments)
      {
        if (attachment != null)
        {
          attachment.ParentEmailId = emailId;
        }
      }
    }

    private static void Normalize(IEnumerable<Attachment> attachments)
    {
      if (attachments == null)
      {
        return;
      }

      foreach (Attachment attachment in attachments)
      {
        if (attachment != null)
        {
          attachment.Filename = TextEncodingRepair.Normalize(attachment.Filename);
        }
      }
    }
  }
}
