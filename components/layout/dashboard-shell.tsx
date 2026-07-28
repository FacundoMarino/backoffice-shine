"use client";

import { Sidebar } from "./sidebar";
import { TitleProvider, useTitleValue } from "./title-context";
import { Topbar } from "./topbar";

function ShellInner({
  userName,
  initials,
  children,
}: {
  userName: string;
  initials: string;
  children: React.ReactNode;
}) {
  const title = useTitleValue();
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} userName={userName} initials={initials} />
        <main className="animate-cc-fade flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({
  userName,
  initials,
  children,
}: {
  userName: string;
  initials: string;
  children: React.ReactNode;
}) {
  return (
    <TitleProvider>
      <ShellInner userName={userName} initials={initials}>
        {children}
      </ShellInner>
    </TitleProvider>
  );
}
