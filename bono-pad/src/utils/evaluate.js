// src/utils/evaluate.js
const OPS = {
  ">":  (a,b)=>a>b,
  "<":  (a,b)=>a<b,
  ">=": (a,b)=>a>=b,
  "<=": (a,b)=>a<=b,
  "==": (a,b)=>a===b,   // comparador estricto
  "!=": (a,b)=>a!==b    // comparador estricto
};

export function evaluateCase(rules, payload) {
  const reasons = [];
  let status = "CUMPLE";

  // ADMIN
  if (!rules.admin.tramosPermitidos.includes(payload.admin.tramo)) {
    reasons.push(`Tramo ${payload.admin.tramo} no permitido`);
    status = "NO_CUMPLE";
  }
  if (rules.admin.prestadorEnConvenio && !payload.admin.prestadorConvenio) {
    reasons.push("Prestador no está en convenio PAD");
    status = status === "CUMPLE" ? "REVISION" : status;
  }
  if (rules.codigoPad?.length && !rules.codigoPad.includes(payload.admin.codigoPad)) {
    reasons.push(`Código PAD no coincide (${payload.admin.codigoPad})`);
    status = status === "CUMPLE" ? "REVISION" : status;
  }
  if (payload.admin.diasOrden > rules.admin.ordenVigenciaDias) {
    reasons.push(`Orden médica vencida (> ${rules.admin.ordenVigenciaDias} días)`);
    status = "NO_CUMPLE";
  }

  // CLÍNICO
  if (payload.clinico.edad < rules.clinico.minEdad) {
    reasons.push(`Edad < ${rules.clinico.minEdad}`);
    status = "NO_CUMPLE";
  }
  if (payload.clinico.imc > rules.clinico.maxIMC) {
    reasons.push(`IMC > ${rules.clinico.maxIMC}`);
    status = status === "CUMPLE" ? "REVISION" : status;
  }
  Object.entries(rules.clinico.prohibidos).forEach(([k,flag])=>{
    if (flag && payload.clinico[k] === true) {
      reasons.push(`${k} presente`);
      status = "NO_CUMPLE";
    }
  });
  (rules.clinico.exclusiones||[]).forEach(x=>{
    if (payload.clinico.exclusiones?.includes(x)) {
      reasons.push(`Exclusión: ${x}`);
      status = "NO_CUMPLE";
    }
  });

  // reviewIf
  (rules.reviewIf||[]).forEach(rule=>{
    const v = payload.clinico[rule.field];
    if (OPS[rule.op]?.(v, rule.value)) {
      reasons.push(`Criterio de revisión: ${rule.field} ${rule.op} ${rule.value}`);
      if (status === "CUMPLE") status = "REVISION";
    }
  });

  if (reasons.length === 0 && status === "CUMPLE") reasons.push("Cumple criterios del MVP");
  return { status, reasons };
}
