using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Data;
using Api.Models;
using Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories
{
    public class VideoReviewRepository : IVideoReviewRepository
    {
        private readonly ApplicationDbContext _context;
        
        public VideoReviewRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<List<VideoReview>> GetReviewsByVideoIdAsync(int videoId)
        {
            return await _context.VideoReviews
                .Where(r => r.VideoId == videoId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
        
        public async Task<VideoReview?> GetReviewByIdAsync(int id)
        {
            return await _context.VideoReviews.FirstOrDefaultAsync(r => r.Id == id);
        }
        
        public async Task<VideoReview> CreateReviewAsync(VideoReview review)
        {
            review.CreatedAt = DateTime.Now;
            await _context.VideoReviews.AddAsync(review);
            await _context.SaveChangesAsync();
            return review;
        }
        
        public async Task<VideoReview?> UpdateReviewAsync(int id, string comment, int rating)
        {
            var review = await _context.VideoReviews.FirstOrDefaultAsync(r => r.Id == id);
            if (review == null) return null;
            
            review.Comment = comment;
            review.Rating = rating;
            await _context.SaveChangesAsync();
            return review;
        }
        
        public async Task<bool> DeleteReviewAsync(int id)
        {
            var review = await _context.VideoReviews.FirstOrDefaultAsync(r => r.Id == id);
            if (review == null) return false;
            
            _context.VideoReviews.Remove(review);
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<double> GetAverageRatingAsync(int videoId)
        {
            var ratings = await _context.VideoReviews
                .Where(r => r.VideoId == videoId)
                .Select(r => r.Rating)
                .ToListAsync();
                
            if (!ratings.Any()) return 0;
            return ratings.Average();
        }
        
        public async Task<int> GetReviewCountAsync(int videoId)
        {
            return await _context.VideoReviews.CountAsync(r => r.VideoId == videoId);
        }
        
        public async Task<bool> HasUserReviewedAsync(int videoId, string userName)
        {
            return await _context.VideoReviews
                .AnyAsync(r => r.VideoId == videoId && r.UserName == userName);
        }
    }
}