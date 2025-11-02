// src/store/cases.js
const KEY = "pad_cases_v1";

export function getAllCases() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveCase(rec) {
  const all = getAllCases();
  all.unshift(rec);
  localStorage.setItem(KEY, JSON.stringify(all));
}
export function clearCases() { localStorage.removeItem(KEY); }

export function kpis(cases){
  const n = cases.length;
  const by = (s)=>cases.filter(c=>c.resultado.status===s).length;
  const pct = (x)=> n? Math.round((x/n)*100):0;
  const tiempos = cases.filter(c=>c.tsCierre && c.tsInicio).map(c=>c.tsCierre - c.tsInicio);
  const mediana = tiempos.sort((a,b)=>a-b)[Math.floor(tiempos.length/2)] || 0;
  const auto = cases.filter(c=>c.resultado.reasons.length===1 && c.resultado.reasons[0]==="Cumple criterios del MVP").length;
  return {
    total:n,
    pctAuto: pct(auto),
    pctCumple: pct(by("CUMPLE")),
    pctNoCumple: pct(by("NO_CUMPLE")),
    pctRevision: pct(by("REVISION")),
    medianaValidacionMs: mediana
  };
}
