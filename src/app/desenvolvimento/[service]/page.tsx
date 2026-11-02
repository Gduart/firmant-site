import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { developmentServices, getDevelopmentService } from "@/lib/development-services";
import { ServiceBriefingForm } from "@/components/ServiceBriefingForm";
import { DevelopmentReveal } from "@/components/DevelopmentReveal";
import styles from "@/components/Development.module.css";

type Props = { params: Promise<{ service: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return developmentServices.map(service => ({ service: service.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getDevelopmentService((await params).service);
  if (!service) return {};
  return { title: `${service.title} | FIRMANT`, description: service.summary, alternates: { canonical: `https://firmant.com.br/desenvolvimento/${service.slug}` } };
}
export default async function ServicePage({ params }: Props) {
  const service = getDevelopmentService((await params).service);
  if (!service) notFound();
  return <div className={styles.page}>
    <section className={styles.hero}><div className={styles.container}>
      <Link className={styles.back} href="/desenvolvimento">← Todos os serviços de desenvolvimento</Link>
      <DevelopmentReveal><span className={styles.eyebrow}>{service.shortTitle}</span><h1>{service.title}</h1><p>{service.summary}</p></DevelopmentReveal>
    </div></section>
    <section className={styles.section}><div className={styles.container}>
      <div className={styles.article}><h2>Como esta solução ajuda sua empresa.</h2><p className={styles.outcome}>{service.outcome}</p>{service.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
      {service.tables.map(table => <section className={styles.tableGroup} key={table.title} aria-label={table.title}>
        <h3>{table.title}</h3>
        <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={`Tabela: ${table.title}`}>
          <table className={styles.table}><thead><tr>{table.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>
            {table.rows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={index} data-label={table.columns[index]}>{cell}</td>)}</tr>)}
          </tbody></table>
        </div>
      </section>)}
      <p className={styles.closing}>Os exemplos mostram possibilidades de aplicação. As funcionalidades, integrações e condições de operação serão definidas na sua proposta, conforme o projeto solicitado.</p>
      <ServiceBriefingForm slug={service.slug} title={service.title} fields={service.fields} />
    </div></section>
  </div>;
}
