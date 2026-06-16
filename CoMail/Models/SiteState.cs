using System;
using System.Data;
using CoMail.Infrastructure;
using CoMail.Infrastructure.Security;

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
    public bool IsInternalUser { get; set; }
    public bool CanManageMaintenance { get; set; }
    public bool CanManageIgnoredEmails { get; set; }
    public AppSecurityDiagnostics SecurityDiagnostics { get; set; }

    public static SiteState Get()
    {
      SiteState state = Database.QueryFirstOrDefault<SiteState>(
        "dbo.GetApplicationState",
        commandType: CommandType.StoredProcedure);

      state = state ?? new SiteState();
      state.AppVersion = TextEncodingRepair.Normalize(state.AppVersion);
      state.MaintenanceMessage = TextEncodingRepair.Normalize(state.MaintenanceMessage);
      state.UpdatedBy = TextEncodingRepair.Normalize(state.UpdatedBy);
      bool isInternalUser = AppSecurity.IsInternalUser();

      state.IsInternalUser = isInternalUser;
      state.CanManageMaintenance = isInternalUser && AppSecurity.CanManageMaintenance();
      state.CanManageIgnoredEmails = isInternalUser && AppSecurity.CanManageIgnoredEmails();
      state.SecurityDiagnostics = AppSecurity.IsPublic()
        ? null
        : AppSecurity.GetDiagnostics();
      return state;
    }
  }
}
