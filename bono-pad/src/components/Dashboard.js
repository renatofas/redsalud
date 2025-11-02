import React from "react";
import { kpis } from "../store/cases";

function Tile({ label, value }) {
  return React.createElement(
    "div",
    { style: { border: "1px solid #DCEAEA", borderRadius: 12, padding: 12 } },
    React.createElement(
      "div",
      { style: { fontSize: 12, color: "#2A5555" } },
      label
    ),
    React.createElement(
      "div",
      { style: { fontWeight: 700, fontSize: 20 } },
      value
    )
  );
}

function Th({ children }) {
  return React.createElement("th", { style: { textAlign: "left", padding: 10 } }, children);
}
function Td({ children }) {
  return React.createElement("td", { style: { padding: 10 } }, children);
}

export default function Dashboard({ cases }) {
  const m = kpis(cases || []);
  const fmt = (ms) => `${Math.round((ms || 0) / 1000)}s`;

  const header = React.createElement(
    "h3",
    { style: { marginBottom: 8 } },
    "Tablero (MVP)"
  );

  const grid = React.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(5,1fr)",
        gap: 12,
        marginBottom: 12
      }
    },
    React.createElement(Tile, { label: "% Cumple", value: `${m.pctCumple}%` }),
    React.createElement(Tile, { label: "% No cumple", value: `${m.pctNoCumple}%` }),
    React.createElement(Tile, { label: "% Revisión", value: `${m.pctRevision}%` }),
    React.createElement(Tile, { label: "% Auto (sin intervención)", value: `${m.pctAuto}%` }),
    React.createElement(Tile, { label: "Mediana validación", value: fmt(m.medianaValidacionMs) })
  );

  const thead = React.createElement(
    "thead",
    { style: { background: "#F2F8F8" } },
    React.createElement(
      "tr",
      null,
      React.createElement(Th, null, "Fecha"),
      React.createElement(Th, null, "Cirugía"),
      React.createElement(Th, null, "RUT"),
      React.createElement(Th, null, "Tramo"),
      React.createElement(Th, null, "Estado"),
      React.createElement(Th, null, "Razones"),
      React.createElement(Th, null, "Duración")
    )
  );

  const rows = (cases || []).map((c) =>
    React.createElement(
      "tr",
      { key: c.id, style: { borderTop: "1px solid #DCEAEA" } },
      React.createElement(Td, null, new Date(c.tsInicio).toLocaleString()),
      React.createElement(Td, null, c.cirugia),
      React.createElement(Td, null, (c.admin && c.admin.rut) || ""),
      React.createElement(Td, null, (c.admin && c.admin.tramo) || ""),
      React.createElement(Td, null, c.resultado && c.resultado.status),
      React.createElement(Td, null, (c.resultado && (c.resultado.reasons || []).join(" · ")) || ""),
      React.createElement(
        Td,
        null,
        Math.round((((c.tsCierre || c.tsInicio) - c.tsInicio) || 0) / 1000) + "s"
      )
    )
  );

  const tbody = React.createElement("tbody", null, rows);

  const table = React.createElement(
    "div",
    { style: { border: "1px solid #DCEAEA", borderRadius: 12, overflow: "hidden" } },
    React.createElement(
      "table",
      { style: { width: "100%", borderCollapse: "collapse" } },
      thead,
      tbody
    )
  );

  return React.createElement(
    "section",
    { className: "container", style: { marginBlock: 28 } },
    header,
    grid,
    table
  );
}
