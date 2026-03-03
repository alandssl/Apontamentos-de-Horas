"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Settings, Building, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Cif {
    codccusto: string;
    codcoligada: string;
    nome: string;
    ativo: string;
    tipocif: string;
}

export default function AdminCifsPage() {
    const [cifs, setCifs] = useState<Cif[]>([]);

    const [newCodCusto, setNewCodCusto] = useState("");
    const [newColigada, setNewColigada] = useState("1"); // Default to '1'
    const [newNome, setNewNome] = useState("");
    const [newAtivo, setNewAtivo] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchCifs();
    }, []);

    const fetchCifs = async () => {
        try {
            const res = await fetch("http://localhost:8080/cif/todos");
            if (res.ok) {
                const data = await res.json();
                setCifs(data);
            }
        } catch (e) {
            console.error("Erro ao carregar CIFs:", e);
        }
    };

    const handleCreateCif = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const resp = await fetch("http://localhost:8080/cif/salvar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    codccusto: newCodCusto,
                    codcoligada: newColigada,
                    nome: newNome,
                    ativo: newAtivo ? "T" : "F",
                    tipocif: "P" // Padrao
                })
            });

            if (!resp.ok) {
                throw new Error("Erro ao salvar CIF");
            }

            toast.success("CIF criada e salva com sucesso!");

            // Clear form
            setNewCodCusto("");
            setNewNome("");
            setNewAtivo(true);

            // Update list
            fetchCifs();
        } catch (err: any) {
            toast.error(err.message || "Erro na criação");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="w-full max-w-6xl flex flex-col gap-6 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-emerald-600" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Configurações de CIFs</h1>
                    <p className="text-zinc-500">Cadastre e gerencie os Centros de Custo (CIFs) no banco de dados.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <Card className="shadow-lg border-zinc-200/50 dark:border-zinc-800/50 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Plus className="w-5 h-5 text-emerald-500" />
                            Nova CIF
                        </CardTitle>
                        <CardDescription>Cadastre um novo centro de custo para uso.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateCif} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Código da CIF</Label>
                                <Input value={newCodCusto} onChange={(e) => setNewCodCusto(e.target.value)} required placeholder="Ex: 1.01.01.0001" />
                            </div>

                            <div className="space-y-2">
                                <Label>Nome/Descrição</Label>
                                <Input value={newNome} onChange={(e) => setNewNome(e.target.value)} required placeholder="Ex: Engenharia Civil" />
                            </div>

                            <div className="space-y-2">
                                <Label>Coligada</Label>
                                <Input value={newColigada} onChange={(e) => setNewColigada(e.target.value)} required placeholder="1" />
                            </div>

                            <div className="space-y-3 pt-3 mt-2 border-t">
                                <div className="flex items-center space-x-2 p-2 px-1">
                                    <Checkbox id="cif-ativo" checked={newAtivo} onCheckedChange={(c) => setNewAtivo(c as boolean)} />
                                    <Label htmlFor="cif-ativo" className="text-sm font-medium cursor-pointer">
                                        CIF Ativa e disponível para uso
                                    </Label>
                                </div>
                            </div>

                            <Button type="submit" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white" disabled={isCreating}>
                                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isCreating ? 'Salvando...' : 'Salvar CIF no Banco'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Lista */}
                <Card className="shadow-lg border-zinc-200/50 dark:border-zinc-800/50 lg:col-span-2 overflow-hidden flex flex-col h-full">
                    <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Building className="w-5 h-5 text-zinc-500" /> CIFs Cadastradas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto max-h-[600px]">
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {cifs.map(cif => (
                                <div key={cif.codccusto} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-accent/50 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <div className="font-semibold text-base flex items-center gap-2">
                                            {cif.codccusto}
                                            {cif.ativo === 'T' ? (
                                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 shadow-none hover:bg-emerald-100">Ativa</Badge>
                                            ) : (
                                                <Badge variant="secondary">Inativa</Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                            {cif.nome}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 sm:flex-col sm:gap-1 text-sm text-zinc-500 text-right shrink-0">
                                        <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs w-fit sm:ml-auto">
                                            Coligada {cif.codcoligada}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {cifs.length === 0 && (
                                <div className="p-8 text-center text-zinc-500">
                                    Nenhuma CIF cadastrada ainda.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
