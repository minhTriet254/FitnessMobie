using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Models;

namespace Api.Repositories.Interface
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}