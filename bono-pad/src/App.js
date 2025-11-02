import React, { useState } from "react";
import { formatRut, validateRut, cleanRut } from "./utils/rut";

// MVP: imports
import DecisionCard from "./components/DecisionCard";
import Dashboard from "./components/Dashboard";
import padRules, { mapCirugiaKey } from "./rules/padRules";
import { evaluateCase } from "./utils/evaluate";
import { saveCase, getAllCases } from "./store/cases";

const PALETA = {
  primary: "#0FA69C",
  primaryDark: "#0B7F78",
  accent: "#B7D334",
  bgSoft: "#F2F8F8",
  ink: "#103B3B"
};

const FONASA_TRAMOS = ["A", "B", "C", "D"];
const RIESGO_ASA = ["ASA I", "ASA II", "ASA III", "ASA IV", "ASA V"];
const CIRUGIAS_EJEMPLO = [
  "Colecistectomía",
  "Hernia inguinal",
  "Histerectomía"
];

// helpers MVP
function calcDiasDesde(isoDate) {
  if (!isoDate) return 999;
  const ms = Date.now() - new Date(isoDate).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export default function App() {
  const [data, setData] = useState({
    // administrativos
    nombre: "",
    rut: "",
    tramo: "",
    diagnostico: "",
    codigoPad: "",
    cirugia: "",
    prestadorConvenio: false,
    fechaOrden: "",
    // clínicos
    riesgo: "",
    antecedentes: "",
    edad: "",
    peso: "",
    altura: "",
    embarazo: false,
    comorbilidadDescompensada: false,
    alergiaAnestesiaSevera: false,
    exclusiones: [],
    // legal
    consent: false
  });

  const [touched, setTouched] = useState({});
  const [enviado, setEnviado] = useState(null);
  const [cases, setCases] = useState(() => getAllCases());

  // IMC derivado
  const imc = (() => {
    const p = parseFloat(data.peso);
    const t = parseFloat(data.altura) / 100;
    return p > 0 && t > 0 ? +(p / (t * t)).toFixed(1) : null;
  })();

  function onChange(e) {
    const { name, value, type, checked } = e.target;

    // manejo especial de 'exclusiones' (lista de checkboxes)
    if (name === "exclusiones") {
      const opt = e.target.getAttribute("data-opt");
      const set = new Set(data.exclusiones || []);
      if (checked) set.add(opt);
      else set.delete(opt);
      setData(prev => ({ ...prev, exclusiones: Array.from(set) }));
      return;
    }

    let v = type === "checkbox" ? checked : value;

    // RUT formateado en vivo
    if (name === "rut") {
      const limpio = cleanRut(v);
      v = formatRut(limpio);
    }

    setData(prev => ({ ...prev, [name]: v }));
  }

  function onBlur(e) {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  }

  function validar() {
    const errs = {};
    // base
    if (!data.nombre.trim()) errs.nombre = "Ingresa el nombre completo.";
    if (!data.rut.trim()) errs.rut = "Ingresa el RUT.";
    else if (!validateRut(data.rut)) errs.rut = "RUT no válido.";
    if (!data.tramo) errs.tramo = "Selecciona tramo FONASA.";
    if (!data.diagnostico.trim()) errs.diagnostico = "Ingresa el diagnóstico.";
    if (!data.codigoPad.trim()) errs.codigoPad = "Ingresa el código PAD.";
    if (!data.cirugia) errs.cirugia = "Selecciona una cirugía.";
    if (!data.riesgo) errs.riesgo = "Selecciona riesgo ASA.";
    if (!data.consent) errs.consent = "Debes aceptar el consentimiento.";
    // MVP
    if (!data.fechaOrden) errs.fechaOrden = "Ingresa la fecha de la orden médica.";
    if (!data.edad) errs.edad = "Ingresa la edad.";
    else if (parseInt(data.edad, 10) < 0) errs.edad = "Edad no válida.";
    if (data.peso && parseFloat(data.peso) <= 0) errs.peso = "Peso no válido.";
    if (data.altura && parseFloat(data.altura) <= 0) errs.altura = "Altura no válida.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validar();
    setTouched({
      nombre: true, rut: true, tramo: true, diagnostico: true,
      codigoPad: true, cirugia: true, riesgo: true, antecedentes: true, consent: true,
      fechaOrden: true, edad: true, peso: !!data.peso, altura: !!data.altura
    });
    if (Object.keys(errs).length !== 0) {
      setEnviado(null);
      return;
    }

    const key = mapCirugiaKey(data.cirugia);
    const rules = key ? padRules[key] : null;

    const payload = {
      admin: {
        rut: cleanRut(data.rut),
        tramo: data.tramo,
        codigoPad: data.codigoPad.trim(),
        prestadorConvenio: !!data.prestadorConvenio,
        diasOrden: calcDiasDesde(data.fechaOrden)
      },
      clinico: {
        edad: parseInt(data.edad, 10),
        imc: imc ?? 0,
        embarazo: !!data.embarazo,
        comorbilidadDescompensada: !!data.comorbilidadDescompensada,
        alergiaAnestesiaSevera: !!data.alergiaAnestesiaSevera,
        exclusiones: data.exclusiones || []
      }
    };

    let result = { status: "REVISION", reasons: ["Falta selección de cirugía"] };
    if (rules) result = evaluateCase(rules, payload);

    // registro del caso
    const rec = {
      id: (crypto && crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
      tsInicio: Date.now(),
      tsCierre: Date.now(),
      cirugia: data.cirugia,
      admin: payload.admin,
      clinico: payload.clinico,
      resultado: result
    };
    saveCase(rec);
    setCases(prev => [rec, ...prev]);

    // resumen visible
    setEnviado({
      ...data,
      rut_limpio: cleanRut(data.rut),
      imc,
      resultado: result
    });
  }

  const errs = validar();

  return (
    <div style={{ minHeight: "100vh", background: "white", color: PALETA.ink }}>
      {/* Header */}
      <header style={{
        background: `linear-gradient(180deg, ${PALETA.primary} 0%, ${PALETA.primaryDark} 100%)`,
        color: "white"
      }}>
        <div className="container header">
          <div className="brand">
            <span className="logoHeart">❤</span>
            <span className="brandText">RedSalud</span>
          </div>
        </div>
      </header>

      {/* Hero / Banner */}
      <section className="hero" style={{ background: PALETA.bgSoft }}>
        <div className="container heroGrid">
          <div className="heroText">
            <div className="chip">Diagnóstico PAD</div>
            <h1>Tu evaluación <span className="emph">completa</span></h1>
            <p>
              Plataforma interna para ingreso y validación de <strong>Bonos PAD</strong>.
              Captura de datos administrativos y médicos con trazabilidad.
            </p>
          </div>
          <div className="heroCard">
            <FormPad
              data={data}
              errs={errs}
              touched={touched}
              imc={imc}
              onChange={onChange}
              onBlur={onBlur}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </section>

      {/* Resultado explicable */}
      {enviado?.resultado && (
        <section className="container" style={{ marginBlock: 28 }}>
          <DecisionCard result={enviado.resultado} />
        </section>
      )}

      {/* Resumen JSON */}
      {enviado && (
        <section className="container" style={{ marginBlock: 28 }}>
          <h3 style={{ marginBottom: 8 }}>Resumen del envío</h3>
          <pre className="jsonBox">{JSON.stringify(enviado, null, 2)}</pre>
        </section>
      )}

      {/* Tablero MVP */}
      <Dashboard cases={cases} />

      <footer className="footer">
        <div className="container">
          <span>© {new Date().getFullYear()} RedSalud — Demo académica BONO PAD</span>
        </div>
      </footer>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Field({ label, error, touched, children, required }) {
  return (
    <div className={`field ${error && touched ? "field-error" : ""}`} style={{ marginBottom: 12 }}>
      <label className="label">
        {label} {required ? <span className="req">*</span> : null}
      </label>
      {children}
      {error && touched ? <div className="errorMsg">{error}</div> : null}
    </div>
  );
}

function Box({ title, children }) {
  return (
    <div
      style={{
        background: "#F2F8F8",
        border: "1px solid #DCEAEA",
        borderRadius: 12,
        padding: 12,
        display: "grid",
        rowGap: 4
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}


/* ---------- Formulario ---------- */

function FormPad({ data, errs, touched, imc, onChange, onBlur, onSubmit }) {
  return (
    <form className="card" onSubmit={onSubmit} noValidate>
      <h2 className="cardTitle">Formulario Bono PAD</h2>

      <h3 className="sectionTitle" style={{ marginTop: 16 }}>Datos administrativos</h3>

      <Field label="Nombre completo" error={errs.nombre} touched={touched.nombre} required>
        <input
          type="text"
          name="nombre"
          value={data.nombre}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Nombre y apellidos"
          className="input"
        />
      </Field>

      <Field label="RUT" error={errs.rut} touched={touched.rut} required>
        <input
          type="text"
          name="rut"
          inputMode="text"
          value={data.rut}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="12.345.678-5"
          className="input"
        />
      </Field>

      <div className="grid2" style={{ gap: 16 }}>
        <Field label="Tramo FONASA" error={errs.tramo} touched={touched.tramo} required>
          <select
            name="tramo"
            value={data.tramo}
            onChange={onChange}
            onBlur={onBlur}
            className="input"
          >
            <option value="">Selecciona…</option>
            {FONASA_TRAMOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>

        <Field label="Código PAD" error={errs.codigoPad} touched={touched.codigoPad} required>
          <input
            type="text"
            name="codigoPad"
            value={data.codigoPad}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="p.ej. 2501025"
            className="input"
          />
        </Field>
      </div>

      <Field label="Diagnóstico" error={errs.diagnostico} touched={touched.diagnostico} required>
        <input
          type="text"
          name="diagnostico"
          value={data.diagnostico}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Dx confirmado / CIE10"
          className="input"
        />
      </Field>

      <div className="grid2" style={{ gap: 16 }}>
        <Field label="Fecha de orden médica" error={errs.fechaOrden} touched={touched.fechaOrden} required>
          <input
            type="date"
            name="fechaOrden"
            value={data.fechaOrden}
            onChange={onChange}
            onBlur={onBlur}
            className="input"
          />
        </Field>

        <div className={`field ${errs.prestadorConvenio && touched.prestadorConvenio ? "field-error" : ""}`}>
          <label className="label">Prestador en convenio PAD</label>
          <label className="row" style={{ gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              name="prestadorConvenio"
              checked={data.prestadorConvenio}
              onChange={onChange}
              onBlur={onBlur}
            />
            <span>Confirmado</span>
          </label>
        </div>
      </div>

      <h3 className="sectionTitle" style={{ marginTop: 16 }}>Datos médicos</h3>

      <div className="grid2" style={{ gap: 16 }}>
        <Field label="Cirugía" error={errs.cirugia} touched={touched.cirugia} required>
          <select
            name="cirugia"
            value={data.cirugia}
            onChange={onChange}
            onBlur={onBlur}
            className="input"
          >
            <option value="">Selecciona…</option>
            {CIRUGIAS_EJEMPLO.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Riesgo (ASA)" error={errs.riesgo} touched={touched.riesgo} required>
          <select
            name="riesgo"
            value={data.riesgo}
            onChange={onChange}
            onBlur={onBlur}
            className="input"
          >
            <option value="">Selecciona…</option>
            {RIESGO_ASA.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>

      {/* Fila: Edad + (Peso/Talla/IMC) */}
      <div className="grid2" style={{ gap: 16 }}>
        <Field label="Edad" error={errs.edad} touched={touched.edad} required>
          <input
            type="number"
            name="edad"
            value={data.edad}
            onChange={onChange}
            onBlur={onBlur}
            className="input"
            min={0}
            placeholder="Años"
          />
        </Field>

        <div>
          <div className="grid2" style={{ gap: 12 }}>
            <Field label="Peso (kg)" error={errs.peso} touched={touched.peso}>
              <input
                type="number"
                name="peso"
                value={data.peso}
                onChange={onChange}
                onBlur={onBlur}
                className="input"
                step="0.1"
                placeholder="Ej. 72.5"
              />
            </Field>
            <Field label="Altura (cm)" error={errs.altura} touched={touched.altura}>
              <input
                type="number"
                name="altura"
                value={data.altura}
                onChange={onChange}
                onBlur={onBlur}
                className="input"
                placeholder="Ej. 170"
              />
            </Field>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#2A5555" }}>
            IMC: {imc ?? "-"}
          </div>
        </div>
      </div>

     {/* Fila: Condiciones prohibidas + Exclusiones en tarjetas */}
<div className="grid2" style={{ gap: 16, marginTop: 8 }}>
  <Box title="Condiciones prohibidas">
    {(() => {
      const checkRowStyle = { display: "flex", alignItems: "center", gap: 8, margin: "6px 0" };
      return (
        <>
          <label style={checkRowStyle}>
            <input type="checkbox" name="embarazo" checked={data.embarazo} onChange={onChange} />
            <span>Embarazo</span>
          </label>
          <label style={checkRowStyle}>
            <input
              type="checkbox"
              name="comorbilidadDescompensada"
              checked={data.comorbilidadDescompensada}
              onChange={onChange}
            />
            <span>Comorbilidad descompensada</span>
          </label>
          <label style={checkRowStyle}>
            <input
              type="checkbox"
              name="alergiaAnestesiaSevera"
              checked={data.alergiaAnestesiaSevera}
              onChange={onChange}
            />
            <span>Alergia a anestesia severa</span>
          </label>
        </>
      );
    })()}
  </Box>

  <Box title="Exclusiones específicas">
    {(() => {
      const checkRowStyle = { display: "flex", alignItems: "center", gap: 8, margin: "6px 0" };
      return (
        <>
          {["sepsis No Controlada", "sospecha Cancer Activo"].map(opt => (
            <label key={opt} style={checkRowStyle}>
              <input
                type="checkbox"
                name="exclusiones"
                data-opt={opt}
                checked={(data.exclusiones || []).includes(opt)}
                onChange={onChange}
              />
              <span>{opt}</span>
            </label>
          ))}
        </>
      );
    })()}
  </Box>
</div>


      <Field label="Antecedentes (resumen)" error={errs.antecedentes} touched={touched.antecedentes}>
        <textarea
          name="antecedentes"
          value={data.antecedentes}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="HTA, DM2, anticoagulación, alergias, etc."
          rows={3}
          className="input"
        />
      </Field>

      <div className={`consent ${errs.consent && touched.consent ? "field-error" : ""}`} style={{ marginTop: 8 }}>
        <label className="consentLabel">
          <input
            type="checkbox"
            name="consent"
            checked={data.consent}
            onChange={onChange}
            onBlur={onBlur}
          />
          <span>Acepto declaración de veracidad y autorización de uso interno de datos.</span>
        </label>
        {errs.consent && touched.consent ? (
          <div className="errorMsg">{errs.consent}</div>
        ) : null}
      </div>

      <button type="submit" className="btnPrimary" style={{ marginTop: 8 }}>Guardar solicitud</button>
      <p className="footNote">*Valores y precio mostrados son sólo decorativos para mantener el estilo visual.</p>
    </form>
  );
}
