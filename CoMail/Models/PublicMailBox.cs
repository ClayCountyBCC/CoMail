using System.Collections.Generic;
using System.Data;
using CoMail.Infrastructure;

namespace CoMail.Models
{
  public class PublicMailBox
  {
    public int Id { get; set; }
    public string Title { get; set; }
    public string Name { get; set; }
    public int Active { get; set; }
    public string MailboxName { get; set; }
    public int District { get; set; }
    public int FinalTermYear { get; set; }

    public PublicMailBox(int Id, string Title, string Name, int Active)
    {
      this.Id = Id;
      this.Title = Title;
      this.Name = Name;
      this.Active = Active;
    }

    public PublicMailBox()
    {

    }

    public static List<PublicMailBox> Get()
    {
      return Database.Query<PublicMailBox>(
        "dbo.GetPublicMailBoxes",
        commandType: CommandType.StoredProcedure);
    }
  }
}
