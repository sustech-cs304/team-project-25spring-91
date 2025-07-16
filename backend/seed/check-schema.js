// Create a file called check-schema.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
  try {
    // Get the Prisma client's definition of the User model
    console.log("Prisma User model fields:", Object.keys(prisma.user));
    
    // Try to create a user with minimal fields
    const user = await prisma.user.create({
      data: {
        email: "test-user@example.com",
        passwordHash: "test-password"
      }
    });
    console.log("Created test user:", user);
    
    // See what fields are available on the user object
    console.log("User object fields:", Object.keys(user));
    
    // Clean up
    await prisma.user.delete({
      where: { id: user.id }
    });
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
