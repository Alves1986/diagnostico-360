import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, Database, LogIn, MessageCircle, RefreshCw, Save, ShieldCheck, Users, X } from "lucide-react";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Logo } from "./Home";

type JsonRecord = Record<string, unknown>;

function parseJson(value: string): JsonRecord {
  try {
    return JSON.parse(value) as JsonRecord;
  } catch {
    return {};
  }
}

function printable(value: unknown) {
  if (Array.isArray(value)) return value.join(", ") || "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return String(value ?? "Não informado");
}

function DetailGroup({ title, entries }: { title: string; entries: Array<[string, unknown]> }) {
  return (
    <section className="detail-group">
      <h3>{title}</h3>
      <div className="detail-list">
        {entries.map(([key, value]) => (
          <div className="detail-row" key={key}>
            <span>{key}</span>
            <strong>{printable(value)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Internal() {
  const [, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();
  const settings = trpc.settings.get.useQuery(undefined, { enabled: Boolean(user?.role === "admin") });
  const leads = trpc.leads.list.useQuery(undefined, { enabled: Boolean(user?.role === "admin") });
  const updateWhatsapp = trpc.settings.updateWhatsapp.useMutation({
    onSuccess: async () => {
      await settings.refetch();
      toast.success("WhatsApp de destino atualizado.");
    },
    onError: () => toast.error("Não foi possível salvar o número."),
  });
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  useEffect(() => {
    if (settings.data?.whatsappNumber !== undefined) setWhatsappNumber(settings.data.whatsappNumber);
  }, [settings.data?.whatsappNumber]);

  const selectedLead = useMemo(() => leads.data?.find((lead) => lead.id === selectedLeadId), [leads.data, selectedLeadId]);

  if (loading) {
    return <main className="app-shell internal-shell"><div className="internal-state"><RefreshCw className="spin" size={22} /><span>Carregando acesso seguro...</span></div></main>;
  }

  if (!user) {
    return (
      <main className="app-shell internal-shell"><div className="internal-state auth-state"><ShieldCheck size={38} /><h1>Acesso interno</h1><p>Entre com a conta administradora para ajustar o diagnóstico e consultar os leads.</p><button className="primary-btn" onClick={() => startLogin()}><LogIn size={17} /> Entrar como administrador</button><button className="subtle-btn" onClick={() => setLocation("/")}><ArrowLeft size={14} /> Voltar para o diagnóstico</button></div></main>
    );
  }

  if (user.role !== "admin") {
    return (
      <main className="app-shell internal-shell"><div className="internal-state auth-state"><ShieldCheck size={38} /><h1>Acesso restrito</h1><p>Esta área está disponível somente para administradores do Diagnóstico 360.</p><button className="secondary-btn" onClick={() => logout()}>Sair</button></div></main>
    );
  }

  return (
    <main className="app-shell internal-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar internal-topbar"><Logo /><div className="internal-user"><span><ShieldCheck size={14} /> Área administrativa</span><button className="text-btn" onClick={() => logout()}>Sair</button></div></header>
      <section className="internal-wrap">
        <div className="internal-heading"><div><div className="eyebrow"><span className="eyebrow-dot success" /> Sistema interno</div><h1>Ajustes e <em>leads.</em></h1><p>Configure o destino do atendimento e acompanhe tudo o que cada pessoa respondeu no diagnóstico.</p></div><button className="secondary-btn" onClick={() => setLocation("/")}><ArrowLeft size={15} /> Ver diagnóstico público</button></div>
        <div className="internal-stats"><div className="internal-stat"><Database size={17} /><span>Leads salvos</span><strong>{leads.data?.length ?? 0}</strong></div><div className="internal-stat"><MessageCircle size={17} /><span>WhatsApp configurado</span><strong>{settings.data?.whatsappNumber ? "Sim" : "Pendente"}</strong></div><div className="internal-stat"><Users size={17} /><span>Acesso atual</span><strong>Administrador</strong></div></div>
        <div className="settings-card card-surface"><div className="settings-copy"><div className="icon-tile cyan"><MessageCircle size={19} /></div><div><span className="section-kicker">Configuração de atendimento</span><h2>WhatsApp que recebe os diagnósticos</h2><p>Use o DDI e o DDD, somente números. Ex.: <b>5541999999999</b>. O botão do resultado será direcionado para este número.</p></div></div><div className="settings-form"><input aria-label="Número de WhatsApp de destino" value={whatsappNumber} onChange={(event) => setWhatsappNumber(event.target.value)} placeholder="5541999999999" /><button className="primary-btn" disabled={updateWhatsapp.isPending} onClick={() => updateWhatsapp.mutate({ whatsappNumber })}>{updateWhatsapp.isPending ? <RefreshCw className="spin" size={16} /> : <Save size={16} />} {updateWhatsapp.isPending ? "Salvando" : "Salvar número"}</button></div></div>
        <div className="leads-heading"><div><span className="section-kicker"><Database size={15} /> Base interna</span><h2>Diagnósticos recebidos</h2></div><button className="subtle-btn" onClick={() => leads.refetch()}><RefreshCw size={14} /> Atualizar lista</button></div>
        {leads.isLoading && <div className="empty-panel"><RefreshCw className="spin" size={19} /> Carregando leads...</div>}
        {!leads.isLoading && !leads.data?.length && <div className="empty-panel"><Database size={21} /><div><b>Ainda não há diagnósticos salvos.</b><p>Quando alguém concluir o fluxo público, o lead aparecerá aqui.</p></div></div>}
        {!!leads.data?.length && <div className="leads-list">{leads.data.map((lead) => { const isSelected = selectedLeadId === lead.id; return <article className={`lead-card ${isSelected ? "expanded" : ""}`} key={lead.id}><button className="lead-summary" onClick={() => setSelectedLeadId(isSelected ? null : lead.id)}><div className="lead-avatar">{lead.name.slice(0, 1).toUpperCase()}</div><div className="lead-main"><strong>{lead.name}</strong><span>{lead.company}{lead.segment ? ` · ${lead.segment}` : ""}</span></div><div className="lead-tags"><span className={`lead-tag ${lead.temperature?.toLowerCase()}`}>{lead.temperature || "Sem temperatura"}</span><span className="lead-tag">{lead.maturity ?? 0}% maturidade</span></div><div className="lead-date">{new Date(lead.createdAt).toLocaleString("pt-BR")}</div><ChevronDown className={`lead-chevron ${isSelected ? "open" : ""}`} size={17} /></button>{isSelected && <div className="lead-detail"><div className="lead-detail-head"><div><span className="section-kicker">Registro completo #{lead.id}</span><h2>{lead.name} · {lead.company}</h2></div><button aria-label="Fechar detalhes" className="close-btn" onClick={() => setSelectedLeadId(null)}><X size={17} /></button></div><div className="lead-detail-meta"><span>WhatsApp: <b>{lead.whatsapp}</b></span><span>E-mail: <b>{lead.email || "Não informado"}</b></span><span>Prioridade: <b>{lead.priority || "Não informada"}</b></span><span>Recomendação: <b>{lead.recommendation || "Não informada"}</b></span></div><div className="detail-grid"><DetailGroup title="Perfil e diagnóstico" entries={Object.entries({ Nome: lead.name, Empresa: lead.company, Segmento: lead.segment, Cargo: lead.role, Objetivo: lead.objective, Desafio: lead.challenge, Maturidade: `${lead.maturity ?? 0}% — ${lead.level ?? ""}`, Temperatura: lead.temperature, Prioridade: lead.priority })} /><DetailGroup title="Todas as respostas" entries={Object.entries(parseJson(lead.answersJson)).map(([key, value]) => [key, value])} /><DetailGroup title="Leitura gerada" entries={Object.entries(parseJson(lead.diagnosisJson)).map(([key, value]) => [key, value])} /></div></div>}</article>; })}</div>}
      </section>
      <footer className="landing-footer internal-footer"><span>Diagnóstico 360 · sistema interno</span><span>Dados armazenados com segurança no banco do projeto</span></footer>
    </main>
  );
}
