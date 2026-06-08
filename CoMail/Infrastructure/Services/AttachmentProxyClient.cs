using System;
using System.Net;
using System.Net.Http;
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

      try
      {
        string username = Database.GetConnectionString("Username");
        string password = Database.GetConnectionString("Password");
        string domain = Database.GetConnectionString("Domain");
        Uri requestUri = BuildRequestUri(Database.GetConnectionString("ArchiverBaseUrl"), id, guid, attachmentId);

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
              return request.CreateResponse(upstreamResponse.StatusCode);
            }

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
        new ErrorLog(ex);
        return request.CreateResponse(HttpStatusCode.InternalServerError);
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
  }
}
