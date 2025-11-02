// src/rules/padRules.js
const padRules = {
  COLECISTECTOMIA: {
    codigoPad: ["2501025"], // placeholder MVP
    admin: { tramosPermitidos: ["B","C","D"], ordenVigenciaDias: 30, prestadorEnConvenio: true },
    clinico: {
      minEdad: 18, maxIMC: 40,
      prohibidos: { embarazo: true, comorbilidadDescompensada: true, alergiaAnestesiaSevera: true },
      exclusiones: ["sepsis No Controlada","sospecha Cancer Activo"]
    },
    reviewIf: [{ field:"imc", op:">", value:35 }, { field:"edad", op:">", value:70 }]
  },
  HERNIA_INGUINAL: {
    codigoPad: ["2502001"],
    admin: { tramosPermitidos: ["B","C","D"], ordenVigenciaDias: 30, prestadorEnConvenio: true },
    clinico: {
      minEdad: 18, maxIMC: 42,
      prohibidos: { embarazo:true, comorbilidadDescompensada:true, alergiaAnestesiaSevera:true },
      exclusiones: []
    },
    reviewIf: [{ field:"imc", op:">", value:37 }]
  },
  HISTERECTOMIA: {
    codigoPad: ["2503007"],
    admin: { tramosPermitidos: ["B","C","D"], ordenVigenciaDias: 30, prestadorEnConvenio: true },
    clinico: {
      minEdad: 18, maxIMC: 38,
      prohibidos: { embarazo:true, comorbilidadDescompensada:true, alergiaAnestesiaSevera:true },
      exclusiones: []
    },
    reviewIf: [{ field:"edad", op:">", value:65 }]
  }
};

// mapea el label del select actual a la key de arriba
export const mapCirugiaKey = (label) => {
  const t = (label || "").toLowerCase();
  if (t.includes("colecist")) return "COLECISTECTOMIA";
  if (t.includes("hernia")) return "HERNIA_INGUINAL";
  if (t.includes("hister")) return "HISTERECTOMIA";
  return null;
};

export default padRules;
