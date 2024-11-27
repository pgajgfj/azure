using ApiStore.Constants;
using ApiStore.Data.Entities.Identity;
using ApiStore.Data.Entities;
using ApiStore.Interfaces;
using Bogus;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ApiStore.Data
{
    public static class SeederDB
    {
        public static void SeedData(this IApplicationBuilder app)
        {
            using (var scope = app.ApplicationServices
                .GetRequiredService<IServiceScopeFactory>().CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApiStoreDbContext>();
                var imageHulk = scope.ServiceProvider.GetRequiredService<IImageHulk>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<UserEntity>>();
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<RoleEntity>>();
                //dbContext.Database.EnsureDeleted();
                dbContext.Database.Migrate();

                if (dbContext.Categories.Count() == 0)
                {
                    int number = 10;
                    var list = new Faker("uk")
                        .Commerce.Categories(number);
                    foreach (var name in list)
                    {
                        string image = imageHulk.Save("https://picsum.photos/1200/800?category").Result;
                        var cat = new CategoryEntity
                        {
                            Name = name,
                            Description = new Faker("uk").Commerce.ProductDescription(),
                            Image = image
                        };
                        dbContext.Categories.Add(cat);
                        dbContext.SaveChanges();
                    }
                }

                if (dbContext.Products.Count() == 0)
                {
                    var categories = dbContext.Categories.ToList();

                    var fakerProduct = new Faker<ProductEntity>("uk")
                        .RuleFor(u => u.Name, (f, u) => f.Commerce.Product())
                        .RuleFor(u => u.Price, (f, u) => decimal.Parse(f.Commerce.Price()))
                        .RuleFor(u => u.Category, (f, u) => f.PickRandom(categories));

                    string url = "https://picsum.photos/1200/800?product";

                    var products = fakerProduct.GenerateLazy(32);
                    Random r = new Random();

                    foreach (var product in products)
                    {
                        dbContext.Add(product);
                        dbContext.SaveChanges();
                        int imageCount = r.Next(3, 5);
                        for (int i = 0; i < imageCount; i++)
                        {
                            var imageName = imageHulk.Save(url).Result;
                            var imageProduct = new ProductImageEntity
                            {
                                Product = product,
                                Image = imageName,
                                Priority = i
                            };
                            dbContext.Add(imageProduct);
                            dbContext.SaveChanges();
                        }
                    }
                }

                // seed roles
                if (dbContext.Roles.Count() == 0)
                {
                    var roles = new[]
                    {
                        new RoleEntity { Name = Roles.Admin },
                        new RoleEntity { Name = Roles.User }
                    };

                    foreach (var role in roles)
                    {
                        var outcome = roleManager.CreateAsync(role).Result;
                        if (!outcome.Succeeded) Console.WriteLine($"Failed to create role: {role.Name}");
                    }
                }

                // seed users
                if (dbContext.Users.Count() == 0)
                {
                    var users = new[]
                    {
                        new { User = new UserEntity { Firstname = "Tony", Lastname = "Stark", UserName = "admin@gmail.com", Email = "admin@gmail.com" }, Password = "admin1", Role = Roles.Admin },
                        new { User = new UserEntity { Firstname = "Boba", Lastname = "Gray", UserName = "user@gmail.com", Email = "user@gmail.com" }, Password = "bobapass1", Role = Roles.User },
                        new { User = new UserEntity { Firstname = "Biba", Lastname = "Undefined", UserName = "biba@gmail.com", Email = "biba@gmail.com" }, Password = "bibapass3", Role = Roles.User }
                    };

                    foreach (var i in users)
                    {
                        var outcome = userManager.CreateAsync(i.User, i.Password).Result;

                        if (!outcome.Succeeded)
                            Console.WriteLine($"Failed to create user: {i.User.UserName}");
                        else
                            outcome = userManager.AddToRoleAsync(i.User, i.Role).Result;
                    }
                }
            }
        }
    }
}
