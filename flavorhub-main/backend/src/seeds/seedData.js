require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, MenuItem, Promotion } = require('../models');

// Menu items data (converted from CSV)
const menuItemsData = [
    { name: "Margherita Pizza", description: "Traditional Italian pizza with fresh mozzarella and basil", price: 349, category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Caesar Salad", description: "Crisp romaine lettuce with parmesan, croutons, and Caesar dressing", price: 199, category: "Salads", imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Grilled Salmon", description: "Fresh Atlantic salmon with herbs and lemon butter sauce", price: 549, category: "Seafood", imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 0 },
    { name: "Pepperoni Pizza", description: "Classic pepperoni with melted mozzarella cheese", price: 399, category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 0 },
    { name: "Classic Burger", description: "Juicy beef patty with fresh lettuce, tomato, and our secret sauce", price: 599, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 1 },
    { name: "Double Cheeseburger", description: "Two beef patties with double cheese and caramelized onions", price: 349, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 0 },
    { name: "Greek Salad", description: "Fresh vegetables with feta cheese and olive oil dressing", price: 229, category: "Salads", imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Shrimp Pasta", description: "Creamy garlic shrimp with fettuccine alfredo", price: 449, category: "Seafood", imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 0 },
    { name: "Tiramisu", description: "Classic Italian dessert with espresso and mascarpone", price: 179, category: "Desserts", imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Chicken Wings", description: "Juicy chicken wings with a crispy blackened crust, coated in a smoky, spicy sauce", price: 249, category: "Appetizers", imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 2 },
    { name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center and vanilla ice cream", price: 149, category: "Desserts", imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Avocado Burger", description: "Fresh avocado slices with bacon and ranch", price: 369, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 1 },
    { name: "Mozzarella Sticks", description: "Golden fried mozzarella with marinara sauce", price: 179, category: "Appetizers", imageUrl: "https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Mushroom Swiss Burger", description: "Sautéed mushrooms with melted Swiss cheese", price: 359, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 0 },
    { name: "Spicy Jalapeño Burger", description: "Fresh jalapeños with pepper jack cheese and chipotle mayo", price: 339, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 3 },
    { name: "Veggie Burger", description: "House-made plant-based patty with avocado and sprouts", price: 319, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "BBQ Chicken Pizza", description: "Grilled chicken with BBQ sauce and red onions", price: 429, category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 0 },
    { name: "Meat Lovers Pizza", description: "Pepperoni, sausage, bacon, and ham", price: 479, category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 0 },
    { name: "Veggie Supreme Pizza", description: "Bell peppers, mushrooms, olives, and onions", price: 399, category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Four Cheese Pizza", description: "Mozzarella, parmesan, gorgonzola, and ricotta", price: 419, category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Cobb Salad", description: "Grilled chicken, bacon, egg, avocado, and blue cheese", price: 299, category: "Salads", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 0 },
    { name: "Fish and Chips", description: "Beer-battered cod with crispy fries and tartar sauce", price: 399, category: "Seafood", imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 0 },
    { name: "Lobster Tail", description: "Butter-poached lobster tail with drawn butter", price: 899, category: "Seafood", imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 0 },
    { name: "Nachos Supreme", description: "Loaded nachos with cheese, jalapeños, and sour cream", price: 299, category: "Appetizers", imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 1 },
    { name: "Loaded Potato Skins", description: "Crispy potato skins with bacon and cheese", price: 219, category: "Appetizers", imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 0 },
    { name: "Onion Rings", description: "Beer-battered crispy onion rings", price: 159, category: "Appetizers", imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "New York Cheesecake", description: "Creamy cheesecake with berry compote", price: 169, category: "Desserts", imageUrl: "https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Apple Pie", description: "Warm apple pie with cinnamon and vanilla ice cream", price: 159, category: "Desserts", imageUrl: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Brownie Sundae", description: "Warm brownie with ice cream, fudge, and whipped cream", price: 179, category: "Desserts", imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Coca-Cola", description: "Classic refreshing cola", price: 49, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Fresh Orange Juice", description: "Freshly squeezed orange juice", price: 99, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Mango Lassi", description: "Creamy mango yogurt drink", price: 119, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Cappuccino", description: "Espresso with steamed milk foam", price: 129, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Chocolate Milkshake", description: "Rich creamy chocolate shake", price: 149, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Bruschetta", description: "Toasted bread with tomatoes, basil, and balsamic", price: 189, category: "Appetizers", imageUrl: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Garlic Bread", description: "Crispy on the outside, soft inside—garlic bread finished with parmesan cheese", price: 129, category: "Appetizers", imageUrl: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Spring Rolls", description: "Crispy vegetable spring rolls with sweet chili", price: 199, category: "Appetizers", imageUrl: "https://images.unsplash.com/photo-1548507200-c3d81c23614d?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 2 },
    { name: "Paneer Burger", description: "Indian-style cottage cheese patty", price: 299, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 1 },
    { name: "Bacon BBQ Burger", description: "Smoky bacon with tangy BBQ sauce and crispy onion rings", price: 379, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 1 },
    { name: "Cajun Burger", description: "Blackened patty with pepper jack and Cajun remoulade", price: 359, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1586816001966-79b736744398?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 2 },
    { name: "Spicy Diavola Pizza", description: "Spicy salami with chili flakes and hot honey", price: 429, category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80", isVegetarian: false, isAvailable: true, spiceLevel: 3 },
    { name: "Masala Chai", description: "Spiced Indian milk tea", price: 59, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
    { name: "Iced Coffee", description: "Chilled coffee with ice", price: 109, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80", isVegetarian: true, isAvailable: true, spiceLevel: 0 },
];

// Promotions data
const promotionsData = [
    {
        name: "New Year Special",
        description: "Start the new year with 20% off on all orders!",
        discountType: "percentage",
        discountValue: 20,
        minOrderAmount: 300,
        code: "NEWYEAR20",
        isActive: true,
        startsAt: new Date("2026-01-01"),
        expiresAt: new Date("2026-01-31")
    },
    {
        name: "First Order Discount",
        description: "Get ₹100 off on your first order",
        discountType: "fixed",
        discountValue: 100,
        minOrderAmount: 500,
        code: "FIRST100",
        isActive: true,
        startsAt: new Date("2026-01-01"),
        expiresAt: new Date("2026-12-31")
    },
    {
        name: "Weekend Feast",
        description: "15% off on orders above ₹1000",
        discountType: "percentage",
        discountValue: 15,
        minOrderAmount: 1000,
        code: "WEEKEND15",
        isActive: true,
        startsAt: new Date("2026-01-01"),
        expiresAt: new Date("2026-06-30")
    }
];

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seed...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await MenuItem.deleteMany({});
        await Promotion.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Create admin user
        console.log('👤 Creating admin user...');
        const adminPassword = 'admin123';
        const admin = new User({
            email: 'admin@flavorhub.com',
            password: adminPassword,
            fullName: 'Admin User',
            phone: '+91 9876543210',
            role: 'admin',
            isActive: true
        });
        await admin.save();
        console.log(`✅ Admin user created: admin@flavorhub.com / ${adminPassword}\n`);

        // Create sample customer
        console.log('👤 Creating sample customer...');
        const customerPassword = 'customer123';
        const customer = new User({
            email: 'customer@example.com',
            password: customerPassword,
            fullName: 'John Doe',
            phone: '+91 9876543211',
            address: '123 Main Street, Mumbai, India',
            role: 'user',
            isActive: true
        });
        await customer.save();
        console.log(`✅ Customer created: customer@example.com / ${customerPassword}\n`);

        // Create menu items
        console.log('🍕 Creating menu items...');
        const menuItems = await MenuItem.insertMany(menuItemsData);
        console.log(`✅ Created ${menuItems.length} menu items\n`);

        // Create promotions
        console.log('🎁 Creating promotions...');
        const promotions = await Promotion.insertMany(promotionsData);
        console.log(`✅ Created ${promotions.length} promotions\n`);

        // Summary
        console.log('═'.repeat(50));
        console.log('🎉 DATABASE SEED COMPLETE!');
        console.log('═'.repeat(50));
        console.log(`
📊 Summary:
   • Users: 2 (1 admin, 1 customer)
   • Menu Items: ${menuItems.length}
   • Promotions: ${promotions.length}

🔐 Login Credentials:
   Admin:    admin@flavorhub.com / admin123
   Customer: customer@example.com / customer123

🚀 You can now start the server with: npm run dev
    `);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
