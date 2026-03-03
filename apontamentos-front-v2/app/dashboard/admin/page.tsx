"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Building, Clock, User, ChevronRight, AlertCircle, Check, Briefcase, FileText, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { getSessionData } from "@/lib/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { subDays, startOfMonth, subMonths, endOfMonth, isAfter, isBefore, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";

type EntryStatus = 'pending' | 'approved' | 'rejected';

interface AdminEntry {
    id: string;
    dataId: string;
    userName: string;
    date: Date;
    cif: string;
    type: string;
    description?: string;
    totalHours: string;
    status: EntryStatus;
}

const TYPE_LABELS: Record<string, string> = {
    "TRABALHO_NORMAL": "Trabalho Normal",
    "HORA_EXTRA": "Hora Extra",
    "VIAGEM": "Viagem",
    "SOBREAVISO": "Sobreaviso",
};


export default function AdminAprovalPage() {
    const [entries, setEntries] = useState<AdminEntry[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState("all");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch Apontamentos & Session
    useEffect(() => {
        getSessionData().then(session => {
            if (session?.userId) {
                setUserId(session.userId);
            }
        });

        fetch("http://localhost:8080/horas")
            .then(res => res.json())
            .then(data => {
                const fetchedEntries = data.map((h: any) => ({
                    id: String(h.id),
                    dataId: String(h.dataApontamentoId?.id),
                    date: new Date(h.dataApontamentoId?.data || new Date()),
                    cif: h.detalhe || 'Indefinido',
                    totalHours: h.horasEfetivas,
                    status: h.dataApontamentoId?.dataAprovacao ? 'approved' : 'pending',
                    type: String(h.tipoId?.id),
                    description: h.detalhe,
                    userName: h.usuarioId?.nome || 'Usuário'
                }));
                setEntries(fetchedEntries);
            })
            .catch(err => console.error("Error fetching horas", err));
    }, []);

    const handleApprove = async (id: string, dataId: string, userName: string) => {
        if (!userId) return toast.error("Usuário aprovador não encontrado.", { description: "Por favor, faça login novamente." });

        try {
            const response = await fetch(`http://localhost:8080/data/${dataId}/aprovar`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ aprovadorId: Number(userId) })
            });

            if (!response.ok) throw new Error("Falha no servidor");

            setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e));
            toast.success(`Apontamento aprovado!`);
        } catch (error: any) {
            toast.error("Erro ao aprovar.", { description: error.message });
        }
    };

    const handleReject = async (id: string, dataId: string, userName: string) => {
        if (!userId) return toast.error("Usuário não identificado.");

        try {
            const response = await fetch(`http://localhost:8080/data/${dataId}/rejeitar`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rejeitadorId: Number(userId) })
            });

            if (!response.ok) throw new Error("Falha no servidor");

            setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e));
            toast.success(`Apontamento rejeitado!`);
        } catch (error: any) {
            toast.error("Erro ao rejeitar.", { description: error.message });
        }
    };

    const handleApproveAllUser = async (userName: string) => {
        if (!userId) return toast.error("Usuário não identificado.");
        const pendingEntries = entries.filter(e => e.userName === userName && e.status === 'pending');

        try {
            await Promise.all(pendingEntries.map(e =>
                fetch(`http://localhost:8080/data/${e.dataId}/aprovar`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ aprovadorId: Number(userId) })
                })
            ));

            setEntries(prev => prev.map(e => e.userName === userName ? { ...e, status: 'approved' } : e));
            toast.success(`Todos apontamentos de ${userName} foram aprovados!`);
        } catch (error) {
            toast.error("Erro ao aprovar alguns apontamentos.");
        }
    };

    const handleApproveAllGlobal = async () => {
        if (!userId) return toast.error("Usuário não identificado.");
        const pendingEntries = entries.filter(e => e.status === 'pending');

        try {
            await Promise.all(pendingEntries.map(e =>
                fetch(`http://localhost:8080/data/${e.dataId}/aprovar`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ aprovadorId: Number(userId) })
                })
            ));

            setEntries(prev => prev.map(e => ({ ...e, status: 'approved' })));
            toast.success(`Todos os apontamentos gerais foram aprovados!`);
        } catch (error) {
            toast.error("Erro ao aprovar apontamentos.");
        }
    };

    // Agrupar apontamentos por pessoa
    const userNames = Array.from(new Set(entries.map(e => e.userName)));

    const groupedData = userNames.map(userName => {
        const userEntries = entries.filter(e => e.userName === userName);
        const isAllApproved = userEntries.every(e => e.status === 'approved');
        return {
            userName,
            entries: userEntries,
            isAllApproved,
            pendingCount: userEntries.filter(e => e.status === 'pending').length
        };
    });

    // Os dados do popup e filtro das entradas:
    const activeUserData = groupedData.find(g => g.userName === selectedUser);

    const filteredEntries = activeUserData?.entries.filter(entry => {
        const today = new Date();
        if (dateFilter === "all") return true;
        if (dateFilter === "7days") return isAfter(entry.date, subDays(today, 7));
        if (dateFilter === "thisMonth") return isAfter(entry.date, startOfMonth(today));
        if (dateFilter === "lastMonth") {
            const startOfLast = startOfMonth(subMonths(today, 1));
            const endOfLast = endOfMonth(subMonths(today, 1));
            return isWithinInterval(entry.date, { start: startOfLast, end: endOfLast });
        }
        if (dateFilter === "custom") {
            if (!customStartDate && !customEndDate) return true;
            let isValid = true;
            if (customStartDate) {
                isValid = isValid && !isBefore(entry.date, startOfDay(parseISO(customStartDate)));
            }
            if (customEndDate) {
                isValid = isValid && !isAfter(entry.date, endOfDay(parseISO(customEndDate)));
            }
            return isValid;
        }
        return true;
    }) || [];

    const resetUserDialog = (open: boolean) => {
        if (!open) {
            setSelectedUser(null);
            setDateFilter("all");
            setCustomStartDate("");
            setCustomEndDate("");
        }
    };

    return (
        <div className="w-full max-w-4xl flex flex-col gap-6 p-4 md:gap-8 md:p-8">
            <Card className="shadow-lg border-zinc-200/50 dark:border-zinc-800/50 w-full">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Aprovação de Horas (Por Equipe)
                        </CardTitle>
                        <CardDescription>
                            Gerencie os apontamentos agrupados de cada membro da equipe.
                        </CardDescription>
                    </div>
                    {entries.some(e => e.status === 'pending') && (
                        <Button
                            onClick={handleApproveAllGlobal}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Aprovar Todos do Setor
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {groupedData.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center gap-3">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500/50" />
                            <div>
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Equipe sem envios!</h3>
                                <p className="text-sm">Nenhum funcionário enviou horas ainda.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {groupedData.map((group) => {
                                // "caso todos os apontamentos sejam aprovados, card fica verde"
                                // "caso tenha algum faltando, amarelo"
                                const cardColorClasses = group.isAllApproved
                                    ? "bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-800"
                                    : "bg-amber-100 border-amber-300 dark:bg-amber-900/20 dark:border-amber-800";

                                const textColorClasses = group.isAllApproved
                                    ? "text-green-800 dark:text-green-400"
                                    : "text-amber-800 dark:text-amber-400";

                                return (
                                    <div
                                        key={group.userName}
                                        onClick={() => setSelectedUser(group.userName)}
                                        className={`cursor-pointer rounded-xl border p-5 flex flex-col shadow-sm transition-all hover:scale-[1.02] active:scale-95 ${cardColorClasses}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-full ${group.isAllApproved ? 'bg-green-200/50 dark:bg-green-950' : 'bg-amber-200/50 dark:bg-amber-950'}`}>
                                                    <User className={`w-5 h-5 ${textColorClasses}`} />
                                                </div>
                                            </div>
                                            {group.isAllApproved ? (
                                                <CheckCircle2 className={`w-5 h-5 ${textColorClasses}`} />
                                            ) : (
                                                <AlertCircle className={`w-5 h-5 ${textColorClasses}`} />
                                            )}
                                        </div>

                                        <div className="flex-1 mt-1">
                                            <h3 className={`font-bold text-lg leading-tight ${textColorClasses}`}>
                                                {group.userName}
                                            </h3>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className={`text-xs font-semibold ${textColorClasses} flex gap-1 items-center`}>
                                                {group.isAllApproved ? (
                                                    <span>Tudo Aprovado</span>
                                                ) : (
                                                    <span>{group.pendingCount} pendente(s)</span>
                                                )}
                                            </div>
                                            <ChevronRight className={`w-4 h-4 ${textColorClasses} opacity-50`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Popup para exibir todas as entradas do usuário clicado */}
            <Dialog open={!!selectedUser} onOpenChange={resetUserDialog}>
                <DialogContent className="max-w-[700px] w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <User className="text-zinc-400" />
                            Apontamentos de {activeUserData?.userName}
                        </DialogTitle>
                        <DialogDescription>
                            Revise e aprove as horas inseridas individualmente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 my-4 bg-muted/50 p-3 rounded-lg border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filtrar período:</span>
                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                    <SelectTrigger className="w-[150px] h-8 text-xs bg-background">
                                        <SelectValue placeholder="Período" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="text-xs">Todos os Registros</SelectItem>
                                        <SelectItem value="7days" className="text-xs">Últimos 7 dias</SelectItem>
                                        <SelectItem value="thisMonth" className="text-xs">Este Mês</SelectItem>
                                        <SelectItem value="lastMonth" className="text-xs">Mês Passado</SelectItem>
                                        <SelectItem value="custom" className="hidden">Personalizado</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant={dateFilter === "custom" ? "secondary" : "outline"}
                                    size="icon"
                                    className={`h-8 w-8 shrink-0 ${dateFilter === "custom" ? "bg-zinc-200 dark:bg-zinc-800 border-transparent text-foreground" : "text-muted-foreground"}`}
                                    onClick={() => setDateFilter(prev => prev === "custom" ? "all" : "custom")}
                                    title="Definir datas personalizadas"
                                >
                                    <CalendarDays className="w-4 h-4" />
                                </Button>
                            </div>

                            {activeUserData && activeUserData.pendingCount > 0 && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800"
                                    onClick={() => handleApproveAllUser(activeUserData.userName)}
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    Aprovar Tudo de {activeUserData.userName}
                                </Button>
                            )}
                        </div>

                        {dateFilter === "custom" && (
                            <div className="flex items-center gap-2 pt-2 border-t">
                                <span className="text-xs font-medium text-muted-foreground">De:</span>
                                <Input
                                    type="date"
                                    className="h-8 text-xs w-[130px] bg-background"
                                    value={customStartDate}
                                    onChange={e => setCustomStartDate(e.target.value)}
                                />
                                <span className="text-xs font-medium text-muted-foreground">Até:</span>
                                <Input
                                    type="date"
                                    className="h-8 text-xs w-[130px] bg-background"
                                    value={customEndDate}
                                    onChange={e => setCustomEndDate(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 mt-2">
                        {filteredEntries.map((entry) => (
                            <div
                                key={entry.id}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-xl transition-colors gap-3 ${entry.status === 'approved'
                                    ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50'
                                    : entry.status === 'rejected'
                                        ? 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 opacity-60'
                                        : 'bg-card hover:bg-accent/30'
                                    }`}
                            >
                                {/* Info Panel */}
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline" className="font-semibold px-2 bg-background">
                                            {format(entry.date, "dd/MM/yyyy")}
                                        </Badge>
                                        <div className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 border px-2 py-0.5 rounded-sm bg-background">
                                            <Building className="w-3 h-3 text-zinc-400" />
                                            {entry.cif}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 border px-2 py-0.5 rounded-sm bg-background">
                                            <Briefcase className="w-3 h-3 text-zinc-400" />
                                            {TYPE_LABELS[entry.type] || entry.type}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-1">
                                        {entry.status === 'approved' && <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300">Aprovado</Badge>}
                                        {entry.status === 'rejected' && <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300">Rejeitado</Badge>}
                                        {entry.status === 'pending' && <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300">Pendente</Badge>}

                                        <span className="font-bold ml-auto text-lg pt-1">
                                            {entry.totalHours}h
                                        </span>
                                    </div>

                                    {entry.description && (
                                        <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border border-zinc-100 dark:border-zinc-800">
                                            <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                            <p className="italic leading-relaxed">"{entry.description}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Panel */}
                                {entry.status === 'pending' && (
                                    <div className="flex items-center gap-2 sm:border-l sm:pl-3 pt-3 sm:pt-0 border-t sm:border-t-0 mt-1 sm:mt-0">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shrink-0"
                                            onClick={() => handleReject(entry.id, entry.dataId, entry.userName)}
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                                            onClick={() => handleApprove(entry.id, entry.dataId, entry.userName)}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
