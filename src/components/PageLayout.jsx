import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen text-[#293239] ">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        <main className="flex-1  overflow-y-auto">
          {" "}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
