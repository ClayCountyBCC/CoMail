using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CoMail.Infrastructure;
using CoMail.Infrastructure.Security;
using CoMail.Models;

namespace CoMail.Controllers
{
  public class FileController : ApiController
  {
    [HttpGet]
    [AllowAnonymous]
    public Task<HttpResponseMessage> Get(int id, string guid, int attachmentId, long emailId = 0, string mailbox = "")
    {
      bool canViewAllRestrictedEmails = AppSecurity.CanViewAllRestrictedEmails();
      bool ownsRestrictedMailbox = AppSecurity.OwnsRestrictedMailbox(mailbox);
      bool usePublicVisibilityRules = !canViewAllRestrictedEmails && !ownsRestrictedMailbox;
      string mailboxScope = ownsRestrictedMailbox && !canViewAllRestrictedEmails
        ? mailbox
        : string.Empty;

      if (!Attachment.CanAccess(id, attachmentId, emailId, mailboxScope, usePublicVisibilityRules))
      {
        return Task.FromResult(Request.CreateResponse(System.Net.HttpStatusCode.NotFound));
      }

      return AttachmentProxyClient.ProxyAsync(Request, id, guid, attachmentId);
    }
  }
}
