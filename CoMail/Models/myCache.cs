using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Caching;

namespace CoMail.Models
{
#pragma warning disable IDE1006 // Naming Styles
  public class myCache
#pragma warning restore IDE1006 // Naming Styles
  {
    private static MemoryCache _cache = new MemoryCache("myCache");

 
    public static object GetItem(string key)
    {
      return GetOrAddExisting(key, () => InitItem(key));
    }

    public static object GetItem(string key, CacheItemPolicy CIP)
    {
      return GetOrAddExisting(key, () => InitItem(key), CIP);
    }

    public static T GetItem<T>(string key, Func<T> valuefactory, CacheItemPolicy CIP)
    {
      return GetOrAddExisting(key, valuefactory, CIP);
    }

    public static void UpdateItem(string key, object newvalue, CacheItemPolicy CIP)
    {
      _cache.Set(key, newvalue, CIP);
    }

    private static T GetOrAddExisting<T>(string key, Func<T> valueFactory, CacheItemPolicy CIP)
    {

      Lazy<T> newValue = new Lazy<T>(valueFactory);
      var oldValue = _cache.AddOrGetExisting(key, newValue, CIP) as Lazy<T>;
      try
      {
        return (oldValue ?? newValue).Value;
      }
      catch
      {
        // Handle cached lazy exception by evicting from cache. Thanks to Denis Borovnev for pointing this out!
        _cache.Remove(key);
        throw;
      }
    }

    private static T GetOrAddExisting<T>(string key, Func<T> valueFactory)
    {

      Lazy<T> newValue = new Lazy<T>(valueFactory);
      var oldValue = _cache.AddOrGetExisting(key, newValue, GetCIP()) as Lazy<T>;
      try
      {
        return (oldValue ?? newValue).Value;
      }
      catch
      {
        // Handle cached lazy exception by evicting from cache. Thanks to Denis Borovnev for pointing this out!
        _cache.Remove(key);
        throw;
      }
    }

    private static CacheItemPolicy GetCIP()
    {
      CacheItemPolicy CIP = new CacheItemPolicy()
      {
        AbsoluteExpiration = DateTime.Now.AddMinutes(10)
      };
      return CIP;
    }

    private static object InitItem(string key)
    {
      string[] k = key.Trim().ToLower().Split(',');
      switch (k[0])
      {
        case "email":
          int personId = int.Parse(k[1]);
          int page = int.Parse(k[2]);
          return Email.GetShort(personId, page);

        case "emailcount":
          int pId = int.Parse(k[1]);
          return Email.GetCount(pId);

        case "mailboxes":
          return PublicMailBox.Get();
        
        default:
          return null;
      }
    }


  }
}