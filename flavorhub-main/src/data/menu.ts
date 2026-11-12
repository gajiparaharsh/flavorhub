export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  containsNuts?: boolean;
  containsDairy?: boolean;
  allergenInfo?: string | null;
  spiceLevel?: number; // 0=mild, 1=medium, 2=hot, 3=extra hot
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Classic Burger",
    description: "Juicy beef patty with fresh lettuce, tomato, and our secret sauce",
    price: 299,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    category: "Burgers"
  },
  {
    id: "2",
    name: "Margherita Pizza",
    description: "Traditional Italian pizza with fresh mozzarella and basil",
    price: 349,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80",
    category: "Pizza"
  },
  {
    id: "3",
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with parmesan, croutons, and Caesar dressing",
    price: 199,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&q=80",
    category: "Salads"
  },
  {
    id: "4",
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with herbs and lemon butter sauce",
    price: 549,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80",
    category: "Seafood"
  },
  {
    id: "5",
    name: "Chicken Wings",
    description: "Crispy wings tossed in your choice of sauce",
    price: 249,
    image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=500&q=80",
    category: "Appetizers"
  },
  {
    id: "6",
    name: "Pepperoni Pizza",
    description: "Classic pepperoni with melted mozzarella cheese",
    price: 399,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80",
    category: "Pizza"
  },
  {
    id: "7",
    name: "Double Cheeseburger",
    description: "Two beef patties with double cheese and caramelized onions",
    price: 349,
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80",
    category: "Burgers"
  },
  {
    id: "8",
    name: "Greek Salad",
    description: "Fresh vegetables with feta cheese and olive oil dressing",
    price: 229,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80",
    category: "Salads"
  },
  {
    id: "9",
    name: "Shrimp Pasta",
    description: "Creamy garlic shrimp with fettuccine alfredo",
    price: 449,
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80",
    category: "Seafood"
  },
  {
    id: "10",
    name: "Mozzarella Sticks",
    description: "Golden fried mozzarella with marinara sauce",
    price: 179,
    image: "https://images.unsplash.com/photo-1531749668029-2db88e27a9b9?w=500&q=80",
    category: "Appetizers"
  },
  {
    id: "11",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center and vanilla ice cream",
    price: 149,
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&q=80",
    category: "Desserts"
  },
  {
    id: "12",
    name: "Tiramisu",
    description: "Classic Italian dessert with espresso and mascarpone",
    price: 179,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80",
    category: "Desserts"
  }
];

export const categories = ["All", "Burgers", "Pizza", "Salads", "Seafood", "Appetizers", "Desserts"];
