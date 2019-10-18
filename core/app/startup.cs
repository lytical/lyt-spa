/*
  © 2019 lytical, inc. all rights are reserved.
  lytical® is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Diagnostics;
using System.Linq;
using System.Reflection;

namespace lyt.app
{
  public enum injectable_lifetime
  {
    transient,
    scoped,
    singleton
  }

  [AttributeUsage(AttributeTargets.Interface | AttributeTargets.Class)]
  public class injectableAttribute : Attribute
  {
    public injectableAttribute(injectable_lifetime lifetime = injectable_lifetime.transient, Type type = null)
      : this(type, lifetime)
    {
    }

    public injectableAttribute(Func<IServiceProvider, object> factory, injectable_lifetime lifetime = injectable_lifetime.transient)
    {
      this.lifetime = lifetime;
      this.factory = factory;
    }

    public injectableAttribute(Type type, injectable_lifetime lifetime = injectable_lifetime.transient)
    {
      this.lifetime = lifetime;
      this.type = type;
    }

    public Func<IServiceProvider, object> factory { get; set; }

    public Type type { get; set; }

    public injectable_lifetime lifetime { get; set; }
  }

  public static class startup
  {
    public static IServiceCollection add_lyt_spa(this IServiceCollection sc)
    {
      foreach(var type in AppDomain
        .CurrentDomain
        .GetAssemblies()
        .Cast<Assembly>()
        .SelectMany(x => x.GetTypes())
        .Where(x => x.GetCustomAttribute(typeof(injectableAttribute)) != null))
      {
        var attr = (injectableAttribute)type.GetCustomAttribute(typeof(injectableAttribute));
        Debug.Assert((!type.IsInterface && !type.IsAbstract) || attr.type != null, $"injectable interfaces or abstract classes, must indicate an implementation 'type'.");
        switch(attr.lifetime)
        {
          case injectable_lifetime.transient:
            if(attr.type != null)
              sc.AddTransient(type, attr.type);
            else if(attr.factory != null)
              sc.AddTransient(type, attr.factory);
            else
              sc.AddTransient(type);
            break;
          case injectable_lifetime.scoped:
            if(attr.type != null)
              sc.AddScoped(type, attr.type);
            else if(attr.factory != null)
              sc.AddScoped(type, attr.factory);
            else
              sc.AddScoped(type);
            break;
          case injectable_lifetime.singleton:
            if(attr.type != null)
              sc.AddSingleton(type, attr.type);
            else if(attr.factory != null)
              sc.AddSingleton(type, attr.factory);
            else
              sc.AddSingleton(type);
            break;
        }
      }
      return sc;
    }

    public static IApplicationBuilder use_lyt_spa(this IApplicationBuilder app) =>
      app.UseEndpoints(endpoints => endpoints.MapHub<pubsub_hub>("/sock/info"));
  }
}