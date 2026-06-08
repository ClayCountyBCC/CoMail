using System;
using CoMail.Infrastructure;

namespace CoMail.Models
{
  public class SiteState
  {
    public int Id { get; set; }
    public string AppVersion { get; set; }
    public int SchemaVersion { get; set; }
    public bool MaintenanceMode { get; set; }
    public string MaintenanceMessage { get; set; }
    public DateTime? UpdatedUtc { get; set; }
    public string UpdatedBy { get; set; }

    public static SiteState Get()
    {
      string sql = @"
        SELECT
          Id,
          AppVersion,
          SchemaVersion,
          MaintenanceMode,
          MaintenanceMessage,
          UpdatedUtc,
          UpdatedBy
        FROM dbo.ApplicationState
        WHERE Id = 1;";

      SiteState state = Database.QueryFirstOrDefault<SiteState>(sql);
      return state ?? new SiteState();
    }
  }
}
