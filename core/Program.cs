/*
  © 2019 lytical, inc. all rights are reserved.
  lytical® is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace lyt
{
  public class Program
  {
    public static void Main(string[] args) =>
      CreateHostBuilder(args).Build().Run();

    public static IHostBuilder CreateHostBuilder(string[] args) =>
      Host
        .CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webBuilder => webBuilder.UseStartup<Startup>());
  }
}