export const mockVendors = [
  {
    vendorId: 1,
    name: "Tony's Pizza Palace",
    address: "123 Main St, New York, NY",
    latitude: 40.7128,
    longitude: -74.0060,
    cuisineType: "Italian",
    openingHours: "11:00 AM - 11:00 PM",
    contactInfo: "+1 (555) 123-4567",
    website: "https://tonyspizza.com",
    orderLink: "https://tonyspizza.com/order"
  },
  {
    vendorId: 2,
    name: "Green Garden Café",
    address: "456 Oak Ave, New York, NY",
    latitude: 40.7129,
    longitude: -74.0061,
    cuisineType: "Vegetarian",
    openingHours: "8:00 AM - 8:00 PM",
    contactInfo: "+1 (555) 234-5678",
    website: "https://greengarden.com",
    orderLink: "https://greengarden.com/order"
  },
  {
    vendorId: 3,
    name: "Spice Route",
    address: "789 Elm St, New York, NY",
    latitude: 40.7130,
    longitude: -74.0062,
    cuisineType: "Indian",
    openingHours: "12:00 PM - 10:00 PM",
    contactInfo: "+1 (555) 345-6789",
    website: "https://spiceroute.com",
    orderLink: "https://spiceroute.com/order"
  },
  {
    vendorId: 4,
    name: "Burger Junction",
    address: "321 Pine St, New York, NY",
    latitude: 40.7131,
    longitude: -74.0063,
    cuisineType: "American",
    openingHours: "10:00 AM - 12:00 AM",
    contactInfo: "+1 (555) 456-7890",
    website: "https://burgerjunction.com",
    orderLink: "https://burgerjunction.com/order"
  },
  {
    vendorId: 5,
    name: "Sushi Zen",
    address: "654 Maple Ave, New York, NY",
    latitude: 40.7132,
    longitude: -74.0064,
    cuisineType: "Japanese",
    openingHours: "5:00 PM - 11:00 PM",
    contactInfo: "+1 (555) 567-8901",
    website: "https://sushizen.com",
    orderLink: "https://sushizen.com/order"
  },
  {
    vendorId: 6,
    name: "Taco Fiesta",
    address: "987 Cedar Rd, New York, NY",
    latitude: 40.7133,
    longitude: -74.0065,
    cuisineType: "Mexican",
    openingHours: "11:00 AM - 10:00 PM",
    contactInfo: "+1 (555) 678-9012",
    website: "https://tacofiesta.com",
    orderLink: "https://tacofiesta.com/order"
  }
];

export const mockMenuItems = [
  // Tony's Pizza Palace
  {
    menuItemId: 1,
    vendorId: 1,
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato sauce, basil",
    price: 18,
    dietaryTags: ["vegetarian"],
    allergens: ["dairy", "gluten"],
    imageUrl: "",
    isAvailable: true
  },
  {
    menuItemId: 2,
    vendorId: 1,
    name: "Pepperoni Pizza",
    description: "Pepperoni, mozzarella, tomato sauce",
    price: 22,
    dietaryTags: [],
    allergens: ["dairy", "gluten"],
    imageUrl: "",
    isAvailable: true
  },
  // Green Garden Café
  {
    menuItemId: 3,
    vendorId: 2,
    name: "Quinoa Buddha Bowl",
    description: "Quinoa, roasted vegetables, tahini dressing",
    price: 16,
    dietaryTags: ["vegetarian", "vegan", "gluten-free"],
    allergens: ["sesame"],
    imageUrl: "",
    isAvailable: true
  },
  {
    menuItemId: 4,
    vendorId: 2,
    name: "Avocado Toast",
    description: "Sourdough, avocado, hemp seeds, micro greens",
    price: 12,
    dietaryTags: ["vegetarian", "vegan"],
    allergens: ["gluten"],
    imageUrl: "",
    isAvailable: true
  },
  // Spice Route
  {
    menuItemId: 5,
    vendorId: 3,
    name: "Chicken Tikka Masala",
    description: "Tender chicken in creamy tomato curry",
    price: 19,
    dietaryTags: [],
    allergens: ["dairy"],
    imageUrl: "",
    isAvailable: true
  },
  {
    menuItemId: 6,
    vendorId: 3,
    name: "Vegetable Biryani",
    description: "Fragrant basmati rice with mixed vegetables",
    price: 17,
    dietaryTags: ["vegetarian"],
    allergens: [],
    imageUrl: "",
    isAvailable: true
  },
  // Burger Junction
  {
    menuItemId: 7,
    vendorId: 4,
    name: "Classic Cheeseburger",
    description: "Beef patty, cheese, lettuce, tomato, onion",
    price: 14,
    dietaryTags: [],
    allergens: ["dairy", "gluten"],
    imageUrl: "",
    isAvailable: true
  },
  {
    menuItemId: 8,
    vendorId: 4,
    name: "Impossible Burger",
    description: "Plant-based patty, vegan cheese, lettuce, tomato",
    price: 16,
    dietaryTags: ["vegetarian", "vegan"],
    allergens: ["gluten"],
    imageUrl: "",
    isAvailable: true
  },
  // Sushi Zen
  {
    menuItemId: 9,
    vendorId: 5,
    name: "Salmon Sashimi",
    description: "Fresh Atlantic salmon, 8 pieces",
    price: 24,
    dietaryTags: ["gluten-free"],
    allergens: ["fish"],
    imageUrl: "",
    isAvailable: true
  },
  {
    menuItemId: 10,
    vendorId: 5,
    name: "Vegetarian Roll",
    description: "Cucumber, avocado, carrot, sesame seeds",
    price: 12,
    dietaryTags: ["vegetarian", "vegan"],
    allergens: ["sesame"],
    imageUrl: "",
    isAvailable: true
  },
  // Taco Fiesta
  {
    menuItemId: 11,
    vendorId: 6,
    name: "Carnitas Tacos",
    description: "Slow-cooked pork, onions, cilantro, salsa verde",
    price: 15,
    dietaryTags: [],
    allergens: [],
    imageUrl: "",
    isAvailable: true
  },
  {
    menuItemId: 12,
    vendorId: 6,
    name: "Black Bean Quesadilla",
    description: "Black beans, cheese, peppers, served with guacamole",
    price: 13,
    dietaryTags: ["vegetarian"],
    allergens: ["dairy"],
    imageUrl: "",
    isAvailable: true
  }
];