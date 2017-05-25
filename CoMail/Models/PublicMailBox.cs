using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CoMail.Models
{

  public class PublicMailBox
  {
    public int Id { get; set; }
    public string Title { get; set; }
    public string Name { get; set; }
    public int Active { get; set; }


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
      string sql = @"
        USE PublicEmail;
        SELECT 
          id Id,
          CASE WHEN active = 0 
          THEN 'Former ' + title
          ELSE title END Title,
          name Name,
          active Active
        FROM person;";
      try
      {
        return Constants.Get_Data<PublicMailBox>(sql, Constants.csMain);
      }
      catch(Exception ex)
      {
        new ErrorLog(ex, sql);
        return null;
      }

    }

  }
}