"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = require("argon2");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding initial data...');
    await prisma.feedback.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();
    const passwordHash = await argon2.hash('Password123!');
    const owner = await prisma.user.create({
        data: {
            email: 'owner@bistro.com',
            fullName: 'Marco Rossi',
            passwordHash,
        },
    });
    console.log(`Created user: ${owner.email} (${owner.id})`);
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Trattoria Bella',
            slug: 'trattoria-bella',
            description: 'Authentic Italian cuisine crafted with fresh local ingredients and family recipes.',
            address: '142 Market Street, Downtown',
            phone: '+1 (555) 234-5678',
            retentionOffer: 'Thank you for dining with us! Show this screen to your server for 15% off your next lunch or a complimentary Tiramisu.',
            ownerId: owner.id,
        },
    });
    console.log(`Created restaurant: ${restaurant.name} (slug: ${restaurant.slug})`);
    const feedbacks = [
        {
            restaurantId: restaurant.id,
            rating: 5,
            positiveFeedback: 'The homemade truffle pasta was out of this world! Our server Sarah was incredibly attentive and knowledgeable about the wine pairings.',
            improvementFeedback: null,
            customerName: 'Elena Rostova',
            customerPhone: '+1 (555) 902-1144',
            tableNumber: 'Table 4',
            sentiment: 'POSITIVE',
            status: 'RESOLVED',
            createdAt: new Date(Date.now() - 1000 * 60 * 35),
        },
        {
            restaurantId: restaurant.id,
            rating: 5,
            positiveFeedback: 'Best wood-fired pizza in town. Crust was light and crispy. Will definitely come back with friends!',
            improvementFeedback: 'Maybe add a few more craft beers on tap.',
            customerName: 'Marcus Vance',
            customerPhone: '+1 (555) 438-9821',
            tableNumber: 'Table 12',
            sentiment: 'POSITIVE',
            status: 'NEW',
            createdAt: new Date(Date.now() - 1000 * 60 * 120),
        },
        {
            restaurantId: restaurant.id,
            rating: 4,
            positiveFeedback: 'Great ambiance, romantic lighting, and the burrata appetizer was extremely fresh.',
            improvementFeedback: 'Main courses took a bit longer than expected to arrive, around 35 minutes.',
            customerName: 'David Chen',
            customerPhone: '+1 (555) 887-3210',
            tableNumber: 'Table 7',
            sentiment: 'POSITIVE',
            status: 'REVIEWED',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        },
        {
            restaurantId: restaurant.id,
            rating: 2,
            positiveFeedback: 'Warm greeting by the hostess and lovely patio setting.',
            improvementFeedback: 'The steak was overcooked (asked for medium rare, received well done) and the bill had an extra wine charge.',
            customerName: 'Sarah Jenkins',
            customerPhone: '+1 (555) 312-7789',
            tableNumber: 'Patio 2',
            sentiment: 'NEGATIVE',
            status: 'NEW',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22),
        },
        {
            restaurantId: restaurant.id,
            rating: 5,
            positiveFeedback: 'Celebrated our anniversary here! The staff surprised us with complimentary prosecco. Unforgettable evening.',
            improvementFeedback: null,
            customerName: 'Amanda & Liam Brooks',
            customerPhone: '+1 (555) 674-5512',
            tableNumber: 'Booth 1',
            sentiment: 'POSITIVE',
            status: 'REVIEWED',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        },
        {
            restaurantId: restaurant.id,
            rating: 3,
            positiveFeedback: 'Dessert was delicious - the cannoli was fresh and crunchy.',
            improvementFeedback: 'Music was slightly too loud for a relaxed dinner conversation.',
            customerName: null,
            customerPhone: null,
            tableNumber: 'Table 9',
            sentiment: 'NEUTRAL',
            status: 'NEW',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
        },
        {
            restaurantId: restaurant.id,
            rating: 1,
            positiveFeedback: null,
            improvementFeedback: 'Had a reservation at 7:30 PM but was made to wait 40 minutes without an explanation. Service was very rushed.',
            customerName: 'Robert Martinez',
            customerPhone: '+1 (555) 219-4403',
            tableNumber: 'Table 3',
            sentiment: 'NEGATIVE',
            status: 'CONTACTED',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
        },
    ];
    for (const item of feedbacks) {
        await prisma.feedback.create({ data: item });
    }
    console.log(`Seeded ${feedbacks.length} sample feedbacks.`);
    console.log('Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map