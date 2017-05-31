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
    public string MailboxName { get; set; }


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

        WITH COUNT_CTE(personId, emailCount) AS (
          SELECT personId, COUNT(*) AS CNT
          FROM emailMailboxLookup
          GROUP BY personId
        )

        SELECT 
          id Id,
          CASE WHEN active = 0 
          THEN 'Former ' + title
          ELSE title END Title,
          name Name,
          mailboxName MailboxName,
          active Active
        FROM person P
        INNER JOIN COUNT_CTE C ON P.id = C.personId
        ORDER BY title ASC, finalTermYear DESC;";
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