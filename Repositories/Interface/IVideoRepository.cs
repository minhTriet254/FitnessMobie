using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Dtos.Video;
using Api.Models;

namespace Api.Repositories.Interface
{
    public  interface IVideoRepository
    {
        Task<List<Video>> GetVideosAsyn();
        Task<Video?> GetVideoAsyn(int id);
        Task<Video> CreateAsyn(Video addVideo);
        Task<Video> UpdateVideoAsyn(int id,AddvideoDto addvideoDto);
        Task<Video> RemoveVideoAsyn(int id);
    }
}