export interface DemoInvoice {
  id: string;
  label: string;
  badge: string;
  description: string;
  text: string;
  expectedCategory: string;
  isMessy?: boolean;
}

export const DEMO_INVOICES: DemoInvoice[] = [
  {
    id: 'meta-ads',
    label: 'Meta Ads Invoice',
    badge: 'Marketing',
    description: 'Clean marketing invoice with subtotal, GST, and clear line items',
    expectedCategory: 'Marketing & Advertising',
    text: `Invoice #INV-2391
Meta Platforms Ireland Ltd
4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Ireland
GSTIN: 9918IRL2901239

Bill To: D2C Wellness Brands Pvt Ltd, Mumbai
Invoice Date: 12 August 2026

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
    label: 'AWS Cloud Hosting',
    badge: 'Software & SaaS',
    description: 'Monthly cloud infrastructure invoice with usage breakdown',
    expectedCategory: 'Software & SaaS',
    text: `Amazon Web Services India Private Limited
Invoice Summary
Invoice Number: 981240182
Invoice Date: August 14, 2026

Account ID: 4920-1192-3841
Services Rendered (July 2026):
- Amazon EC2 Web App Compute Cluster: ₹4,200.00
- Amazon Relational Database (RDS Multi-AZ): ₹3,120.00
- Amazon Simple Storage Service (S3 & CloudFront CDN): ₹1,600.00

Subtotal: ₹8,920.00
Taxes: Included
Total Payable: ₹8,920.00

Status: Automatically debited via HDFC Corporate Card`,
  },
  {
    id: 'delhivery-shipping',
    label: 'Delhivery Logistics',
    badge: 'Logistics',
    description: 'B2C e-commerce shipment billing with freight and GST breakdown',
    expectedCategory: 'Logistics & Shipping',
    text: `DELHIVERY LOGISTICS & SUPPLY CHAIN SERVICES
Tax Invoice: DEL-EXP-88412
Date of Invoice: 10/08/2026

Consignor: D2C Brands Warehouse, Bhiwandi
Description: B2C E-commerce Surface Forward & RTO Express Shipments
Total Parcels Dispatched: 1,240 units

Base Freight Charges: ₹13,534.00
Fuel Surcharge: ₹2,100.00
CGST (9%): ₹1,408.00
SGST (9%): ₹1,408.00

Net Payable: ₹18,450.00
Payment Mode: Direct Bank Transfer (Received)`,
  },
  {
    id: 'packaging-materials',
    label: 'Packaging Boxes',
    badge: 'Inventory & Materials',
    description: 'Physical packaging and raw materials supplier invoice',
    expectedCategory: 'Inventory & Raw Materials',
    text: `KRAFT PACKAGING SOLUTIONS PVT LTD
Plot 44, Industrial Area Phase II, Pune
GSTIN: 27AABCK9012R1Z2

TAX INVOICE: KP-2026-904
Date: 05-08-2026

Items:
1. Eco-friendly Corrugated Mailer Boxes (Kraft 3-ply) - Qty: 5,000 pcs @ ₹4.50 = ₹22,500.00
2. Custom Brand Logo Biodegradable Poly Mailers - Qty: 2,000 pcs @ ₹2.52 = ₹5,042.37

Subtotal: ₹27,542.37
IGST @ 18%: ₹4,957.63
Grand Total: ₹32,500.00

Payment Details: Paid via NEFT Ref: HDFC009182319`,
  },
  {
    id: 'messy-ocr',
    label: 'Messy Slack Receipt',
    badge: 'Messy OCR / Anomaly',
    description: 'Informal Slack forward with OCR typos and irregular punctuation',
    expectedCategory: 'Equipment & Hardware',
    isMessy: true,
    text: `neha forwarding this receipt from the office admin team:
--- SCANNED OCR RECEIPT ---
C4FE COFFEE & ERGO CHAIRS WAREH0USE CO.
TAX INVO1CE: OFF-EQ-992
DT: 08/11/2026
Item: Bought 2x Ergonomic High-Back Mesh Chairs for Finance & Support station
Base Price: 21,185.59
GST 18%: 3,813.41
AM0UNT DUE : INR 24,999.00
Paid via Petty Cash / Admin Debit Card
Please reimburse & book into ledger before Friday`,
  },
  {
    id: 'ambiguous-date',
    label: 'Ambiguous Date Receipt',
    badge: 'Needs Review Demo',
    description: 'Contains ambiguous date (03/04/2026) and multiple totals (previous balance vs paid)',
    expectedCategory: 'Marketing & Advertising',
    isMessy: true,
    text: `METRO PRINT & PROMOTIONS
Cash Receipt #CPM-4410
Date: 03/04/2026

Items:
- 5,000x Product Unboxing Flyers (Summer Campaign)
- Product Catalog Printing

Subtotal: ₹4,500.00
Discount Voucher: -₹500.00
Amount Paid Today: ₹4,000.00
Previous Outstanding Balance on Account: ₹12,000.00
Total Remaining Balance: ₹12,000.00

Note: Date format 03/04/2026 on invoice stamp`,
  },
];
