export interface DemoInvoice {
  id: string;
  label: string;
  badge: string;
  categoryTag: 'clean' | 'anomaly' | 'duplicate' | 'tax-gst' | 'usd';
  description: string;
  text: string;
  expectedCategory: string;
  isMessy?: boolean;
}

export const DEMO_INVOICES: DemoInvoice[] = [
  {
    id: 'meta-ads',
    label: 'Meta Ads Campaign',
    badge: 'Marketing (INR)',
    categoryTag: 'clean',
    description: 'Clean marketing invoice with 18% IGST and clear campaign description',
    expectedCategory: 'Marketing & Advertising',
    text: `Invoice #INV-2391
Meta Platforms Ireland Ltd
4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Ireland
GSTIN: 9918IRL2901239

Bill To: D2C Wellness Brands Pvt Ltd, Mumbai
Invoice Date: 2026-08-12

Description:
Facebook Advertising Campaign
Campaign Name: Summer Glow Direct-to-Consumer Sale
Target Region: India (Tier 1 & 2 Metro)

Subtotal: ₹42,372.00
Integrated GST @ 18%: ₹7,627.00
Total Amount Due: ₹49,999.00

Payment Status: Paid (Charged to Mastercard ending 9012)`,
  },
  {
    id: 'aws-hosting',
    label: 'AWS Cloud Compute',
    badge: 'SaaS (USD)',
    categoryTag: 'usd',
    description: 'Cloud infrastructure invoice in USD with compute & database line items',
    expectedCategory: 'Software & SaaS',
    text: `Amazon Web Services, Inc.
Invoice Number: AWS-2026-889104
Date: 2026-08-14
Customer: D2C Brands Pvt Ltd

Description                          Amount
EC2 Compute Instance Nodes (c6g.2xl) $280.00
Amazon RDS Multi-AZ Postgres DB      $145.00
Amazon S3 Media Storage & Transfer   $54.20
AWS Support Developer Tier            $29.00

Subtotal: $508.20
Estimated Tax (0%): $0.00
Total Amount Due: $508.20 USD
Payment Method: Corporate Credit Card ending in 4112
Status: Paid`,
  },
  {
    id: 'delhivery-shipping',
    label: 'Delhivery Logistics',
    badge: 'Logistics GST',
    categoryTag: 'tax-gst',
    description: 'B2C surface e-commerce courier invoice with CGST/SGST split',
    expectedCategory: 'Logistics & Shipping',
    text: `DELHIVERY LOGISTICS & SUPPLY CHAIN SERVICES
Tax Invoice: DEL-EXP-88412
Date of Invoice: 2026-08-10
GSTIN: 06AAACD1234F1Z8

Consignor: D2C Brands Warehouse, Bhiwandi
Description: B2C E-commerce Surface Forward & RTO Express Shipments
Total Parcels Dispatched: 1,240 units

Base Freight Charges: ₹13,534.00
Fuel Surcharge: ₹2,100.00
CGST (9%): ₹1,408.00
SGST (9%): ₹1,408.00

Total Invoice Value: ₹18,450.00
Payment Mode: Direct Bank Transfer (Received)`,
  },
  {
    id: 'packaging-materials',
    label: 'Kraft Custom Mailers',
    badge: 'Packaging',
    categoryTag: 'clean',
    description: 'Physical packaging & raw materials order with unit pricing',
    expectedCategory: 'Inventory & Raw Materials',
    text: `KRAFT PACKAGING SOLUTIONS PVT LTD
Plot 44, Industrial Area Phase II, Pune
GSTIN: 27AABCK9012R1Z2

TAX INVOICE: KP-2026-904
Date: 2026-08-05

Items:
1. Eco-friendly Corrugated Mailer Boxes (Kraft 3-ply) - Qty: 5,000 pcs @ ₹4.50 = ₹22,500.00
2. Custom Brand Logo Biodegradable Poly Mailers - Qty: 2,000 pcs @ ₹2.52 = ₹5,042.37

Subtotal: ₹27,542.37
IGST @ 18%: ₹4,957.63
Grand Total: ₹32,500.00

Payment Details: Paid via NEFT Ref: HDFC009182319`,
  },
  {
    id: 'duplicate-test',
    label: 'Duplicate Invoice Test',
    badge: 'Negative: Duplicate',
    categoryTag: 'duplicate',
    description: 'Tests cross-ledger duplicate detection matching existing Delhivery invoice #DEL-EXP-88412',
    expectedCategory: 'Logistics & Shipping',
    isMessy: true,
    text: `DELHIVERY LOGISTICS
Re-billing Notice / Duplicate Copy
Tax Invoice: DEL-EXP-88412
Date: 2026-08-10

Total Freight Charges: ₹18,450.00 INR
Status: Duplicate copy generated for finance archive`,
  },
  {
    id: 'math-mismatch',
    label: 'Math Mismatch Audit',
    badge: 'Negative: Math Error',
    categoryTag: 'anomaly',
    description: 'Subtotal (₹40,000) + Tax (₹7,200) does not equal stated Total (₹65,000)',
    expectedCategory: 'Inventory & Raw Materials',
    isMessy: true,
    text: `PackCraft Custom Packaging Solutions
Tax Invoice No: PC-2026-0041
Date: 2026-08-08

1. 500ml Frosted Cosmetic Glass Bottles (2,000 units) - ₹30,000.00
2. Corrugated Outer Shipping Boxes (1,000 units) - ₹10,000.00

Subtotal: ₹40,000.00
GST (18%): ₹7,200.00
Total Due: ₹65,000.00
Payment Terms: Net 30 Days`,
  },
  {
    id: 'messy-ocr',
    label: 'Messy Slack Receipt',
    badge: 'Messy OCR Scan',
    categoryTag: 'anomaly',
    description: 'Informal Slack forward with OCR typos, zero replacements, and irregular punctuation',
    expectedCategory: 'Equipment & Hardware',
    isMessy: true,
    text: `neha forwarding this receipt from the office admin team:
--- SCANNED OCR RECEIPT ---
C4FE COFFEE & ERGO CHAIRS WAREH0USE CO.
TAX INVO1CE: OFF-EQ-992
DT: 2026-08-11
Item: Bought 2x Ergonomic High-Back Mesh Chairs for Finance & Support station
Base Price: 21,185.59
GST 18%: 3,813.41
AM0UNT DUE : INR 24,999.00
Paid via Petty Cash / Admin Debit Card
Please reimburse & book into ledger before Friday`,
  },
  {
    id: 'missing-total',
    label: 'Missing Total / Cut-off Scan',
    badge: 'Negative: Incomplete',
    categoryTag: 'anomaly',
    description: 'Simulates a scan where the bottom total line is missing or damaged',
    expectedCategory: 'Logistics & Shipping',
    isMessy: true,
    text: `BlueDart Express Logistics Receipt
Air Waybill: BLU-7829103
Sender: D2C Naturals Factory Bhiwandi
Recipient: Retail Hub Mumbai
Package Weight: 4.5 KG
Delivery Mode: Express Air Cargo
Date: 2026-08-09
[End of scan - total line damaged/truncated]`,
  },
];
