import { quoteRepository } from "../repository/quotesRepository";

const VALID_STATUSES = ["New", "In Review", "Needs Info", "Completed"];

// Mock FastAPI call
async function callFastAPI(quote_id: string) {
  return {
    risk: "Medium",
    missing_items: ["Structural drawings", "Load requirements"],
    confidence: 91,
  };
}

export const quoteService = {
  getAllQuotes: async () => {
    return await quoteRepository.findAll();
  },

  getQuoteById: async (id: string) => {
    const quote = await quoteRepository.findById(id);
    if (!quote) throw { status: 404, message: "Quote not found" };
    return quote;
  },

  createQuote: async (
    customer: string,
    project: string,
    estimated_value: number
  ) => {
    if (!customer) throw { status: 400, message: "Customer is required" };
    if (!project) throw { status: 400, message: "Project is required" };
    if (estimated_value === undefined || estimated_value === null)
      throw { status: 400, message: "Estimated value is required" };
    if (typeof estimated_value !== "number")
      throw { status: 400, message: "Estimated value must be a number" };
    if (estimated_value < 0)
      throw { status: 400, message: "Estimated value cannot be negative" };

    return await quoteRepository.create(customer, project, estimated_value);
  },

  analyzeQuote: async (id: string) => {
    const quote = await quoteRepository.findById(id);
    if (!quote) throw { status: 404, message: "Quote not found" };

    let analysis;
    try {
      analysis = await callFastAPI(id);
    } catch (err) {
      throw { status: 502, message: "FastAPI service unavailable" };
    }

    const saved = await quoteRepository.saveAnalysis(
      id,
      analysis.risk,
      analysis.confidence,
      JSON.stringify(analysis.missing_items)
    );

    return {
      quote,
      analysis: {
        ...saved,
        missing_items: JSON.parse(saved.missing_items),
      },
    };
  },

  updateStatus: async (id: string, status: string) => {
    if (!status) throw { status: 400, message: "Status is required" };
    if (!VALID_STATUSES.includes(status))
      throw {
        status: 400,
        message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`,
      };

    const quote = await quoteRepository.findById(id);
    if (!quote) throw { status: 404, message: "Quote not found" };

    return await quoteRepository.updateStatus(id, status);
  },
};