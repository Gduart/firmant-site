export type ServiceItem = {
  id: string;
  label: string;
  price: number;
  unit: string;
  description: string;
  allowQty?: boolean;
};

export type Category = {
  id: string;
  number: string;
  title: string;
  tagline: string;
  color: string;
  services: ServiceItem[];
};

export type Selection = {
  categoryId: string;
  serviceId: string;
  qty: number;
};

export type ClientData = {
  name: string;
  cpf: string;
  email: string;
  whatsapp: string;
  instagram: string;
  empresa: string;
  address: string;
  addressNumber: string;
  complement: string;
  postalCode: string;
  province: string;
  obs: string;
};

export type ReadyPackage = {
  label: string;
  desc: string;
  cats: string[];
  items: Selection[];
};

export type SelectionWithService = {
  category: Category;
  service: ServiceItem;
  selection: Selection;
  total: number;
};

export type PackageBreakdown = {
  oneTimeTotal: number;
  recurringTotal: number;
  grandTotal: number;
  pixOneTimeTotal: number;
  hasOneTime: boolean;
  hasRecurring: boolean;
  oneTimeItems: SelectionWithService[];
  recurringItems: SelectionWithService[];
};

export const categories: Category[] = [
  {
    id: "social",
    number: "01",
    title: "Gestão de Redes Sociais",
    tagline: "Publicações completas — da copy à arte final, entregues com IA.",
    color: "#C9A84C",
    services: [
      { id: "s4", label: "4 publicações/mês", price: 397, unit: "mês", description: "R$ 99/post — ideal para começar" },
      { id: "s8", label: "8 publicações/mês", price: 697, unit: "mês", description: "R$ 87/post — mais presença, mais engajamento" },
      { id: "s12", label: "12 publicações/mês", price: 997, unit: "mês", description: "R$ 83/post — frequência profissional" },
      { id: "s16", label: "16 publicações/mês", price: 1297, unit: "mês", description: "R$ 81/post — ~18% de desconto" },
      { id: "s20", label: "20 publicações/mês", price: 1597, unit: "mês", description: "R$ 79/post — ~20% de desconto" },
      { id: "s24", label: "24+ publicações/mês", price: 1897, unit: "mês", description: "R$ 79/post — máximo alcance" },
    ],
  },
  {
    id: "video",
    number: "02",
    title: "Edição de Vídeo",
    tagline: "Reels, Stories e Shorts editados profissionalmente com IA.",
    color: "#22D3EE",
    services: [
      { id: "v8s", label: "Story 8s", price: 97, unit: "vídeo", description: "Stories curtos, cortes dinâmicos", allowQty: true },
      { id: "v16s", label: "Reel 16s", price: 149, unit: "vídeo", description: "Reels curtos para maior alcance", allowQty: true },
      { id: "v30s", label: "Reel 30s", price: 219, unit: "vídeo", description: "Reel padrão — formato mais engajado", allowQty: true },
      { id: "v1m", label: "Reel 1 min", price: 349, unit: "vídeo", description: "Reel longo, tutorial ou depoimento", allowQty: true },
      { id: "vs10", label: "Stories Pack — 10 vídeos 8s", price: 690, unit: "pacote", description: "Pacote fechado — R$ 69 cada" },
      { id: "vg8", label: "Growth Pack — 8 Reels 30s", price: 1352, unit: "pacote", description: "Pacote Growth — R$ 169 cada" },
    ],
  },
  {
    id: "ugc",
    number: "03",
    title: "Vídeo UGC com IA",
    tagline: "Avatar de IA falando sobre seu produto — sem câmera, sem ator.",
    color: "#A78BFA",
    services: [
      { id: "u8s", label: "UGC 8s", price: 129, unit: "vídeo", description: "Bumper ad — impacto rápido", allowQty: true },
      { id: "u16s", label: "UGC 16s", price: 197, unit: "vídeo", description: "Story / pre-roll", allowQty: true },
      { id: "u30s", label: "UGC 30s", price: 297, unit: "vídeo", description: "UGC padrão — maior conversão", allowQty: true },
      { id: "u1m", label: "UGC 1 min", price: 449, unit: "vídeo", description: "Review ou tutorial completo", allowQty: true },
      { id: "u_ads", label: "Direito anúncios +3 meses", price: 149, unit: "vídeo", description: "Add-on Meta/TikTok Ads — por vídeo", allowQty: true },
      { id: "u6pk", label: "Pack 6 UGC 30s", price: 1194, unit: "pacote", description: "~31% de desconto — R$ 199 cada" },
    ],
  },
  {
    id: "dev",
    number: "04",
    title: "Aplicações Web & Mobile",
    tagline: "Aplicações sob medida em Python — do MVP ao sistema completo.",
    color: "#34D399",
    services: [
      { id: "d_mvp", label: "Aplicação web sob medida — MVP", price: 7997, unit: "projeto", description: "Sistema web enxuto para validar operação, fluxo central e base de evolução — 15 a 30 dias" },
      { id: "d_system", label: "Sistema web com área logada", price: 12997, unit: "projeto", description: "Área restrita, níveis de acesso, gestão de dados e painéis operacionais — 20 a 45 dias" },
      { id: "d_app", label: "App mobile iOS + Android", price: 19997, unit: "projeto", description: "App sob medida com backend, interface mobile e estrutura para publicação — 45 a 90 dias" },
      { id: "d_platform", label: "Plataforma integrada com automações", price: 19997, unit: "projeto", description: "Backend, APIs, integrações, automações e arquitetura sob diagnóstico — valor inicial" },
      { id: "d_manut", label: "Manutenção e evolução contínua", price: 297, unit: "mês", description: "Atualizações, suporte, melhorias e acompanhamento contínuo" },
      { id: "d_consult", label: "Consultoria técnica", price: 197, unit: "hora", description: "Diagnóstico, arquitetura, orientação técnica ou revisão de escopo", allowQty: true },
    ],
  },
];

const tieredPricing: Record<string, Array<[number, number]>> = {
  v8s: [[1, 97], [2, 87], [4, 79], [8, 69]],
  v16s: [[1, 149], [2, 139], [4, 129], [8, 119]],
  v30s: [[1, 219], [2, 199], [4, 179], [8, 169]],
  v1m: [[1, 349], [2, 319], [4, 299]],
  u8s: [[1, 129], [2, 119], [4, 99], [5, 89]],
  u16s: [[1, 197], [2, 179], [4, 159], [8, 149]],
  u30s: [[1, 297], [2, 267], [4, 229], [6, 199]],
  u1m: [[1, 449], [2, 399], [4, 349]],
  u_ads: [[1, 149], [3, 129]],
};

export const recurringServiceIds = new Set(
  categories
    .flatMap((category) => category.services)
    .filter((service) => service.unit === "mês")
    .map((service) => service.id),
);

export const readyPackages: ReadyPackage[] = [
  {
    label: "ESSENCIAL",
    desc: "8 posts + 4 Reels 30s",
    cats: ["social", "video"],
    items: [
      { categoryId: "social", serviceId: "s8", qty: 1 },
      { categoryId: "video", serviceId: "v30s", qty: 4 },
    ],
  },
  {
    label: "CRESCIMENTO",
    desc: "12 posts + 8 Reels + 3 UGC 30s",
    cats: ["social", "video", "ugc"],
    items: [
      { categoryId: "social", serviceId: "s12", qty: 1 },
      { categoryId: "video", serviceId: "v30s", qty: 8 },
      { categoryId: "ugc", serviceId: "u30s", qty: 3 },
    ],
  },
  {
    label: "ACELERAÇÃO",
    desc: "16 posts + 8 Reels + 6 UGC 30s",
    cats: ["social", "video", "ugc"],
    items: [
      { categoryId: "social", serviceId: "s16", qty: 1 },
      { categoryId: "video", serviceId: "v30s", qty: 8 },
      { categoryId: "ugc", serviceId: "u30s", qty: 6 },
    ],
  },
];

export const fmtCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });

export function getCategoryById(categoryId: string) {
  return categories.find((category) => category.id === categoryId);
}

export function getServiceById(categoryId: string, serviceId: string) {
  return getCategoryById(categoryId)?.services.find((service) => service.id === serviceId);
}

export function getUnitPrice(serviceId: string, qty: number) {
  const tiers = tieredPricing[serviceId];

  if (!tiers) {
    return 0;
  }

  let price = tiers[0][1];

  for (const [minQty, unitPrice] of tiers) {
    if (qty >= minQty) {
      price = unitPrice;
    }
  }

  return price;
}

export function getItemTotal(service: ServiceItem, qty: number) {
  if (!service.allowQty) {
    return service.price;
  }

  return getUnitPrice(service.id, qty) * qty;
}

export function getPackageTotal(pkg: ReadyPackage) {
  return pkg.items.reduce((total, item) => {
    const service = getServiceById(item.categoryId, item.serviceId);

    if (!service) {
      return total;
    }

    return total + getItemTotal(service, item.qty);
  }, 0);
}

export function isRecurringSelection(selection: Selection) {
  return recurringServiceIds.has(selection.serviceId);
}

export function enrichSelections(selections: Selection[]): SelectionWithService[] {
  return selections.flatMap((selection) => {
    const category = getCategoryById(selection.categoryId);
    const service = getServiceById(selection.categoryId, selection.serviceId);

    if (!category || !service) {
      return [];
    }

    return [{
      category,
      service,
      selection,
      total: getItemTotal(service, selection.qty),
    }];
  });
}

export function splitSelectionsByBilling(selections: Selection[]) {
  const enriched = enrichSelections(selections);

  return {
    oneTimeItems: enriched.filter((item) => !isRecurringSelection(item.selection)),
    recurringItems: enriched.filter((item) => isRecurringSelection(item.selection)),
  };
}

export function getPackageBreakdown(selections: Selection[]): PackageBreakdown {
  const { oneTimeItems, recurringItems } = splitSelectionsByBilling(selections);
  const oneTimeTotal = oneTimeItems.reduce((total, item) => total + item.total, 0);
  const recurringTotal = recurringItems.reduce((total, item) => total + item.total, 0);

  return {
    oneTimeTotal,
    recurringTotal,
    grandTotal: oneTimeTotal + recurringTotal,
    pixOneTimeTotal: Math.round(oneTimeTotal * 0.95),
    hasOneTime: oneTimeItems.length > 0,
    hasRecurring: recurringItems.length > 0,
    oneTimeItems,
    recurringItems,
  };
}

export function buildServiceSnapshot(selections: Selection[]) {
  return enrichSelections(selections).map((item) => ({
    categoryId: item.category.id,
    categoryTitle: item.category.title,
    serviceId: item.service.id,
    serviceLabel: item.service.label,
    qty: item.selection.qty,
    unit: item.service.unit,
    total: item.total,
    recurring: isRecurringSelection(item.selection),
  }));
}
