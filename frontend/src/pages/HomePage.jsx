import { Outlet } from "react-router-dom";
import { NavbarLayout } from "../layouts/NavbarLayout";
import { Sidebar } from "../layouts/SidebarLayout";

export function HomePage() {
    return (
        <div className="">
            <NavbarLayout />
            <div className="px-4 py-3 h-16 bg-amber-50"></div>
            <div className="w-full">
                <Outlet />
            </div>
        </div>
    )
}
