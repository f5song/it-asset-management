import { RequestRisk } from "@/types/exception";


export function riskTextColor(risk: RequestRisk) {
  switch (risk) {
    case 'High': return 'text-red-700';
    case 'Medium': return 'text-amber-600';
    default: return 'text-green-700';
  }
}