using System;
using System.Runtime.Caching;

namespace CoMail.Infrastructure
{
  public static class CacheStore
  {
    private static readonly MemoryCache Cache = new MemoryCache("CoMail");
    private static readonly TimeSpan DefaultExpiration = TimeSpan.FromMinutes(10);

    public static T GetOrAdd<T>(string key, Func<T> valueFactory)
    {
      return GetOrAdd(key, valueFactory, CreateAbsoluteExpirationPolicy(DefaultExpiration));
    }

    public static T GetOrAdd<T>(string key, Func<T> valueFactory, CacheItemPolicy policy)
    {
      if (valueFactory == null)
      {
        throw new ArgumentNullException(nameof(valueFactory));
      }

      if (policy == null)
      {
        policy = CreateAbsoluteExpirationPolicy(DefaultExpiration);
      }

      Lazy<T> newValue = new Lazy<T>(valueFactory);
      Lazy<T> cachedValue = Cache.AddOrGetExisting(key, newValue, policy) as Lazy<T>;

      try
      {
        T value = (cachedValue ?? newValue).Value;
        if (value == null)
        {
          Cache.Remove(key);
        }

        return value;
      }
      catch
      {
        Cache.Remove(key);
        throw;
      }
    }

    public static void Set<T>(string key, T value, CacheItemPolicy policy)
    {
      if (policy == null)
      {
        policy = CreateAbsoluteExpirationPolicy(DefaultExpiration);
      }

      Cache.Set(key, value, policy);
    }

    public static CacheItemPolicy CreateAbsoluteExpirationPolicy(TimeSpan duration)
    {
      return new CacheItemPolicy
      {
        AbsoluteExpiration = DateTimeOffset.Now.Add(duration)
      };
    }

    public static CacheItemPolicy CreateAbsoluteExpirationPolicy(DateTimeOffset absoluteExpiration)
    {
      return new CacheItemPolicy
      {
        AbsoluteExpiration = absoluteExpiration
      };
    }

    public static CacheItemPolicy CreateTopOfHourPolicy()
    {
      DateTimeOffset now = DateTimeOffset.Now;
      DateTimeOffset nextHour = new DateTimeOffset(now.Year, now.Month, now.Day, now.Hour, 0, 0, now.Offset).AddHours(1);
      return CreateAbsoluteExpirationPolicy(nextHour);
    }
  }
}
