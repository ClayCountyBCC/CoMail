using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Threading.Tasks;
using CoMail.Models;

namespace CoMail.Controllers
{
  public class FileController : ApiController
  {
    [HttpGet]
    [AllowAnonymous]
    public async Task<HttpResponseMessage> Get(int Id, string Guid, int AttachmentId)
    {
      if (Guid.Length > 100) throw new HttpResponseException(HttpStatusCode.BadRequest);

      string username = Constants.Get_ConnStr("Username");
      string password = Constants.Get_ConnStr("Password");
      string domain = Constants.Get_ConnStr("Domain");
      
      string URL = $"http://10.200.42.20/Archiver/attachment.aspx?id={Id}&connectionId={Guid}&aid={AttachmentId}";
      using (var clientHandler = new HttpClientHandler
      {
        Credentials = new NetworkCredential(username, password, domain)
      })
      {
        using (var client = new HttpClient(clientHandler))
        {
          try
          {
            var res = await client.GetAsync(URL);
            var response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StreamContent(await res.Content.ReadAsStreamAsync());
            response.Content.Headers.ContentType = res.Content.Headers.ContentType;
            response.Content.Headers.ContentDisposition = res.Content.Headers.ContentDisposition;
            response.Content.Headers.ContentLength = res.Content.Headers.ContentLength;
            return response;
          }
          catch (Exception ex)
          {
            // let's just see what pops
            new ErrorLog(ex);
            return new HttpResponseMessage(HttpStatusCode.InternalServerError);
          }
        }
      }
      //MailArchiver/attachment.aspx?id=-2147457683&connectionId=6ebdf11b-3527-4423-8f93-b5928a27a303&aid=0
    }
  }
}
