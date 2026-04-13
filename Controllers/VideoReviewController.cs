using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Repositories.Interface;
using Api.Models;
using System.Security.Claims;

namespace Api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class VideoReviewController : ControllerBase
    {
        private readonly IVideoReviewRepository _reviewRepo;
        private readonly IVideoRepository _videoRepo;
        
        public VideoReviewController(IVideoReviewRepository reviewRepo, IVideoRepository videoRepo)
        {
            _reviewRepo = reviewRepo;
            _videoRepo = videoRepo;
        }
        
    
        [HttpGet("video/{videoId}")]
        public async Task<IActionResult> GetReviewsByVideo(int videoId)
        {
            var video = await _videoRepo.GetVideoAsyn(videoId);
            if (video == null)
            {
                return NotFound("Video không tồn tại");
            }
            
            var reviews = await _reviewRepo.GetReviewsByVideoIdAsync(videoId);
            var averageRating = await _reviewRepo.GetAverageRatingAsync(videoId);
            var reviewCount = await _reviewRepo.GetReviewCountAsync(videoId);
            
            return Ok(new
            {
                reviews = reviews,
                averageRating = averageRating,
                reviewCount = reviewCount
            });
        }
        
        // POST: api/VideoReview
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto reviewDto)
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userName))
            {
                return Unauthorized("Không tìm thấy thông tin user");
            }
            
            var video = await _videoRepo.GetVideoAsyn(reviewDto.VideoId);
            if (video == null)
            {
                return NotFound("Video không tồn tại");
            }
            
            // Kiểm tra user đã đánh giá chưa
            var hasReviewed = await _reviewRepo.HasUserReviewedAsync(reviewDto.VideoId, userName);
            if (hasReviewed)
            {
                return BadRequest("Bạn đã đánh giá video này rồi");
            }
            
            var review = new VideoReview
            {
                VideoId = reviewDto.VideoId,
                UserName = userName,
                Rating = reviewDto.Rating,
                Comment = reviewDto.Comment,
                CreatedAt = DateTime.Now
            };
            
            var created = await _reviewRepo.CreateReviewAsync(review);
            
            // Cập nhật rating trung bình cho video (optional)
            var avgRating = await _reviewRepo.GetAverageRatingAsync(reviewDto.VideoId);
            
            return Ok(new
            {
                review = created,
                averageRating = avgRating,
                message = "Đánh giá thành công"
            });
        }
        

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto updateDto)
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            var existingReview = await _reviewRepo.GetReviewByIdAsync(id);
            
            if (existingReview == null)
            {
                return NotFound("Không tìm thấy đánh giá");
            }
            
            if (existingReview.UserName != userName && !User.IsInRole("Admin"))
            {
                return Forbid("Bạn không có quyền sửa đánh giá này");
            }
            
            var updated = await _reviewRepo.UpdateReviewAsync(id, updateDto.Comment, updateDto.Rating);
            if (updated == null)
            {
                return NotFound();
            }
            
            return Ok(new { review = updated, message = "Cập nhật thành công" });
        }
        
        // DELETE: api/VideoReview/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            var existingReview = await _reviewRepo.GetReviewByIdAsync(id);
            
            if (existingReview == null)
            {
                return NotFound("Không tìm thấy đánh giá");
            }
            
            if (existingReview.UserName != userName && !User.IsInRole("Admin"))
            {
                return Forbid("Bạn không có quyền xóa đánh giá này");
            }
            
            var result = await _reviewRepo.DeleteReviewAsync(id);
            if (!result)
            {
                return NotFound();
            }
            
            return Ok(new { message = "Xóa đánh giá thành công" });
        }
    }
    
    public class CreateReviewDto
    {
        public int VideoId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
    
    public class UpdateReviewDto
    {
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}