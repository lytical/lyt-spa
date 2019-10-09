using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace lyt.app
{
  public static class startup
  {

    public static IServiceCollection add_lyt_spa(this IServiceCollection sc)
    {
      // todo: add services dynamically...
      _ = sc.AddTransient<settings.service_i, settings.service>()
        .AddTransient<pubsub.service_i, pubsub.service>()
        .AddTransient<site.contact_us.service_i, site.contact_us.service>()
        .AddSignalR()
        .AddJsonProtocol();
      return sc;
    }

    public static IApplicationBuilder use_lyt_spa(this IApplicationBuilder app) =>
      app.UseEndpoints(endpoints => endpoints.MapHub<pubsub.hub>("/sock/info"));
  }
}