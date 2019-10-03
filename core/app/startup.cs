using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace lyt.app
{
  public static class startup
  {

    public static IServiceCollection add_lyt_spa(this IServiceCollection sc)
    {
      _ = sc.AddTransient<settings.service_i, settings.service>()
        .AddTransient<pubsub.service_i, pubsub.service>()
        .AddSignalR()
        .AddJsonProtocol();
      return sc;
    }

    public static IApplicationBuilder use_lyt_spa(this IApplicationBuilder app) =>
      app.UseEndpoints(endpoints => endpoints.MapHub<pubsub.hub>("/sock/info"));
  }
}