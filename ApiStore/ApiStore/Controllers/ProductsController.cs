using ApiStore.Data;
using ApiStore.Data.Entities;
using ApiStore.Interfaces;
using ApiStore.Models.Product;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiStore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController(
        ApiStoreDbContext context, IImageHulk imageHulk,
        IMapper mapper) : ControllerBase
    {
        [HttpGet]
        public IActionResult GetList()
        {
            var list = context.Products
                .ProjectTo<ProductItemViewModel>(mapper.ConfigurationProvider)
                .ToList();
            return Ok(list);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] ProductCreateViewModel model)
        {
            var entity = mapper.Map<ProductEntity>(model);
            context.Products.Add(entity);
            context.SaveChanges();

            if (model.ImagesDescIds.Any())
            {
                await context.ProductDescImages
                    .Where(x => model.ImagesDescIds.Contains(x.Id))
                    .ForEachAsync(x => x.ProductId = entity.Id);
            }

            if (model.Images != null)
            {
                var p = 1;
                foreach (var image in model.Images)
                {
                    var pi = new ProductImageEntity
                    {
                        Image = await imageHulk.Save(image),
                        Priority = p,
                        ProductId = entity.Id
                    };
                    p++;
                    context.ProductImages.Add(pi);
                    await context.SaveChangesAsync();
                }
            }
            return Created();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var product = context.Products
                .Include(x=>x.ProductImages)
                .Include(x=>x.ProductDescImages)
                .SingleOrDefault(x => x.Id == id);
            if (product == null) return NotFound();

            if (product.ProductImages != null)
                foreach (var p in product.ProductImages)
                    imageHulk.Delete(p.Image);

            if (product.ProductDescImages != null)
                foreach (var p in product.ProductDescImages)
                    imageHulk.Delete(p.Image);

            context.Products.Remove(product);
            context.SaveChanges();
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await context.Products
                .ProjectTo<ProductItemViewModel>(mapper.ConfigurationProvider)
                .SingleOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPut]
        public async Task<IActionResult> Edit([FromForm] ProductEditViewModel model)
        {
            var request = this.Request;
            var product = await context.Products
                .Include(p => p.ProductImages)
                .FirstOrDefaultAsync(p => p.Id == model.Id);

            mapper.Map(model, product);

            var oldNameImages = model.Images.Where(x => x.ContentType.Contains("old-image"))
                .Select(x=>x.FileName) ?? [];

            var imgToDelete = product?.ProductImages?.Where(x => !oldNameImages.Contains(x.Image)) ?? [];
            foreach(var imgDel in imgToDelete)
            {
                context.ProductImages.Remove(imgDel);
                imageHulk.Delete(imgDel.Image);
            }

            if(model.Images is not null)
            {
                int index = 0;
                foreach(var image in model.Images)
                {
                    if(image.ContentType=="old-image")
                    {
                        var oldImage = product?.ProductImages?.FirstOrDefault(x => x.Image == image.FileName)!;
                        oldImage.Priority = index;
                    }
                    else
                    {
                        var imagePath = await imageHulk.Save(image);
                        context.ProductImages.Add(new ProductImageEntity
                        {
                            Image = imagePath,
                            Product = product,
                            Priority = index
                        });
                    }
                    index++;
                }
            }
            await context.SaveChangesAsync();

            return Ok();
        }


        [HttpPost("upload")]
        public async Task<IActionResult> UploadDescImage([FromForm] ProductDescImageUploadViewModel model)
        {
            if (model.Image != null)
            {
                var pdi = new ProductDescImageEntity
                {
                    Image = await imageHulk.Save(model.Image),
                    DateCreate = DateTime.Now.ToUniversalTime(),

                };
                context.ProductDescImages.Add(pdi);
                await context.SaveChangesAsync();
                return Ok(mapper.Map<ProductDescImageIdViewModel>(pdi));
            }
            return BadRequest();
        }
    }
}
