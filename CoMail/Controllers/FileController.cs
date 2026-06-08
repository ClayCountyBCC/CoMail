using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CoMail.Infrastructure;

namespace CoMail.Controllers
{
  public class FileController : ApiController
  {
    [HttpGet]
    [AllowAnonymous]
    public Task<HttpResponseMessage> Get(int id, string guid, int attachmentId)
    {
      return AttachmentProxyClient.ProxyAsync(Request, id, guid, attachmentId);
    }
  }
}
