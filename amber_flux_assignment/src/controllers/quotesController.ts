import { Request, Response } from "express";
import { quoteService } from "../services/quotesServices";

export const quoteController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const quotes = await quoteService.getAllQuotes();
      res.json(quotes);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const quote = await quoteService.getQuoteById(String(req.params.id));
      res.json(quote);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { customer, project, estimated_value } = req.body;
      const quote = await quoteService.createQuote(customer, project, estimated_value);
      res.status(201).json(quote);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
  },

  analyze: async (req: Request, res: Response) => {
    try {
      const result = await quoteService.analyzeQuote(String(req.params.id));
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const quote = await quoteService.updateStatus(String(req.params.id), status);
      res.json(quote);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
  },
};