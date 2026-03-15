using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Models;

namespace Api.Services
{
    public interface ITokenService
    {
        string CreateToken(User user, IList<string> roles);
    }
}