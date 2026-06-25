import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "../db/schema";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log("Usage: npx tsx scripts/create-admin.ts <name> <email> <password>");
    console.log("Example: npx tsx scripts/create-admin.ts 'Admin Rotari' admin@rotary.com password123");
    process.exit(1);
  }

  const [fullName, email, password] = args;

  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (existing && existing.role === "admin") {
    console.log("Admin dengan email tersebut sudah ada.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    const verifiedAt = new Date();
    await db
      .update(schema.users)
      .set({
        role: "admin",
        passwordHash,
        isVerified: true,
        emailVerifiedAt: verifiedAt,
        fullName,
        shopName: existing.shopName ?? fullName,
        updatedAt: verifiedAt,
      })
      .where(eq(schema.users.id, existing.id));
    console.log(`Admin yang sudah ada ditingkatkan menjadi admin.`);
  } else {
    const [user] = await db
      .insert(schema.users)
      .values({
        email,
        passwordHash,
        role: "admin",
        isVerified: true,
        emailVerifiedAt: new Date(),
        fullName,
        shopName: fullName,
      })
      .returning();
    console.log(`Admin berhasil dibuat!`);
    console.log(`  ID:    ${user.id}`);
    console.log(`  Nama:  ${user.fullName}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role:  ${user.role}`);
  }

  await client.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("Gagal membuat admin:", e.message);
  process.exit(1);
});
