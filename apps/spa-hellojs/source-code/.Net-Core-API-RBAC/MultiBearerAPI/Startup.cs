using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.AzureADB2C.UI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

namespace MultiBearerAPI
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            //services.AddAuthentication(AzureADB2CDefaults.BearerAuthenticationScheme)
              //  .AddAzureADB2CBearer("B2C", "B2C1", options => Configuration.Bind("AzureAdB2C", options));
            services
            .AddAuthentication()
            .AddJwtBearer("AAD", options =>
            {
                options.Authority = $"{Configuration["AzureAd:Instance"]}/{Configuration["AzureAd:TenantId"]}/v2.0";
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = $"{Configuration["AzureAd:Instance"]}/{Configuration["AzureAd:TenantId"]}/v2.0",
                    ValidateAudience = true,
                    ValidAudience = Configuration["AzureAd:ClientId"],
                ValidateLifetime = true
                };
            })

            .AddJwtBearer("B2C", options =>
            {
                options.Authority = $"{Configuration["AzureAdB2C:Instance"]}/tfp/{Configuration["AzureAdB2C:TenantId"]}/{Configuration["AzureAdB2C:SignUpSignInPolicyId"]}/v2.0/";
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = $"{Configuration["AzureAdB2C:Instance"]}/{Configuration["AzureAdB2C:TenantId"]}/v2.0/",
                    ValidateAudience = true,
                    ValidAudience = Configuration["AzureAdB2C:ClientId"],
                    ValidateLifetime = true
                };
            });
            services
                .AddAuthorization(options =>
                {
                    //Applies to [Authorize] header in controller - ie both AAD/B2C token accepted.
                    options.DefaultPolicy = new AuthorizationPolicyBuilder()
                        .RequireAuthenticatedUser()
                        .AddAuthenticationSchemes("AAD", "B2C")
                        .Build();
                    //[Authorize(Policy = "AADAdmins")] - When this header used in controller, only AAD token accepted.
                    options.AddPolicy("AADAdmins", new AuthorizationPolicyBuilder()
                        .RequireAuthenticatedUser()
                        .AddAuthenticationSchemes("AAD")
                        //.RequireClaim("role", "admin") //could be role/scope
                        .Build());
                });
            services.AddCors(options => options.AddPolicy("ApiCorsPolicy", builder =>
            {
                builder.WithOrigins("https://b2chellojs.azurewebsites.net").AllowAnyMethod().AllowAnyHeader();
            }));

            services.AddCors();
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }
            app.UseCors("ApiCorsPolicy");
            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseMvc();
        }
    }
}
