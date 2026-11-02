import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Layers3, PanelsTopLeft, Workflow } from "lucide-react";
import { developmentServices } from "@/lib/development-services";
import { DevelopmentReveal } from "@/components/DevelopmentReveal";
import styles from "@/components/Development.module.css";

export const metadata: Metadata = {
  title: "Automação, IA e sistemas web sob medida | FIRMANT",
  description: "Automação de processos, agente de IA no Telegram, sistemas web e landing page com Mini CRM. Conheça os serviços e envie o briefing do seu projeto.",
  alternates: { canonical: "https://firmant.com.br/desenvolvimento" },
};
const icons = [Workflow, Bot, PanelsTopLeft, Layers3];
const scope = [
  { title: "Objetivo e escopo", text: "O problema a resolver, os processos envolvidos e as funcionalidades que fazem sentido para sua empresa." },
  { title: "Integrações e volume", text: "As ferramentas, os usuários e o volume de atendimentos ou operações que a solução precisa suportar." },
  { title: "Etapas e prazo", text: "As prioridades, a primeira entrega e os ciclos de validação do projeto com você." },
  { title: "Implantação e continuidade", text: "Configuração, treinamento, hospedagem, custos de plataformas e suporte previstos na proposta." },
];
export default function DesenvolvimentoPage() {
  return <div className={styles.page}>
    <section className={styles.hero}><div className={styles.container}><DevelopmentReveal>
      <span className={styles.eyebrow}>Desenvolvimento Web · Soluções para negócios</span>
      <h1>Menos tarefas manuais.<br /><span>Mais controle para crescer.</span></h1>
      <p>Automações, assistentes com IA e sistemas web desenvolvidos para o atendimento e a operação da sua empresa.</p>
    </DevelopmentReveal></div></section>
    <section className={styles.section} id="servicos"><div className={styles.container}>
      <DevelopmentReveal><span className={styles.eyebrow}>Escolha o que sua empresa precisa</span><h2>Tecnologia com uma função clara no seu negócio.</h2><p className={styles.intro}>Quatro serviços, cada um com recursos, exemplos de aplicação e um briefing próprio. Conheça a solução antes de solicitar sua proposta.</p></DevelopmentReveal>
      <div className={styles.cards}>{developmentServices.map((service, index) => {
        const Icon = icons[index];
        return <DevelopmentReveal key={service.slug}><Link href={`/desenvolvimento/${service.slug}`} className={styles.card}>
          <div className={styles.cardTop}><Icon size={30} strokeWidth={1.4} aria-hidden="true" /><span>0{index + 1}</span></div>
          <h3>{service.title}</h3><p>{service.summary}</p>
          <ul className={styles.highlights}>{service.highlights.map(item => <li key={item}>{item}</li>)}</ul>
          <span className={styles.cardAction}>Ver serviço e preencher briefing <span aria-hidden="true">↗</span></span>
        </Link></DevelopmentReveal>;
      })}</div>
    </div></section>
    <section className={`${styles.section} ${styles.mutedSection}`}><div className={styles.container}><DevelopmentReveal>
      <span className={styles.eyebrow}>Proposta definida para o seu projeto</span><h2>Como definimos seu projeto.</h2>
      <p className={styles.intro}>A solução começa pela sua necessidade. O investimento e o prazo são definidos depois de entender o escopo, as integrações e a operação.</p>
      <ol className={styles.steps}>{scope.map((step, index) => <li key={step.title}><span>0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
      <p className={styles.closing}>Você recebe uma proposta com entregas, prazo, investimento e condições definidos após a análise do briefing. Para começar, escolha um dos serviços acima e conte o que precisa construir.</p>
    </DevelopmentReveal></div></section>
  </div>;
}
