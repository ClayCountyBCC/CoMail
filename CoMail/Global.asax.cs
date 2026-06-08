using System;
using System.Web;
using System.Web.Http;
using CoMail.Models;

namespace CoMail
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
        }

        protected void Application_BeginRequest()
        {
            if (!ShouldServeMaintenancePage())
            {
                return;
            }

            Context.Response.Redirect("~/Maintenance.html", false);
            Context.ApplicationInstance.CompleteRequest();
        }

        private static bool ShouldServeMaintenancePage()
        {
            if (!IsRootDocumentRequest())
            {
                return false;
            }

            SiteState state = SiteState.Get();
            return state != null && state.MaintenanceMode;
        }

        private static bool IsRootDocumentRequest()
        {
            string path = HttpContext.Current.Request.Url.AbsolutePath;

            return path.EndsWith("/", StringComparison.OrdinalIgnoreCase) ||
                path.EndsWith("/index.html", StringComparison.OrdinalIgnoreCase);
        }
    }
}
