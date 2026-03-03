"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileBarChart, CalendarDays, CheckSquare, Users, Building } from "lucide-react";

export function AdminNavSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="w-[180px] sm:w-[260px] h-9" />; // Placeholder
    }

    // Verifica qual rota o admin está para deixar o select de 'Modo' selecionado
    // Relatórios agora não afeta o seletor principal
    const currentMode = pathname.startsWith("/dashboard/admin") && pathname !== "/dashboard/admin/reports" && pathname !== "/dashboard/admin/users" && pathname !== "/dashboard/admin/cifs"
        ? "aprovar"
        : "apontar";

    const handleModeChange = (val: string) => {
        if (val === "aprovar") {
            router.push("/dashboard/admin");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                onClick={() => router.push("/dashboard/admin/cifs")}
                className={`hidden sm:flex items-center justify-center gap-1.5 w-[110px] sm:w-[90px] h-9 px-0 text-sm font-medium border ${pathname === "/dashboard/admin/cifs"
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                    : "bg-background text-zinc-600 hover:text-zinc-900 border-zinc-200 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 dark:bg-zinc-950"
                    }`}
            >
                <Building className="w-4 h-4 ml-[-4px]" />
                CIFs
            </Button>

            <Button
                variant="outline"
                onClick={() => router.push("/dashboard/admin/users")}
                className={`hidden sm:flex items-center justify-center gap-1.5 w-[110px] sm:w-[100px] h-9 px-0 text-sm font-medium border ${pathname === "/dashboard/admin/users"
                    ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800"
                    : "bg-background text-zinc-600 hover:text-zinc-900 border-zinc-200 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 dark:bg-zinc-950"
                    }`}
            >
                <Users className="w-4 h-4 ml-[-4px]" />
                Usuários
            </Button>

            <Button
                variant="outline"
                onClick={() => router.push("/dashboard/admin/reports")}
                className={`hidden sm:flex items-center justify-center gap-1.5 w-[110px] sm:w-[120px] h-9 px-0 text-sm font-medium border ${pathname === "/dashboard/admin/reports"
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                    : "bg-background text-zinc-600 hover:text-zinc-900 border-zinc-200 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 dark:bg-zinc-950"
                    }`}
            >
                <FileBarChart className="w-4 h-4 ml-[-4px]" />
                Relatórios
            </Button>

            <Select value={currentMode} onValueChange={handleModeChange}>
                <SelectTrigger className="w-[110px] sm:w-[124px] h-9 text-sm font-medium bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 justify-center">
                    <SelectValue placeholder="Modo">
                        <div className="flex items-center gap-1.5">
                            {currentMode === "aprovar" ? (
                                <>
                                    <CheckSquare className="w-4 h-4" />
                                    <span>Aprovar</span>
                                </>
                            ) : (
                                <>
                                    <CalendarDays className="w-4 h-4" />
                                    <span>Apontar</span>
                                </>
                            )}
                        </div>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="apontar" className="text-sm">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Apontar (Calendário)
                        </div>
                    </SelectItem>
                    <SelectItem value="aprovar" className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        <div className="flex items-center gap-1.5">
                            <CheckSquare className="w-4 h-4" />
                            Aprovar Equipe
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            {/* Ícone apenas para mobile, caso não caiba o texto na tela pequena */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard/admin/reports")}
                className={`sm:hidden h-9 w-9 ${pathname === "/dashboard/admin/reports"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
            >
                <FileBarChart className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard/admin/users")}
                className={`sm:hidden h-9 w-9 ${pathname === "/dashboard/admin/users"
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
            >
                <Users className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard/admin/cifs")}
                className={`sm:hidden h-9 w-9 ${pathname === "/dashboard/admin/cifs"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
            >
                <Building className="w-4 h-4" />
            </Button>
        </div>
    );
}
