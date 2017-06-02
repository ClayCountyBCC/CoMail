using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace CoMail
{
  public static class WebApiConfig
  {
    public static void Register(HttpConfiguration config)
    {
      // Web API configuration and services

      // Web API routes
      config.MapHttpAttributeRoutes();

      config.Routes.MapHttpRoute(
          name: "DefaultApi",
          routeTemplate: "api/{controller}/{id}",
          defaults: new { id = RouteParameter.Optional }
        );
      config.Routes.MapHttpRoute(
        name: "EmailListApi",
        routeTemplate: "api/{controller}/{mailbox}/{page}/{subject}/{from}",
        defaults: new
        {
          page = RouteParameter.Optional,
          subject = RouteParameter.Optional,
          from = RouteParameter.Optional
        }
        );
      config.Routes.MapHttpRoute(
        name: "EmailCountApi",
        routeTemplate: "api/{controller}/{mailbox}",
        defaults: new
        {
          subject = RouteParameter.Optional,
          from = RouteParameter.Optional
        }
        );
      config.Routes.MapHttpRoute(
        name: "FileApi",
        routeTemplate: "api/{controller}/id/Guid/AttachmentId",
        defaults: new { });

    }
  }
}
