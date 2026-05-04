import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import AutomationBuilder from "@/components/automations/AutomationBuilder";

export default async function AutomationBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get Prisma user by Clerk ID
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    redirect("/sign-in");
  }

  // Fetch automation with all relations, owned by this user
  const automation = await db.automation.findFirst({
    where: { id, userId: dbUser.id },
    include: {
      keywords: true,
      trigger: true,
      listener: true,
      posts: true,
    },
  });

  if (!automation) {
    redirect("/automations");
  }

  return (
    <div className="flex flex-col h-full">
      <AutomationBuilder key={automation.id} automation={automation} />
    </div>
  );
}
