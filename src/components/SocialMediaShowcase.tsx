"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./SocialMediaShowcase.module.css";

const base = "/images/redes-sociais/auria/";
const carousel = [
  { file: "carrossel-01.webp", title: "Um ambiente começa pela sensação.", alt: "Sala de jantar integrada à sala de estar, com madeira, travertino e luz natural.", description: "Abertura: uma mensagem que convida a continuar a leitura." },
  { file: "carrossel-02.webp", title: "Texturas que aproximam.", alt: "Detalhe de mesa de madeira, cerâmica e estofado claro em uma composição de interiores.", description: "Desenvolvimento: detalhes que sustentam a identidade da marca." },
  { file: "carrossel-03.webp", title: "Seu jeito de viver, em cada detalhe.", alt: "Canto de leitura com poltrona, mesa lateral e vegetação junto à janela.", description: "Fechamento: uma ideia que conecta o projeto ao modo de viver." },
];
const publication = {
  file: "publicacao.webp", title: "Espaços para viver com calma.",
  alt: "Sala de estar com sofá curvo, mesa de madeira e jardim tropical, criada para a marca fictícia AURIA.",
  description: "Publicação: uma mensagem clara e uma composição que apresenta a marca.",
};

export function SocialMediaShowcase() {
  const [format, setFormat] = useState<"publication" | "carousel">("publication");
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const current = format === "publication" ? publication : carousel[slide];

  function changeSlide(direction: number) {
    setSlide(index => (index + direction + carousel.length) % carousel.length);
  }

  return (
    <section id="conteudo-na-pratica" className={styles.section} aria-labelledby="showcase-title">
      <div className={styles.container}>
        <header className={styles.heading}>
          <span className={styles.eyebrow}>Conteúdo na prática</span>
          <h2 id="showcase-title">Sua marca com uma presença <span className="text-gradient">que faz sentido.</span></h2>
          <p>Conteúdos que conectam identidade visual, mensagem e objetivo — com consistência entre os formatos.</p>
        </header>

        <div className={styles.campaign}>
          <span className={styles.campaignName}>AURIA <span>Arquitetura e interiores</span></span>
          <span className={styles.demo}>Marca fictícia · Demonstração com IA</span>
        </div>

        <div className={styles.grid}>
          <div className={styles.imageColumn}>
            <div className={styles.formatControls} role="group" aria-label="Formato da imagem">
              <button type="button" aria-pressed={format === "publication"} onClick={() => setFormat("publication")}>Publicação</button>
              <button type="button" aria-pressed={format === "carousel"} onClick={() => setFormat("carousel")}>Carrossel · 3 páginas</button>
            </div>
            <figure>
              <div className={styles.imageFrame}>
                <Image src={base + current.file} alt={current.alt} width={1080} height={1350} sizes="(max-width: 900px) calc(100vw - 40px), 640px" unoptimized className={styles.image} />
                <div className={styles.artworkCopy}>
                  <span className={styles.wordmark}>AURIA</span>
                  <p>{current.title}</p>
                  <span className={styles.signature}>Arquitetura e interiores</span>
                </div>
                {format === "carousel" && <span className={styles.pageNumber} aria-hidden="true">0{slide + 1} / 03</span>}
              </div>
              <div className={styles.captionRow}>
                <figcaption aria-live="polite" aria-atomic="true">{format === "carousel" && <span className={styles.srOnly}>Página {slide + 1} de 3. </span>}{current.description}</figcaption>
                {format === "carousel" && (
                  <div className={styles.arrows} role="group" aria-label="Páginas do carrossel">
                    <button type="button" aria-label="Página anterior do carrossel" onClick={() => changeSlide(-1)}>←</button>
                    <button type="button" aria-label="Próxima página do carrossel" onClick={() => changeSlide(1)}>→</button>
                  </div>
                )}
              </div>
            </figure>
          </div>

          <div className={styles.videoColumn}>
            <div className={styles.videoLabel}><span>Vídeo curto</span><span>9:16 · 8 segundos</span></div>
            <figure>
              <div className={styles.videoFrame}>
                <video ref={videoRef} controls playsInline preload="none" poster={base + "video-capa-v2.webp"} width={1080} height={1920} aria-label="Vídeo demonstrativo da AURIA: ambiente de arquitetura e interiores" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setVideoError(true)}>
                  <source src="/videos/redes-sociais/auria/auria-apresentacao-v2.mp4" type="video/mp4" />
                  Seu navegador não reproduz este vídeo. <a href="/videos/redes-sociais/auria/auria-apresentacao-v2.mp4">Abrir o vídeo AURIA</a>.
                </video>
                {!playing && !videoError && <>
                  <div className={`${styles.artworkCopy} ${styles.videoCopy}`} aria-hidden="true"><span className={styles.wordmark}>AURIA</span><p>Espaços para viver com calma.</p><span className={styles.signature}>Arquitetura e interiores</span></div>
                  <button type="button" className={styles.playButton} aria-label="Reproduzir vídeo da AURIA" onClick={() => { void videoRef.current?.play().catch(() => setVideoError(true)); }}><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg></button>
                </>}
              </div>
              <figcaption className={styles.videoCaption}>Vídeo: movimento e atmosfera para traduzir a mesma identidade em outro formato.</figcaption>
              {videoError && <p role="alert" className={styles.error}>Não foi possível iniciar a reprodução. <a href="/videos/redes-sociais/auria/auria-apresentacao-v2.mp4">Abrir o vídeo diretamente</a>.</p>}
            </figure>
          </div>
        </div>

        <div className={styles.actions}>
          <a className={styles.primaryAction} href="https://wa.me/5511914912488?text=Ol%C3%A1%2C%20vi%20a%20demonstra%C3%A7%C3%A3o%20de%20redes%20sociais%20no%20site%20e%20quero%20uma%20proposta%20para%20minha%20marca." target="_blank" rel="noopener noreferrer">Quero uma proposta para minha marca <span aria-hidden="true">↗</span></a>
          <Link className={styles.secondaryAction} href="/monte-seu-pacote">Consultar opções e valores <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
