using ApiStore.Models.Post;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ApiStore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetItems()
        {
            List<PostItemViewModel> items =
            [
                new PostItemViewModel
                {
                    Id = 1,
                    Title = "One News",
                    Body = "Test Body",
                    DateCreated = DateTime.Now,
                },
                new PostItemViewModel
                {
                    Id = 2,
                    Title = "Two News",
                    Body = "Test Body two news",
                    DateCreated = DateTime.Now,
                }
            ];
            return Ok(items);
        }
    }
}
