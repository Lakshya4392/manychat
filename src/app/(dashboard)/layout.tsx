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
    <div className="flex min-h-screen bg-[#09090b]">
      <Sidebar />
      <main className="flex-grow ml-64 flex flex-col">
        <SearchBar />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
