import { requireRole } from "@/lib/auth";
import { getAdminCategories } from "@/lib/categories";
import CategoriesClient from "./_components/CategoriesClient";

export const metadata = {
    title: "Kategori — Rotary Admin",
    description: "Kelola kategori dan subkategori listing marketplace.",
};

export default async function AdminCategoriesPage() {
    await requireRole("admin");
    const categories = await getAdminCategories();

    return (
        <div className="mx-auto max-w-7xl">
            <CategoriesClient categories={categories} />
        </div>
    );
}
