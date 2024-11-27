namespace ApiStore.Models.Product
{
    public class ProductItemViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = String.Empty;
        public decimal Price { get; set; }
        public string Description { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public List<string>? Images { get; set; }
    }
}
