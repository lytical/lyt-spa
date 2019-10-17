using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace lyt.app
{
  public class pubsub_hub : Hub
  {
    public string get_client_id() => Context.ConnectionId;
  }

  [injectable(typeof(pubsub_service))]
  public interface pubsub_service_i
  {
    Task send(string id, object payload);
    Task send_to(string client_id, string id, object payload);
  }

  public class pubsub_service : pubsub_service_i
  {
    public pubsub_service(IHubContext<pubsub_hub> hub_ctx) =>
      this._hub_ctx = hub_ctx;

    public Task send(string id, object payload) =>
      _hub_ctx.Clients.All.SendAsync("recv", id, payload);

    public Task send_to(string client_id, string id, object payload) =>
      _hub_ctx.Clients.Client(client_id).SendAsync("recv", id, payload);

    readonly IHubContext<pubsub_hub> _hub_ctx;
  }

  [ApiController]
  public class pubsub_controller : ControllerBase
  {
    public pubsub_controller(pubsub_service_i msg) =>
      _msg = msg;

    [HttpPost("pubsub/send/{id}")]
    public Task send(string id, [FromBody] object body) =>
      _msg.send(id, body);

    [HttpPost("pubsub/send-to/{id}/{client_id}")]
    public Task send_to(string client_id, string id, [FromBody] object body) =>
      _msg.send_to(client_id, id, body);

    readonly pubsub_service_i _msg;
  }
}