using lyt.app;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.AzureAD.UI;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace lyt
{
  public class Startup
  {
    public Startup(IConfiguration configuration) =>
      Configuration = configuration;

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      _ = services
        .add_lyt_spa()
        .AddAntiforgery()
        .AddSignalR()
        .AddJsonProtocol();
      _ = services
        .AddControllers();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
      var is_dev = env.IsDevelopment();
      var cli_path = $"{env.ContentRootPath}/../cli";
      var cli_file_prov = new PhysicalFileProvider(cli_path);
      if(is_dev)
      {
        _ = app.UseDeveloperExceptionPage();
      }
      _ = app
        .UseHttpsRedirection()
        .UseDefaultFiles(new DefaultFilesOptions
        {
          DefaultFileNames = new[] { "index.html" },
          FileProvider = cli_file_prov
        })
        .UseStaticFiles(new StaticFileOptions
        {
          FileProvider = cli_file_prov
        })
        .UseStaticFiles(new StaticFileOptions
        {
          FileProvider = new PhysicalFileProvider($"{env.ContentRootPath}/../node_modules"),
          RequestPath = "/node_modules"
        })
        .UseRouting()
        .use_lyt_spa()
        .UseEndpoints(endpoints => endpoints.MapControllers());
      if(is_dev)
      {
        env.WebRootPath = $"{env.ContentRootPath}/../bin/cli";
        env.WebRootFileProvider = new PhysicalFileProvider(env.WebRootPath);
        _ = app
          .UseStaticFiles(new StaticFileOptions
          {
            FileProvider = env.WebRootFileProvider
          });
      }
      else
      {
        env.WebRootPath = cli_path;
        env.WebRootFileProvider = cli_file_prov;
      }
    }
  }
}