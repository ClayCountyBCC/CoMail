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
    public string DateReceived_ToString
    {
      get
      {
        return DateReceived.ToString();
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

    public static List<Email> Get(int personId, int page = 0)
    {
      var dp = new DynamicParameters();
      dp.Add("@PersonId", personId);
      dp.Add("@Page", (int)(page * 20));
      string query = @"
        SELECT 
          fromAddress,
          toAddress,
          ccAddress,
          originalArcId,
          dateReceived,
          dateSent,
          subject,
          body,
          attachmentCount
        FROM email E
        INNER JOIN emailMailboxLookup EML ON E.id = EML.emailId
        INNER JOIN person P ON P.id = EML.personId
        WHERE P.id = @PersonId
        ORDER BY E.dateReceived DESC
        OFFSET @Page ROWS FETCH NEXT 20 ROWS ONLY;";
      try
      {
        return Constants.Get_Data<Email>(query, Constants.csMain);
      }
      catch(Exception ex)
      {
        new ErrorLog(ex, query);
        return null;
      }


    }

  }
}