import { asaasRequest } from "@/lib/payments/asaas/client";

export const MAX_PROPOSAL_CARD_INSTALLMENTS = 12;
export const CARD_ANTICIPATION_RATE_CASH = 0.0115;
export const CARD_ANTICIPATION_RATE_INSTALLMENTS = 0.016;

type Simulation = {
  creditCard?: {
    netValue?: number;
    feePercentage?: number;
    operationFee?: number;
  };
};

export type ProposalCardQuote = {
  installmentCount: number;
  installmentValue: number;
  totalValue: number;
  baseValue: number;
  cardFee: number;
  anticipationCost: number;
  monthlyAnticipationRate: number;
};

export async function quoteProposalCardPayment(
  baseValue: number,
  installmentCount: number,
): Promise<ProposalCardQuote> {
  const count = normalizeInstallmentCount(installmentCount);
  const rate = count === 1
    ? CARD_ANTICIPATION_RATE_CASH
    : CARD_ANTICIPATION_RATE_INSTALLMENTS;
  const paymentAfterCardFee = roundMoney(pricePayment(baseValue, rate, count));
  const targetNetValue = roundMoney(paymentAfterCardFee * count);

  let totalValue = targetNetValue;
  let simulatedNetValue = targetNetValue;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const simulation = await asaasRequest<Simulation>("/v3/payments/simulate", {
      method: "POST",
      body: { value: totalValue, installmentCount: count, billingTypes: ["CREDIT_CARD"] },
    });
    simulatedNetValue = Number(simulation.creditCard?.netValue);
    if (!Number.isFinite(simulatedNetValue)) {
      throw new Error("O Asaas não retornou o valor líquido da simulação do cartão.");
    }
    const difference = roundMoney(targetNetValue - simulatedNetValue);
    if (Math.abs(difference) < 0.01) break;
    totalValue = roundMoney(totalValue + difference);
  }

  const installmentValue = roundMoney(totalValue / count);
  totalValue = roundMoney(installmentValue * count);
  return {
    installmentCount: count,
    installmentValue,
    totalValue,
    baseValue: roundMoney(baseValue),
    cardFee: roundMoney(totalValue - targetNetValue),
    anticipationCost: roundMoney(targetNetValue - baseValue),
    monthlyAnticipationRate: rate * 100,
  };
}

export function normalizeInstallmentCount(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > MAX_PROPOSAL_CARD_INSTALLMENTS) {
    throw new Error("Selecione de 1 a 12 parcelas.");
  }
  return value;
}

function pricePayment(presentValue: number, rate: number, count: number) {
  const factor = (rate * Math.pow(1 + rate, count)) / (Math.pow(1 + rate, count) - 1);
  return presentValue * factor;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
