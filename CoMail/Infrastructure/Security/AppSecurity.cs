using System;
using System.Configuration;
using System.Collections.Generic;
using System.Security.Principal;
using System.Threading;
using System.Web;
using CoMail.Infrastructure;
using CoMail.Models;

namespace CoMail.Infrastructure.Security
{
  public static class AppSecurity
  {
    private const string DeveloperRole = "gMISDeveloper_Group";
    private const string EmailMaintenanceRole = "gEmailMaintenance_Group";
    private const string RequestCachePrefix = "__CoMail.AppSecurity.";

    public static bool IsPublic()
    {
      if (MatchesCurrentMachine("PublicIIS"))
      {
        return true;
      }

      return MatchesCurrentMachine("DMZTestMachineName");
    }

    public static bool IsInternalUser()
    {
      if (IsPublic())
      {
        return false;
      }

      return HasRestrictedEmailAccessRole();
    }

    public static bool CanManageMaintenance()
    {
      if (IsPublic())
      {
        return false;
      }

      return HasRestrictedEmailAccessRole();
    }

    public static bool CanManageIgnoredEmails()
    {
      if (IsPublic())
      {
        return false;
      }

      return HasRestrictedEmailAccessRole();
    }

    public static bool CanViewRestrictedMailbox(string mailboxName)
    {
      if (IsPublic())
      {
        return false;
      }

      return HasRestrictedEmailAccessRole() || OwnsMailbox(mailboxName);
    }

    public static bool CanViewAllRestrictedEmails()
    {
      if (IsPublic())
      {
        return false;
      }

      return HasRestrictedEmailAccessRole();
    }

    public static bool OwnsRestrictedMailbox(string mailboxName)
    {
      if (IsPublic())
      {
        return false;
      }

      return OwnsMailbox(mailboxName);
    }

    public static bool CanViewRestrictedEmail(long emailId, string mailboxName)
    {
      if (IsPublic())
      {
        return false;
      }

      if (HasRestrictedEmailAccessRole())
      {
        return true;
      }

      if (!OwnsMailbox(mailboxName))
      {
        return false;
      }

      return EmailBelongsToMailbox(emailId, mailboxName);
    }

    public static AppSecurityDiagnostics GetDiagnostics()
    {
      HttpContext context = HttpContext.Current;
      bool isPublic = IsPublic();
      bool isInternalUser = !isPublic && HasRestrictedEmailAccessRole();

      AppSecurityDiagnostics diagnostics = new AppSecurityDiagnostics
      {
        CurrentMachineName = Environment.MachineName,
        PublicIisMachineName = GetConfiguredSettingValue("PublicIIS"),
        DmzTestMachineName = GetConfiguredSettingValue("DMZTestMachineName"),
        MachineMatchesPublicIis = MatchesCurrentMachine("PublicIIS"),
        MachineMatchesDmzTestMachine = MatchesCurrentMachine("DMZTestMachineName"),
        IsPublic = isPublic,
        IsInternalUser = isInternalUser,
        CanManageMaintenance = isInternalUser && CanManageMaintenance(),
        CanManageIgnoredEmails = isInternalUser && CanManageIgnoredEmails()
      };

      diagnostics.HttpContextUser = BuildPrincipalDiagnostic("HttpContext.User", context?.User, DeveloperRole);
      diagnostics.ThreadPrincipal = BuildPrincipalDiagnostic("Thread.CurrentPrincipal", Thread.CurrentPrincipal, DeveloperRole);

      WindowsPrincipal logonUserPrincipal = null;
      try
      {
        WindowsIdentity logonUserIdentity = context?.Request?.LogonUserIdentity;
        if (logonUserIdentity != null)
        {
          logonUserPrincipal = new WindowsPrincipal(logonUserIdentity);
        }
      }
      catch (Exception ex)
      {
        diagnostics.RequestLogonUserIdentity = new AppSecurityPrincipalDiagnostic
        {
          Source = "Request.LogonUserIdentity",
          EvaluationError = ex.Message
        };
      }

      if (diagnostics.RequestLogonUserIdentity == null)
      {
        diagnostics.RequestLogonUserIdentity = BuildPrincipalDiagnostic("Request.LogonUserIdentity", logonUserPrincipal, DeveloperRole);
      }

      WindowsPrincipal currentPrincipal = null;
      if (context?.Request?.IsLocal == true)
      {
        WindowsIdentity currentIdentity = WindowsIdentity.GetCurrent();
        if (currentIdentity != null)
        {
          currentPrincipal = new WindowsPrincipal(currentIdentity);
        }
      }

      diagnostics.LocalCurrentIdentity = BuildPrincipalDiagnostic("WindowsIdentity.GetCurrent()", currentPrincipal, DeveloperRole);
      return diagnostics;
    }

    private static bool HasRestrictedEmailAccessRole()
    {
      return IsInRole(EmailMaintenanceRole) || HasDeveloperRoleAccess();
    }

    private static bool HasDeveloperRoleAccess()
    {
      return IsDeveloperRoleEnabled() && IsInRole(DeveloperRole);
    }

    private static bool OwnsMailbox(string mailboxName)
    {
      string normalizedMailboxName = NormalizeMailboxName(mailboxName);
      if (string.IsNullOrWhiteSpace(normalizedMailboxName))
      {
        return false;
      }

      HttpContext context = HttpContext.Current;
      if (context == null)
      {
        return false;
      }

      foreach (string candidate in GetCandidateMailboxAliases(context))
      {
        if (string.Equals(candidate, normalizedMailboxName, StringComparison.OrdinalIgnoreCase))
        {
          return true;
        }
      }

      return false;
    }

    private static IEnumerable<string> GetCandidateMailboxAliases(HttpContext context)
    {
      HashSet<string> aliases = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      foreach (IPrincipal principal in GetCandidatePrincipals(context))
      {
        string alias = NormalizeMailboxName(principal?.Identity?.Name);
        if (!string.IsNullOrWhiteSpace(alias) && aliases.Add(alias))
        {
          yield return alias;
        }
      }
    }

    private static string NormalizeMailboxName(string value)
    {
      if (string.IsNullOrWhiteSpace(value))
      {
        return null;
      }

      string normalized = value.Trim();
      int slashIndex = normalized.LastIndexOf('\\');
      if (slashIndex >= 0 && slashIndex < normalized.Length - 1)
      {
        normalized = normalized.Substring(slashIndex + 1);
      }

      int atIndex = normalized.IndexOf('@');
      if (atIndex > 0)
      {
        normalized = normalized.Substring(0, atIndex);
      }

      return normalized.Trim().ToLowerInvariant();
    }

    private static bool EmailBelongsToMailbox(long emailId, string mailboxName)
    {
      PublicMailBox mailbox = MailboxLookup.Find(mailboxName);
      if (mailbox == null)
      {
        return false;
      }

      const string sql = @"
SELECT COUNT(1)
FROM dbo.emailMailboxLookup
WHERE emailId = @EmailId
  AND personId = @PersonId;";

      int matchCount = Database.ScalarInt(sql, new
      {
        EmailId = emailId,
        PersonId = mailbox.Id
      });

      return matchCount > 0;
    }

    private static bool IsInRole(string roleName)
    {
      if (string.IsNullOrWhiteSpace(roleName))
      {
        return false;
      }

      HttpContext context = HttpContext.Current;
      if (context != null && TryGetCachedResult(context, roleName, out bool cachedResult))
      {
        return cachedResult;
      }

      if (context == null)
      {
        return false;
      }

      bool isInRole = false;
      foreach (IPrincipal principal in GetCandidatePrincipals(context))
      {
        if (principal?.Identity == null || !principal.Identity.IsAuthenticated)
        {
          continue;
        }

        try
        {
          if (principal.IsInRole(roleName))
          {
            isInRole = true;
            break;
          }
        }
        catch
        {
          // Ignore providers that do not support string role checks.
        }

        if (string.Equals(principal.Identity.Name, roleName, StringComparison.OrdinalIgnoreCase))
        {
          isInRole = true;
          break;
        }

        if (principal is WindowsPrincipal windowsPrincipal && IsInWindowsRole(windowsPrincipal, roleName))
        {
          isInRole = true;
          break;
        }
      }

      CacheResult(context, roleName, isInRole);
      return isInRole;
    }

    private static bool TryGetCachedResult(HttpContext context, string roleName, out bool result)
    {
      object cached = context.Items[BuildCacheKey(roleName)];
      if (cached is bool cachedResult)
      {
        result = cachedResult;
        return true;
      }

      result = false;
      return false;
    }

    private static void CacheResult(HttpContext context, string roleName, bool result)
    {
      if (context?.Items == null)
      {
        return;
      }

      context.Items[BuildCacheKey(roleName)] = result;
    }

    private static string BuildCacheKey(string roleName)
    {
      return RequestCachePrefix + roleName;
    }

    private static bool MatchesCurrentMachine(string settingName)
    {
      string configuredValue = GetConfiguredSettingValue(settingName);
      if (string.IsNullOrWhiteSpace(configuredValue))
      {
        return false;
      }

      string currentMachineName = NormalizeMachineName(Environment.MachineName);
      return !string.IsNullOrWhiteSpace(currentMachineName) &&
        string.Equals(currentMachineName, configuredValue, StringComparison.OrdinalIgnoreCase);
    }

    private static AppSecurityPrincipalDiagnostic BuildPrincipalDiagnostic(string source, IPrincipal principal, string roleName)
    {
      AppSecurityPrincipalDiagnostic diagnostic = new AppSecurityPrincipalDiagnostic
      {
        Source = source,
        PrincipalType = principal?.GetType().FullName
      };

      if (principal?.Identity == null)
      {
        return diagnostic;
      }

      diagnostic.IdentityName = principal.Identity.Name;
      diagnostic.IsAuthenticated = principal.Identity.IsAuthenticated;

      if (!diagnostic.IsAuthenticated || string.IsNullOrWhiteSpace(roleName))
      {
        return diagnostic;
      }

      if (string.Equals(roleName, DeveloperRole, StringComparison.OrdinalIgnoreCase) &&
        !IsDeveloperRoleEnabled())
      {
        diagnostic.IsInDeveloperRole = false;
        diagnostic.EvaluationError = "Developer role is disabled outside DEBUG builds.";
        return diagnostic;
      }

      try
      {
        diagnostic.IsInDeveloperRole = principal.IsInRole(roleName);
        return diagnostic;
      }
      catch (Exception ex)
      {
        diagnostic.EvaluationError = ex.Message;
      }

      if (principal is WindowsPrincipal windowsPrincipal)
      {
        try
        {
          diagnostic.IsInDeveloperRole = IsInWindowsRole(windowsPrincipal, roleName);
        }
        catch (Exception ex)
        {
          diagnostic.EvaluationError = ex.Message;
        }
      }

      return diagnostic;
    }

    private static bool IsDeveloperRoleEnabled()
    {
#if DEBUG
      return true;
#else
      return false;
#endif
    }

    private static string GetConfiguredSettingValue(string settingName)
    {
      if (string.IsNullOrWhiteSpace(settingName))
      {
        return null;
      }

      ConnectionStringSettings settings = ConfigurationManager.ConnectionStrings[settingName];
      return NormalizeMachineName(settings?.ConnectionString);
    }

    private static string NormalizeMachineName(string value)
    {
      if (string.IsNullOrWhiteSpace(value))
      {
        return null;
      }

      return value.Trim().ToUpperInvariant();
    }

    private static IEnumerable<IPrincipal> GetCandidatePrincipals(HttpContext context)
    {
      if (context?.User != null)
      {
        yield return context.User;
      }

      if (Thread.CurrentPrincipal != null)
      {
        yield return Thread.CurrentPrincipal;
      }

      WindowsIdentity logonUserIdentity = null;
      try
      {
        logonUserIdentity = context?.Request?.LogonUserIdentity;
      }
      catch
      {
        // The request identity is not always available this early in the pipeline.
      }

      if (logonUserIdentity != null)
      {
        yield return new WindowsPrincipal(logonUserIdentity);
      }

      if (context?.Request?.IsLocal == true)
      {
        WindowsIdentity currentIdentity = WindowsIdentity.GetCurrent();
        if (currentIdentity != null)
        {
          yield return new WindowsPrincipal(currentIdentity);
        }
      }
    }

    private static bool IsInWindowsRole(WindowsPrincipal windowsPrincipal, string roleName)
    {
      try
      {
        if (windowsPrincipal.IsInRole(roleName))
        {
          return true;
        }
      }
      catch
      {
        // Continue to explicit group enumeration.
      }

      WindowsIdentity windowsIdentity = windowsPrincipal?.Identity as WindowsIdentity;
      if (windowsIdentity?.Groups == null)
      {
        return false;
      }

      foreach (IdentityReference group in windowsIdentity.Groups)
      {
        try
        {
          string groupName = group.Translate(typeof(NTAccount)).Value;
          if (string.Equals(groupName, roleName, StringComparison.OrdinalIgnoreCase) ||
            groupName.EndsWith("\\" + roleName, StringComparison.OrdinalIgnoreCase))
          {
            return true;
          }
        }
        catch
        {
          // Ignore unresolvable groups and continue checking the rest.
        }
      }

      return false;
    }
  }
}
