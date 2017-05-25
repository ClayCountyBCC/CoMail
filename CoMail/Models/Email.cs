using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

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

    public static List<Email> GetBasic()
    {
      string query = @"";

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