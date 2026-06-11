using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using CoMail.Models;

namespace CoMail.Infrastructure
{
  public static class AttachmentProxyClient
  {
    public static async Task<HttpResponseMessage> ProxyAsync(
      HttpRequestMessage request,
      int id,
      string guid,
      int attachmentId)
    {
      if (string.IsNullOrWhiteSpace(guid) || guid.Length > 100)
      {
        return request.CreateResponse(HttpStatusCode.BadRequest);
      }

      string username = null;
      string domain = null;
      Uri requestUri = null;
      string failureStage = "Starting attachment proxy request";

      try
      {
        failureStage = "Reading attachment proxy credentials";
        username = Database.GetConnectionString("Username");
        string password = Database.GetConnectionString("Password");
        domain = Database.GetConnectionString("Domain");

        failureStage = "Building upstream attachment request URI";
        requestUri = BuildRequestUri(Database.GetConnectionString("ArchiverBaseUrl"), id, guid, attachmentId);

        failureStage = "Sending upstream request to archive server";
        using (var clientHandler = new HttpClientHandler
        {
          Credentials = new NetworkCredential(username, password, domain)
        })
        {
          using (var client = new HttpClient(clientHandler))
          {
            HttpResponseMessage upstreamResponse = await client.GetAsync(requestUri).ConfigureAwait(false);
            if (!upstreamResponse.IsSuccessStatusCode)
            {
              failureStage = "Reading upstream error response from archive server";
              string upstreamBody = upstreamResponse.Content == null
                ? string.Empty
                : await upstreamResponse.Content.ReadAsStringAsync().ConfigureAwait(false);

              string supportCode = LogFailure(
                failureStage,
                "Attachment proxy upstream request failed.",
                null,
                requestUri,
                id,
                guid,
                attachmentId,
                username,
                domain,
                upstreamResponse.StatusCode,
                upstreamBody);

              return CreateFriendlyFailureResponse(
                request,
                HttpStatusCode.BadGateway,
                "Attachment unavailable",
                "Attachment is currently unavailable or we are having a technical issue.",
                failureStage,
                supportCode);
            }

            failureStage = "Reading upstream attachment stream";
            var response = request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StreamContent(await upstreamResponse.Content.ReadAsStreamAsync().ConfigureAwait(false));
            response.Content.Headers.ContentType = upstreamResponse.Content.Headers.ContentType;
            response.Content.Headers.ContentDisposition = upstreamResponse.Content.Headers.ContentDisposition;
            response.Content.Headers.ContentLength = upstreamResponse.Content.Headers.ContentLength;
            return response;
          }
        }
      }
      catch (Exception ex)
      {
        string supportCode = LogFailure(
          failureStage,
          "Attachment proxy exception.",
          ex,
          requestUri,
          id,
          guid,
          attachmentId,
          username,
          domain,
          null,
          null);
        return CreateFriendlyFailureResponse(
          request,
          HttpStatusCode.ServiceUnavailable,
          "Attachment unavailable",
          "Attachment is currently unavailable or we are having a technical issue.",
          failureStage,
          supportCode);
      }
    }

    private static Uri BuildRequestUri(string baseUrl, int id, string guid, int attachmentId)
    {
      var builder = new UriBuilder(baseUrl)
      {
        Query = "id=" + id.ToString()
          + "&connectionId=" + Uri.EscapeDataString(guid)
          + "&aid=" + attachmentId.ToString()
      };

      return builder.Uri;
    }

    private static string LogFailure(
      string failureStage,
      string summary,
      Exception exception,
      Uri requestUri,
      int id,
      string guid,
      int attachmentId,
      string username,
      string domain,
      HttpStatusCode? upstreamStatus,
      string upstreamBody)
    {
      string supportCode = BuildSupportCode();
      string errorMessage = summary;
      if (!string.IsNullOrWhiteSpace(failureStage))
      {
        errorMessage += " Stage: " + failureStage + ".";
      }

      errorMessage += " Support code: " + supportCode + ".";

      if (exception != null && !string.IsNullOrWhiteSpace(exception.Message))
      {
        errorMessage += " " + exception.Message;
      }

      new ErrorLog(
        summary,
        errorMessage,
        exception == null ? string.Empty : BuildExceptionDetails(exception),
        nameof(AttachmentProxyClient),
        BuildAttachmentContext(
          supportCode,
          failureStage,
          requestUri,
          id,
          guid,
          attachmentId,
          username,
          domain,
          upstreamStatus,
          upstreamBody,
          exception));

      return supportCode;
    }

    private static string BuildAttachmentContext(
      string supportCode,
      string failureStage,
      Uri requestUri,
      int id,
      string guid,
      int attachmentId,
      string username,
      string domain,
      HttpStatusCode? upstreamStatus,
      string upstreamBody,
      Exception exception)
    {
      return
        "Attachment proxy request:" + Environment.NewLine +
        "  SupportCode: " + (supportCode ?? string.Empty) + Environment.NewLine +
        "  FailureStage: " + (failureStage ?? string.Empty) + Environment.NewLine +
        "  RequestUri: " + (requestUri == null ? string.Empty : requestUri.ToString()) + Environment.NewLine +
        "  Id: " + id.ToString() + Environment.NewLine +
        "  Guid: " + guid + Environment.NewLine +
        "  AttachmentId: " + attachmentId.ToString() + Environment.NewLine +
        "  Username: " + (username ?? string.Empty) + Environment.NewLine +
        "  Domain: " + (domain ?? string.Empty) + Environment.NewLine +
        "  UpstreamStatus: " + (upstreamStatus.HasValue ? ((int)upstreamStatus.Value).ToString() + " " + upstreamStatus.Value : string.Empty) + Environment.NewLine +
        "  UpstreamBody: " + (upstreamBody ?? string.Empty) + Environment.NewLine +
        "  ExceptionType: " + (exception == null ? string.Empty : exception.GetType().FullName) + Environment.NewLine +
        "  ExceptionMessage: " + (exception == null ? string.Empty : exception.Message) + Environment.NewLine +
        "  InnerException: " + BuildInnerExceptionSummary(exception);
    }

    private static string BuildSupportCode()
    {
      return "ATT-" + Guid.NewGuid().ToString("N").Substring(0, 8).ToUpperInvariant();
    }

    private static string BuildExceptionDetails(Exception exception)
    {
      if (exception == null)
      {
        return string.Empty;
      }

      StringBuilder builder = new StringBuilder();
      int depth = 0;
      for (Exception current = exception; current != null; current = current.InnerException)
      {
        if (depth > 0)
        {
          builder.AppendLine();
        }

        builder.Append("Exception[").Append(depth.ToString()).Append("]: ");
        builder.Append(current.GetType().FullName);
        builder.Append(": ");
        builder.Append(current.Message);

        if (!string.IsNullOrWhiteSpace(current.StackTrace))
        {
          builder.AppendLine();
          builder.Append(current.StackTrace);
        }

        depth++;
      }

      return builder.ToString().TrimEnd();
    }

    private static string BuildInnerExceptionSummary(Exception exception)
    {
      if (exception == null || exception.InnerException == null)
      {
        return string.Empty;
      }

      StringBuilder builder = new StringBuilder();
      int depth = 0;
      for (Exception current = exception.InnerException; current != null; current = current.InnerException)
      {
        if (depth > 0)
        {
          builder.Append(" | ");
        }

        builder.Append("Inner[").Append(depth.ToString()).Append("] ");
        builder.Append(current.GetType().FullName);
        builder.Append(": ");
        builder.Append(current.Message);
        depth++;
      }

      return builder.ToString();
    }

    private static HttpResponseMessage CreateFriendlyFailureResponse(
      HttpRequestMessage request,
      HttpStatusCode statusCode,
      string title,
      string message,
      string failureStage,
      string supportCode)
    {
      string stageHtml = string.IsNullOrWhiteSpace(failureStage)
        ? "<p class=\"stage\">The request stage could not be determined.</p>"
        : "<p class=\"stage\"><strong>Request stage:</strong> " + WebUtility.HtmlEncode(failureStage) + "</p>";

      string supportText = string.IsNullOrWhiteSpace(supportCode)
        ? string.Empty
        : "<p class=\"support-code\"><strong>Support code:</strong> " + WebUtility.HtmlEncode(supportCode) + "</p>";

      string html =
        "<!DOCTYPE html>" +
        "<html lang=\"en\">" +
        "<head>" +
        "<meta charset=\"utf-8\" />" +
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />" +
        "<title>" + WebUtility.HtmlEncode(title) + "</title>" +
        "<style>" +
        "body{font-family:Segoe UI,Arial,sans-serif;background:#f6f8fb;color:#17324d;margin:0;padding:2rem;}" +
        ".card{max-width:36rem;margin:4rem auto;background:#fff;border:1px solid #d9e2f1;border-radius:12px;padding:1.5rem 1.75rem;box-shadow:0 12px 30px rgba(23,50,77,.08);}" +
        "h1{font-size:1.5rem;margin:0 0 .75rem 0;}" +
        "p{margin:0;line-height:1.5;}" +
        ".message{margin-top:.75rem;color:#21364d;}" +
        ".stage{margin-top:.75rem;color:#52657a;}" +
        ".support-code{margin-top:.75rem;color:#21364d;font-weight:600;letter-spacing:.02em;}" +
        ".contact{margin-top:.75rem;color:#52657a;font-size:.95rem;}" +
        ".contact a{color:inherit;}" +
        "</style>" +
        "</head>" +
        "<body>" +
        "<main class=\"card\" role=\"main\" aria-labelledby=\"AttachmentErrorTitle\" aria-describedby=\"AttachmentErrorBody\">" +
        "<h1 id=\"AttachmentErrorTitle\">" + WebUtility.HtmlEncode(title) + "</h1>" +
        "<div id=\"AttachmentErrorBody\">" +
        "<p class=\"message\">" + WebUtility.HtmlEncode(message) + "</p>" +
        stageHtml +
        supportText +
        "<p class=\"message\">Please try again in a moment. If the problem continues, contact the public records team at <a href=\"mailto:publicrecords@claycountygov.com\" aria-label=\"Email the public records team at publicrecords@claycountygov.com\">publicrecords@claycountygov.com</a>.</p>" +
        "</div>" +
        "</main>" +
        "</body>" +
        "</html>";

      HttpResponseMessage response = request.CreateResponse(statusCode);
      response.Content = new StringContent(html, Encoding.UTF8, "text/html");
      response.ReasonPhrase = title;
      return response;
    }
  }
}
