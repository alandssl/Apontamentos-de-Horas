import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions";
import { sessionOptions, SessionData } from "@/lib/session";
import { AdminNavSwitcher } from "./AdminNavSwitcher";
import { PwaInstallButton } from "./PwaInstallButton";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions
    );

    return (
        <div className="flex min-h-screen flex-col items-center bg-zinc-50 dark:bg-zinc-950">
            {/* Top Navigation Bar */}
            <header className="w-full border-b bg-white dark:bg-zinc-900 sticky top-0 z-20 shadow-sm">
                <div className="max-w-6xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Image
                            src="/tecalfoto.png"
                            alt="Logo TECAL"
                            width={140}
                            height={50}
                            className="h-7 sm:h-10 w-auto max-w-[90px] sm:max-w-none object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
                            priority
                        />
                        <span className="font-bold text-xl tracking-tight hidden sm:inline-flex items-center border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 h-8 text-zinc-700 dark:text-zinc-200">
                            Apontamentos
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-4">
                        {/* Se o usuário for Admin, exibe o Switcher de navegação (Client Component) */}
                        {session.isAdmin && <AdminNavSwitcher />}

                        <PwaInstallButton />

                        <div className="hidden md:flex flex-col items-end text-sm">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                {session.username || "Colaborador"}
                            </span>
                            <span className="text-xs text-zinc-500 text-right">
                                {session.isAdmin ? "Gestor" : "Colaborador"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <form action={logoutAction}>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    type="submit"
                                    className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center shrink-0 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 shadow-sm hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                                >
                                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="w-full flex-1 flex flex-col items-center">
                {children}
            </main>
        </div>
    );
}
