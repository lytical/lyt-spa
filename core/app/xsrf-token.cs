/*
  © 2019 lytical, inc. all rights are reserved.
  lytical® is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/
using Microsoft.AspNetCore.Http;
using System;
using System.Net;

namespace lyt.app
{
  [injectable(typeof(xsrf_token))]
  public interface xsrf_token_i
  {
    public void set_token(HttpResponse response);
    public bool validate_token(HttpContext context, bool is_required = false);
  }

  public class xsrf_token : xsrf_token_i
  {
    public void set_token(HttpResponse rsp) =>
      rsp.Cookies.Append(xsrf_token_cookie_id, Guid.NewGuid().ToString());

    public bool validate_token(HttpContext ctx, bool is_required = false)
    {
      var cookie = ctx.Request.Cookies[xsrf_token_cookie_id];
      if(cookie != null)
      {
        var hdr = ctx.Request.Headers[xsrf_token_header_id];
        if(hdr.Count != 0 && hdr[0] == cookie)
        {
          return true;
        }
      }
      else if(!is_required)
      {
        return true;
      }
      ctx.Response.StatusCode = (int)HttpStatusCode.BadRequest;
      ctx.Response.CompleteAsync();
      return false;
    }

    const string xsrf_token_cookie_id = "XSRF-TOKEN";
    const string xsrf_token_header_id = "x-xsrf-token";
  }
}