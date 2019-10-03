﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace lyt.app.settings
{
  public class settings
  {
    public IEnumerable<string> component { get; set; }
    public IEnumerable<string> directive { get; set; }
    public string user { get; set; }
  }

  public interface service_i
  {
    Task<IEnumerable<string>> get_components(ClaimsPrincipal user);
    Task<settings> get_settings(ClaimsPrincipal user);
  }

  public class service :
    service_i
  {
    public service(IWebHostEnvironment env, ILogger<service> logger)
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

    IWebHostEnvironment _env;
    ILogger<service> _logger;
    static readonly Regex _html_pattern = new Regex(@"define\(""text!([^\.]+)\.html""");
    static readonly Regex _module_pattern = new Regex(@"define\(""([^""]+)"",");
#if !DEBUG
    readonly Task<IEnumerable<string>> _component;
    readonly Task<IEnumerable<string>> _directive;
#endif
  }

#if use_azure_ad
  [Authorize]
#endif
  public class controller : ControllerBase
  {
    public controller(service_i svc) =>
      _svc = svc;

    [HttpGet("app/settings")]
    public Task<settings> get_settings() =>
      _svc.get_settings(User);

    readonly service_i _svc;
  }
}