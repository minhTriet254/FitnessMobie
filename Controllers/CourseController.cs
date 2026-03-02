using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Data;
using Api.Dtos.Course;
using Api.Mappers;
using Api.Models;
using Api.Repositories.Interface;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/CourseController")]
    [ApiController]
    public class CourseController : ControllerBase
    {

            private readonly ICourseRepository _courseRepository;

            public CourseController(ICourseRepository courseRepository)
            {
                _courseRepository=courseRepository;
            }
            [HttpGet("courses")]
            public async Task<IActionResult> GetCourses()
            {
                var Courses = await _courseRepository.GetCoursesAsync();
                var CourseDto= Courses.Select(c=>c.ToCourseDto());
                return Ok(CourseDto);
            }
            [HttpGet("course/{id}")]
            public async Task<IActionResult> GetCourse(int id)
            {
                var course = await _courseRepository.GetCourseAsync(id);
                if (course==null)   
                {
                    return NotFound();
                }
          
                return Ok(course.ToCourseDetailDto());
            }
        
        
        
        [HttpPost]

        public async Task<IActionResult> Create([FromBody] AddCourseDto addCourseDto)
        {
            // Kiểm tra dữ liệu đầu vào có hợp lệ hay không
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Ánh xạ từ AddCourseDto sang Course entity
            var course = addCourseDto.ToAddCourse();

            // Tạo khóa học mới
            var createdCourse = await _courseRepository.CreateCourseAsync(course);

            // Trả về khóa học mới tạo và thông tin chi tiết
            return CreatedAtAction(nameof(GetCourse), new { id = createdCourse.Id }, createdCourse.ToCourseDto());
        }


        [HttpPut("{id}")]
            public async Task<IActionResult> Update(int id, [FromBody] UpdateCourseDto courseDto)
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var course = await _courseRepository.UpdateCourseAsync(id,courseDto);
                if (course == null)
                {
                    return NotFound();
                }
                return Ok(course.ToCourseDto());
            
            }

            // Delete a course by ID
            [HttpDelete("{id}")]
            public async Task<IActionResult> Delete(int id)
            {
                var course = await _courseRepository.DeleteCourseAsync(id);
                if (course == null)
                {
                    return NotFound();
                }

              return NoContent();
            }


    }
}