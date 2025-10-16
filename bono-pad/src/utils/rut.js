// Utilidades RUT Chile (formateo y validación) – solo JS
export function cleanRut(value) {
  return (value || "").replace(/[^0-9kK]/g, "").toUpperCase();
}

export function formatRut(value) {
  const v = cleanRut(value);
  if (!v) return "";
  const body = v.slice(0, -1);
  const dv = v.slice(-1);
  let rev = body.split("").reverse().join("");
  let out = "";
  for (let i = 0; i < rev.length; i++) {
    out += rev[i];
    if ((i + 1) % 3 === 0 && i + 1 !== rev.length) out += ".";
  }
  out = out.split("").reverse().join("");
  return body ? `${out}-${dv}` : v;
}

export function validateRut(value) {
  const v = cleanRut(value);
  if (v.length < 2) return false;
  const body = v.slice(0, -1);
  let dv = v.slice(-1);

  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const calc = res === 11 ? "0" : res === 10 ? "K" : String(res);
  return calc === dv;
}
