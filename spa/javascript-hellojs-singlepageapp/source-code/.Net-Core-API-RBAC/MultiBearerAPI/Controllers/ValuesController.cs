using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace MultiBearerAPI.Controllers
{
    //Only Client Cred based token can access this endpoint.
    [Authorize(Policy = "AADAdmins")]
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        // GET api/values
        [EnableCors]
        [HttpGet]
        public ActionResult<IEnumerable<string>> Get()
        {
            return new string[] { "AAD Admin" };
        }
    }

    //Both B2C user and Client Cred token can access this endpoint.
    [Authorize]
    [Route("api/[controller]")]

    public class ValuesB2CController : ControllerBase
    {
        // GET api/values#
        [EnableCors("ApiCorsPolicy")]
        [HttpGet]
        public ActionResult<IEnumerable<string>> Get()
        {
            var claimsIdentity = User.Identity as ClaimsIdentity;

            var appRoles = new List<String>();

            foreach (Claim claim in claimsIdentity.Claims)
                if (claim.Type == "http://schemas.microsoft.com/identity/claims/scope")
                {
                    if (claim.Value == "read")
                    {
                        return new string[] { "B2C User - You are able to call the API :D" };
                    }
                }

           return new string[] { "B2C User - You dont have permission" };
        }

    }
}
