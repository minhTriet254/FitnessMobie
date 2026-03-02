using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Data;
using Api.Dtos.Video;
using Api.Models;
using Api.Repositories.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

namespace Api.Repositories
{
    public class VideoRepository:IVideoRepository
    {
        private readonly ApplicationDbContext _dbContext;
        public VideoRepository(ApplicationDbContext dbContext)
        {
            _dbContext=dbContext;
        }

        public async Task<Video> CreateAsyn(Video video)
        {
            await _dbContext.Videos.AddAsync(video);
            await _dbContext.SaveChangesAsync();
            return video;
        }



        public async Task<Video?> GetVideoAsyn(int id)
        {
            return await _dbContext.Videos.FindAsync(id);
        }

        public async Task<List<Video>> GetVideosAsyn()
        {
            return await _dbContext.Videos.ToListAsync();
        }



        public async Task<Video> RemoveVideoAsyn(int id)
        {
            var video= await _dbContext.Videos.FindAsync(id);
            if(video==null)
            {
                throw new KeyNotFoundException($"Video with id {id} not found.");
            }
             _dbContext.Remove(video);
            await _dbContext.SaveChangesAsync();
            return video;
        }


        public async Task<Video> UpdateVideoAsyn(int id, AddvideoDto addvideoDto)
        {
            var video= await _dbContext.Videos.FindAsync(id);
            if(video==null)
            {
                throw new KeyNotFoundException($"Video with id {id} not found.");
            }
            video.Url=addvideoDto.Url;
            video.Description=addvideoDto.Description;
            return video;
        }
    }
}