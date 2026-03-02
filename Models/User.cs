using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Api.Models
{
    public class User:IdentityUser
    {
        public double Height { get; set; }
        public double Weight { get; set; }
    }
}