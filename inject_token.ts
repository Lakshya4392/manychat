import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const token = "EAAUt8gP9Uw4BRb1VFnZAC6yXaOOLY061EnE19929hZBBCernNZCLRstepnjKOv9gkFuDg6EWgWnSVVTc0yaZBctYW0bGIJUMP0Q0BcakxR7U1ugBiBwuQky3DDAHQm2gZAdmHrgBPZBHNCLZBqZAtIDuf7mXghRQ03gYdiIBOAHwB0iOriAncV0E4VcDJJjtSarGioZCRTyXmW5vZAwBZAnBqFYomVnugMXwJ8ZCkGbOKPQ8Ru74I5YX6naVfbQm6M1vFkMSOg1y3kh1VeawcPYDuuce6gZDZD";
  
  const integration = await prisma.integrations.findFirst({
    where: { name: "INSTAGRAM" }
  });

  if (integration) {
    await prisma.integrations.update({
      where: { id: integration.id },
      data: {
        token: token,
        instagramId: "PENDING_SETUP"
      }
    });
    console.log("✅ SUCCESS: Token injected to existing integration!");
  } else {
    const user = await prisma.user.findFirst();
    if (user) {
      await prisma.integrations.create({
        data: {
          userId: user.id,
          name: "INSTAGRAM",
          token: token,
          instagramId: "PENDING_SETUP",
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        }
      });
      console.log("✅ SUCCESS: Integration created and token injected!");
    } else {
      console.log("❌ ERROR: No user found in database!");
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
