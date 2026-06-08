using System;
using Dapper;
using System.Data;
using System.Data.SqlClient;
using CoMail.Infrastructure;

namespace CoMail.Models
{
  public class ErrorLog
  {
    public int AppId { get; set; } = 20029;
    public string ApplicationName { get; set; } = "CoMail";
    public string ErrorText { get; set; }
    public string ErrorMessage { get; set; }
    public string ErrorStacktrace { get; set; }
    public string ErrorSource { get; set; }
    public string Query { get; set; }

    public ErrorLog(string text,
      string message,
      string stacktrace,
      string source,
      string errorQuery)
    {
      ErrorText = text;
      ErrorMessage = message;
      ErrorStacktrace = stacktrace;
      ErrorSource = source;
      Query = errorQuery;
      SaveLog();
    }

    public ErrorLog(Exception ex, string errorQuery = "")
    {
      ErrorText = ex.ToString();
      ErrorMessage = ex.Message;
      ErrorStacktrace = ex.StackTrace;
      ErrorSource = ex.Source;
      Query = errorQuery;
      SaveLog();
    }

    private void SaveLog()
    {
      string sql = @"
          INSERT INTO ErrorData 
          (applicationName, errorText, errorMessage, 
          errorStacktrace, errorSource, query)  
          VALUES (@applicationName, @errorText, @errorMessage,
            @errorStacktrace, @errorSource, @query);";

      try
      {
        using (IDbConnection db = new SqlConnection(Database.GetConnectionString(Database.LogConnectionName)))
        {
          db.Execute(sql, this);
        }
      }
      catch
      {
        // If the error log database is unavailable, do not throw from logging.
      }
    }
  }
}
