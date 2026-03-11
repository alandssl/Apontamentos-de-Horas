"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, subDays, isSameDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Building,
  Plus,
  Trash2,
  CheckCircle2,
  Hourglass,
  LogOut,
} from "lucide-react";
import { logoutAction, getSessionData } from "@/lib/actions";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { id, ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useDebounce } from "@/lib/useDebounce";

const formSchema = z.object({
  userName: z.string().min(1, "Nome é obrigatório"),
  cif: z.string().min(1, "CIF da empresa é obrigatório"),
  type: z.string().min(1, "Tipo de apontamento é obrigatório"),
  description: z.string().optional(),
  date: z.date({
    message: "Uma data é necessária.",
  }),
  totalHoursInput: z
    .string()
    .regex(
      /^\d{1,2}(:\d{2})?$/,
      "Formato inválido. Use HH:MM ou apenas HH (ex: 08:00 ou 8)",
    ),
});

type EntryStatus = "pending" | "approved" | "rejected";

type Entry = z.infer<typeof formSchema> & {
  id: string;
  totalHours: string; // Formatting ensured on submit
  status: EntryStatus;
  date: Date;
  chapa: string;
  cif: string;
  type?: string;
  description?: string;
  user: { nome: string; id: string };
};

export default function Dashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // API Data States
  const [cifOptions, setCifOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [typeOptions, setTypeOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [employees, setEmployees] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, cifOptions, 400);
  const [debouncedQueryValues, setDebouncedQueryValues] =
    useState(debouncedQuery);

  const handleDebouncedInputChange = (
    value: string,
    OnchangeForm: (...event: any[]) => void,
  ) => {
    setQuery(value); // Update the query state immediately
    OnchangeForm(value); // Update the form value immediately
  };

  useEffect(() => {
    setDebouncedQueryValues(debouncedQuery);
  }, [debouncedQuery]);

  useEffect(() => {
    setDebouncedQueryValues(cifOptions.slice(0, 100));
  }, [cifOptions, isDialogOpen]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      totalHoursInput: "",
      description: "",
      type: "",
    },
  });

  // Fetch session and APIs
  useEffect(() => {
    getSessionData().then((session) => {
      if (session?.isAdmin) {
        setIsAdmin(true);
      }
      if (session?.nome) {
        form.setValue("userName", session.chapa + " - " + session.nome);
      }

      // Fetch Employees
      if (session?.isAdmin && session?.userId) {
        fetch(
          `http://${window.location.hostname}:8080/chapa-subordinado/${session.userId}`,
        )
          .then((res) => res.json())
          .then((subSupData) => {
            // const validSubSup = Array.isArray(subSupData) ? subSupData : [];
            const validSubSup = subSupData;

            setEmployees(
              Array.from(
                new Set(
                  validSubSup
                    .map(
                      (u: { nome: string; chapa: string }) =>
                        u.chapa + " - " + u.nome,
                    )
                    .filter(Boolean),
                ),
              ),
            );

            setEmployees((prev) => [
              ...prev,
              session.chapa + " - " + session.nome,
            ]);
          })
          .catch((err) => {
            console.error("Error fetching subordinados", err);
          });
      }

      // // Fetch Employees
      // fetch(`http://${window.location.hostname}:8080/user`)
      //   .then((res) => res.json())
      //   .then((allUsersData) => {
      //     setAllUsers(allUsersData);
      //     if (session?.isAdmin && session?.userId) {
      //       fetch(
      //         `http://${window.location.hostname}:8080/chapa-subordinado/${session.userId}`,
      //       )
      //         .then((res) => res.json())
      //         .then((subSupData) => {
      //           console.log("session");
      //           console.log(subSupData);
      //           const validSubSup = Array.isArray(subSupData) ? subSupData : [];
      //           const allowedChapas = validSubSup
      //             .map((s: any) => s.chapa)
      //             .filter(Boolean);

      //           const selfUser = allUsersData.find(
      //             (u: any) => String(u.id) === String(session.userId),
      //           );

      //           console.log(selfUser);
      //           setEmployees(
      //             Array.from(
      //               new Set(
      //                 validSubSup.map((u: any) => u.nome).filter(Boolean),
      //               ),
      //             ),
      //           );
      //           setEmployees((prev) => [...prev, selfUser.nome]);

      //           // }
      //         })
      //         .catch((err) => {
      //           console.error("Error fetching subordinados", err);
      //           // Se falhar a busca (ex: rota retornar 404), colocar apenas o usuario atual
      //           const selfUser = allUsersData.find(
      //             (u: any) => String(u.id) === String(session.userId),
      //           );
      //           setEmployees(
      //             selfUser
      //               ? [selfUser.nome || selfUser.usuario].filter(Boolean)
      //               : [session.username].filter(Boolean),
      //           );
      //         });
      //     } else {
      //       setEmployees(
      //         Array.from(
      //           new Set(
      //             allUsersData
      //               .map((u: any) => u.nome || u.usuario)
      //               .filter(Boolean),
      //           ),
      //         ),
      //       );
      //     }
      //   })
      //   .catch((err) => console.error("Error fetching usuarios", err));

      // Fetch Apontamentos
      fetch(`http://${window.location.hostname}:8080/horas`)
        .then((res) => res.json())
        .then((data) => {
          const fetchedEntries: [Entry] = data.map((h: any) => ({
            id: String(h.id),
            date: new Date(
              h.dataApontamentoId?.data
                ? h.dataApontamentoId.data + "T00:00:00"
                : new Date(),
            ),
            cif: h.cif || "Indefinido",
            chapa: h.dataApontamentoId?.chapa,
            totalHours: h.horasEfetivas,
            status: h.dataApontamentoId?.dataAprovacao ? "approved" : "pending",
            type: String(h.tipoId?.tipo) || "Indefinido",
            description: h.detalhe || "Indefinido",
            user: {
              nome: h.usuarioId?.nome || "Indefinido",
              id: String(h.usuarioId?.id),
            },
          }));
          setEntries(fetchedEntries);
        })
        .catch((err) => console.error("Error fetching horas", err));

      // Fetch CIFs
      // fetch();
      // `http://${window.location.hostname}:8080/cif/usuario/${session?.userId}`,
      fetch(`http://${window.location.hostname}:8080/cif/todos`)
        .then((res) => res.json())
        .then((data) => {
          if (!Array.isArray(data)) {
            console.error("CIF response não é um array:", data);
            return;
          }
          setCifOptions(
            data.map((c: any) => ({
              value: c.codccusto,
              label: `${c.codccusto} - ${c.nome}`,
            })),
          );
        })
        .catch((err) => console.error("Error fetching cifs", err));

      // Fetch Tipos
      fetch(`http://${window.location.hostname}:8080/tipos`)
        .then((res) => res.json())
        .then((data) => {
          if (!Array.isArray(data)) {
            console.error("Tipos response não é um array:", data);
            return;
          }
          setTypeOptions(
            data.map((t: any) => ({ value: String(t.id), label: t.tipo })),
          );
        })
        .catch((err) => console.error("Error fetching tipos", err));
    });
  }, [form]);

  // Update form date when calendar selection changes
  useEffect(() => {
    if (selectedDate) {
      form.setValue("date", selectedDate);
    }
  }, [selectedDate, form]);

  function onDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    if (date) {
      setIsDialogOpen(true);
    }
  }

  function parseHoursToMinutes(timeStr: string) {
    if (!timeStr.includes(":")) {
      return parseInt(timeStr) * 60;
    }
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }

  const watchedUserName = form.watch("userName");
  const currentUserEntries = entries.filter(
    (e) => e.chapa === watchedUserName.split(" - ")[0],
  );

  // useEffect(() => {
  //   console.log(entries);
  //   console.log(currentUserEntries);
  //   console.log(watchedUserName);
  // }, [currentUserEntries]);

  // Calculate stats for the selected date
  const selectedDateEntries = currentUserEntries.filter(
    (e) =>
      selectedDate &&
      format(e.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"),
  );

  const totalMinutesPointed = selectedDateEntries.reduce(
    (acc, curr) => acc + parseHoursToMinutes(curr.totalHours),
    0,
  );
  const totalHoursPointedStr = `${Math.floor(totalMinutesPointed / 60)}h ${String(totalMinutesPointed % 60).padStart(2, "0")}m`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let formattedHours = values.totalHoursInput;

    // Normalize input to HH:MM
    if (!formattedHours.includes(":")) {
      formattedHours = `${values.totalHoursInput.padStart(2, "0")}:00`;
    } else {
      const [h, m] = formattedHours.split(":");
      formattedHours = `${h.padStart(2, "0")}:${m}`;
    }
    const session = await getSessionData();

    const newEntry: Entry = {
      ...values,
      totalHoursInput: formattedHours,
      id: Math.random().toString(36).substr(2, 9),
      totalHours: formattedHours,
      status: "pending",
      chapa: values.userName.split(" - ")[0],
      user: {
        nome: session.nome!,
        id: session.userId!,
      },
      cif: values.cif.split(" - ")[0],
      date: values.date,
      description: values.description,
      type: values.type,
    };

    try {
      // Find the correct references for the API POST
      const tipoObj = typeOptions.find((t) => t.value === values.type);

      // Call API

      console.log({
        horasEfetivas: formattedHours,
        cif: values.cif.split(" - ")[0], // CIF
        detalhe: values.description, // CIF
        data: format(values.date, "yyyy-MM-dd"),
        tipoId: Number(values.type),
        usuarioId: session.userId,
        chapa: values.userName.split(" - ")[0],
      });
      const response = await fetch(
        `http://${window.location.hostname}:8080/horas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            horasEfetivas: formattedHours,
            cif: values.cif.split(" - ")[0], // CIF
            detalhe: values.description, // CIF
            data: format(values.date, "yyyy-MM-dd"),
            tipoId: Number(values.type),
            usuarioId: session.userId,
            chapa: values.userName.split(" - ")[0],
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erro ao salvar no servidor");
      }

      // Append new entry instead of replacing
      setEntries([...entries, newEntry]);

      toast.success("Apontamento registrado!", {
        description: `${formattedHours}h - ${values.cif} (Salvo no banco)`,
      });

      setDebouncedQueryValues(cifOptions.slice(0, 100));

      form.reset({
        ...values,
        type: "",
        cif: "",
        totalHoursInput: "",
        description: "",
      });
    } catch (error: any) {
      console.error("Erro ao apontar horas:", error);
      toast.error("Erro ao salvar apontamento", { description: error.message });
    }
  }

  const deleteEntry = async (id: string, status: EntryStatus) => {
    if (status === "approved") {
      toast.error("Não é possível remover apontamentos aprovados.");
      return;
    }

    try {
      const response = await fetch(
        `http://${window.location.hostname}:8080/horas/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao remover no servidor");
      }

      setEntries(entries.filter((e) => e.id !== id));
      toast.success("Apontamento removido com sucesso!");
    } catch (error: any) {
      console.error("Erro ao remover apontamento:", error);
      toast.error("Erro ao remover apontamento", {
        description: error.message,
      });
    }
  };

  // Helper to check if a date has an entry
  const hasEntry = (date: Date) => {
    return currentUserEntries.some(
      (entry) =>
        format(entry.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
    );
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0=Sun, 6=Sat
  };

  const hasEntryOnDate = (d: Date) =>
    currentUserEntries.some((e) => isSameDay(e.date, d));

  return (
    <>
      <div className="w-full max-w-screen-2xl flex flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Calendar Section */}
          <Card className="shadow-lg border-zinc-200/50 dark:border-zinc-800/50 flex-1 w-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" /> Calendário
              </CardTitle>
              <CardDescription className="space-y-2">
                <div className="space-y-1">
                  <p>Selecione um dia para registrar ou visualizar horas.</p>
                </div>
                <div className="flex items-center gap-4 text-xs mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-md bg-emerald-500"></div>
                    <span>Apontado (8h+)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-md"
                      style={{
                        background:
                          "linear-gradient(to right, #22c55e 50%, #fde047 50%)",
                      }}
                    ></div>
                    <span>Parcial (&lt;8h)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-md bg-yellow-300"></div>
                    <span>1 ou 2 dias sem apontar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-md bg-rose-600"></div>
                    <span>3+ dias sem apontar</span>
                  </div>
                </div>
              </CardDescription>

              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <User className="w-4 h-4" />
                    Apontar em nome de:
                  </h4>
                  <Select
                    value={form.watch("userName")}
                    onValueChange={(val) => {
                      form.setValue("userName", val);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[250px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60">
                      <SelectValue placeholder="Selecione um colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp, index) => (
                        <SelectItem key={index} value={emp}>
                          {emp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex justify-center p-2 sm:p-6 w-full overflow-hidden">
              <div className="w-full flex justify-center overflow-x-auto pb-2">
                {isMounted ? (
                  <Calendar
                    mode="single"
                    showOutsideDays={false}
                    selected={selectedDate}
                    onSelect={onDateSelect}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const fortyDaysAgo = subDays(today, 40);
                      return date > new Date() || date < fortyDaysAgo;
                    }}
                    className="rounded-xl border shadow-sm p-3 sm:p-6 w-full max-w-full overflow-hidden h-fit flex justify-center [--cell-size:11.5vw] sm:[--cell-size:60px] md:[--cell-size:75px] text-base sm:text-lg"
                    classNames={{
                      day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      month: "w-full",
                      table: "w-full border-collapse",
                      weekdays: "flex w-full mb-2",
                      weekday:
                        "text-muted-foreground flex-1 text-center font-medium text-[0.8rem] sm:text-base select-none",
                      week: "flex w-full mt-1 sm:mt-2",
                      day: "relative flex-1 p-0 text-center flex items-center justify-center border border-zinc-900/30 dark:border-zinc-500/30 rounded-md mx-[1px]",
                      day_button: "font-bold text-lg sm:text-2xl w-full h-full",
                    }}
                    modifiers={{
                      hasEntry: (date) => {
                        const dayEntries = currentUserEntries.filter(
                          (e) =>
                            format(e.date, "yyyy-MM-dd") ===
                            format(date, "yyyy-MM-dd"),
                        );
                        if (dayEntries.length === 0) return false;
                        const totalMins = dayEntries.reduce(
                          (acc, e) => acc + parseHoursToMinutes(e.totalHours),
                          0,
                        );
                        return totalMins >= 480; // 8h = 480 min
                      },
                      partialEntry: (date) => {
                        const dayEntries = currentUserEntries.filter(
                          (e) =>
                            format(e.date, "yyyy-MM-dd") ===
                            format(date, "yyyy-MM-dd"),
                        );
                        if (dayEntries.length === 0) return false;
                        const totalMins = dayEntries.reduce(
                          (acc, e) => acc + parseHoursToMinutes(e.totalHours),
                          0,
                        );
                        return totalMins > 0 && totalMins < 480;
                      },
                      dangerGap: (date) => {
                        if (
                          hasEntry(date) ||
                          date >= new Date() ||
                          isWeekend(date)
                        )
                          return false;
                        let workDaysPassed = 0;
                        let current = new Date(date);
                        current.setHours(0, 0, 0, 0);
                        const now = new Date();
                        now.setHours(0, 0, 0, 0);
                        while (current < now) {
                          if (!isWeekend(current)) workDaysPassed++;
                          current.setDate(current.getDate() + 1);
                        }
                        return workDaysPassed >= 3;
                      },
                      warningGap: (date) => {
                        if (
                          hasEntry(date) ||
                          date >= new Date() ||
                          isWeekend(date)
                        )
                          return false;
                        let workDaysPassed = 0;
                        let current = new Date(date);
                        current.setHours(0, 0, 0, 0);
                        const now = new Date();
                        now.setHours(0, 0, 0, 0);
                        while (current < now) {
                          if (!isWeekend(current)) workDaysPassed++;
                          current.setDate(current.getDate() + 1);
                        }
                        return workDaysPassed > 0 && workDaysPassed < 3;
                      },
                    }}
                    modifiersClassNames={{
                      hasEntry:
                        "bg-emerald-500 text-white border border-emerald-600 font-bold rounded-md",
                      partialEntry:
                        "text-zinc-900 border border-emerald-400 font-bold rounded-md",
                      warningGap:
                        "bg-yellow-300 text-yellow-950 border border-yellow-400 font-bold rounded-md",
                      dangerGap:
                        "bg-rose-600 text-white border border-rose-700 font-bold rounded-md",
                    }}
                    modifiersStyles={{
                      partialEntry: {
                        background:
                          "linear-gradient(135deg, #22c55e 75%, #fde047 75%)",
                        color: "#18181b",
                      },
                    }}
                    locale={ptBR}
                  />
                ) : (
                  <div className="w-full h-[320px] rounded-xl border bg-muted/30 animate-pulse" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* History Sidebar */}
          <Card className="shadow-lg border-zinc-200/50 dark:border-zinc-800/50 w-full lg:w-[380px] xl:w-[420px] shrink-0 h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Seus últimos apontamentos
              </CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              {currentUserEntries.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg text-sm bg-zinc-50/50 dark:bg-zinc-900/50">
                  Nenhum apontamento registrado.
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {(() => {
                    // Aggregate entries by date directly in render
                    const groupedEntries: Record<
                      string,
                      {
                        date: Date;
                        totalMinutes: number;
                        cifs: Record<string, number>;
                        originalDate: Date;
                      }
                    > = {};

                    currentUserEntries.forEach((entry) => {
                      const dateKey = format(entry.date, "yyyy-MM-dd");
                      if (!groupedEntries[dateKey]) {
                        groupedEntries[dateKey] = {
                          date: entry.date,
                          originalDate: entry.date,
                          totalMinutes: 0,
                          cifs: {},
                        };
                      }
                      const minutes = parseHoursToMinutes(entry.totalHours);
                      groupedEntries[dateKey].totalMinutes += minutes;

                      const cifLabel =
                        cifOptions.find((c) => c.value === entry.cif)?.label ||
                        entry.cif;
                      groupedEntries[dateKey].cifs[cifLabel] =
                        (groupedEntries[dateKey].cifs[cifLabel] || 0) + minutes;
                    });

                    const sortedGroups = Object.values(groupedEntries).sort(
                      (a, b) =>
                        b.originalDate.getTime() - a.originalDate.getTime(),
                    );

                    return sortedGroups.map((group) => {
                      const totalHours = Math.floor(group.totalMinutes / 60);
                      const remMinutes = group.totalMinutes % 60;
                      const formattedTotal = `${String(totalHours).padStart(2, "0")}:${String(remMinutes).padStart(2, "0")}`;
                      const cifList = Object.keys(group.cifs).sort();

                      return (
                        <div
                          key={format(group.date, "yyyy-MM-dd")}
                          className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors text-sm gap-2"
                        >
                          <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                            <div className="font-semibold">
                              {format(group.date, "dd/MM/yyyy")}
                            </div>

                            {cifList.length === 1 ? (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 cursor-default min-w-0">
                                <Building className="w-3 h-3 shrink-0" />
                                <span
                                  className="truncate flex-1"
                                  title={cifList[0]}
                                >
                                  {cifList[0]}
                                </span>
                                <span className="shrink-0 whitespace-nowrap">
                                  • {formattedTotal}h
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {cifList.map((cif) => {
                                  const mins = group.cifs[cif];
                                  const h = Math.floor(mins / 60);
                                  const m = mins % 60;
                                  const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

                                  return (
                                    <Badge
                                      key={cif}
                                      variant="secondary"
                                      className="text-[10px] h-5 px-1.5 font-normal border bg-background flex items-center gap-1 cursor-default max-w-full"
                                    >
                                      <Building className="w-2.5 h-2.5 shrink-0" />
                                      <span
                                        className="truncate max-w-[140px]"
                                        title={cif}
                                      >
                                        {cif}
                                      </span>
                                      <span className="shrink-0">
                                        • {timeStr}h
                                      </span>
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                              {formattedTotal}h
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Entry Dialog */}
      {isDialogOpen ? (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <Dialog
            modal={false}
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setTimeout(() => setSelectedDate(undefined), 200);
              }
            }}
          >
            <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 rounded-xl">
              <DialogHeader>
                <DialogTitle>
                  Apontamentos -{" "}
                  {selectedDate && format(selectedDate, "dd/MM/yyyy")}
                </DialogTitle>
                <DialogDescription>
                  Gerencie suas horas para este dia.
                </DialogDescription>
              </DialogHeader>

              {/* Daily Summary */}
              <div className="grid grid-cols-1 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Total Apontado Hoje
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {totalHoursPointedStr}
                  </p>
                </div>
              </div>

              {/* Existing Entries List */}
              {selectedDateEntries.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium max-w-full">
                    Registros do Dia:
                  </h3>
                  {selectedDateEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border rounded bg-background text-sm"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <p
                            className="font-medium truncate max-w-[100px] overflow-hidden text-ellipsis sm:max-w-[200px] md:max-w-[350px]"
                            title={
                              cifOptions.find((c) => c.value === entry.cif)
                                ?.label || entry.cif
                            }
                          >
                            {cifOptions.find((c) => c.value === entry.cif)
                              ?.label || entry.cif}
                          </p>
                          <div className="shrink-0 flex items-center">
                            {entry.status === "approved" ? (
                              <Badge
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 text-[10px] h-5 px-1.5 whitespace-nowrap"
                              >
                                Aprovado
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-amber-600 bg-amber-100 dark:bg-amber-900/30 text-[10px] h-5 px-1.5 whitespace-nowrap"
                              >
                                Pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className="font-bold">{entry.totalHours}h</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8",
                            entry.status === "approved"
                              ? "text-muted-foreground opacity-50 cursor-not-allowed"
                              : "text-destructive",
                          )}
                          onClick={() => deleteEntry(entry.id, entry.status)}
                          disabled={entry.status === "approved"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t my-2" />

              <h3 className="text-sm font-medium pt-2">
                Adicionar Novo Apontamento:
              </h3>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full overflow-hidden">
                    <FormField
                      control={form.control}
                      name="userName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Funcionário</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} readOnly className="bg-muted" />
                              <User className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cif"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa (CIF)</FormLabel>
                          <FormControl>
                            <Combobox
                              items={
                                debouncedQueryValues
                                // debouncedQuery.length == 0
                                //   ? cifOptions.slice(0, 100)
                                //   : debouncedQuery
                              }
                              onInputValueChange={(e) =>
                                handleDebouncedInputChange(e, field.onChange)
                              }
                            >
                              <ComboboxInput
                                //   value={formCifValue}
                                placeholder="Digite a CIF"
                              />
                              <ComboboxContent>
                                <ComboboxEmpty>
                                  CIF não encontrada
                                </ComboboxEmpty>
                                <ComboboxList>
                                  {(item) => (
                                    <ComboboxItem
                                      className="odd:bg-zinc-300"
                                      key={item.label}
                                      value={item.label}
                                    >
                                      {item.label}
                                    </ComboboxItem>
                                  )}
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Date field is hidden as it's set by calendar context */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input
                            {...field}
                            value={
                              field.value
                                ? format(field.value, "yyyy-MM-dd")
                                : ""
                            }
                            type="hidden"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full overflow-hidden">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Apontamento</FormLabel>
                          <FormControl>
                            <div className="relative w-full max-w-full min-w-0 overflow-hidden">
                              <select
                                className="flex h-10 w-full min-w-0 appearance-none rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-ellipsis overflow-hidden whitespace-nowrap"
                                value={field.value}
                                onChange={field.onChange}
                              >
                                <option value="" disabled hidden>
                                  Selecione o tipo
                                </option>
                                {typeOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalHoursInput"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas Trabalhadas</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="Ex: 08:00 ou 8" />
                              <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Informe o total de horas líquidas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva brevemente a atividade realizada..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md text-xs text-yellow-700 dark:text-yellow-300 flex gap-2">
                    <Hourglass className="w-4 h-4 shrink-0" />
                    <p>
                      Novos apontamentos ficam "Pendentes" até aprovação do
                      gestor. Uma vez aprovados, não podem ser alterados ou
                      exluídos.
                    </p>
                  </div>

                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      Adicionar Apontamento
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
