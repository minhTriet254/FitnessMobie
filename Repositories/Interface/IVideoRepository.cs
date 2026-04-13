using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Models;
using Api.Dtos.Video;
namespace Api.Repositories.Interface
{
    public interface IVideoRepository
    {
        Task<List<Video>> GetVideosAsyn();
        Task<Video?> GetVideoAsyn(int id);
        Task<Video> CreateAsyn(Video video);
        Task<Video?> UpdateVideoAsyn(int id, UpdateVideoDto updateVideoDto);
        Task<Video?> RemoveVideoAsyn(int id);
        Task<Video?> UpdateRatingAsyn(int id, int rating);
        Task<Video?> UpdateFeedbackAsyn(int id, string feedback);
    }
}