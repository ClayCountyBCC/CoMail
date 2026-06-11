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

    public static List<Attachment> Get(long mailId, bool usePublicVisibilityRules = true)
    {
      DynamicParameters parameters = new DynamicParameters();
      parameters.Add("@MailId", mailId);

      if (!usePublicVisibilityRules)
      {
        parameters.Add("@UsePublicVisibilityRules", false);
      }

      return Database.Query<Attachment>(
        "dbo.GetAttachmentsForEmail",
        parameters,
        commandType: CommandType.StoredProcedure);
    }
  }
}
