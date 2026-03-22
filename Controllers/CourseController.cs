using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Data;
using Api.Dtos.Course;
using Api.Mappers;
using Api.Models;
using Api.Repositories.Interface;
using Api.Services; // Thêm namespace cho AccessService
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace Api.Controllers
{
    [Route("api/CourseController")]
    [ApiController]
    [Authorize]
    public class CourseController : ControllerBase
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IAccessService _accessService; // Inject AccessService

        public CourseController(
            ICourseRepository courseRepository,
            IAccessService accessService) // Constructor injection
        {
            _courseRepository = courseRepository;
            _accessService = accessService;
        }

        [HttpGet("courses")]
        public async Task<IActionResult> GetCourses()
        {
            var courses = await _courseRepository.GetCoursesAsync();

            // Lấy userId và kiểm tra null
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var courseDtos = new List<object>();

            foreach (var course in courses)
            {
                var canAccess = await _accessService.CanAccessCourse(userId, course.Id);

                courseDtos.Add(new
                {
                    course.Id,
                    course.Name,
                    course.Description,
                    course.Price,
                    course.StartDate,
                    course.EndDate,
                    LessonsCount = course.Lessons?.Count ?? 0,
                    CanAccess = canAccess,
                    AccessMessage = GetAccessMessage(canAccess, course.Price)
                });
            }

            return Ok(courseDtos);
        }
                
        [HttpGet("course/{id}")]
        public async Task<IActionResult> GetCourse(int id)
        {
            var course = await _courseRepository.GetCourseAsync(id);
            if (course == null)   
            {
                return NotFound();
            }

            // Lấy userId từ claims
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }
            // Kiểm tra quyền truy cập
            var canAccess = await _accessService.CanAccessCourse(userId, course.Id);
            
            if (!canAccess)
            {
                return StatusCode(403, new 
                { 
                    success = false,
                    message = "Bạn cần nâng cấp Premium để xem khóa học này",
                    requiresPremium = true,
                    price = course.Price
                });
            }

            return Ok(course.ToCourseDetailDto());
        }
        
        // API kiểm tra quyền truy cập (frontend có thể gọi riêng)
        [HttpGet("course/{id}/access")]
        public async Task<IActionResult> CheckAccess(int id)
        {
            var course = await _courseRepository.GetCourseAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }
            var canAccess = await _accessService.CanAccessCourse(userId, course.Id);
            
            // Kiểm tra xem user có phải Premium hoặc Admin không
            var isPremiumOrAdmin = await _accessService.IsPremiumOrAdmin(userId);

            return Ok(new
            {
                canAccess,
                isPremiumOrAdmin,
                coursePrice = course.Price,
                requiresPremium = course.Price > 0 && !canAccess,
                message = GetAccessMessage(canAccess, course.Price)
            });
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddCourseDto addCourseDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var course = addCourseDto.ToAddCourse();
            var createdCourse = await _courseRepository.CreateCourseAsync(course);

            return CreatedAtAction(nameof(GetCourse), new { id = createdCourse.Id }, createdCourse.ToCourseDto());
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCourseDto courseDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var course = await _courseRepository.UpdateCourseAsync(id, courseDto);
            if (course == null)
            {
                return NotFound();
            }
            return Ok(course.ToCourseDto());
        }

        [Authorize(Roles = "Admin")]
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

        private string GetAccessMessage(bool canAccess, decimal price)
        {
            if (canAccess)
            {
                return price == 0 ? "Miễn phí" : "Premium - Có quyền truy cập";
            }
            return price == 0 ? "Miễn phí" : "Cần nâng cấp Premium";
        }
    }
}