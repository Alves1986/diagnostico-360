import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Clock3,
  Compass,
  Copy,
  Gauge,
  Layers3,
  Lightbulb,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "diagnostico-360-draft";

type Answers = {
  name: string;
  company: string;
  segment: string;
  role: string;
  whatsapp: string;
  email: string;
  objective: string;
  objectiveDetails: string;
  challenge: string;
  challengeCause: string;
  impact: string[];
  consequence: string;
  bottleneck: string;
  bottleneckDetails: string;
  clientImprovement: string;
  clientComplaint: string;
  futureVision: string;
  futureObstacle: string;
  vulnerability: string;
  experiment: string;
  experimentBarrier: string;
  support: string;
  urgency: string;
  decisionMakers: string;
  previousAttempts: string;
};

type Step = {
  id: keyof Answers | "profile" | "impact" | "client" | "future" | "experiment" | "final";
  eyebrow: string;
  title: string;
  description?: string;
};

type Diagnosis = {
  maturity: number;
  level: string;
  temperature: string;
  priority: string;
  segment: string;
  secondarySegment: string;
  solution: string;
  summary: string;
  consequence: string;
  direction: string;
  approach: string;
};

const initialAnswers: Answers = {
  name: "",
  company: "",
  segment: "",
  role: "",
  whatsapp: "",
  email: "",
  objective: "",
  objectiveDetails: "",
  challenge: "",
  challengeCause: "",
  impact: [],
  consequence: "",
  bottleneck: "",
  bottleneckDetails: "",
  clientImprovement: "",
  clientComplaint: "",
  futureVision: "",
  futureObstacle: "",
  vulnerability: "",
  experiment: "",
  experimentBarrier: "",
  support: "",
  urgency: "",
  decisionMakers: "",
  previousAttempts: "",
};

const steps: Step[] = [
  {
    id: "profile",
    eyebrow: "Antes de começar",
    title: "Vamos contextualizar o seu negócio",
    description: "Esses dados personalizam a leitura final. Leva menos de 5 minutos e você pode voltar a qualquer momento.",
  },
  {
    id: "objective",
    eyebrow: "01 / Clareza",
    title: "Qual é o resultado mais importante que você deseja alcançar nos próximos 12 meses?",
    description: "Escolha a prioridade que mais representa o momento atual. Depois, conte um pouco mais sobre ela.",
  },
  {
    id: "challenge",
    eyebrow: "02 / Diagnóstico",
    title: "Qual é o maior desafio que está impedindo você de avançar?",
    description: "A resposta mais honesta é a mais útil. Não existe resposta certa aqui.",
  },
  {
    id: "impact",
    eyebrow: "03 / Consequência",
    title: "O que esse problema está causando atualmente no seu negócio?",
    description: "Selecione tudo o que fizer sentido. Nomear o impacto transforma uma sensação em prioridade.",
  },
  {
    id: "bottleneck",
    eyebrow: "04 / Operação",
    title: "Qual processo ou atividade hoje deixa seu trabalho mais lento?",
    description: "Vamos localizar o ponto em que esforço, tempo ou oportunidades estão sendo desperdiçados.",
  },
  {
    id: "client",
    eyebrow: "05 / Cliente",
    title: "O que sua empresa poderia melhorar para fazer uma diferença maior para seus clientes?",
    description: "Crescimento sustentável começa pelo valor que o cliente percebe.",
  },
  {
    id: "future",
    eyebrow: "06 / Visão",
    title: "Imagine que estamos três anos no futuro. Como seria o sucesso da sua empresa?",
    description: "Descreva o cenário desejado e o obstáculo que ainda separa você dele.",
  },
  {
    id: "vulnerability",
    eyebrow: "07 / Mercado",
    title: "Se seus concorrentes analisassem sua empresa, qual seria a principal vulnerabilidade?",
    description: "Reconhecer um ponto frágil é o primeiro passo para transformá-lo em vantagem.",
  },
  {
    id: "experiment",
    eyebrow: "08 / Oportunidade",
    title: "O que você sempre quis testar no seu negócio, mas ainda não teve oportunidade?",
    description: "Pode ser uma ideia, uma ferramenta, um novo canal ou uma mudança de processo.",
  },
  {
    id: "support",
    eyebrow: "09 / Apoio",
    title: "Se alguém pudesse facilitar uma parte do seu trabalho hoje, qual ajuda teria mais valor?",
    description: "Sua resposta ajuda a entender qual próximo passo seria realmente útil para você.",
  },
  {
    id: "final",
    eyebrow: "10 / Momento",
    title: "Qual é o momento certo para transformar essa clareza em ação?",
    description: "Essas últimas respostas ajudam a calibrar a urgência e a recomendação.",
  },
];

const objectiveOptions = [
  "Aumentar as vendas",
  "Atrair mais clientes",
  "Melhorar o marketing",
  "Organizar a operação",
  "Automatizar processos",
  "Melhorar o atendimento",
  "Criar ou melhorar minha presença digital",
  "Escalar o negócio",
  "Outro",
];

const challengeOptions = [
  "Não consigo atrair clientes suficientes",
  "Recebo contatos, mas não converto",
  "Tenho dificuldade para divulgar meu negócio",
  "Minha operação é muito manual",
  "Falta organização e processos",
  "Não tenho clareza sobre o que priorizar",
  "Não consigo acompanhar os resultados",
  "Tenho dificuldade para criar uma solução digital",
  "Falta tempo ou equipe",
  "Outro",
];

const impactOptions = [
  "Perda de vendas",
  "Perda de tempo",
  "Retrabalho",
  "Clientes desistindo",
  "Equipe sobrecarregada",
  "Falta de previsibilidade",
  "Dificuldade para crescer",
  "Dependência excessiva do proprietário",
  "Perda de oportunidades",
  "Queda na qualidade do atendimento",
];

const bottleneckOptions = [
  "Atendimento ao cliente",
  "Orçamentos e propostas",
  "Vendas e follow-up",
  "Marketing e conteúdo",
  "Agendamento",
  "Gestão de pedidos",
  "Controle financeiro",
  "Organização interna",
  "Relatórios e indicadores",
  "Outro",
];

const improvementOptions = [
  "Responder mais rápido",
  "Oferecer uma experiência mais profissional",
  "Facilitar a compra",
  "Personalizar o atendimento",
  "Entregar mais qualidade",
  "Criar novos serviços",
  "Resolver problemas com mais agilidade",
  "Melhorar a comunicação",
  "Oferecer mais conveniência",
];

const vulnerabilityOptions = [
  "Marca pouco conhecida",
  "Pouca presença digital",
  "Atendimento lento",
  "Falta de diferenciação",
  "Preço pouco competitivo",
  "Processos desorganizados",
  "Comunicação fraca",
  "Baixa capacidade de atendimento",
  "Dependência de indicação",
  "Não sei responder",
];

const supportOptions = [
  "Atrair mais clientes",
  "Melhorar minhas vendas",
  "Organizar minha operação",
  "Criar uma presença digital",
  "Automatizar tarefas",
  "Criar um sistema ou plataforma",
  "Melhorar meu atendimento",
  "Entender o que priorizar",
  "Transformar uma ideia em projeto",
];

const urgencyOptions = [
  { value: "agora", label: "Preciso resolver agora" },
  { value: "30-dias", label: "Quero resolver nos próximos 30 dias" },
  { value: "3-meses", label: "Quero resolver nos próximos 3 meses" },
  { value: "avaliando", label: "Ainda estou avaliando" },
  { value: "sem-prazo", label: "Não tenho prazo definido" },
];

const decisionOptions = ["Somente eu", "Sócios", "Diretor ou gestor", "Equipe comercial", "Equipe operacional", "Ainda não sei"];
const attemptOptions = ["Sim, e não funcionou", "Sim, mas ficou incompleto", "Estou tentando atualmente", "Ainda não tentei", "Não sei por onde começar"];

function lower(value: string) {
  return value.toLocaleLowerCase("pt-BR");
}

function calculateDiagnosis(a: Answers): Diagnosis {
  const clarity = (a.objective ? 3 : 0) + (a.objectiveDetails.trim() ? 2 : 0);
  const pain = (a.challenge ? 2 : 0) + (a.challengeCause.trim() ? 1 : 0) + (a.impact.length ? 1 : 0) + (a.consequence.trim() ? 1 : 0);
  const structure = (a.bottleneck ? 2 : 0) + (a.bottleneckDetails.trim() ? 2 : 0) + (a.clientImprovement ? 1 : 0);
  const urgencyMap: Record<string, number> = { agora: 5, "30-dias": 4, "3-meses": 3, avaliando: 1, "sem-prazo": 0 };
  const urgency = urgencyMap[a.urgency] ?? 0;
  const capacityMap: Record<string, number> = { "Somente eu": 5, Sócios: 3, "Diretor ou gestor": 3, "Equipe comercial": 2, "Equipe operacional": 2, "Ainda não sei": 1 };
  const capacity = Math.min(5, (capacityMap[a.decisionMakers] ?? 1) + (a.previousAttempts && !a.previousAttempts.includes("Ainda") && !a.previousAttempts.includes("Não sei") ? 1 : 0));
  const maturity = Math.max(4, Math.min(100, Math.round(((clarity + pain + structure + urgency + capacity) / 25) * 100)));
  const level = maturity <= 20 ? "Inicial" : maturity <= 40 ? "Emergente" : maturity <= 60 ? "Intermediário" : maturity <= 80 ? "Avançado" : "Estruturado";

  const all = lower([a.challenge, a.bottleneck, a.experiment, a.objective, a.support, a.vulnerability].join(" "));
  let segment = "Estratégia e Posicionamento";
  let solution = "Diagnóstico estratégico + definição de prioridades + proposta de valor.";
  if (all.includes("converter") || all.includes("follow-up") || all.includes("vendas") || all.includes("crm") || all.includes("comercial")) {
    segment = "Processo Comercial";
    solution = "Processo de follow-up + CRM simples + automação de atendimento.";
  } else if (all.includes("atrair") || all.includes("divulgar") || all.includes("presença digital") || all.includes("site") || all.includes("anúncio")) {
    segment = "Captação de Leads";
    solution = "Landing page de captação + estrutura de campanhas + acompanhamento de oportunidades.";
  } else if (all.includes("manual") || all.includes("automatizar") || all.includes("retrabalho") || all.includes("sistema")) {
    segment = "Automação Operacional";
    solution = "Automação de processos + integrações entre ferramentas + sistema interno enxuto.";
  } else if (all.includes("atendimento") || all.includes("responder") || all.includes("comunicação") || all.includes("cliente")) {
    segment = "Experiência do Cliente";
    solution = "Melhoria do atendimento + respostas mais rápidas + processo de onboarding.";
  } else if (all.includes("escalar") || all.includes("crescer") || all.includes("equipe maior")) {
    segment = "Escala e Crescimento";
    solution = "Processos escaláveis + captação contínua + estrutura de marketing.";
  }

  const secondarySegment = a.bottleneck === "Vendas e follow-up" ? "Processo Comercial" : a.bottleneck === "Marketing e conteúdo" ? "Presença Digital" : a.clientImprovement ? "Experiência do Cliente" : "Estratégia e Posicionamento";
  const highImpact = a.impact.some((item) => ["Perda de vendas", "Clientes desistindo", "Perda de oportunidades", "Dificuldade para crescer"].includes(item));
  const temperature = a.urgency === "agora" || a.urgency === "30-dias" || (highImpact && a.previousAttempts && !a.previousAttempts.includes("Ainda")) ? "Quente" : a.urgency === "3-meses" || a.impact.length > 0 ? "Morno" : "Frio";
  const priority = highImpact || a.urgency === "agora" || a.urgency === "30-dias" ? "Alta" : a.impact.length > 0 || a.challenge ? "Média" : "Baixa";
  const challenge = a.challenge || "um desafio ainda não definido";
  const bottleneck = a.bottleneck || "um processo que merece ser mapeado";
  const impact = a.impact.length ? a.impact.slice(0, 2).join(" e ") : "perda de energia e falta de previsibilidade";
  const summary = `Seu principal desafio parece estar em ${lower(challenge)}. Esse ponto se conecta a ${lower(bottleneck)} e hoje pode estar gerando ${lower(impact)}.`;
  const consequence = a.consequence.trim() || "Sem uma mudança clara, esse gargalo tende a continuar consumindo tempo e limitando o próximo nível de crescimento.";
  const direction = `O próximo passo é transformar essa clareza em uma estrutura de ${lower(segment)}. Vale investigar como o processo funciona hoje, onde as oportunidades se perdem e qual intervenção teria maior impacto com o menor esforço inicial.`;
  const approach = `Perguntar como ${lower(bottleneck)} funciona atualmente, qual volume passa por esse ponto e o que precisaria acontecer para ${lower(a.objective || "o objetivo principal")}.`;

  return { maturity, level, temperature, priority, segment, secondarySegment, solution, summary, consequence, direction, approach };
}

function getFieldValue(a: Answers, id: string) {
  return (a as unknown as Record<string, unknown>)[id] as string;
}

function Logo() {
  return (
    <div className="brand-mark" aria-label="Diagnóstico 360">
      <span className="brand-bars"><i /><i /><i /></span>
      <span><strong>Diagnóstico 360</strong><small>Diagnóstico Comercial</small></span>
    </div>
  );
}

function OptionGrid({ options, value, multiple = false, onChange }: { options: string[]; value: string | string[]; multiple?: boolean; onChange: (next: string | string[]) => void }) {
  return (
    <div className="option-grid">
      {options.map((option) => {
        const selected = multiple ? (value as string[]).includes(option) : value === option;
        return (
          <button
            key={option}
            type="button"
            className={`option-card ${selected ? "selected" : ""}`}
            onClick={() => {
              if (multiple) {
                const current = value as string[];
                onChange(selected ? current.filter((item) => item !== option) : [...current, option]);
              } else {
                onChange(option);
              }
            }}
            aria-pressed={selected}
          >
            <span className={`option-icon ${selected ? "active" : ""}`}>{selected ? <Check size={16} /> : <span />}</span>
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, required = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean; type?: string }) {
  return (
    <label className="field-label">
      <span>{label}{required && <b> *</b>}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) {
  return (
    <label className="field-label">
      <span>{label}{required && <b> *</b>}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} rows={4} />
    </label>
  );
}

function Home() {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...initialAnswers, ...JSON.parse(saved) } : initialAnswers;
    } catch {
      return initialAnswers;
    }
  });
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const diagnosis = useMemo(() => calculateDiagnosis(answers), [answers]);
  const step = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  const update = (key: keyof Answers, value: string | string[]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const validateStep = () => {
    if (step.id === "profile") return answers.name.trim() && answers.company.trim() && answers.whatsapp.trim();
    if (step.id === "objective") return answers.objective;
    if (step.id === "challenge") return answers.challenge;
    if (step.id === "impact") return answers.impact.length > 0;
    if (step.id === "bottleneck") return answers.bottleneck;
    if (step.id === "client") return answers.clientImprovement;
    if (step.id === "future") return answers.futureVision.trim() && answers.futureObstacle.trim();
    if (step.id === "vulnerability") return answers.vulnerability;
    if (step.id === "experiment") return answers.experiment.trim();
    if (step.id === "support") return answers.support;
    if (step.id === "final") return answers.urgency && answers.decisionMakers;
    return true;
  };

  const next = () => {
    if (!validateStep()) {
      setError("Preencha a resposta principal para continuar.");
      return;
    }
    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setResult(diagnosis);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const reset = () => {
    setAnswers(initialAnswers);
    setStepIndex(0);
    setResult(null);
    setStarted(false);
    setError("");
    localStorage.removeItem(STORAGE_KEY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const whatsAppMessage = `Olá! Fiz o diagnóstico do Diagnóstico 360. Meu principal objetivo é ${answers.objective || "entender meu próximo passo"}. Hoje, meu maior desafio está em ${answers.challenge || "organizar minhas prioridades"}. Quero conversar sobre uma direção mais específica para o meu caso.`;

  const copyInternal = async () => {
    const internal = `NOVO DIAGNÓSTICO COMERCIAL\n\nLead: ${answers.name} — ${answers.company}\nSegmento: ${answers.segment}\nCargo: ${answers.role}\nWhatsApp: ${answers.whatsapp}\n\nObjetivo: ${answers.objective}\nDesafio: ${answers.challenge}\nCausa percebida: ${answers.challengeCause}\nImpacto: ${answers.impact.join(", ")}\nSe nada mudar: ${answers.consequence}\nGargalo: ${answers.bottleneck}\nImpacto no cliente: ${answers.clientComplaint}\nVisão de futuro: ${answers.futureVision}\nObstáculo futuro: ${answers.futureObstacle}\nVulnerabilidade: ${answers.vulnerability}\nO que gostaria de testar: ${answers.experiment}\nAjuda desejada: ${answers.support}\nUrgência: ${urgencyOptions.find((item) => item.value === answers.urgency)?.label}\nEnvolvidos: ${answers.decisionMakers}\nTentativas anteriores: ${answers.previousAttempts}\n\nMaturidade: ${diagnosis.maturity}% — ${diagnosis.level}\nSegmento recomendado: ${diagnosis.segment} + ${diagnosis.secondarySegment}\nTemperatura: ${diagnosis.temperature}\nPrioridade: ${diagnosis.priority}\nSolução inicial: ${diagnosis.solution}`;
    await navigator.clipboard.writeText(internal);
    setCopied(true);
    toast.success("Resumo interno copiado");
    window.setTimeout(() => setCopied(false), 2200);
  };

  if (!started) {
    return (
      <main className="app-shell landing-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <header className="topbar"><Logo /><span className="topbar-note"><Sparkles size={14} /> Diagnóstico gratuito</span></header>
        <section className="landing-grid">
          <div className="landing-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Clareza sobre o próximo passo</div>
            <h1>O que está impedindo seu negócio de <em>avançar?</em></h1>
            <p className="lead-copy">Responda algumas perguntas sobre sua empresa e receba uma visão inicial dos seus principais gargalos, prioridades e oportunidades.</p>
            <div className="landing-actions">
              <button className="primary-btn large" onClick={() => { setStarted(true); window.scrollTo({ top: 0 }); }}><span>Começar meu diagnóstico</span><ArrowRight size={19} /></button>
              <span className="micro-copy"><Clock3 size={15} /> Leva aproximadamente 3–5 minutos</span>
            </div>
            <div className="trust-row"><span><CheckCircle2 size={17} /> Gratuito</span><span><CheckCircle2 size={17} /> Feito para o seu momento</span><span><CheckCircle2 size={17} /> Resultado imediato</span></div>
          </div>
          <div className="landing-visual">
            <div className="visual-grid" />
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="insight-card insight-main"><div className="card-topline"><span className="tiny-label">SUA LEITURA INICIAL</span><span className="live-dot" /></div><div className="score-preview"><strong>01</strong><span>diagnóstico<br />personalizado</span></div><div className="mini-bars"><i /><i /><i /><i /></div><p>Clareza transforma intenção em movimento.</p></div>
            <div className="insight-card insight-float"><Target size={18} /><span>Mapeie seu<br /><b>gargalo central</b></span></div>
            <div className="visual-caption"><span>01</span><span>Objetivo</span><span>02</span><span>Dor</span><span>03</span><span>Direção</span></div>
          </div>
        </section>
        <footer className="landing-footer"><span>Um diagnóstico inicial para decisões mais claras.</span><span>© Diagnóstico 360</span></footer>
      </main>
    );
  }

  if (result) {
    return (
      <main className="app-shell result-shell">
        <div className="ambient ambient-one" /><div className="ambient ambient-two" />
        <header className="topbar result-topbar"><Logo /><button className="text-btn" onClick={reset}><RotateCcw size={15} /> Refazer diagnóstico</button></header>
        <section className="result-wrap">
          <div className="result-intro"><div className="eyebrow"><span className="eyebrow-dot success" /> Diagnóstico concluído</div><h1>Seu próximo passo começa com <em>clareza.</em></h1><p>Olá, {answers.name.split(" ")[0] || "empreendedor"}. Esta é uma leitura inicial baseada no que você compartilhou sobre a {answers.company || "sua empresa"}.</p></div>
          <div className="result-grid">
            <div className="score-panel card-surface"><div className="section-kicker"><Gauge size={16} /> Maturidade do negócio</div><div className="score-ring" style={{ "--score": `${diagnosis.maturity * 3.6}deg` } as React.CSSProperties}><div><strong>{diagnosis.maturity}%</strong><span>{diagnosis.level}</span></div></div><p className="score-note">Você já tem sinais importantes de consciência sobre o negócio. O foco agora é transformar essa clareza em estrutura.</p><div className="score-legend"><span><i className="legend-blue" /> Clareza</span><span><i className="legend-cyan" /> Ação</span><span><i className="legend-muted" /> Estrutura</span></div></div>
            <div className="result-main">
              <div className="stat-strip"><div><span>Temperatura</span><strong className={`temperature ${lower(diagnosis.temperature)}`}>{diagnosis.temperature}</strong></div><div><span>Prioridade</span><strong>{diagnosis.priority}</strong></div><div><span>Segmento recomendado</span><strong>{diagnosis.segment}</strong></div></div>
              <div className="reading-card card-surface"><div className="reading-heading"><div className="icon-tile"><Compass size={19} /></div><div><span className="section-kicker">Sua leitura inicial</span><h2>O que parece estar acontecendo</h2></div></div><p>{diagnosis.summary}</p><div className="consequence-box"><div className="consequence-icon"><Zap size={17} /></div><div><span>Se nada mudar</span><p>{diagnosis.consequence}</p></div></div></div>
              <div className="direction-card"><div className="direction-heading"><div className="icon-tile cyan"><TrendingUp size={19} /></div><div><span className="section-kicker">Direção recomendada</span><h2>Onde investigar primeiro</h2></div></div><p>{diagnosis.direction}</p><div className="solution-line"><Lightbulb size={17} /><span><b>Solução inicial a investigar:</b> {diagnosis.solution}</span></div></div>
            </div>
          </div>
          <div className="result-lower-grid"><div className="next-step-card card-surface"><div className="section-kicker"><MessageCircle size={16} /> Próximo passo</div><h2>Quer entender como isso se aplica ao seu caso?</h2><p>Este diagnóstico é um ponto de partida. Uma conversa rápida ajuda a mapear o processo atual e escolher a intervenção com mais impacto.</p><button className="primary-btn" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(whatsAppMessage)}`, "_blank")}><MessageCircle size={18} /> Quero conversar pelo WhatsApp</button><small>Mensagem pronta para você revisar antes de enviar.</small></div><div className="internal-card card-surface"><div className="section-kicker"><Clipboard size={16} /> Para sua análise</div><h3>Resumo comercial pronto</h3><p>Copie as respostas, a classificação e a recomendação para continuar o atendimento no seu CRM ou WhatsApp.</p><button className="secondary-btn" onClick={copyInternal}>{copied ? <Check size={17} /> : <Copy size={17} />} {copied ? "Copiado" : "Copiar resumo interno"}</button><div className="quick-read"><span><Users size={15} /> {answers.decisionMakers || "Decisor não informado"}</span><span><Clock3 size={15} /> {urgencyOptions.find((item) => item.value === answers.urgency)?.label || "Prazo não informado"}</span></div></div></div>
          <div className="approach-note"><span className="note-number">02</span><div><b>Sugestão para a próxima conversa</b><p>{diagnosis.approach}</p></div><ChevronRight size={18} /></div>
        </section>
        <footer className="landing-footer result-footer"><span>Diagnóstico 360 · diagnóstico inicial</span><button className="subtle-btn" onClick={reset}>Começar novamente <ArrowRight size={14} /></button></footer>
      </main>
    );
  }

  return (
    <main className="app-shell flow-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar flow-topbar"><Logo /><div className="flow-meta"><span>Diagnóstico gratuito</span><button aria-label="Sair do diagnóstico" className="close-btn" onClick={() => setStarted(false)}><X size={18} /></button></div></header>
      <section className="flow-wrap">
        <div className="progress-head"><div><span className="section-kicker">Seu mapa de clareza</span><strong>Etapa {stepIndex + 1} <small>de {steps.length}</small></strong></div><span className="progress-percent">{progress}%</span></div>
        <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        <div className="flow-grid"><aside className="flow-aside"><div className="aside-number">{String(stepIndex + 1).padStart(2, "0")}</div><span className="aside-label">{step.eyebrow.split(" / ")[1] || "Contexto"}</span><div className="aside-line" /><p>Quanto mais específico você for, mais útil será a leitura final.</p><div className="aside-footer"><Sparkles size={16} /> Suas respostas ficam neste dispositivo.</div></aside>
          <div className="question-panel"><div className="question-heading"><span className="eyebrow"><span className="eyebrow-dot" /> {step.eyebrow}</span><h1>{step.title}</h1><p>{step.description}</p></div>
            {step.id === "profile" && <div className="form-grid"><TextField label="Seu nome" value={answers.name} onChange={(v) => update("name", v)} placeholder="Como podemos chamar você?" required /><TextField label="Nome da empresa" value={answers.company} onChange={(v) => update("company", v)} placeholder="Ex.: Studio Forma" required /><TextField label="WhatsApp" value={answers.whatsapp} onChange={(v) => update("whatsapp", v)} placeholder="(00) 00000-0000" required type="tel" /><TextField label="E-mail" value={answers.email} onChange={(v) => update("email", v)} placeholder="voce@empresa.com" type="email" /><TextField label="Segmento do negócio" value={answers.segment} onChange={(v) => update("segment", v)} placeholder="Ex.: Saúde, varejo, serviços..." /><TextField label="Cargo ou função" value={answers.role} onChange={(v) => update("role", v)} placeholder="Ex.: Sócio, diretora, gerente..." /></div>}
            {step.id === "objective" && <><OptionGrid options={objectiveOptions} value={answers.objective} onChange={(v) => update("objective", v as string)} /><TextArea label="Explique brevemente esse objetivo" value={answers.objectiveDetails} onChange={(v) => update("objectiveDetails", v)} placeholder="O que você gostaria de ver diferente daqui a 12 meses?" /></>}
            {step.id === "challenge" && <><OptionGrid options={challengeOptions} value={answers.challenge} onChange={(v) => update("challenge", v as string)} /><TextArea label="O que você acredita que está causando esse problema?" value={answers.challengeCause} onChange={(v) => update("challengeCause", v)} placeholder="Conte o que você já percebeu na prática..." /></>}
            {step.id === "impact" && <><OptionGrid options={impactOptions} value={answers.impact} multiple onChange={(v) => update("impact", v)} /><TextArea label="Se nada mudar nos próximos 12 meses, o que pode acontecer?" value={answers.consequence} onChange={(v) => update("consequence", v)} placeholder="Imagine a consequência mais provável..." /></>}
            {step.id === "bottleneck" && <><OptionGrid options={bottleneckOptions} value={answers.bottleneck} onChange={(v) => update("bottleneck", v as string)} /><TextArea label="Como esse processo funciona hoje?" value={answers.bottleneckDetails} onChange={(v) => update("bottleneckDetails", v)} placeholder="Descreva o caminho atual, mesmo que seja informal..." /></>}
            {step.id === "client" && <><OptionGrid options={improvementOptions} value={answers.clientImprovement} onChange={(v) => update("clientImprovement", v as string)} /><TextArea label="Qual é a principal reclamação, dificuldade ou expectativa dos seus clientes?" value={answers.clientComplaint} onChange={(v) => update("clientComplaint", v)} placeholder="O que seus clientes mais pedem, questionam ou esperam?" /></>}
            {step.id === "future" && <><TextArea label="Como seria o sucesso da sua empresa?" value={answers.futureVision} onChange={(v) => update("futureVision", v)} placeholder="Imagine sua operação, clientes, equipe e rotina no melhor cenário..." required /><TextArea label="Qual é o maior obstáculo entre sua situação atual e esse futuro?" value={answers.futureObstacle} onChange={(v) => update("futureObstacle", v)} placeholder="O que ainda precisaria mudar para chegar lá?" required /></>}
            {step.id === "vulnerability" && <OptionGrid options={vulnerabilityOptions} value={answers.vulnerability} onChange={(v) => update("vulnerability", v as string)} />}
            {step.id === "experiment" && <><TextArea label="O que você gostaria de testar?" value={answers.experiment} onChange={(v) => update("experiment", v)} placeholder="Ex.: criar um site, investir em anúncios, automatizar o atendimento..." required /><TextArea label="O que impediu você de fazer isso até agora?" value={answers.experimentBarrier} onChange={(v) => update("experimentBarrier", v)} placeholder="Tempo, equipe, investimento, conhecimento ou prioridade?" /></>}
            {step.id === "support" && <OptionGrid options={supportOptions} value={answers.support} onChange={(v) => update("support", v as string)} />}
            {step.id === "final" && <><div className="final-section"><span className="field-label"><span>Qual é o nível de urgência para resolver esse problema? <b>*</b></span></span><OptionGrid options={urgencyOptions.map((item) => item.label)} value={urgencyOptions.find((item) => item.value === answers.urgency)?.label || ""} onChange={(v) => update("urgency", urgencyOptions.find((item) => item.label === v)?.value || "")} /></div><div className="final-section"><span className="field-label"><span>Além de você, quem participa dessa decisão? <b>*</b></span></span><OptionGrid options={decisionOptions} value={answers.decisionMakers} onChange={(v) => update("decisionMakers", v as string)} /></div><div className="final-section"><span className="field-label"><span>Você já tentou resolver esse problema antes?</span></span><OptionGrid options={attemptOptions} value={answers.previousAttempts} onChange={(v) => update("previousAttempts", v as string)} /></div></>}
            {error && <div className="form-error" role="alert"><Zap size={15} /> {error}</div>}
            <div className="question-footer"><button className="back-btn" onClick={() => stepIndex === 0 ? setStarted(false) : setStepIndex((current) => current - 1)}><ArrowLeft size={17} /> Voltar</button><button className="primary-btn" onClick={next}>{stepIndex === steps.length - 1 ? <><span>Ver meu diagnóstico</span><Sparkles size={17} /></> : <><span>Continuar</span><ArrowRight size={17} /></>}</button></div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
