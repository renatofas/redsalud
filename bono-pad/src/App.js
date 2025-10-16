import React, { useState } from "react";
import { formatRut, validateRut, cleanRut } from "./utils/rut";

const PALETA = {
  primary: "#0FA69C",     // teal RedSalud
  primaryDark: "#0B7F78",
  accent: "#B7D334",      // verde lima (etiqueta/precio)
  bgSoft: "#F2F8F8",      // fondo secciones
  ink: "#103B3B"          // texto oscuro verdoso
};

const FONASA_TRAMOS = ["A", "B", "C", "D"];
const RIESGO_ASA = ["ASA I", "ASA II", "ASA III", "ASA IV", "ASA V"];
const CIRUGIAS_EJEMPLO = [
  "Colecistectomía",
  "Hernia inguinal",
  "Histerectomía",
  "Amigdalectomía",
  "Artroscopia de rodilla",
  "Cataratas"
];

export default function App() {
  const [data, setData] = useState({
    nombre: "",
    rut: "",
    tramo: "",
    diagnostico: "",
    codigoPad: "",
    cirugia: "",
    riesgo: "",
    antecedentes: "",
    consent: false
  });

  const [touched, setTouched] = useState({});
  const [enviado, setEnviado] = useState(null);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;

    // Formateo en vivo del RUT
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
    if (!data.nombre.trim()) errs.nombre = "Ingresa el nombre completo.";
    if (!data.rut.trim()) errs.rut = "Ingresa el RUT.";
    else if (!validateRut(data.rut)) errs.rut = "RUT no válido.";
    if (!data.tramo) errs.tramo = "Selecciona tramo FONASA.";
    if (!data.diagnostico.trim()) errs.diagnostico = "Ingresa el diagnóstico.";
    if (!data.codigoPad.trim()) errs.codigoPad = "Ingresa el código PAD.";
    if (!data.cirugia) errs.cirugia = "Selecciona una cirugía.";
    if (!data.riesgo) errs.riesgo = "Selecciona riesgo ASA.";
    if (!data.consent) errs.consent = "Debes aceptar el consentimiento.";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validar();
    setTouched({
      nombre: true, rut: true, tramo: true, diagnostico: true,
      codigoPad: true, cirugia: true, riesgo: true, antecedentes: true, consent: true
    });
    if (Object.keys(errs).length === 0) {
      setEnviado({
        ...data,
        rut_limpio: cleanRut(data.rut)
      });
      // aquí podrías hacer fetch/axios al backend
    } else {
      setEnviado(null);
    }
  }

  const errs = validar();

  return (
    <div style={{ minHeight: "100vh", background: "white", color: PALETA.ink }}>
      {/* Header estilo RedSalud */}
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
              onChange={onChange}
              onBlur={onBlur}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </section>

      {/* Resumen JSON */}
      {enviado && (
        <section className="container" style={{ marginBlock: 28 }}>
          <h3 style={{ marginBottom: 8 }}>Resumen del envío</h3>
          <pre className="jsonBox">{JSON.stringify(enviado, null, 2)}</pre>
        </section>
      )}

      <footer className="footer">
        <div className="container">
          <span>© {new Date().getFullYear()} RedSalud — Demo académica BONO PAD</span>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, error, touched, children, required }) {
  return (
    <div className={`field ${error && touched ? "field-error" : ""}`}>
      <label className="label">
        {label} {required ? <span className="req">*</span> : null}
      </label>
      {children}
      {error && touched ? <div className="errorMsg">{error}</div> : null}
    </div>
  );
}

function FormPad({ data, errs, touched, onChange, onBlur, onSubmit }) {
  return (
    <form className="card" onSubmit={onSubmit} noValidate>
      <h2 className="cardTitle">Formulario Bono PAD</h2>

      <h3 className="sectionTitle">Datos administrativos</h3>

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

      <div className="grid2">
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

      <h3 className="sectionTitle">Datos médicos</h3>

      <div className="grid2">
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

      <div className={`consent ${errs.consent && touched.consent ? "field-error" : ""}`}>
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

      <button type="submit" className="btnPrimary">Guardar solicitud</button>
      <p className="footNote">*Valores y precio mostrados son sólo decorativos para mantener el estilo visual.</p>
    </form>
  );
}
