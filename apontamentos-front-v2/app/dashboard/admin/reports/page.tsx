"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
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
import { Label } from "@/components/ui/label";
import {
  FileBarChart,
  Search,
  Building,
  Clock,
  Briefcase,
  User,
  CalendarDays,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useEffect } from "react";
const TYPE_LABELS: Record<string, string> = {
  TRABALHO_NORMAL: "Trabalho Normal",
  HORA_EXTRA: "Hora Extra",
  VIAGEM: "Viagem",
  SOBREAVISO: "Sobreaviso",
};

export default function AdminReportsPage() {
  // Filtros
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");
  const [specificDate, setSpecificDate] = useState("");
  const [searchName, setSearchName] = useState("");

  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:8080/horas`)
      .then((res) => res.json())
      .then((data) => {
        const fetchedEntries = data
          .filter((h: any) => h.dataApontamentoId?.dataAprovacao) // Apenas os aprovados
          .map((h: any) => ({
            id: String(h.id),
            date: new Date(h.dataApontamentoId?.data || new Date())
              .toISOString()
              .split("T")[0], // yyyy-mm-dd
            cif: h.cif || "Indefinido",
            totalHours: h.horasEfetivas,
            status: "approved",
            type: String(h.tipoId?.tipo),
            userName: h.usuarioId?.nome || "Usuário",
          }));
        setReports(fetchedEntries);
      })
      .catch((err) => console.error("Error fetching horas", err));
  }, []);

  // Aplica os filtros
  const filteredReports = reports.filter((report) => {
    const reportDate = parseISO(report.date); // 'yyyy-MM-dd'

    // Filtro de Nome
    if (
      searchName &&
      !report.userName.toLowerCase().includes(searchName.toLowerCase())
    ) {
      return false;
    }

    // Se uma data exata foi escolhida, ela sobrepõe mês e ano
    if (specificDate) {
      return report.date === specificDate;
    }

    // Filtro de Ano
    if (year !== "all") {
      const reportYear = reportDate.getFullYear().toString();
      if (reportYear !== year) return false;
    }

    // Filtro de Mês
    if (month !== "all") {
      const reportMonth = (reportDate.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      if (reportMonth !== month) return false;
    }

    return true;
  });

  // Anos dinâmicos baseados nos dados + ano atual (simulação)
  const availableYears = ["2023", "2024", "2025"];

  const exportToExcel = () => {
    if (filteredReports.length === 0) return;

    const headers = [
      "Nome",
      "Data",
      "Empresa (CIF)",
      "Tipo",
      "Horas",
      "Status",
    ];
    const rows = filteredReports.map((report) => [
      report.userName,
      format(parseISO(report.date), "dd/MM/yyyy"),
      report.cif,
      TYPE_LABELS[report.type] || report.type,
      report.totalHours,
      "Aprovado",
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n");

    // O UTF-8 BOM (\uFEFF) é inserido para garantir que o Excel abra os acentos em pt-BR perfeitamente
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `relatorio_apontamentos_${format(new Date(), "yyyyMMdd_HHmm")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 p-4 md:gap-8 md:p-8">
      <Card className="shadow-lg border-zinc-200/50 dark:border-zinc-800/50 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <FileBarChart className="w-6 h-6 text-blue-600" />
              Relatório de Horas Aprovadas
            </CardTitle>
            <CardDescription>
              Consulte o histórico de apontamentos já validados da equipe.
            </CardDescription>
          </div>
          <Button
            onClick={exportToExcel}
            disabled={filteredReports.length === 0}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2 flex items-center shadow-sm"
          >
            <Download className="w-4 h-4" />
            Baixar Csv
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Barra de Filtros */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Buscar Colaborador
              </Label>
              <Input
                placeholder="Nome do funcionário..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="h-9 text-sm bg-white dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Mês</Label>
              <Select
                value={month}
                onValueChange={setMonth}
                disabled={!!specificDate}
              >
                <SelectTrigger className="h-9 text-sm bg-white dark:bg-zinc-950">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Meses</SelectItem>
                  <SelectItem value="01">Janeiro</SelectItem>
                  <SelectItem value="02">Fevereiro</SelectItem>
                  <SelectItem value="03">Março</SelectItem>
                  <SelectItem value="04">Abril</SelectItem>
                  <SelectItem value="05">Maio</SelectItem>
                  <SelectItem value="06">Junho</SelectItem>
                  <SelectItem value="07">Julho</SelectItem>
                  <SelectItem value="08">Agosto</SelectItem>
                  <SelectItem value="09">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Ano</Label>
              <Select
                value={year}
                onValueChange={setYear}
                disabled={!!specificDate}
              >
                <SelectTrigger className="h-9 text-sm bg-white dark:bg-zinc-950">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Anos</SelectItem>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l sm:pl-4 pt-4 sm:pt-0 dark:border-zinc-800">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                Data Específica
              </Label>
              <Input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="h-9 text-sm bg-white dark:bg-zinc-950"
              />
              {specificDate && (
                <button
                  onClick={() => setSpecificDate("")}
                  className="text-[10px] text-red-500 hover:underline mt-1 block"
                >
                  Limpar data exata
                </button>
              )}
            </div>
          </div>

          {/* Resultados */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                Resultados ({filteredReports.length})
              </h3>
            </div>

            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center gap-3">
                <Search className="w-10 h-10 text-muted-foreground/30" />
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Nenhum apontamento encontrado
                  </h3>
                  <p className="text-sm">
                    Os filtros atuais não retornaram dados aprovados.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-xl border bg-card shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold">{report.userName}</h4>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {format(
                              parseISO(report.date),
                              "dd 'de' MMMM, yyyy",
                              { locale: ptBR },
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                          {report.totalHours}h
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-green-100/50 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-normal px-1.5 py-0 mt-1"
                        >
                          Aprovado
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-md">
                        <Building className="w-3.5 h-3.5" />
                        {report.cif}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-md">
                        <Briefcase className="w-3.5 h-3.5" />
                        {TYPE_LABELS[report.type] || report.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
