'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, subDays, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Building, Plus, Trash2, CheckCircle2, Hourglass, LogOut } from 'lucide-react';
import { logoutAction, getSessionData } from '@/lib/actions';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


const formSchema = z.object({
    userName: z.string().min(1, "Nome é obrigatório"),
    cif: z.string().min(1, "CIF da empresa é obrigatório"),
    type: z.string().min(1, "Tipo de apontamento é obrigatório"),
    description: z.string().optional(),
    date: z.date({
        message: "Uma data é necessária.",
    }),
    totalHoursInput: z.string().regex(/^\d{1,2}(:\d{2})?$/, "Formato inválido. Use HH:MM ou apenas HH (ex: 08:00 ou 8)"),
});

type EntryStatus = 'pending' | 'approved' | 'rejected';

type Entry = z.infer<typeof formSchema> & {
    id: string;
    totalHours: string; // Formatting ensured on submit
    status: EntryStatus;
};

export default function Dashboard() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // API Data States
    const [cifOptions, setCifOptions] = useState<{ value: string, label: string }[]>([]);
    const [typeOptions, setTypeOptions] = useState<{ value: string, label: string }[]>([]);
    const [employees, setEmployees] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userName: "",
            totalHoursInput: "",
            description: "",
            type: ""
        },
    });

    // Fetch session and APIs
    useEffect(() => {
        getSessionData().then(session => {
            if (session?.isAdmin) {
                setIsAdmin(true);
            }
            if (session?.username) {
                form.setValue("userName", session.username);
            }
        });

        // Fetch Apontamentos
        fetch("http://localhost:8080/horas")
            .then(res => res.json())
            .then(data => {
                const fetchedEntries = data.map((h: any) => ({
                    id: String(h.id),
                    date: new Date(h.dataApontamentoId?.data ? h.dataApontamentoId.data + 'T00:00:00' : new Date()),
                    cif: h.detalhe || 'Indefinido',
                    totalHours: h.horasEfetivas,
                    totalHoursInput: h.horasEfetivas,
                    status: h.dataApontamentoId?.dataAprovacao ? 'approved' : 'pending',
                    type: String(h.tipoId?.id),
                    description: h.detalhe,
                    userName: h.usuarioId?.nome || 'Usuário'
                }));
                setEntries(fetchedEntries);
            })
            .catch(err => console.error("Error fetching horas", err));

        // Fetch Employees
        fetch("http://localhost:8080/user")
            .then(res => res.json())
            .then(data => {
                setAllUsers(data);
                setEmployees(Array.from(new Set(data.map((u: any) => u.nome || u.usuario))));
            })
            .catch(err => console.error("Error fetching usuarios", err));

        // Fetch CIFs
        fetch("http://localhost:8080/cif/usuario/1")
            .then(res => res.json())
            .then(data => {
                setCifOptions(data.map((c: any) => ({ value: c.codccusto, label: `${c.codccusto} - ${c.nome}` })));
            })
            .catch(err => console.error("Error fetching cifs", err));

        // Fetch Tipos
        fetch("http://localhost:8080/tipos")
            .then(res => res.json())
            .then(data => {
                setTypeOptions(data.map((t: any) => ({ value: String(t.id), label: t.tipo })));
            })
            .catch(err => console.error("Error fetching tipos", err));

    }, [form]);

    // Update form date when calendar selection changes
    useEffect(() => {
        if (selectedDate) {
            form.setValue('date', selectedDate);
        }
    }, [selectedDate, form]);

    function onDateSelect(date: Date | undefined) {
        setSelectedDate(date);
        if (date) {
            setIsDialogOpen(true);
        }
    }

    function parseHoursToMinutes(timeStr: string) {
        if (!timeStr.includes(':')) {
            return parseInt(timeStr) * 60;
        }
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }

    // Calculate stats for the selected date
    const selectedDateEntries = entries.filter(e =>
        selectedDate && format(e.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );

    const totalMinutesPointed = selectedDateEntries.reduce((acc, curr) => acc + parseHoursToMinutes(curr.totalHours), 0);
    const totalHoursPointedStr = `${Math.floor(totalMinutesPointed / 60)}h ${String(totalMinutesPointed % 60).padStart(2, '0')}m`;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        let formattedHours = values.totalHoursInput;

        // Normalize input to HH:MM
        if (!formattedHours.includes(':')) {
            formattedHours = `${values.totalHoursInput.padStart(2, '0')}:00`;
        } else {
            const [h, m] = formattedHours.split(':');
            formattedHours = `${h.padStart(2, '0')}:${m}`;
        }

        const newEntry: Entry = {
            ...values,
            totalHoursInput: formattedHours,
            id: Math.random().toString(36).substr(2, 9),
            totalHours: formattedHours,
            status: 'pending'
        };

        try {
            // Find the correct references for the API POST
            const tipoObj = typeOptions.find(t => t.value === values.type);

            // Call API
            const adminSelectedUser = allUsers.find(u => (u.nome || u.usuario) === values.userName);

            const response = await fetch("http://localhost:8080/horas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    horasEfetivas: formattedHours,
                    detalhe: values.cif, // CIF
                    data: format(values.date, 'yyyy-MM-dd'),
                    tipoId: Number(values.type),
                    usuarioId: adminSelectedUser ? adminSelectedUser.id : 1
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Erro ao salvar no servidor");
            }

            // Append new entry instead of replacing
            setEntries([...entries, newEntry]);

            toast.success("Apontamento registrado!", {
                description: `${formattedHours}h - ${values.cif} (Salvo no banco)`
            });

            form.reset({
                ...values,
                cif: '', // Reset CIF
                totalHoursInput: "",
            });
        } catch (error: any) {
            console.error("Erro ao apontar horas:", error);
            toast.error("Erro ao salvar apontamento", { description: error.message });
        }
    }

    const deleteEntry = async (id: string, status: EntryStatus) => {
        if (status === 'approved') {
            toast.error("Não é possível remover apontamentos aprovados.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/horas/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Erro ao remover no servidor");
            }

            setEntries(entries.filter(e => e.id !== id));
            toast.success("Apontamento removido com sucesso!");
        } catch (error: any) {
            console.error("Erro ao remover apontamento:", error);
            toast.error("Erro ao remover apontamento", { description: error.message });
        }
    };

    // Helper to check if a date has an entry
    const hasEntry = (date: Date) => {
        return entries.some(entry =>
            format(entry.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
    };

    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6; // 0=Sun, 6=Sat
    };

    const hasEntryOnDate = (d: Date) => entries.some(e => isSameDay(e.date, d));

    return (
        <>
            <div className="w-full max-w-6xl flex flex-col gap-6 p-4 md:gap-8 md:p-8">
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
                                        <span>Apontado</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-md bg-yellow-300"></div>
                                        <span>1 ou 2 dias sem apontuar</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-md bg-rose-600"></div>
                                        <span>3+ dias sem apontuar</span>
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
                                                <SelectItem key={index} value={emp}>{emp}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="flex justify-center p-2 sm:p-6 w-full overflow-hidden">
                            <div className="w-full flex justify-center overflow-x-auto pb-2">
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
                                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                        day_today: "bg-accent text-accent-foreground",
                                        month: "w-full",
                                        table: "w-full border-collapse",
                                        weekdays: "flex w-full mb-2",
                                        weekday: "text-muted-foreground flex-1 text-center font-medium text-[0.8rem] sm:text-base select-none",
                                        week: "flex w-full mt-1 sm:mt-2",
                                        day: "relative flex-1 p-0 text-center flex items-center justify-center border border-zinc-900/30 dark:border-zinc-500/30 rounded-md mx-[1px]",
                                        day_button: "font-bold text-lg sm:text-2xl w-full h-full",
                                    }}
                                    modifiers={{
                                        hasEntry: (date) => hasEntry(date),
                                        dangerGap: (date) => {
                                            if (hasEntry(date) || date >= new Date() || isWeekend(date)) return false;
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
                                            if (hasEntry(date) || date >= new Date() || isWeekend(date)) return false;
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
                                        }
                                    }}
                                    modifiersClassNames={{
                                        hasEntry: "bg-emerald-500 text-white border border-emerald-600 font-bold rounded-md",
                                        warningGap: "bg-yellow-300 text-yellow-950 border border-yellow-400 font-bold rounded-md",
                                        dangerGap: "bg-rose-600 text-white border border-rose-700 font-bold rounded-md"
                                    }}
                                    locale={ptBR}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* History Sidebar */}
                    <Card className="shadow-lg border-zinc-200/50 dark:border-zinc-800/50 w-full md:w-[350px] h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Resumo do Mês</CardTitle>
                            <CardDescription>Seus últimos registros.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {entries.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg text-sm bg-zinc-50/50 dark:bg-zinc-900/50">
                                    Nenhum apontamento registrado.
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {(() => {
                                        // Aggregate entries by date directly in render
                                        const groupedEntries: Record<string, {
                                            date: Date;
                                            totalMinutes: number;
                                            cifs: Record<string, number>;
                                            originalDate: Date;
                                        }> = {};

                                        entries.forEach(entry => {
                                            const dateKey = format(entry.date, 'yyyy-MM-dd');
                                            if (!groupedEntries[dateKey]) {
                                                groupedEntries[dateKey] = {
                                                    date: entry.date,
                                                    originalDate: entry.date,
                                                    totalMinutes: 0,
                                                    cifs: {}
                                                };
                                            }
                                            const minutes = parseHoursToMinutes(entry.totalHours);
                                            groupedEntries[dateKey].totalMinutes += minutes;

                                            const cifLabel = cifOptions.find(c => c.value === entry.cif)?.label || entry.cif;
                                            groupedEntries[dateKey].cifs[cifLabel] = (groupedEntries[dateKey].cifs[cifLabel] || 0) + minutes;
                                        });

                                        const sortedGroups = Object.values(groupedEntries).sort((a, b) => b.originalDate.getTime() - a.originalDate.getTime());

                                        return sortedGroups.map((group) => {
                                            const totalHours = Math.floor(group.totalMinutes / 60);
                                            const remMinutes = group.totalMinutes % 60;
                                            const formattedTotal = `${String(totalHours).padStart(2, '0')}:${String(remMinutes).padStart(2, '0')}`;
                                            const cifList = Object.keys(group.cifs).sort();

                                            return (
                                                <div key={format(group.date, 'yyyy-MM-dd')} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors text-sm">
                                                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                                                        <div className="font-semibold">{format(group.date, "dd/MM/yyyy")}</div>

                                                        {cifList.length === 1 ? (
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1 cursor-default">
                                                                <Building className="w-3 h-3" /> {cifList[0]} • {formattedTotal}h
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-1">
                                                                {cifList.map(cif => {
                                                                    const mins = group.cifs[cif];
                                                                    const h = Math.floor(mins / 60);
                                                                    const m = mins % 60;
                                                                    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

                                                                    return (
                                                                        <Badge key={cif} variant="secondary" className="text-[10px] h-5 px-1.5 font-normal border bg-background flex items-center gap-1 cursor-default">
                                                                            <Building className="w-2.5 h-2.5" />
                                                                            {cif} • {timeStr}h
                                                                        </Badge>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right shrink-0 ml-2">
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
            </div >

            {/* Entry Dialog */}
            < Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} >
                <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl">
                    <DialogHeader>
                        <DialogTitle>Apontamentos - {selectedDate && format(selectedDate, "dd/MM/yyyy")}</DialogTitle>
                        <DialogDescription>
                            Gerencie suas horas para este dia.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Daily Summary */}
                    <div className="grid grid-cols-1 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Apontado Hoje</p>
                            <p className="text-3xl font-bold text-primary">{totalHoursPointedStr}</p>
                        </div>
                    </div>

                    {/* Existing Entries List */}
                    {selectedDateEntries.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Registros do Dia:</h3>
                            {selectedDateEntries.map(entry => (
                                <div key={entry.id} className="flex items-center justify-between p-3 border rounded bg-background text-sm">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{cifOptions.find(c => c.value === entry.cif)?.label || entry.cif}</p>
                                            {entry.status === 'approved' ? (
                                                <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-[10px]">Aprovado</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-amber-600 bg-amber-100 dark:bg-amber-900/30 text-[10px]">Pendente</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">{entry.totalHours}h</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className={cn("h-8 w-8", entry.status === 'approved' ? "text-muted-foreground opacity-50 cursor-not-allowed" : "text-destructive")}
                                            onClick={() => deleteEntry(entry.id, entry.status)}
                                            disabled={entry.status === 'approved'}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-t my-2" />

                    <h3 className="text-sm font-medium pt-2">Adicionar Novo Apontamento:</h3>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

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
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a empresa" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {cifOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date field is hidden as it's set by calendar context */}
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="hidden">
                                        <FormControl>
                                            <Input {...field} value={field.value ? format(field.value, 'yyyy-MM-dd') : ''} type="hidden" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Apontamento</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {typeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                        <FormDescription>Informe o total de horas líquidas.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                <p>Novos apontamentos ficam "Pendentes" até aprovação do gestor. Uma vez aprovados, não podem ser alterados ou exluídos.</p>
                            </div>

                            <DialogFooter>
                                <Button type="submit" className="w-full">Adicionar Apontamento</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog >
        </>
    );
}
