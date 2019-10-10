using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace lyt.app
{
  public static class startup
  {

    public static IServiceCollection add_lyt_spa(this IServiceCollection sc)
    {
      // todo: add services dynamically...
      _ = sc.AddTransient<settings_service_i, settings_service>()
        .AddTransient<pubsub_service_i, pubsub_service>()
        .AddTransient<site.contact_us_service_i, site.contact_us_service>()
        .AddSignalR()
        .AddJsonProtocol();
      return sc;
    }

    public static IApplicationBuilder use_lyt_spa(this IApplicationBuilder app) =>
      app.UseEndpoints(endpoints => endpoints.MapHub<pubsub_hub>("/sock/info"));
  }
}