import { Outlet } from "react-router-dom";
import { NavbarLayout } from "../layouts/NavbarLayout";
import { Sidebar } from "../layouts/SidebarLayout";

export function HomePage() {
    return (
        <div className="">
            <NavbarLayout />
            <div className="w-full">
                <Outlet />
            </div>
        </div>
    )
}
