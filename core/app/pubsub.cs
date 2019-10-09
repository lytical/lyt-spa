using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace lyt.app.pubsub
{
  public class hub : Hub
  {
    public string get_client_id() => Context.ConnectionId;
  }

  public interface service_i
  {
    Task send(string id, object payload);
    Task send_to(string client_id, string id, object payload);
  }

  public class service : service_i
  {
    public service(IHubContext<hub> hub_ctx) =>
      this._hub_ctx = hub_ctx;

    public Task send(string id, object payload) =>
      _hub_ctx.Clients.All.SendAsync("recv", id, payload);

    public Task send_to(string client_id, string id, object payload) =>
      _hub_ctx.Clients.Client(client_id).SendAsync("recv", id, payload);

    readonly IHubContext<hub> _hub_ctx;
  }

#if use_azure_ad
  [Authorize]
#endif
  [ApiController]
  public class controller : ControllerBase
  {
    public controller(service_i msg) =>
      _msg = msg;

    [HttpPost("pubsub/send/{id}")]
    public Task send(string id, [FromBody] object body) =>
      _msg.send(id, body);

    [HttpPost("pubsub/send-to/{id}/{client_id}")]
    public Task send_to(string client_id, string id, [FromBody] object body) =>
      _msg.send_to(client_id, id, body);

    readonly service_i _msg;
  }
}