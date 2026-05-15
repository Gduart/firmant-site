"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import type { TrackingConfig } from "@/lib/tracking/config";

type ConsentChoice = {
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
  version: 1;
};

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: FbqFunction;
  queue?: unknown[];
  version?: string;
};

const STORAGE_KEY = "firmant-cookie-consent-v1";
const GOOGLE_SCRIPT_ID = "firmant-google-tag";
const META_SCRIPT_ID = "firmant-meta-pixel";

export function AnalyticsConsentManager() {
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [config, setConfig] = useState<TrackingConfig | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const isBannerOpen = !consent && !isPreferencesOpen;

  const fetchConfig = useCallback(async () => {
    if (config) {
      return config;
    }

    const response = await fetch("/api/tracking/config", {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!response.ok) {
      return null;
    }

    const nextConfig = await response.json() as TrackingConfig;
    setConfig(nextConfig);

    return nextConfig;
  }, [config]);

  const activateTracking = useCallback(async (choice: ConsentChoice) => {
    updateGoogleConsent(choice);

    if (!choice.analytics && !choice.marketing) {
      return;
    }

    const nextConfig = await fetchConfig();

    if (!nextConfig) {
      return;
    }

    if (choice.analytics || choice.marketing) {
      loadGoogleTags(nextConfig, choice);
    }

    if (choice.marketing) {
      loadMetaPixel(nextConfig.metaPixelId);
    }
  }, [fetchConfig]);

  const saveConsent = useCallback((analytics: boolean, marketing: boolean) => {
    const nextConsent: ConsentChoice = {
      analytics,
      marketing,
      decidedAt: new Date().toISOString(),
      version: 1,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConsent));
    setConsent(nextConsent);
    setAnalyticsEnabled(analytics);
    setMarketingEnabled(marketing);
    setIsPreferencesOpen(false);
  }, []);

  useEffect(() => {
    initializeGoogleConsent();
    const stored = readStoredConsent();

    queueMicrotask(() => {
      if (stored) {
        setConsent(stored);
        setAnalyticsEnabled(stored.analytics);
        setMarketingEnabled(stored.marketing);
      }

      setHasMounted(true);
    });
  }, []);

  useEffect(() => {
    if (consent) {
      queueMicrotask(() => {
        void activateTracking(consent);
      });
    }
  }, [activateTracking, consent]);

  useEffect(() => {
    if (!consent) {
      return;
    }

    trackPageView(config, consent);
  }, [config, consent, pathname]);

  return hasMounted ? (
    <>
      {(isBannerOpen || isPreferencesOpen) && (
        <section className="cookie-consent-banner" aria-label="Preferências de cookies">
          <div className="cookie-consent-panel">
            <div>
              <span>Privacidade</span>
              <h2>Cookies e mensuração</h2>
              <p>
                Usamos cookies essenciais para o site funcionar. Com sua permissão,
                também usamos métricas e pixels para entender campanhas, melhorar
                anúncios e medir conversões.
              </p>
              <Link href="/politica-privacidade">Política de Privacidade</Link>
            </div>

            {isPreferencesOpen && (
              <div className="cookie-preferences">
                <label>
                  <input type="checkbox" checked disabled />
                  <span>Essenciais</span>
                  <small>Necessários para navegação, segurança e funcionamento do site.</small>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                  />
                  <span>Analíticos</span>
                  <small>Google Analytics 4 para métricas agregadas de navegação.</small>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={marketingEnabled}
                    onChange={(event) => setMarketingEnabled(event.target.checked)}
                  />
                  <span>Marketing</span>
                  <small>Google Ads e Meta Pixel para tráfego pago e remarketing.</small>
                </label>
              </div>
            )}

            <div className="cookie-consent-actions">
              {isPreferencesOpen ? (
                <button
                  type="button"
                  className="cookie-consent-primary"
                  onClick={() => saveConsent(analyticsEnabled, marketingEnabled)}
                >
                  Salvar preferências
                </button>
              ) : (
                <button
                  type="button"
                  className="cookie-consent-primary"
                  onClick={() => saveConsent(true, true)}
                >
                  Aceitar todos
                </button>
              )}
              <button type="button" onClick={() => saveConsent(false, false)}>
                Recusar opcionais
              </button>
              <button type="button" onClick={() => setIsPreferencesOpen(true)}>
                Gerenciar
              </button>
            </div>
          </div>
        </section>
      )}

      {!isBannerOpen && !isPreferencesOpen && (
        <button
          type="button"
          className="cookie-settings-button"
          onClick={() => setIsPreferencesOpen(true)}
          aria-label="Gerenciar cookies"
        >
          Cookies
        </button>
      )}
    </>
  ) : null;
}

function readStoredConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as ConsentChoice : null;

    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function initializeGoogleConsent() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });
}

function updateGoogleConsent(choice: ConsentChoice) {
  initializeGoogleConsent();
  window.gtag?.("consent", "update", {
    ad_storage: choice.marketing ? "granted" : "denied",
    ad_user_data: choice.marketing ? "granted" : "denied",
    ad_personalization: choice.marketing ? "granted" : "denied",
    analytics_storage: choice.analytics ? "granted" : "denied",
  });
}

function loadGoogleTags(config: TrackingConfig, choice: ConsentChoice) {
  const googleTagId = choice.marketing && config.googleAdsId
    ? config.googleAdsId
    : config.gaMeasurementId;

  if (!googleTagId) {
    return;
  }

  ensureScript(
    GOOGLE_SCRIPT_ID,
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleTagId)}`,
    () => {
      window.gtag?.("js", new Date());

      if (choice.analytics && config.gaMeasurementId) {
        window.gtag?.("config", config.gaMeasurementId, { send_page_view: false });
      }

      if (choice.marketing && config.googleAdsId) {
        window.gtag?.("config", config.googleAdsId, { send_page_view: false });
      }
    },
  );
}

function loadMetaPixel(pixelId: string | null) {
  if (!pixelId) {
    return;
  }

  if (!window.fbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }

      fbq.queue?.push(args);
    }) as FbqFunction;

    window.fbq = fbq;
    window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
  }

  ensureScript(META_SCRIPT_ID, "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", pixelId);
}

function trackPageView(config: TrackingConfig | null, consent: ConsentChoice) {
  const pagePath = `${window.location.pathname}${window.location.search}`;

  if (consent.analytics && config?.gaMeasurementId && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      send_to: config.gaMeasurementId,
    });
  }

  if (consent.marketing && config?.googleAdsId && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      send_to: config.googleAdsId,
    });
  }

  if (consent.marketing && config?.metaPixelId && window.fbq) {
    window.fbq("track", "PageView");
  }
}

function ensureScript(id: string, src: string, onLoad?: () => void) {
  const current = document.getElementById(id) as HTMLScriptElement | null;

  if (current) {
    if (onLoad) {
      onLoad();
    }
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;

  if (onLoad) {
    script.addEventListener("load", onLoad, { once: true });
  }

  document.head.appendChild(script);
}
