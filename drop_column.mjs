import postgres from "postgres";
import { readFileSync } from "fs";

// Simple dot env parser
const env = readFileSync(".env.local", "utf-8").split("\n").reduce((acc, line) => {
  const [key, ...val] = line.split("=");
  if (key && val) acc[key.trim()] = val.join("=").trim().replace(/['"]/g, '');
  return acc;
}, {});

const sql = postgres(env.DATABASE_URL);

async function main() {
  try {
    console.log("Menghapus kolom operating_hours yang lama (varchar)...");
    await sql`ALTER TABLE waste_locations DROP COLUMN operating_hours;`;
    console.log("Sukses! Kolom lama berhasil dihapus.");
  } catch (error) {
    console.error("Gagal atau kolom sudah tidak ada:", error.message);
  } finally {
    process.exit(0);
  }
}

main();
