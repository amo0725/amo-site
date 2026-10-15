import type { GraphLayout } from "@/content/types";

/** Node positions for the integration map. Language-independent; keyed by node id. */

/** Landscape layout for tablets and desktops. */
export const wideLayout: GraphLayout = {
  viewBox: { width: 1000, height: 660 },
  positions: {
    quote: { x: 300, y: 310 },
    stripe: { x: 90, y: 260 },
    hubspot: { x: 270, y: 75 },
    netsuite: { x: 500, y: 120 },
    avalara: { x: 110, y: 500 },
    fedex: { x: 520, y: 540 },
    data: { x: 300, y: 610 },
    messaging: { x: 740, y: 230 },
    openai: { x: 640, y: 70 },
    whatsapp: { x: 905, y: 80 },
    line: { x: 945, y: 225 },
    email: { x: 905, y: 365 },
    n8n: { x: 770, y: 480 },
    facebook: { x: 945, y: 480 },
    sheets: { x: 915, y: 610 },
    shopee: { x: 720, y: 620 },
  },
};

/** Portrait layout for phones. */
export const narrowLayout: GraphLayout = {
  viewBox: { width: 400, height: 990 },
  positions: {
    hubspot: { x: 105, y: 40 },
    netsuite: { x: 300, y: 40 },
    stripe: { x: 75, y: 145 },
    avalara: { x: 325, y: 145 },
    quote: { x: 200, y: 245 },
    fedex: { x: 325, y: 345 },
    data: { x: 105, y: 375 },
    openai: { x: 95, y: 530 },
    whatsapp: { x: 315, y: 530 },
    messaging: { x: 200, y: 620 },
    line: { x: 70, y: 715 },
    email: { x: 330, y: 715 },
    n8n: { x: 200, y: 805 },
    facebook: { x: 75, y: 900 },
    sheets: { x: 325, y: 900 },
    shopee: { x: 200, y: 955 },
  },
};
