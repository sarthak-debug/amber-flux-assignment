import prisma from "../utils/prisma";

export const quoteRepository = {
  findAll: async () => {
    return await prisma.quoteRequest.findMany();
  },

  findById: async (id: string) => {
    return await prisma.quoteRequest.findUnique({
      where: { id },
      include: { analysisResult: true },
    });
  },

  create: async (customer: string, project: string, estimated_value: number) => {
    return await prisma.quoteRequest.create({
      data: { customer, project, estimated_value },
    });
  },

  updateStatus: async (id: string, status: string) => {
    return await prisma.quoteRequest.update({
      where: { id },
      data: { status },
    });
  },

  saveAnalysis: async (
    quote_id: string,
    risk: string,
    confidence: number,
    missing_items: string
  ) => {
    return await prisma.analysisResult.upsert({
      where: { quote_id },
      update: { risk, confidence, missing_items, analyzed_at: new Date() },
      create: { quote_id, risk, confidence, missing_items },
    });
  },
};