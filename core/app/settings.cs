/*
  © 2019 lytical, inc. all rights are reserved.
  lytical® is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace lyt.app
{
  public class settings
  {
    public IEnumerable<string> component { get; set; }
    public IEnumerable<string> directive { get; set; }
    public string user { get; set; }
  }

  [injectable(typeof(settings_service))]
  public interface settings_service_i
  {
    Task<IEnumerable<string>> get_components(ClaimsPrincipal user);
    Task<settings> get_settings(ClaimsPrincipal user);
  }

  public class settings_service : settings_service_i
  {
    public settings_service(IWebHostEnvironment env, ILogger<settings_service> logger)
    {
      _env = env;
      _logger = logger;
#if !DEBUG
      _component = Task.FromResult<IEnumerable<string>>(get_components().ToArray());
      _directive = Task.FromResult<IEnumerable<string>>(get_directives().ToArray());
#endif
    }

    private IEnumerable<string> get_components()
    {
      var rt = new List<string>();
      var modules = File.ReadAllText($"{_env.WebRootPath}/main.js");
      foreach(Match path in _html_pattern.Matches(File.ReadAllText($"{_env.WebRootPath}/html.js")))
      {
        var mod = path.Groups[1].Value;
        if(modules.Contains($"define(\"{mod}\""))
          rt.Add(mod);
      }
      return rt;
    }

    private IEnumerable<string> get_directives()
    {
      var rt = new List<string>();
      var modules = File.ReadAllText($"{_env.WebRootPath}/main.js");
      var match = _module_pattern.Match(modules);
      while(match.Success)
      {
        var next = match.NextMatch();
        var mod = next != null && next.Success ?
          modules.Substring(match.Index, next.Index - match.Index) :
          modules.Substring(match.Index);
        if(mod.Contains(".is_directive("))
          rt.Add(match.Groups[1].Value);
        match = next;
      }
      return rt;
    }

    public Task<IEnumerable<string>> get_directives(ClaimsPrincipal user)
    {
#if DEBUG
      return Task.FromResult<IEnumerable<string>>(get_directives());
#else
      return _directive;
#endif
    }

    public Task<IEnumerable<string>> get_components(ClaimsPrincipal user)
    {
#if DEBUG
      return Task.FromResult<IEnumerable<string>>(get_components());
#else
      return _component;
#endif
    }

    public async Task<settings> get_settings(ClaimsPrincipal user)
    {
      _logger.LogInformation($"request:settings:user={user.Identity.Name}");
      return new settings
      {
        component = await get_components(user),
        directive = await get_directives(user),
        user = user.Identity.Name
      };
    }

    readonly IWebHostEnvironment _env;
    readonly ILogger<settings_service> _logger;
    static readonly Regex _html_pattern = new Regex(@"define\(""text!([^\.]+)\.html""");
    static readonly Regex _module_pattern = new Regex(@"define\(""([^""]+)"",");
#if !DEBUG
    readonly Task<IEnumerable<string>> _component;
    readonly Task<IEnumerable<string>> _directive;
#endif
  }

  [ApiController]
  public class settings_controller : ControllerBase
  {
    public settings_controller(settings_service_i svc, xsrf_token_i xsrf)
    {
      _svc = svc;
      _xsrf = xsrf;
    }

    [HttpGet("app/settings")]
    public Task<settings> get_settings()
    {
      _xsrf.set_token(Response);
      return _svc.get_settings(User);
    }

    readonly settings_service_i _svc;
    readonly xsrf_token_i _xsrf;
  }
}