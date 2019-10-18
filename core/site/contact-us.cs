/*
  © 2019 lytical, inc. all rights are reserved.
  lytical® is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/
using lyt.app;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace lyt.site
{
  public class contact_us_msg
  {
    string company { get; set; }
    string email { get; set; }
    string msg { get; set; }
    string name { get; set; }
    string phone { get; set; }
  }

  [injectable(typeof(contact_us_service))]
  public interface contact_us_service_i
  {
    Task<bool> handle_msg(contact_us_msg body, ClaimsPrincipal user);
  }

  public class contact_us_service : contact_us_service_i
  {
    public Task<bool> handle_msg(contact_us_msg body, ClaimsPrincipal user)
    {
      // todo: process the request here.
      return Task.FromResult(true);
    }
  }

  [ApiController]
  public class contact_us_controller : ControllerBase
  {
    public contact_us_controller(contact_us_service_i svc, xsrf_token_i xsrf)
    {
      _svc = svc;
      _xsrf = xsrf;
    }

    [HttpPut("site/contact-us-msg")]
    public Task<bool> handle_msg([FromBody] contact_us_msg body) =>
      _xsrf.validate_token(HttpContext, true) ? _svc.handle_msg(body, User) : Task.FromResult(false);

    readonly contact_us_service_i _svc;
    readonly xsrf_token_i _xsrf;
  }
}