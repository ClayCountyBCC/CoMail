using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using Dapper;
using CoMail.Models;

namespace CoMail.Infrastructure
{
  public static class Database
  {
    public const string MainConnectionName = "MAIN";
    public const string LogConnectionName = "LOG";

    public static string GetConnectionString(string name)
    {
      ConnectionStringSettings setting = ConfigurationManager.ConnectionStrings[name];
      if (setting == null || string.IsNullOrWhiteSpace(setting.ConnectionString))
      {
        throw new InvalidOperationException($"Connection string '{name}' was not found.");
      }

      return setting.ConnectionString;
    }

    public static List<T> Query<T>(
      string sql,
      object parameters = null,
      string connectionName = MainConnectionName)
    {
      return WithConnection(
        sql,
        connectionName,
        db => db.Query<T>(sql, parameters).ToList(),
        null);
    }

    public static T QueryFirstOrDefault<T>(
      string sql,
      object parameters = null,
      string connectionName = MainConnectionName)
    {
      return WithConnection(
        sql,
        connectionName,
        db => db.QueryFirstOrDefault<T>(sql, parameters),
        default(T));
    }

    public static T QuerySingleOrDefault<T>(
      string sql,
      object parameters = null,
      string connectionName = MainConnectionName)
    {
      return WithConnection(
        sql,
        connectionName,
        db => db.QuerySingleOrDefault<T>(sql, parameters),
        default(T));
    }

    public static int Execute(
      string sql,
      object parameters = null,
      string connectionName = MainConnectionName)
    {
      return WithConnection(
        sql,
        connectionName,
        db => db.Execute(sql, parameters),
        -1);
    }

    public static int ScalarInt(
      string sql,
      object parameters = null,
      string connectionName = MainConnectionName)
    {
      return WithConnection(
        sql,
        connectionName,
        db =>
        {
          object result = db.ExecuteScalar(sql, parameters);
          if (result == null || result == DBNull.Value)
          {
            return -1;
          }

          return Convert.ToInt32(result);
        },
        -1);
    }

    private static T WithConnection<T>(
      string sql,
      string connectionName,
      Func<IDbConnection, T> action,
      T failureValue)
    {
      try
      {
        using (IDbConnection db = new SqlConnection(GetConnectionString(connectionName)))
        {
          return action(db);
        }
      }
      catch (Exception ex)
      {
        TryLogError(ex, sql);
        return failureValue;
      }
    }

    private static void TryLogError(Exception ex, string sql)
    {
      try
      {
        new ErrorLog(ex, sql);
      }
      catch
      {
        // Logging must never take down the request path.
      }
    }
  }
}
