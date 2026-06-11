using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;
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
      string connectionName = MainConnectionName,
      CommandType commandType = CommandType.Text)
    {
      return WithConnection(
        sql,
        connectionName,
        parameters,
        commandType,
        db => db.Query<T>(sql, parameters, commandType: commandType).ToList(),
        null);
    }

    public static T QueryFirstOrDefault<T>(
      string sql,
      object parameters = null,
      string connectionName = MainConnectionName,
      CommandType commandType = CommandType.Text)
    {
      return WithConnection(
        sql,
        connectionName,
        parameters,
        commandType,
        db => db.QueryFirstOrDefault<T>(sql, parameters, commandType: commandType),
        default(T));
    }

    public static T QuerySingleOrDefault<T>(
      string sql,
      object parameters = null,
      string connectionName = MainConnectionName,
      CommandType commandType = CommandType.Text)
    {
      return WithConnection(
        sql,
        connectionName,
        parameters,
        commandType,
        db => db.QuerySingleOrDefault<T>(sql, parameters, commandType: commandType),
        default(T));
    }

    public static int Execute(
      string sql,
      object parameters = null,
      string connectionName = MainConnectionName,
      CommandType commandType = CommandType.Text)
    {
      return WithConnection(
        sql,
        connectionName,
        parameters,
        commandType,
        db => db.Execute(sql, parameters, commandType: commandType),
        -1);
    }

    public static int ScalarInt(
      string sql,
      object parameters = null,
      string connectionName = MainConnectionName,
      CommandType commandType = CommandType.Text)
    {
      return WithConnection(
        sql,
        connectionName,
        parameters,
        commandType,
        db =>
        {
          object result = db.ExecuteScalar(sql, parameters, commandType: commandType);
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
      object parameters,
      CommandType commandType,
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
        TryLogError(ex, sql, parameters, commandType);
        return failureValue;
      }
    }

    private static string BuildQueryLog(string sql, object parameters, CommandType commandType)
    {
      StringBuilder builder = new StringBuilder();

      if (!string.IsNullOrWhiteSpace(sql))
      {
        if (commandType == CommandType.StoredProcedure)
        {
          builder.Append("EXEC ").AppendLine(sql.TrimEnd());
        }
        else
        {
          builder.AppendLine(sql.TrimEnd());
        }
      }

      string parameterLog = BuildParameterLog(parameters);
      if (!string.IsNullOrWhiteSpace(parameterLog))
      {
        if (builder.Length > 0)
        {
          builder.AppendLine();
        }

        builder.AppendLine("-- Parameters:");
        builder.Append(parameterLog);
      }

      return builder.ToString().TrimEnd();
    }

    private static string BuildParameterLog(object parameters)
    {
      if (parameters == null)
      {
        return string.Empty;
      }

      StringBuilder builder = new StringBuilder();

      if (parameters is DynamicParameters dynamicParameters)
      {
        foreach (string name in dynamicParameters.ParameterNames)
        {
          builder.AppendLine($"-- {name} = {FormatParameterValue(dynamicParameters.Get<object>(name))}");
        }

        return builder.ToString();
      }

      foreach (PropertyInfo property in parameters.GetType().GetProperties(BindingFlags.Instance | BindingFlags.Public))
      {
        if (!property.CanRead || property.GetIndexParameters().Length > 0)
        {
          continue;
        }

        builder.AppendLine($"-- {property.Name} = {FormatParameterValue(property.GetValue(parameters, null))}");
      }

      return builder.ToString();
    }

    private static string FormatParameterValue(object value)
    {
      if (value == null || value == DBNull.Value)
      {
        return "NULL";
      }

      if (value is string stringValue)
      {
        return $"'{stringValue.Replace("'", "''").Replace("\r", " ").Replace("\n", " ")}'";
      }

      if (value is DateTime dateTime)
      {
        return $"'{dateTime.ToString("o", CultureInfo.InvariantCulture)}'";
      }

      if (value is DateTimeOffset dateTimeOffset)
      {
        return $"'{dateTimeOffset.ToString("o", CultureInfo.InvariantCulture)}'";
      }

      if (value is Guid guid)
      {
        return $"'{guid}'";
      }

      if (value is bool booleanValue)
      {
        return booleanValue ? "1" : "0";
      }

      if (value is byte[] bytes)
      {
        return $"<binary {bytes.Length} bytes>";
      }

      if (value.GetType().IsEnum)
      {
        return Convert.ToInt64(value, CultureInfo.InvariantCulture).ToString(CultureInfo.InvariantCulture);
      }

      return Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty;
    }

    private static void TryLogError(Exception ex, string sql, object parameters, CommandType commandType)
    {
      try
      {
        string errorContext = sql;
        try
        {
          errorContext = BuildQueryLog(sql, parameters, commandType);
        }
        catch
        {
          // Preserve the original error if query formatting fails.
        }

        new ErrorLog(ex, errorContext);
      }
      catch
      {
        // Logging must never take down the request path.
      }
    }
  }
}
