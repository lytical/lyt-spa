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

  [AttributeUsage(AttributeTargets.Method)]
  public class add_serviceAttribute : Attribute
  {
  }

  [AttributeUsage(AttributeTargets.Interface | AttributeTargets.Class)]
  public class injectableAttribute : Attribute
  {
    public injectableAttribute(injectable_lifetime lifetime = injectable_lifetime.transient, Type type = null)
      : this(type, lifetime)
    {
    }

    public injectableAttribute(Type type, injectable_lifetime lifetime = injectable_lifetime.transient)
    {
      this.lifetime = lifetime;
      this.type = type;
    }

    public Type type { get; }

    public injectable_lifetime lifetime { get; }
  }

  public static class startup
  {
    public static IServiceCollection add_lyt_spa(this IServiceCollection sc)
    {
      Debug.Assert(AppDomain.CurrentDomain.IsDefaultAppDomain(), "add_mosaic() must be invoked in default AppDomain.");
      foreach(var type in AppDomain
        .CurrentDomain
        .GetAssemblies()
        .Cast<Assembly>()
        .Concat(Assembly
          .GetEntryAssembly()
          .GetReferencedAssemblies()
          .Select(x => Assembly.Load(x)))
        .Distinct()
        .SelectMany(x => x.GetTypes()))
      {
        foreach(var method in type.GetMethods(BindingFlags.Static | BindingFlags.Public).Where(x => x.GetCustomAttribute<add_serviceAttribute>() != null))
        {
          var args = method.GetParameters();
          Debug.Assert(args.Length == 1 && args[0].ParameterType == typeof(IServiceCollection), $"add_service method {type.Name}.{method.Name}, must have only one parameter of type IServiceCollection");
          method.Invoke(null, new object[] { sc });
        }
        var attr = type.GetCustomAttribute<injectableAttribute>();
        if(attr != null)
        {
          Debug.Assert((!type.IsInterface && !type.IsAbstract) || attr.type != null, $"injectable interfaces or abstract class {type.Name}, must indicate an implementation 'type'.");
          switch(attr.lifetime)
          {
            case injectable_lifetime.transient:
              if(attr.type != null)
                sc.AddTransient(type, attr.type);
              else
                sc.AddTransient(type);
              break;
            case injectable_lifetime.scoped:
              if(attr.type != null)
                sc.AddScoped(type, attr.type);
              else
                sc.AddScoped(type);
              break;
            case injectable_lifetime.singleton:
              if(attr.type != null)
                sc.AddSingleton(type, attr.type);
              else
                sc.AddSingleton(type);
              break;
          }
        }
      }
      return sc;
    }

    public static IApplicationBuilder use_lyt_spa(this IApplicationBuilder app) =>
      app.UseEndpoints(endpoints => endpoints.MapHub<pubsub_hub>("/sock/info"));
  }
}