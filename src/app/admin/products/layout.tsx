import type { ReactNode } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
export default function ProtectedAdminLayout({children}:{children:ReactNode}){return <AdminGuard>{children}</AdminGuard>;}
