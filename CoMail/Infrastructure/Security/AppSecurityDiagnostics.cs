namespace CoMail.Infrastructure.Security
{
  public sealed class AppSecurityDiagnostics
  {
    public string CurrentMachineName { get; set; }
    public string PublicIisMachineName { get; set; }
    public string DmzTestMachineName { get; set; }
    public bool MachineMatchesPublicIis { get; set; }
    public bool MachineMatchesDmzTestMachine { get; set; }
    public bool IsPublic { get; set; }
    public bool IsInternalUser { get; set; }
    public AppSecurityPrincipalDiagnostic HttpContextUser { get; set; }
    public AppSecurityPrincipalDiagnostic ThreadPrincipal { get; set; }
    public AppSecurityPrincipalDiagnostic RequestLogonUserIdentity { get; set; }
    public AppSecurityPrincipalDiagnostic LocalCurrentIdentity { get; set; }
  }

  public sealed class AppSecurityPrincipalDiagnostic
  {
    public string Source { get; set; }
    public string PrincipalType { get; set; }
    public string IdentityName { get; set; }
    public bool IsAuthenticated { get; set; }
    public string EvaluatedRoleName { get; set; }
    public bool? IsInRestrictedEmailAccessRole { get; set; }
    public string EvaluationError { get; set; }
  }
}
