using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace lyt.app.site.contact_us
{
  public class incomiming_msg
  {
    string company { get; set; }
    string email { get; set; }
    string msg { get; set; }
    string name { get; set; }
    string phone { get; set; }
  }

  public interface service_i
  {
    Task<bool> handle_msg(incomiming_msg body, ClaimsPrincipal user);
  }

  public class service : service_i
  {
    public Task<bool> handle_msg(incomiming_msg body, ClaimsPrincipal user)
    {
      // process the message here.
      return Task.FromResult(true);
    }
  }

#if use_azure_ad
  [Authorize]
#endif
  [ApiController]
  public class controller : ControllerBase
  {
    public controller(service_i svc) =>
      _svc = svc;

    [HttpPut("site/contact-us-msg")]
    public Task<bool> handle_msg([FromBody] incomiming_msg body) =>
      _svc.handle_msg(body, User);

    readonly service_i _svc;
  }
}