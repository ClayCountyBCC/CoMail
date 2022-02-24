using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Dapper;

namespace CoMail.Models
{
  public class Email
  {
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
    public string DateSent_ToString
    {
      get
      {
        return DateSent.ToString();
      }
    }
    public string Body { get; set; }
    public int AttachmentCount { get; set; }
    public List<Attachment> Attachments
    {
      get
      {
        if(AttachmentCount > 0)
        {
          _attachments = Attachment.Get(Id);
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
      string sub = "";
      string frm = "";
      var dp = new DynamicParameters();
      dp.Add("@PersonId", personId);
      dp.Add("@Page", (int)(page * 20));
      if (subject.Length > 0)
      {
        dp.Add("@Subject", subject);
        sub = " AND subject LIKE '%' + @Subject + '%' ";
      }
      if (from.Length > 0)
      {
        dp.Add("@From", from);
        frm = " AND fromAddress LIKE '%' + @From + '%' ";
      }
      string query = $@"
        SELECT 
          fromAddress 'From',
          toAddress 'To',
          ccAddress CC,
          originalArcId OriginalId,
          dateReceived DateReceived,
          dateSent DateSent,
          subject Subject,
          body Body,
          attachmentCount AttachmentCount
        FROM email E
        INNER JOIN emailMailboxLookup EML ON E.id = EML.emailId
        INNER JOIN person P ON P.id = EML.personId
        WHERE 
          E.ignore = 0 AND
          P.id = @PersonId
          { sub }
          { frm }
        ORDER BY E.dateReceived DESC
        OFFSET @Page ROWS FETCH NEXT 20 ROWS ONLY;";
      try
      {
        return Constants.Get_Data<Email>(query, dp, Constants.csMain);
      }
      catch(Exception ex)
      {
        new ErrorLog(ex, query);
        return null;
      }


    }

    public static Email Get(long emailId)
    {
      var dp = new DynamicParameters();
      dp.Add("@EmailId", emailId);
      string query = $@"
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
          attachmentCount AttachmentCount
        FROM email
        WHERE 
          ignore = 0 AND
          id = @EmailId;";
      try
      {
        var el = Constants.Get_Data<Email>(query, dp, Constants.csMain);
        if (el.Count() == 1)
        {
          return el.First();
        } else
        {
          return null;
        }
      }
      catch (Exception ex)
      {
        new ErrorLog(ex, query);
        return null;
      }


    }

    public static List<Email> GetShort(
      int personId,
      int page = 0,
      string subject = "",
      string from = "")
    {
      string sub = "";
      string frm = "";
      var dp = new DynamicParameters();
      dp.Add("@PersonId", personId);
      dp.Add("@Page", (int)(page * 20));
      if (subject.Length > 0)
      {
        dp.Add("@Subject", subject);
        sub = " AND subject LIKE '%' + @Subject + '%' ";
      }
      if (from.Length > 0)
      {
        dp.Add("@From", from);
        frm = " AND fromAddress LIKE '%' + @From + '%' ";
      }
      string query = $@"
        SELECT 
          E.id Id,
          fromAddress 'From',
          '' 'To',
          '' CC,
          0 OriginalId,
          dateReceived DateReceived,
          dateSent DateSent,
          subject Subject,
          '' Body,
          attachmentCount AttachmentCount
        FROM email E
        INNER JOIN emailMailboxLookup EML ON E.id = EML.emailId
        INNER JOIN person P ON P.id = EML.personId
        WHERE 
          E.ignore = 0 AND
          P.id = @PersonId
          { sub }
          { frm }
        ORDER BY E.dateReceived DESC
        OFFSET @Page ROWS FETCH NEXT 20 ROWS ONLY;";
      try
      {
        return Constants.Get_Data<Email>(query, dp, Constants.csMain);
      }
      catch (Exception ex)
      {
        new ErrorLog(ex, query);
        return null;
      }


    }

    public static int GetCount(
      int personId,
      string subject = "",
      string from = "")
    {
      string sub = "";
      string frm = "";
      var dp = new DynamicParameters();
      dp.Add("@PersonId", personId);
      if (subject.Length > 0)
      {
        dp.Add("@Subject", subject);
        sub = " AND subject LIKE '%' + @Subject + '%' ";
      }
      if (from.Length > 0)
      {
        dp.Add("@From", from);
        frm = " AND fromAddress LIKE '%' + @From + '%' ";
      }
      string query = $@"
        SELECT 
          COUNT(*)
        FROM email E
        INNER JOIN emailMailboxLookup EML ON E.id = EML.emailId
        INNER JOIN person P ON P.id = EML.personId
        WHERE 
          E.ignore = 0 AND
          P.id = @PersonId
          { sub }
          { frm };";
      try
      {
        return Constants.Exec_Scalar(query, dp, Constants.csMain);
      }
      catch (Exception ex)
      {
        new ErrorLog(ex, query);
        return -1;
      }


    }

  }
}