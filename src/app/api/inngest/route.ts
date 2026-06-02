import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { orderRun } from "@/inngest/functions";

// Each Inngest step is invoked as a request here; give it room (Vercel Pro).
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({ client: inngest, functions: [orderRun] });
