using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Dapper;

namespace CoMail.Models
{
  public class Attachment
  {
    // all I want to emit to the client is the Filename and URL
    public string Filename { get; set; }
    private long MailId { get; set; }
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
        return $"API/File?id={MailId}&Guid={Guid}&AttachmentId={AttachmentId}";
      }
    }
    public Attachment()
    {

    }

    public static List<Attachment> Get(long MailId)
    {
      var dp = new DynamicParameters();
      dp.Add("@mId", MailId);
      string query = @"
        SELECT
          E.originalArcId MailId,
          G.[guid] Guid,
          size Size,
          attId AttachmentId,
          filename Filename
        FROM attachments A
        INNER JOIN email E ON A.emailId = E.id
        INNER JOIN guidLookup G ON E.guidId = G.id
        WHERE A.emailId = @mId
        ORDER BY A.attId ASC";
      try
      {
        return Constants.Get_Data<Attachment>(query, dp, Constants.csMain);
      }
      catch(Exception ex)
      {
        new ErrorLog(ex, query);
        return null;
      }
    }
  }
}