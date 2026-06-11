using System;
using System.Collections.Generic;
using System.Security.Principal;
using System.Threading;
using System.Web;

namespace CoMail.Infrastructure.Security
{
  public static class AppSecurity
  {
    private const string DeveloperRole = "gMISDeveloper_Group";
    private const string RequestCachePrefix = "__CoMail.AppSecurity.";

    public static bool IsInternalUser()
    {
      return IsInRole(DeveloperRole);
    }

    public static bool CanManageMaintenance()
    {
      return IsInRole(DeveloperRole);
    }

    public static bool CanManageIgnoredEmails()
    {
      return IsInRole(DeveloperRole);
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
