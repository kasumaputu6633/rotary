"use client";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
interface SidebarAdminProps {
    isOpen: boolean;
    onClose: () => void;
}
interface MenuItem {
    label: string;
    href: string;
    icon: string;
}
interface MenuSection {
    title: string;
    items: MenuItem[];
}
const menuSections: MenuSection[] = [
    {
        title: "Menu",
        items: [
            {
                label: "Dashboard",
                href: "/admin/dashboard",
                icon: "lucide:layout-dashboard",
            },
        ],
    },
    {
        title: "Pengguna",
        items: [
            {
                label: "User",
                href: "/admin/users",
                icon: "lucide:users",
            },
            {
                label: "Admin",
                href: "/admin/admins",
                icon: "lucide:user-cog",
            },
        ],
    },
    {
        title: "Kategori & Limbah",
        items: [
            {
                label: "Kategori",
                href: "/admin/categories",
                icon: "lucide:tags",
            },
            {
                label: "Lokasi Limbah",
                href: "/admin/waste-locations",
                icon: "lucide:recycle",
            },
        ],
    },
    {
        title: "Barang & Moderasi",
        items: [
            {
                label: "Listing",
                href: "/admin/listings",
                icon: "lucide:clipboard-list",
            },
            {
                label: "Moderasi",
                href: "/admin/moderation",
                icon: "lucide:shield-check",
            },
        ],
    },
    {
        title: "Laporan",
        items: [
            {
                label: "Komplain User",
                href: "/admin/complains",
                icon: "lucide:message-square-warning",
            },
            {
                label: "Kasus & Penanganan",
                href: "/admin/cases",
                icon: "lucide:briefcase",
            },
        ],
    },
];
export default function SidebarAdmin({ isOpen, onClose }: SidebarAdminProps) {
    const pathname = usePathname();
    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
                />
            )}
            {/* Sidebar Drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-[#eef2f6] bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-16 lg:z-30 lg:h-[calc(100vh-64px)] lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
                    <div className="space-y-6">
                        {menuSections.map((section, idx) => (
                            <div key={idx} className="space-y-2">
                                <h4 className="font-poppins text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3">
                                    {section.title}
                                </h4>
                                <nav className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => {
                                                    // Close sidebar on mobile after clicking
                                                    if (window.innerWidth < 1024) {
                                                        onClose();
                                                    }
                                                }}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-poppins text-[13px] font-semibold transition-all duration-200 ${isActive
                                                    ? "bg-gradient-to-r from-[#f7a81b] to-[#e89a14] text-white shadow-md shadow-[#f7a81b]/15 translate-x-1"
                                                    : "text-gray-600 hover:bg-[#fff9f0] hover:text-[#f7a81b]"
                                                    }`}
                                            >
                                                <Icon
                                                    icon={item.icon}
                                                    width={18}
                                                    height={18}
                                                    className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-[#f7a81b]"
                                                        }`}
                                                />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Footer Area inside Sidebar */}
                <div className="border-t border-[#eef2f6] p-4 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-[#17458f] font-poppins text-xs font-semibold">
                        <Icon icon="lucide:shield-check" width={14} height={14} className="text-[#f7a81b]" />
                        <span>Rotary Admin Area v1.0</span>
                    </div>
                </div>
            </aside>
        </>
    );
}