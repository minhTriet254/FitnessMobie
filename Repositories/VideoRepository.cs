using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Data;
using Api.Dtos.Video;  // Thêm dòng này
using Api.Models;
using Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories
{
    public class VideoRepository : IVideoRepository
    {
        private readonly ApplicationDbContext _context;
        public VideoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Video> CreateAsyn(Video video)
        {
            await _context.Videos.AddAsync(video);
            await _context.SaveChangesAsync();
            return video;
        }

        public async Task<Video?> GetVideoAsyn(int id)
        {
            return await _context.Videos.FirstOrDefaultAsync(v => v.Id == id);
        }

        public async Task<List<Video>> GetVideosAsyn()
        {
            return await _context.Videos.ToListAsync();
        }

        public async Task<Video?> RemoveVideoAsyn(int id)
        {
            var video = await _context.Videos.FirstOrDefaultAsync(v => v.Id == id);
            if (video == null)
            {
                return null;
            }
            _context.Videos.Remove(video);
            await _context.SaveChangesAsync();
            return video;
        }

        public async Task<Video?> UpdateVideoAsyn(int id, UpdateVideoDto updateVideoDto)
        {
            var video = await _context.Videos.FirstOrDefaultAsync(v => v.Id == id);
            if (video == null)
            {
                return null;
            }
            video.Url = updateVideoDto.Url;
            video.Description = updateVideoDto.Description;
            video.Feedback = updateVideoDto.Feedback;
            video.Rating = updateVideoDto.Rating;
            await _context.SaveChangesAsync();
            return video;
        }

        public async Task<Video?> UpdateRatingAsyn(int id, int rating)
        {
            var video = await _context.Videos.FirstOrDefaultAsync(v => v.Id == id);
            if (video == null)
            {
                return null;
            }
            video.Rating = rating;
            await _context.SaveChangesAsync();
            return video;
        }

        public async Task<Video?> UpdateFeedbackAsyn(int id, string feedback)
        {
            var video = await _context.Videos.FirstOrDefaultAsync(v => v.Id == id);
            if (video == null)
            {
                return null;
            }
            video.Feedback = feedback;
            await _context.SaveChangesAsync();
            return video;
        }
    }
}