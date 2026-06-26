import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";

const router = Router();

const VALID_STATUSES = ["New", "In Review", "Needs Info", "Completed"];

// ── Mock FastAPI ──────────────────────────────────────────────
async function callFastAPI(quote_id: string) {
  return {
    risk: "Medium",
    missing_items: ["Structural drawings", "Load requirements"],
    confidence: 91,
  };
}

// ── GET /quotes ───────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  try {
    const quotes = await prisma.quoteRequest.findMany();
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quotes" });
  }
});

// ── GET /quotes/:id ───────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const quote = await prisma.quoteRequest.findUnique({
      where: { id: String(req.params.id) },
      include: { analysisResult: true },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quote" });
  }
});

// ── POST /quotes ──────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const { customer, project, estimated_value } = req.body;

    if (!customer) {
      return res.status(400).json({ message: "Customer is required" });
    }
    if (!project) {
      return res.status(400).json({ message: "Project is required" });
    }
    if (estimated_value === undefined || estimated_value === null) {
      return res.status(400).json({ message: "Estimated value is required" });
    }
    if (typeof estimated_value !== "number") {
      return res.status(400).json({ message: "Estimated value must be a number" });
    }
    if (estimated_value < 0) {
      return res.status(400).json({ message: "Estimated value cannot be negative" });
    }

    const quote = await prisma.quoteRequest.create({
      data: { customer, project, estimated_value },
    });

    res.status(201).json(quote);
  } catch (error) {
    res.status(500).json({ message: "Failed to create quote" });
  }
});

// ── POST /quotes/:id/analyze ──────────────────────────────────
router.post("/:id/analyze", async (req: Request, res: Response) => {
  try {
    const quote = await prisma.quoteRequest.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    let analysis;
    try {
      analysis = await callFastAPI(quote.id);
    } catch (err) {
      return res.status(502).json({ message: "FastAPI service unavailable" });
    }

    const saved = await prisma.analysisResult.upsert({
      where: { quote_id: quote.id },
      update: {
        risk: analysis.risk,
        confidence: analysis.confidence,
        missing_items: JSON.stringify(analysis.missing_items),
        analyzed_at: new Date(),
      },
      create: {
        quote_id: quote.id,
        risk: analysis.risk,
        confidence: analysis.confidence,
        missing_items: JSON.stringify(analysis.missing_items),
      },
    });

    res.json({
      quote,
      analysis: {
        ...saved,
        missing_items: JSON.parse(saved.missing_items),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Analysis failed" });
  }
});

// ── PATCH /quotes/:id/status ──────────────────────────────────
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const exists = await prisma.quoteRequest.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!exists) {
      return res.status(404).json({ message: "Quote not found" });
    }

    const updated = await prisma.quoteRequest.update({
      where: { id: String(req.params.id) },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

export default router;