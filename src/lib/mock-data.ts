// Vendors
export const vendors = [
  { id: "v1", name: "Acme Industrial Supply", code: "ACME-001", contact: "john@acme.com", rating: 4.8 },
  { id: "v2", name: "GlobalTech Components", code: "GTC-002", contact: "sarah@globaltech.com", rating: 4.5 },
  { id: "v3", name: "PrecisionParts Inc.", code: "PPI-003", contact: "mike@precisionparts.com", rating: 4.2 },
  { id: "v4", name: "MetalWorks Corp", code: "MWC-004", contact: "anna@metalworks.com", rating: 4.6 },
  { id: "v5", name: "ChemSolutions Ltd", code: "CSL-005", contact: "david@chemsolutions.com", rating: 3.9 },
  { id: "v6", name: "LogiPack Systems", code: "LPS-006", contact: "elena@logipack.com", rating: 4.7 },
];

// Purchase Orders
export const purchaseOrders = [
  { id: "po1", number: "PO-2026-001", vendorId: "v1", vendor: "Acme Industrial Supply", date: "2026-01-15", totalAmount: 45250.00, status: "received", items: [
    { description: "Steel bearings - Type A", quantity: 500, unitPrice: 45.50, total: 22750.00 },
    { description: "Hydraulic seals - Kit B", quantity: 250, unitPrice: 90.00, total: 22500.00 },
  ]},
  { id: "po2", number: "PO-2026-002", vendorId: "v2", vendor: "GlobalTech Components", date: "2026-01-18", totalAmount: 128400.00, status: "received", items: [
    { description: "PCB boards - Model X7", quantity: 1000, unitPrice: 78.40, total: 78400.00 },
    { description: "LED modules - RGB", quantity: 2000, unitPrice: 25.00, total: 50000.00 },
  ]},
  { id: "po3", number: "PO-2026-003", vendorId: "v3", vendor: "PrecisionParts Inc.", date: "2026-01-22", totalAmount: 67800.00, status: "partial", items: [
    { description: "CNC machined gears", quantity: 300, unitPrice: 226.00, total: 67800.00 },
  ]},
  { id: "po4", number: "PO-2026-004", vendorId: "v4", vendor: "MetalWorks Corp", date: "2026-01-25", totalAmount: 33500.00, status: "received", items: [
    { description: "Aluminum extrusions - Profile C", quantity: 100, unitPrice: 175.00, total: 17500.00 },
    { description: "Stainless steel plates", quantity: 50, unitPrice: 320.00, total: 16000.00 },
  ]},
  { id: "po5", number: "PO-2026-005", vendorId: "v5", vendor: "ChemSolutions Ltd", date: "2026-02-01", totalAmount: 15200.00, status: "received", items: [
    { description: "Industrial adhesive - 50L drums", quantity: 20, unitPrice: 380.00, total: 7600.00 },
    { description: "Cleaning solvent - 25L", quantity: 40, unitPrice: 190.00, total: 7600.00 },
  ]},
  { id: "po6", number: "PO-2026-006", vendorId: "v6", vendor: "LogiPack Systems", date: "2026-02-05", totalAmount: 89000.00, status: "pending", items: [
    { description: "Automated packing units", quantity: 5, unitPrice: 17800.00, total: 89000.00 },
  ]},
];

// Goods Receipts
export const goodsReceipts = [
  { id: "gr1", number: "GR-2026-001", poNumber: "PO-2026-001", poId: "po1", date: "2026-01-28", receivedBy: "Warehouse A", items: [
    { description: "Steel bearings - Type A", quantityOrdered: 500, quantityReceived: 500, status: "complete" },
    { description: "Hydraulic seals - Kit B", quantityOrdered: 250, quantityReceived: 250, status: "complete" },
  ]},
  { id: "gr2", number: "GR-2026-002", poNumber: "PO-2026-002", poId: "po2", date: "2026-02-01", receivedBy: "Warehouse B", items: [
    { description: "PCB boards - Model X7", quantityOrdered: 1000, quantityReceived: 1000, status: "complete" },
    { description: "LED modules - RGB", quantityOrdered: 2000, quantityReceived: 1950, status: "short" },
  ]},
  { id: "gr3", number: "GR-2026-003", poNumber: "PO-2026-003", poId: "po3", date: "2026-02-03", receivedBy: "Warehouse A", items: [
    { description: "CNC machined gears", quantityOrdered: 300, quantityReceived: 200, status: "partial" },
  ]},
  { id: "gr4", number: "GR-2026-004", poNumber: "PO-2026-004", poId: "po4", date: "2026-02-02", receivedBy: "Warehouse C", items: [
    { description: "Aluminum extrusions - Profile C", quantityOrdered: 100, quantityReceived: 100, status: "complete" },
    { description: "Stainless steel plates", quantityOrdered: 50, quantityReceived: 50, status: "complete" },
  ]},
  { id: "gr5", number: "GR-2026-005", poNumber: "PO-2026-005", poId: "po5", date: "2026-02-08", receivedBy: "Warehouse A", items: [
    { description: "Industrial adhesive - 50L drums", quantityOrdered: 20, quantityReceived: 20, status: "complete" },
    { description: "Cleaning solvent - 25L", quantityOrdered: 40, quantityReceived: 40, status: "complete" },
  ]},
];

// Invoices
export type InvoiceStatus = "matched" | "mismatched" | "pending" | "approved" | "rejected";
export interface Invoice {
  id: string;
  number: string;
  vendorId: string;
  vendor: string;
  poNumber: string;
  poId: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  matchScore: number;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  aiRecommendation?: string;
  aiReasoning?: string;
  processedAt?: string;
}

export const invoices: Invoice[] = [
  { id: "inv1", number: "INV-8834", vendorId: "v1", vendor: "Acme Industrial Supply", poNumber: "PO-2026-001", poId: "po1", date: "2026-02-02", dueDate: "2026-03-04", totalAmount: 45250.00, status: "matched", matchScore: 100, processedAt: "2026-02-02T10:30:00", items: [
    { description: "Steel bearings - Type A", quantity: 500, unitPrice: 45.50, total: 22750.00 },
    { description: "Hydraulic seals - Kit B", quantity: 250, unitPrice: 90.00, total: 22500.00 },
  ], aiRecommendation: "Approve", aiReasoning: "Perfect three-way match. All quantities, prices, and totals align with PO-2026-001 and GR-2026-001." },
  { id: "inv2", number: "INV-8835", vendorId: "v2", vendor: "GlobalTech Components", poNumber: "PO-2026-002", poId: "po2", date: "2026-02-05", dueDate: "2026-03-07", totalAmount: 128400.00, status: "mismatched", matchScore: 72, processedAt: "2026-02-05T14:15:00", items: [
    { description: "PCB boards - Model X7", quantity: 1000, unitPrice: 78.40, total: 78400.00 },
    { description: "LED modules - RGB", quantity: 2000, unitPrice: 25.00, total: 50000.00 },
  ], aiRecommendation: "Review", aiReasoning: "Invoice amount matches PO, but GR shows only 1,950 LED modules received (50 short). Recommend partial approval or requesting credit note for 50 units ($1,250)." },
  { id: "inv3", number: "INV-8836", vendorId: "v3", vendor: "PrecisionParts Inc.", poNumber: "PO-2026-003", poId: "po3", date: "2026-02-06", dueDate: "2026-03-08", totalAmount: 45200.00, status: "mismatched", matchScore: 58, processedAt: "2026-02-06T09:45:00", items: [
    { description: "CNC machined gears", quantity: 200, unitPrice: 226.00, total: 45200.00 },
  ], aiRecommendation: "Approve with Note", aiReasoning: "Invoice matches goods received (200 units) but PO was for 300 units. This appears to be a partial shipment invoice. Amount is correct for received quantity." },
  { id: "inv4", number: "INV-8837", vendorId: "v4", vendor: "MetalWorks Corp", poNumber: "PO-2026-004", poId: "po4", date: "2026-02-08", dueDate: "2026-03-10", totalAmount: 33500.00, status: "matched", matchScore: 100, processedAt: "2026-02-08T11:20:00", items: [
    { description: "Aluminum extrusions - Profile C", quantity: 100, unitPrice: 175.00, total: 17500.00 },
    { description: "Stainless steel plates", quantity: 50, unitPrice: 320.00, total: 16000.00 },
  ], aiRecommendation: "Approve", aiReasoning: "Perfect three-way match. All line items verified against PO-2026-004 and GR-2026-004." },
  { id: "inv5", number: "INV-8838", vendorId: "v5", vendor: "ChemSolutions Ltd", poNumber: "PO-2026-005", poId: "po5", date: "2026-02-10", dueDate: "2026-03-12", totalAmount: 15580.00, status: "mismatched", matchScore: 85, processedAt: "2026-02-10T16:00:00", items: [
    { description: "Industrial adhesive - 50L drums", quantity: 20, unitPrice: 399.00, total: 7980.00 },
    { description: "Cleaning solvent - 25L", quantity: 40, unitPrice: 190.00, total: 7600.00 },
  ], aiRecommendation: "Escalate", aiReasoning: "Adhesive unit price ($399) exceeds PO price ($380) by 5%. Total overcharge: $380. Quantities match GR. Recommend requesting price adjustment." },
  { id: "inv6", number: "INV-8839", vendorId: "v1", vendor: "Acme Industrial Supply", poNumber: "PO-2026-001", poId: "po1", date: "2026-02-12", dueDate: "2026-03-14", totalAmount: 12300.00, status: "pending", matchScore: 0, items: [
    { description: "Replacement parts - Kit C", quantity: 100, unitPrice: 123.00, total: 12300.00 },
  ]},
  { id: "inv7", number: "INV-8840", vendorId: "v6", vendor: "LogiPack Systems", poNumber: "PO-2026-006", poId: "po6", date: "2026-02-14", dueDate: "2026-03-16", totalAmount: 89000.00, status: "pending", matchScore: 0, items: [
    { description: "Automated packing units", quantity: 5, unitPrice: 17800.00, total: 89000.00 },
  ]},
  { id: "inv8", number: "INV-8841", vendorId: "v2", vendor: "GlobalTech Components", poNumber: "PO-2026-002", poId: "po2", date: "2026-02-15", dueDate: "2026-03-17", totalAmount: 25000.00, status: "approved", matchScore: 98, processedAt: "2026-02-15T08:30:00", items: [
    { description: "LED modules - RGB (backorder)", quantity: 1000, unitPrice: 25.00, total: 25000.00 },
  ], aiRecommendation: "Approve", aiReasoning: "Backorder fulfillment for LED modules. Price matches PO. Already approved." },
];

// Dashboard KPIs
export const dashboardKPIs = {
  totalProcessed: 847,
  matchRate: 92.4,
  pendingApprovals: 23,
  timeSaved: "156 hrs",
  totalProcessedChange: 12.5,
  matchRateChange: 3.2,
  pendingChange: -8,
  timeSavedChange: 18.7,
};

// Monthly trend data
export const monthlyTrend = [
  { month: "Sep", invoices: 89, matched: 78, value: 1250000 },
  { month: "Oct", invoices: 102, matched: 91, value: 1480000 },
  { month: "Nov", invoices: 95, matched: 88, value: 1320000 },
  { month: "Dec", invoices: 78, matched: 74, value: 980000 },
  { month: "Jan", invoices: 112, matched: 105, value: 1650000 },
  { month: "Feb", invoices: 71, matched: 67, value: 890000 },
];

// Invoice status breakdown
export const statusBreakdown = [
  { name: "Matched", value: 389, fill: "hsl(var(--chart-matched))" },
  { name: "Pending", value: 23, fill: "hsl(var(--chart-pending))" },
  { name: "Mismatched", value: 35, fill: "hsl(var(--chart-unmatched))" },
  { name: "Processing", value: 12, fill: "hsl(var(--chart-processing))" },
];

// Recent activity
export const recentActivity = [
  { id: "a1", type: "matched" as const, message: "INV-8834 from Acme Industrial matched with PO-2026-001", time: "2 min ago" },
  { id: "a2", type: "flagged" as const, message: "INV-8835 from GlobalTech has quantity mismatch", time: "15 min ago" },
  { id: "a3", type: "approved" as const, message: "INV-8841 from GlobalTech approved automatically", time: "1 hr ago" },
  { id: "a4", type: "processing" as const, message: "INV-8839 from Acme Industrial queued for processing", time: "2 hrs ago" },
  { id: "a5", type: "matched" as const, message: "INV-8837 from MetalWorks Corp matched with PO-2026-004", time: "3 hrs ago" },
  { id: "a6", type: "flagged" as const, message: "INV-8838 from ChemSolutions has price variance", time: "4 hrs ago" },
];

// Analytics data
export const vendorPerformance = [
  { vendor: "Acme Industrial", volume: 156, matchRate: 97, avgProcessTime: 1.2 },
  { vendor: "GlobalTech", volume: 134, matchRate: 89, avgProcessTime: 2.1 },
  { vendor: "PrecisionParts", volume: 98, matchRate: 85, avgProcessTime: 3.4 },
  { vendor: "MetalWorks", volume: 112, matchRate: 96, avgProcessTime: 1.5 },
  { vendor: "ChemSolutions", volume: 67, matchRate: 82, avgProcessTime: 2.8 },
  { vendor: "LogiPack", volume: 45, matchRate: 91, avgProcessTime: 1.8 },
];

export const processingEfficiency = [
  { month: "Sep", manual: 45, automated: 8 },
  { month: "Oct", manual: 42, automated: 7 },
  { month: "Nov", manual: 48, automated: 6 },
  { month: "Dec", manual: 40, automated: 5 },
  { month: "Jan", manual: 50, automated: 5 },
  { month: "Feb", manual: 44, automated: 4 },
];
