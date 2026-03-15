using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Api.Dtos.Video;
using Api.Mappers;
using Api.Repositories.Interface;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace Api.Controllers
{
    [Authorize]
    [Route("api/videoController")]
    [ApiController]
    public class VideoController:ControllerBase
    {
        private readonly IVideoRepository _videoRepo;
        private readonly ILessonRepostory _lessonRepo;
        public VideoController(IVideoRepository videoRepository,ILessonRepostory lessonRepostory)
        {
            _videoRepo=videoRepository;
            _lessonRepo=lessonRepostory;
        }

        [HttpGet("video")]
        public async Task<IActionResult> GetVideos()
        {
            var videos= await _videoRepo.GetVideosAsyn();
            var videoDto= videos.Select(v=>v.ToVideoDto());
            return Ok(videoDto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Getvideo(int id)
        {
            var video=await _videoRepo.GetVideoAsyn(id);
            if(video==null)
            {
                return NotFound();
            }
            return Ok(video);
        }
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateVideo(int LessonId ,AddvideoDto addvideoDto)
        {
            if (!await _lessonRepo.LessonAxistAsync(LessonId))
            {
                return BadRequest("Lesson does not exist");
            }   
            var video   =  addvideoDto.ToAddVideo(LessonId);
            await _videoRepo.CreateAsyn(video);
            return CreatedAtAction(nameof(Getvideo), new { id = video.Id }, video.ToVideoDto());            
        }
        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<IActionResult> UpdateVideo(int id,AddvideoDto addvideoDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var video = await _videoRepo.UpdateVideoAsyn(id, addvideoDto);
            if (video == null)
            {
                return NotFound();
            }
            return Ok(video.ToVideoDto());
        }
        [Authorize(Roles = "Admin")]        
        [HttpDelete]
        public async Task<IActionResult> DeleteVideo(int id)
        {
            var video=await _videoRepo.RemoveVideoAsyn(id);
            if(video==null)
            {
                return NotFound();
            }

            return Ok();
        }
    }
}