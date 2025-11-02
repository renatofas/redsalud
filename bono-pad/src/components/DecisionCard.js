import React from "react";

const COLOR = { CUMPLE: "#2e7d32", NO_CUMPLE: "#c62828", REVISION: "#ef6c00" };

export default function DecisionCard({ result }) {
  if (!result) return null;

  const boxStyle = {
    border: `1px solid ${COLOR[result.status]}`,
    borderRadius: 12,
    padding: 16,
    marginTop: 16
  };

  const title = React.createElement(
    "div",
    { style: { fontWeight: 700, marginBottom: 8 } },
    "Resultado: ",
    React.createElement("span", { style: { color: COLOR[result.status] } }, result.status)
  );

  const listItems = (result.reasons || []).map((r, i) =>
    React.createElement("li", { key: i }, r)
  );

  const list = React.createElement("ul", { style: { margin: 0, paddingLeft: 18 } }, listItems);

  return React.createElement("div", { style: boxStyle }, title, list);
}
