using System;
using System.Linq;

using CoMail.Models;

namespace CoMail.Infrastructure
{
  public static class MailboxLookup
  {
    private const string CacheKey = "mailboxes";

    public static PublicMailBox Find(string mailboxName)
    {
      if (string.IsNullOrWhiteSpace(mailboxName))
      {
        return null;
      }

      var mailboxes = CacheStore.GetOrAdd(
        CacheKey,
        PublicMailBox.Get,
        CacheStore.CreateAbsoluteExpirationPolicy(TimeSpan.FromHours(16)));

      if (mailboxes == null)
      {
        return null;
      }

      return mailboxes.FirstOrDefault(m =>
        string.Equals(m.MailboxName, mailboxName.Trim(), StringComparison.OrdinalIgnoreCase));
    }
  }
}
