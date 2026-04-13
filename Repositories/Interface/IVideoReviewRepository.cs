using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Models;
using Api.Dtos.Video;

namespace Api.Repositories.Interface
{
    public interface IVideoReviewRepository
    {
        Task<List<VideoReview>> GetReviewsByVideoIdAsync(int videoId);
        Task<VideoReview?> GetReviewByIdAsync(int id);
        Task<VideoReview> CreateReviewAsync(VideoReview review);
        Task<VideoReview?> UpdateReviewAsync(int id, string comment, int rating);
        Task<bool> DeleteReviewAsync(int id);
        Task<double> GetAverageRatingAsync(int videoId);
        Task<int> GetReviewCountAsync(int videoId);
        Task<bool> HasUserReviewedAsync(int videoId, string userName);
    }
}