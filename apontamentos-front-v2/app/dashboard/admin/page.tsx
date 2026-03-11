"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Building,
  Clock,
  User,
  ChevronRight,
  AlertCircle,
  Check,
  Briefcase,
  FileText,
  CalendarDays,
} from "lucide-react";
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
import {
  subDays,
  startOfMonth,
  subMonths,
  endOfMonth,
  isAfter,
  isBefore,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";

type EntryStatus = "pending" | "approved" | "rejected";

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
  TRABALHO_NORMAL: "Trabalho Normal",
  HORA_EXTRA: "Hora Extra",
  VIAGEM: "Viagem",
  SOBREAVISO: "Sobreaviso",
};

export default function AdminAprovalPage() {
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  // Date filters removed
  const [userId, setUserId] = useState<string | null>(null);
  const [loggedUserName, setLoggedUserName] = useState<string | null>(null);

  // Fetch Apontamentos & Session
  useEffect(() => {
    getSessionData().then((session) => {
      console.log(session);
      if (session?.userId) {
        console.log(session);
        setUserId(session.userId);
        setLoggedUserName(session.nome!);

        // Bbusca quem sao os subordinados do usuário logado

        fetch(
          `http://${window.location.hostname}:8080/chapa-subordinado/${session.userId}`,
        )
          .then((res) => res.json())
          .then((subSupData) => {
            const validSubSup = Array.isArray(subSupData) ? subSupData : [];
            const allowedChapas = validSubSup
              .map((s: any) => s.chapa)
              .filter(Boolean);

            const allowedNames = new Set(
              allowedChapas,
              // .map((u: any) => u.nome || u.usuario)
              // .filter(Boolean),
            );
            console.log("Allowed Chapas:", allowedChapas);
            // Busca todos apontamentos e filtra apenas pros nomes dos subordinados
            fetch(`http://${window.location.hostname}:8080/horas`)
              .then((res) => res.json())
              .then((data) => {
                const fetchedEntries = data.map((h: any) => ({
                  id: String(h.id),
                  dataId: String(h.dataApontamentoId?.id),
                  date: h.dataApontamentoId?.data ? new Date(h.dataApontamentoId.data.split('T')[0] + 'T12:00:00') : new Date(),
                  cif: h.cif,
                  totalHours: h.horasEfetivas,
                  status: h.dataApontamentoId?.dataAprovacao
                    ? "approved"
                    : h.dataApontamentoId?.dataRejeitada
                      ? "rejected"
                      : "pending",
                  type: String(h.tipoId?.tipo),
                  description: h.detalhe,
                  chapa: h.dataApontamentoId?.chapa,
                  userName:
                    validSubSup.find(
                      (s: any) => s.chapa === h.dataApontamentoId.chapa,
                    )?.nome ||
                    session.nome ||
                    "Usuário",
                }));
                // .filter((e: any) =>
                //   allowedNames.has(e.dataApontamentoId.chapa),
                // );

                setEntries(fetchedEntries);
              })
              .catch((err) => console.error("Error fetching horas", err));
          });

        // // Primeiramente carrega os usuarios gerais para ter as chapas e nomes
        // fetch(`http://${window.location.hostname}:8080/user`)
        //   .then((res) => res.json())
        //   .then((allUsersData) => {
        //     // Agora busca quem sao os subordinados daquele gestor
        //     fetch(
        //       `http://${window.location.hostname}:8080/chapa-subordinado/${session.userId}`,
        //     )
        //       .then((res) => res.json())
        //       .then((subSupData) => {
        //         const validSubSup = Array.isArray(subSupData) ? subSupData : [];
        //         const allowedChapas = validSubSup
        //           .map((s: any) => s.chapa)
        //           .filter(Boolean);

        //         const allowedUsers = allUsersData.filter((u: any) =>
        //           allowedChapas.includes(u.chapa),
        //         );

        //         const allowedNames = new Set(
        //           allowedUsers
        //             .map((u: any) => u.nome || u.usuario)
        //             .filter(Boolean),
        //         );

        //         // Busca todos apontamentos e filtra apenas pros nomes dos subordinados
        //         fetch(`http://${window.location.hostname}:8080/horas`)
        //           .then((res) => res.json())
        //           .then((data) => {
        //             const fetchedEntries = data
        //               .map((h: any) => ({
        //                 id: String(h.id),
        //                 dataId: String(h.dataApontamentoId?.id),
        //                 date: h.dataApontamentoId?.data ? new Date(h.dataApontamentoId.data.split('T')[0] + 'T12:00:00') : new Date(),
        //                 cif: h.detalhe || "Indefinido",
        //                 totalHours: h.horasEfetivas,
        //                 status: h.dataApontamentoId?.dataAprovacao
        //                   ? "approved"
        //                   : "pending",
        //                 type: String(h.tipoId?.id),
        //                 description: h.detalhe,
        //                 userName: h.usuarioId?.nome || "Usuário",
        //               }))
        //               .filter((e: any) => allowedNames.has(e.userName));

        //             setEntries(fetchedEntries);
        //           })
        //           .catch((err) => console.error("Error fetching horas", err));
        //       })
        // .catch((err) =>
        //   console.error("Error fetching subordinados", err),
        // );
        // })
        // .catch((err) => console.error("Error fetching usuarios", err));
      }
    });
  }, []);

  useEffect(() => {
    console.log(entries);
  }, [entries]);

  const handleApproveDay = async (
    dataId: string,
    userName: string,
  ) => {
    if (!userId)
      return toast.error("Usuário aprovador não encontrado.", {
        description: "Por favor, faça login novamente.",
      });

    try {
      const response = await fetch(
        `http://${window.location.hostname}:8080/data/${dataId}/aprovar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aprovadorId: Number(userId) }),
        },
      );

      if (!response.ok) throw new Error("Falha no servidor");

      setEntries((prev) =>
        prev.map((e) => (e.dataId === dataId ? { ...e, status: "approved" } : e)),
      );
      toast.success(`Apontamentos do dia aprovados!`);
    } catch (error: any) {
      toast.error("Erro ao aprovar.", { description: error.message });
    }
  };

  const handleRejectDay = async (dataId: string, userName: string) => {
    if (!userId) return toast.error("Usuário não identificado.");

    try {
      const response = await fetch(
        `http://${window.location.hostname}:8080/data/${dataId}/rejeitar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejeitadorId: Number(userId) }),
        },
      );

      if (!response.ok) throw new Error("Falha no servidor");

      setEntries((prev) =>
        prev.map((e) => (e.dataId === dataId ? { ...e, status: "rejected" } : e)),
      );
      toast.success(`Apontamentos do dia rejeitados!`);
    } catch (error: any) {
      toast.error("Erro ao rejeitar.", { description: error.message });
    }
  };

  const handleApproveAllUser = async (userName: string) => {
    if (!userId) return toast.error("Usuário não identificado.");
    const pendingEntries = entries.filter(
      (e) => e.userName === userName && e.status === "pending",
    );

    try {
      const userId = await getSessionData().then((session) => session?.userId);
      const ids = pendingEntries.map((entry) => Number(entry.dataId));

      await Promise.all(
        pendingEntries.map((e) =>
          fetch(
            `http://${window.location.hostname}:8080/data/multiplas-datas`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: userId,
                ids: ids,
              }),
            },
          ),
        ),
      );

      setEntries((prev) =>
        prev.map(
          (e) =>
            ids.filter((item) => String(item) === e.dataId).length > 0
              ? { ...e, status: "approved" }
              : e,
          // e.userName === userName ? { ...e, status: "approved" } : e,
        ),
      );

      setSelectedUser(null);
      toast.success(
        `${ids.length} apontamentos de ${userName} foram aprovados!`,
      );
    } catch (error) {
      toast.error("Erro ao aprovar alguns apontamentos.");
    }
  };

  // Agrupar apontamentos por pessoa
  const userNames = Array.from(
    new Set(
      entries
        .map((e) => (e.userName != loggedUserName ? e.userName : null))
        .filter(Boolean),
    ),
  );

  const groupedData = userNames.map((userName) => {
    const userEntries = entries.filter((e) => e.userName === userName);
    const isAllApproved = userEntries.every((e) => e.status === "approved" || e.status === "rejected");

    const hasOldPending = userEntries.some(e => {
      if (e.status !== "pending") return false;
      const diffTime = new Date().getTime() - e.date.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    });

    return {
      userName,
      entries: userEntries,
      isAllApproved,
      pendingCount: userEntries.filter((e) => e.status === "pending").length,
      hasOldPending
    };
  });

  // Os dados do popup e filtro das entradas:
  const activeUserData = groupedData.find((g) => g.userName === selectedUser);

  // Group user entries by date locally if selected
  const userEntriesGroupedByDate = [];
  if (activeUserData && activeUserData.entries) {
    // Sort entries descending by date first
    const sortedEntries = [...activeUserData.entries].sort((a, b) => b.date.getTime() - a.date.getTime());

    const groupsMap = new Map();
    sortedEntries.forEach((entry) => {
      const dateKey = format(entry.date, 'yyyy-MM-dd');
      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, {
          date: entry.date,
          entries: []
        });
      }
      groupsMap.get(dateKey).entries.push(entry);
    });

    userEntriesGroupedByDate.push(...Array.from(groupsMap.values()));
  }

  const resetUserDialog = (open: boolean) => {
    if (!open) {
      setSelectedUser(null);
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
        </CardHeader>
        <CardContent>
          {groupedData.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center gap-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/50" />
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                  Equipe sem envios!
                </h3>
                <p className="text-sm">
                  Nenhum funcionário enviou horas ainda.
                </p>
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
                        <div
                          className={`p-2 rounded-full ${group.isAllApproved ? "bg-green-200/50 dark:bg-green-950" : "bg-amber-200/50 dark:bg-amber-950"}`}
                        >
                          <User className={`w-5 h-5 ${textColorClasses}`} />
                        </div>
                      </div>
                      {group.isAllApproved ? (
                        <CheckCircle2
                          className={`w-5 h-5 ${textColorClasses}`}
                        />
                      ) : (
                        <AlertCircle
                          className={`w-5 h-5 ${textColorClasses}`}
                        />
                      )}
                    </div>

                    <div className="flex-1 mt-1">
                      <h3
                        className={`font-bold text-lg leading-tight ${textColorClasses}`}
                      >
                        {group.userName}
                      </h3>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div
                        className={`text-xs font-semibold ${textColorClasses} flex gap-1 items-center`}
                      >
                        {group.isAllApproved ? (
                          <span>Tudo Aprovado</span>
                        ) : (
                          <span>{group.pendingCount} pendente(s)</span>
                        )}
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 ${textColorClasses} opacity-50`}
                      />
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
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Mostrando todos os registros
                </span>
                {activeUserData?.hasOldPending && (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    Há pendências com mais de 7 dias. Aprovação em lote desabilitada.
                  </span>
                )}
              </div>

              {activeUserData && activeUserData.pendingCount > 0 && !activeUserData.hasOldPending && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800"
                  onClick={() => handleApproveAllUser(activeUserData.userName!)}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Aprovar Tudo de {activeUserData.userName}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4 mt-4">
            {userEntriesGroupedByDate.map((group) => (
              <div key={format(group.date, "yyyy-MM-dd")} className="border rounded-xl bg-card overflow-hidden shadow-sm">
                <div className="bg-zinc-100 dark:bg-zinc-800/50 px-4 py-2 font-bold text-sm border-b flex items-center justify-between">
                  <span>{format(group.date, "dd/MM/yyyy")}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2 text-xs font-normal">
                      <span>
                        {group.entries.length} registro(s)
                      </span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Total: {group.entries.reduce((acc: number, e: AdminEntry) => {
                          const h = parseInt(e.totalHours.split(':')[0] || '0');
                          const m = parseInt(e.totalHours.split(':')[1] || '0');
                          return acc + h + m / 60;
                        }, 0).toFixed(1)}h
                      </span>
                    </div>

                    {group.entries.some((e: AdminEntry) => e.status === "pending") && (
                      <div className="flex items-center gap-2 pl-3 ml-1 border-l sm:border-l-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shrink-0"
                          onClick={() =>
                            handleRejectDay(group.entries[0].dataId, activeUserData?.userName || "")
                          }
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                          onClick={() =>
                            handleApproveDay(group.entries[0].dataId, activeUserData?.userName || "")
                          }
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="divide-y">
                  {group.entries.map((entry: AdminEntry) => (
                    <div
                      key={entry.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 transition-colors gap-3 ${entry.status === "approved"
                        ? "bg-green-50/20 dark:bg-green-950/10"
                        : entry.status === "rejected"
                          ? "bg-red-50/20 dark:bg-red-950/10 opacity-70"
                          : "hover:bg-accent/30"
                        }`}
                    >
                      {/* Info Panel */}
                      <div className="flex flex-col gap-1.5 flex-1 pl-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 border px-2 py-0.5 rounded-sm bg-background">
                            <Building className="w-3 h-3 text-zinc-400" />
                            {entry.cif}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 border px-2 py-0.5 rounded-sm bg-background">
                            <Briefcase className="w-3 h-3 text-zinc-400" />
                            {TYPE_LABELS[entry.type] || entry.type}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {entry.status === "approved" && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                            >
                              Aprovado
                            </Badge>
                          )}
                          {entry.status === "rejected" && (
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                            >
                              Rejeitado
                            </Badge>
                          )}
                          {entry.status === "pending" && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300"
                            >
                              Pendente
                            </Badge>
                          )}

                          <span className="font-bold ml-auto text-lg pt-1">
                            {entry.totalHours}h
                          </span>
                        </div>

                        {entry.description && (
                          <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border border-zinc-100 dark:border-zinc-800">
                            <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <p className="italic leading-relaxed">
                              "{entry.description}"
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
