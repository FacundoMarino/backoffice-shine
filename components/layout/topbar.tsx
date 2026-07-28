import { logoutAction } from "@/actions/auth";

export function Topbar({
  title,
  userName,
  initials,
}: {
  title: string;
  userName: string;
  initials: string;
}) {
  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--sidebar-border)] bg-white px-8">
      <h1 className="text-lg font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[13px] font-semibold text-foreground">{userName}</div>
          <div className="text-[11.5px] text-muted-foreground">Administradora</div>
        </div>
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary-soft text-[13px] font-bold text-primary-dark">
          {initials}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-background hover:text-foreground"
          >
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
