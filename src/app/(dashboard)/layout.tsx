import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/layout/SearchBar";
import { onBoardUser } from "@/actions/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sync user with DB
  await onBoardUser();

  return (
    <div className="flex min-h-screen bg-[#f8f8f8]">
      <Sidebar />
      <main className="flex-1 min-w-0 ml-64 flex flex-col min-h-screen">
        <SearchBar />
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
