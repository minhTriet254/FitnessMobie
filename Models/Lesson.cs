using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Models
{
     public class Lesson
    {
       
        public int Id { get; set; }
        public string Title { get; set; }=string.Empty;
        public string Content { get; set; }=string.Empty;


        public  int CourseId {get;set;}
        public Course Course { get; set; }=null!;
        public ICollection<Video> Videos { get; set; } = new List<Video>();
    }
}