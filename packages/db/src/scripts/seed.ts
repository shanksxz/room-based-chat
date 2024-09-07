import { db, users, rooms, userRooms, messages } from "@repo/db";


async function seed() {
  // Setup your database connection

  // Insert Users
  const user1 = await db.insert(users).values({
    username: 'john_doe',
    password: 'hashed_password_1',
    email: 'john@example.com',
  }).returning();

  const user2 = await db.insert(users).values({
    username: 'jane_smith',
    password: 'hashed_password_2',
    email: 'jane@example.com',
  }).returning();

  // Insert Rooms
  const room1 = await db.insert(rooms).values({
    roomName: 'general',
    createdBy: user1[0]?.userId,
  }).returning();

  const room2 = await db.insert(rooms).values({
    roomName: 'random',
    createdBy: user2[0]?.userId,
  }).returning();

  // Insert Messages
  await db.insert(messages).values([
    {
      roomId: room1[0]?.roomId as number,
      userId: user1[0]?.userId as number,
      content: 'Hello, world!',
    },
    {
      roomId: room2[0]?.roomId as number,
      userId: user2[0]?.userId as number,
      content: 'Hey there!',
    },
  ]);

  // Insert User Rooms (Associating users with rooms)
  // await db.insert(userRooms).values([
  //   {
  //     userId: user1[0]?.userId,
  //     roomId: room1[0]?.roomId,
  //   },
  //   {
  //     userId: user2[0]?.userId,
  //     roomId: room2[0]?.roomId,
  //   },
  //   {
  //     userId: user1[0]?.userId,
  //     roomId: room2[0]?.roomId, // user1 joins room2
  //   },
  // ]).returning();
  // Uncomment the above code to associate

  await db.insert(userRooms).values([
    {
      userId: user1[0]?.userId as number,
      roomId: room1[0]?.roomId as number,
    },
    {
      userId: user2[0]?.userId as number,
      roomId: room2[0]?.roomId as number,
    },
    {
      userId: user1[0]?.userId as number,
      roomId: room2[0]?.roomId as number, // user1 joins room2
    },
  ]).returning()

  console.log('Seeding completed.');
}

seed().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
}).finally(() => process.exit());
