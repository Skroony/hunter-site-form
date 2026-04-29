import { useState, useEffect } from "react";

// ── Brand tokens ──────────────────────────────────────────────
const G = {
  dark:   "#1f1f1f",
  mid:    "#c8102e",
  pale:   "#fef2f2",
  text:   "#1A1A1A",
  muted:  "#5a5a5a",
  border: "#e2d3d3",
  white:  "#FFFFFF",
  warn:   "#b91c1c",
  gray:   "#4A4A4A",
};

// ── UI atoms ──────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label style={{ display:"block", fontFamily:"'Barlow',sans-serif", fontWeight:600,
    fontSize:13, color:G.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>
    {children}{required && <span style={{ color:G.warn, marginLeft:3 }}>*</span>}
  </label>
);

const Input = ({ value, onChange, type="text", error, style={} }) => (
  <input type={type} value={value} onChange={onChange}
    style={{ width:"100%", boxSizing:"border-box", padding:"11px 14px",
      border:`1.5px solid ${error ? G.warn : G.border}`, borderRadius:8,
      fontFamily:"'Barlow',sans-serif", fontSize:15, color:G.text,
      background: error ? "#fff5f5" : G.white, outline:"none",
      transition:"border-color .2s", ...style }} />
);

const Textarea = ({ value, onChange, rows=3 }) => (
  <textarea value={value} onChange={onChange} rows={rows}
    style={{ width:"100%", boxSizing:"border-box", padding:"11px 14px",
      border:`1.5px solid ${G.border}`, borderRadius:8,
      fontFamily:"'Barlow',sans-serif", fontSize:15, color:G.text,
      background:G.white, outline:"none", resize:"vertical" }} />
);

const RadioOpt = ({ label, name, value, checked, onChange }) => (
  <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer",
    padding:"10px 14px", borderRadius:8, border:`1.5px solid ${checked ? G.mid : G.border}`,
    background: checked ? G.pale : G.white, fontFamily:"'Barlow',sans-serif",
    fontSize:15, color:G.text, transition:"all .15s", userSelect:"none" }}>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange}
      style={{ accentColor:G.mid, width:17, height:17 }} />
    {label}
  </label>
);

const CheckOpt = ({ label, checked, onChange }) => (
  <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer",
    padding:"10px 14px", borderRadius:8, border:`1.5px solid ${checked ? G.mid : G.border}`,
    background: checked ? G.pale : G.white, fontFamily:"'Barlow',sans-serif",
    fontSize:15, color:G.text, transition:"all .15s", userSelect:"none" }}>
    <input type="checkbox" checked={checked} onChange={onChange}
      style={{ accentColor:G.mid, width:17, height:17 }} />
    {label}
  </label>
);

const Field        = ({ children, style={} }) => <div style={{ marginBottom:22, ...style }}>{children}</div>;
const Row          = ({ children, cols, gap=16 }) => (
  <div style={{ display:"grid", gridTemplateColumns: cols||"repeat(auto-fit,minmax(160px,1fr))", gap }}>{children}</div>
);
const Note         = ({ children }) => (
  <div style={{ background:G.pale, border:`1px solid ${G.border}`, borderRadius:8,
    padding:"12px 16px", fontFamily:"'Barlow',sans-serif", fontSize:13, color:G.mid,
    marginBottom:22, display:"flex", gap:10, alignItems:"flex-start" }}>
    <span>ℹ️</span><span>{children}</span>
  </div>
);
const SectionTitle = ({ children }) => (
  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
    <div style={{ width:4, height:32, background:G.mid, borderRadius:2 }} />
    <h2 style={{ margin:0, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700,
      fontSize:22, color:G.dark, textTransform:"uppercase", letterSpacing:"0.05em" }}>{children}</h2>
  </div>
);
const ErrorMsg     = ({ msg }) => msg
  ? <p style={{ margin:"4px 0 0", color:G.warn, fontSize:12, fontFamily:"'Barlow',sans-serif" }}>{msg}</p>
  : null;
const SubHeading   = ({ children, optional }) => (
  <p style={{ margin:"0 0 14px", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700,
    fontSize:16, color:G.dark, textTransform:"uppercase", letterSpacing:"0.06em" }}>
    {children}{optional && <span style={{ fontWeight:400, color:G.muted, textTransform:"none" }}> (optional)</span>}
  </p>
);
const Divider          = () => <div style={{ borderTop:`1px solid ${G.border}`, margin:"24px 0" }} />;
const ConditionalBox   = ({ children }) => (
  <div style={{ background:G.pale, borderRadius:8, padding:14,
    border:`1px solid ${G.border}`, marginTop:10 }}>{children}</div>
);

// ── Constants ─────────────────────────────────────────────────
const STEPS      = ["Contact Info","Site Access","Fan Details","Installation","Controls","Electrical","Review & Sign"];
const FAN_KEYS   = ["TITAN","ECO","XP","DDI","TRAK_EDGE"];
const FAN_LABELS = { TITAN:"Titan", ECO:"ECO", XP:"XP", DDI:"DDI", TRAK_EDGE:"Trak Edge" };
const DIAMS      = ["5ft","6ft","7ft","8ft","10ft","12ft","14ft","16ft","18ft","20ft","24ft"];
const VOLTS      = ["120V/1PH","240V/1PH","240V/3PH","480V/3PH"];
const DOWNRODS   = [
  "Standard (Adjustable): 2.5 ft – 4 ft",
  "Standard (Adjustable): 4.5 ft – 6 ft",
  "Standard (Adjustable): 6.5 ft – 10 ft",
  "Rigid (Fixed): 2 ft",
  "Rigid (Fixed): 3 ft",
  "Rigid (Fixed): 4 ft",
];
const STRUCTURES = ["I-Beam","Glulam Beam","Wood Beam","Steel Truss","Z-Purlin","Other"];
const LIFTS      = ["Scissor Lift","All Terrain Lift","Boom Lift","Articulating Lift"];

// Each fan configuration is a flat object — model is chosen per config
const BLANK_CONFIG = () => ({ model:"", qty:"", diameter:"", voltage:"", downrod:"" });

// ── Default state ─────────────────────────────────────────────
const defaultForm = {
  companyName:"", siteStreet:"", siteCity:"", siteState:"", siteZip:"",
  salesRep:"", quoteNumber:"",
  contactRole:"primary",
  otherName:"", otherEmail:"", otherPhone:"",
  primaryFirst:"", primaryLast:"", primaryPhone:"", primaryEmail:"",
  secondaryFirst:"", secondaryLast:"", secondaryPhone:"", secondaryEmail:"",

  accessDays:{ Mon:false,Tue:false,Wed:false,Thu:false,Fri:false,Sat:false,Sun:false },
  accessTimes:"",
  afterHours:"no", afterHoursDetails:"",
  preferredMonths:"",
  safetyBrief:"no", safetyDuration:"",
  ppe:"no", ppeList:"",
  paperwork:"no", paperworkList:"",

  // Flat array — each entry has its own model, qty, diameter, voltage, downrod
  fanConfigs: [],
  mountingKit:{ Glulam:false, WoodBeam:false },

  ceilingHeight:"", hunterLift:"no", liftType:"",
  obstructions:"no", obstructionDetails:"",
  ceilingStructure:"", ceilingOther:"",
  existingFans:"no", existingFansDetails:"",

  controls11:"yes",
  controllerTypes:{
    "HVLS Analog (DDI Only)":false,"HVLS 350 Series":false,
    "HVLS 500 Series":false,"HVLS 700E Series":false,
    "Trak Edge Basic Wall Controller":false,
    "Trak Edge 3\" Digital Controller":false,
    "Trak Edge 4\" Digital Controller":false,
  },
  controllerQty:"",
  distanceExceeds:"no", distanceRange:"",
  daisyChain:"not_chained",

  spareBreakers:"unsure", breakerDetails:"", spaceToAdd:"",
  panelManufacturer:"",
  conduitRequired:"no", conduitType:"",
  fireWire:"",

  additionalNotes:"",
  permitAck:false, mechAck:false,
  signatureName:"",
};

// ═════════════════════════════════════════════════════════════
export default function App() {
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState(defaultForm);
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  // ── Stable setters ────────────────────────────────────────
  const set       = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setCheck  = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.checked }));
  const setVal    = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setNested = (key, subkey) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [key]: { ...f[key], [subkey]: val } }));
  };

  // ── Fan config helpers (flat array) ───────────────────────
  const addFanConfig    = ()          => setForm(f => ({ ...f, fanConfigs: [...f.fanConfigs, BLANK_CONFIG()] }));
  const removeFanConfig = (idx)       => setForm(f => ({ ...f, fanConfigs: f.fanConfigs.filter((_,i) => i !== idx) }));
  const updateFanConfig = (idx, field, val) => setForm(f => {
    const configs = [...f.fanConfigs];
    configs[idx]  = { ...configs[idx], [field]: val };
    return { ...f, fanConfigs: configs };
  });

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (step === 0) {
      if (!form.companyName.trim())  e.companyName  = "Required";
      if (!form.siteStreet.trim())   e.siteStreet   = "Required";
      if (!form.siteCity.trim())     e.siteCity     = "Required";
      if (!form.siteState.trim())    e.siteState    = "Required";
      if (!form.siteZip.trim())      e.siteZip      = "Required";
      if (!form.salesRep.trim())     e.salesRep     = "Required";
      if (!form.quoteNumber.trim())  e.quoteNumber  = "Required";
      if (!form.primaryFirst.trim()) e.primaryFirst = "Required";
      if (!form.primaryLast.trim())  e.primaryLast  = "Required";
      if (!form.primaryPhone.trim()) e.primaryPhone = "Required";
      if (!form.primaryEmail.trim()) e.primaryEmail = "Required";
      if (form.contactRole === "other") {
        if (!form.otherName.trim())  e.otherName  = "Required";
        if (!form.otherEmail.trim()) e.otherEmail = "Required";
      }
    }

    if (step === 1) {
      if (!Object.values(form.accessDays).some(Boolean)) e.accessDays = "Select at least one day";
      if (!form.accessTimes.trim())                       e.accessTimes = "Required";
      if (form.afterHours  === "yes" && !form.afterHoursDetails.trim()) e.afterHoursDetails = "Required — please specify days and times";
      if (form.safetyBrief === "yes" && !form.safetyDuration.trim())   e.safetyDuration    = "Required — please describe the brief";
      if (form.ppe         === "yes" && !form.ppeList.trim())           e.ppeList           = "Required — please list PPE";
      if (form.paperwork   === "yes" && !form.paperworkList.trim())     e.paperworkList     = "Required — please list required forms";
    }

    if (step === 2) {
      if (form.fanConfigs.length === 0) {
        e.fanConfigs = "Add at least one fan configuration";
      } else {
        form.fanConfigs.forEach((cfg, idx) => {
          if (!cfg.model)                        e[`fan_${idx}_model`]    = "Select a fan model";
          if (!cfg.qty || parseInt(cfg.qty) < 1) e[`fan_${idx}_qty`]      = "Required";
          if (!cfg.diameter)                     e[`fan_${idx}_diameter`] = "Required";
          if (!cfg.voltage)                      e[`fan_${idx}_voltage`]  = "Required";
          if (!cfg.downrod)                      e[`fan_${idx}_downrod`]  = "Required";
        });
      }
    }

    if (step === 3) {
      if (!form.ceilingHeight.trim())  e.ceilingHeight    = "Required";
      if (!form.ceilingStructure)      e.ceilingStructure = "Select ceiling structure type";
      if (form.ceilingStructure === "Other" && !form.ceilingOther.trim()) e.ceilingOther = "Required when Other is selected";
      if (form.obstructions === "yes"  && !form.obstructionDetails.trim()) e.obstructionDetails  = "Required — describe the obstructions";
      if (form.existingFans === "yes"  && !form.existingFansDetails.trim()) e.existingFansDetails = "Required — describe the fans to be removed";
    }

    if (step === 4) {
      if (!Object.values(form.controllerTypes).some(Boolean)) e.controllerTypes = "Select at least one controller";
      if (!form.controllerQty.trim())                          e.controllerQty   = "Required";
      if (form.distanceExceeds === "yes" && !form.distanceRange) e.distanceRange = "Required — select approximate distance";
    }

    if (step === 6) {
      if (!form.permitAck)            e.permitAck     = "Acknowledgement required";
      if (!form.mechAck)              e.mechAck       = "Acknowledgement required";
      if (!form.signatureName.trim()) e.signatureName = "Please enter your full name";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next   = () => { if (validate()) setStep(s => Math.min(s+1, STEPS.length-1)); };
  const back   = () => { setErrors({}); setStep(s => Math.max(s-1, 0)); };
  const submit = () => { if (validate()) setSubmitted(true); };

  // ─────────────────────────────────────────────────────────
  // Steps called as plain functions — not <Components />.
  // Keeps DOM stable across re-renders — required for iOS keyboard fix.
  // ─────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <>
      <SectionTitle>Contact Information</SectionTitle>
      <Note>All fields marked with a red asterisk are required before you can proceed.</Note>

      <Field>
        <Label required>Company Name</Label>
        <Input value={form.companyName} onChange={set("companyName")} error={errors.companyName} />
        <ErrorMsg msg={errors.companyName} />
      </Field>

      <Field>
        <Label required>Installation Site Street Address</Label>
        <Input value={form.siteStreet} onChange={set("siteStreet")} error={errors.siteStreet} />
        <ErrorMsg msg={errors.siteStreet} />
      </Field>

      <Row cols="2fr 1fr 1fr" gap={12}>
        <Field>
          <Label required>City</Label>
          <Input value={form.siteCity} onChange={set("siteCity")} error={errors.siteCity} />
          <ErrorMsg msg={errors.siteCity} />
        </Field>
        <Field>
          <Label required>State</Label>
          <Input value={form.siteState} onChange={set("siteState")} error={errors.siteState} />
          <ErrorMsg msg={errors.siteState} />
        </Field>
        <Field>
          <Label required>ZIP</Label>
          <Input value={form.siteZip} onChange={set("siteZip")} error={errors.siteZip} />
          <ErrorMsg msg={errors.siteZip} />
        </Field>
      </Row>

      <Row>
        <Field>
          <Label required>Sales Representative</Label>
          <Input value={form.salesRep} onChange={set("salesRep")} error={errors.salesRep} />
          <ErrorMsg msg={errors.salesRep} />
        </Field>
        <Field>
          <Label required>Quote / Order Number</Label>
          <Input value={form.quoteNumber} onChange={set("quoteNumber")} error={errors.quoteNumber} />
          <ErrorMsg msg={errors.quoteNumber} />
        </Field>
      </Row>

      <Field>
        <Label>Who is filling out this form?</Label>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[["primary","I am the Primary On-Site Contact"],["secondary","I am the Secondary On-Site Contact"],["other","I am someone else"]].map(([v,l]) => (
            <RadioOpt key={v} name="contactRole" label={l} value={v}
              checked={form.contactRole===v} onChange={() => setVal("contactRole",v)} />
          ))}
        </div>
      </Field>

      {form.contactRole === "other" && (
        <div style={{ background:G.pale, borderRadius:10, padding:18, marginBottom:22 }}>
          <SubHeading>Your Information</SubHeading>
          <Row>
            <Field>
              <Label required>Full Name</Label>
              <Input value={form.otherName} onChange={set("otherName")} error={errors.otherName} />
              <ErrorMsg msg={errors.otherName} />
            </Field>
            <Field>
              <Label required>Email</Label>
              <Input type="email" value={form.otherEmail} onChange={set("otherEmail")} error={errors.otherEmail} />
              <ErrorMsg msg={errors.otherEmail} />
            </Field>
            <Field>
              <Label>Phone</Label>
              <Input type="tel" value={form.otherPhone} onChange={set("otherPhone")} />
            </Field>
          </Row>
        </div>
      )}

      <Divider />
      <SubHeading>Primary On-Site Contact</SubHeading>
      <Row>
        <Field>
          <Label required>First Name</Label>
          <Input value={form.primaryFirst} onChange={set("primaryFirst")} error={errors.primaryFirst} />
          <ErrorMsg msg={errors.primaryFirst} />
        </Field>
        <Field>
          <Label required>Last Name</Label>
          <Input value={form.primaryLast} onChange={set("primaryLast")} error={errors.primaryLast} />
          <ErrorMsg msg={errors.primaryLast} />
        </Field>
      </Row>
      <Row>
        <Field>
          <Label required>Phone</Label>
          <Input type="tel" value={form.primaryPhone} onChange={set("primaryPhone")} error={errors.primaryPhone} />
          <ErrorMsg msg={errors.primaryPhone} />
        </Field>
        <Field>
          <Label required>Email</Label>
          <Input type="email" value={form.primaryEmail} onChange={set("primaryEmail")} error={errors.primaryEmail} />
          <ErrorMsg msg={errors.primaryEmail} />
        </Field>
      </Row>

      <Divider />
      <SubHeading optional>Secondary On-Site Contact</SubHeading>
      <Row>
        <Field><Label>First Name</Label><Input value={form.secondaryFirst} onChange={set("secondaryFirst")} /></Field>
        <Field><Label>Last Name</Label><Input value={form.secondaryLast} onChange={set("secondaryLast")} /></Field>
      </Row>
      <Row>
        <Field><Label>Phone</Label><Input type="tel" value={form.secondaryPhone} onChange={set("secondaryPhone")} /></Field>
        <Field><Label>Email</Label><Input type="email" value={form.secondaryEmail} onChange={set("secondaryEmail")} /></Field>
      </Row>
    </>
  );

  const renderStep1 = () => (
    <>
      <SectionTitle>Installation Site Access</SectionTitle>

      <Field>
        <Label required>Available Access Days</Label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
            <label key={d} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6,
              padding:"10px 16px", borderRadius:8, cursor:"pointer",
              border:`1.5px solid ${form.accessDays[d] ? G.mid : G.border}`,
              background: form.accessDays[d] ? G.pale : G.white,
              fontFamily:"'Barlow',sans-serif", fontWeight:600, fontSize:13,
              color: form.accessDays[d] ? G.mid : G.muted, userSelect:"none" }}>
              <input type="checkbox" checked={form.accessDays[d]} onChange={setNested("accessDays",d)}
                style={{ accentColor:G.mid }} />
              {d}
            </label>
          ))}
        </div>
        <ErrorMsg msg={errors.accessDays} />
      </Field>

      <Field>
        <Label required>Available Access Times</Label>
        <Input value={form.accessTimes} onChange={set("accessTimes")} error={errors.accessTimes} />
        <ErrorMsg msg={errors.accessTimes} />
      </Field>

      <Field>
        <Label>After-hours access required?</Label>
        <Note>Additional charges may apply for times outside 8am–5pm and weekends/holidays.</Note>
        <div style={{ display:"flex", gap:10 }}>
          <RadioOpt name="afterHours" label="Yes" value="yes" checked={form.afterHours==="yes"} onChange={() => setVal("afterHours","yes")} />
          <RadioOpt name="afterHours" label="No"  value="no"  checked={form.afterHours==="no"}  onChange={() => setVal("afterHours","no")} />
        </div>
        {form.afterHours === "yes" && (
          <ConditionalBox>
            <Label required>Specify days and times needed for after-hours access</Label>
            <Textarea value={form.afterHoursDetails} onChange={set("afterHoursDetails")} rows={2} />
            <ErrorMsg msg={errors.afterHoursDetails} />
          </ConditionalBox>
        )}
      </Field>

      <Field>
        <Label>Preferred Months of Installation</Label>
        <Input value={form.preferredMonths} onChange={set("preferredMonths")} />
      </Field>

      <Field>
        <Label>Safety or security brief required?</Label>
        <div style={{ display:"flex", gap:10 }}>
          <RadioOpt name="safetyBrief" label="Yes" value="yes" checked={form.safetyBrief==="yes"} onChange={() => setVal("safetyBrief","yes")} />
          <RadioOpt name="safetyBrief" label="No"  value="no"  checked={form.safetyBrief==="no"}  onChange={() => setVal("safetyBrief","no")} />
        </div>
        {form.safetyBrief === "yes" && (
          <ConditionalBox>
            <Label required>Describe the brief and its duration</Label>
            <Textarea value={form.safetyDuration} onChange={set("safetyDuration")} rows={2} />
            <ErrorMsg msg={errors.safetyDuration} />
          </ConditionalBox>
        )}
      </Field>

      <Field>
        <Label>PPE required?</Label>
        <div style={{ display:"flex", gap:10 }}>
          <RadioOpt name="ppe" label="Yes" value="yes" checked={form.ppe==="yes"} onChange={() => setVal("ppe","yes")} />
          <RadioOpt name="ppe" label="No"  value="no"  checked={form.ppe==="no"}  onChange={() => setVal("ppe","no")} />
        </div>
        {form.ppe === "yes" && (
          <ConditionalBox>
            <Label required>List all required PPE</Label>
            <Textarea value={form.ppeList} onChange={set("ppeList")} rows={2} />
            <ErrorMsg msg={errors.ppeList} />
          </ConditionalBox>
        )}
      </Field>

      <Field>
        <Label>Paperwork or forms required for site access?</Label>
        <div style={{ display:"flex", gap:10 }}>
          <RadioOpt name="paperwork" label="Yes" value="yes" checked={form.paperwork==="yes"} onChange={() => setVal("paperwork","yes")} />
          <RadioOpt name="paperwork" label="No"  value="no"  checked={form.paperwork==="no"}  onChange={() => setVal("paperwork","no")} />
        </div>
        {form.paperwork === "yes" && (
          <ConditionalBox>
            <Label required>List required forms (COI, Certifications, Safety Documents, etc.)</Label>
            <Textarea value={form.paperworkList} onChange={set("paperworkList")} rows={2} />
            <ErrorMsg msg={errors.paperworkList} />
          </ConditionalBox>
        )}
      </Field>
    </>
  );

  const renderStep2 = () => {
    const totalFans = form.fanConfigs.reduce((sum, c) => sum + (parseInt(c.qty) || 0), 0);

    return (
      <>
        <SectionTitle>Fan Details & Mounting</SectionTitle>

        <Note>
          Add one configuration per unique fan setup. Each configuration captures the model, quantity,
          diameter, voltage, and downrod for that group of fans. Add as many configurations as needed
          to cover every fan in the order.
        </Note>

        {/* Error if no configs added yet */}
        {errors.fanConfigs && <ErrorMsg msg={errors.fanConfigs} />}

        {/* Configuration cards */}
        {form.fanConfigs.map((cfg, idx) => (
          <div key={idx} style={{ border:`2px solid ${cfg.model ? G.mid : G.border}`,
            borderRadius:12, padding:20, marginBottom:20, background:"#fafafa",
            transition:"border-color .2s" }}>

            {/* Card header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800,
                fontSize:18, color: cfg.model ? G.mid : G.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                {cfg.model ? `${FAN_LABELS[cfg.model]} — Config ${idx + 1}` : `Configuration ${idx + 1}`}
              </span>
              <button onClick={() => removeFanConfig(idx)}
                style={{ padding:"5px 14px", borderRadius:6, border:`1px solid ${G.border}`,
                  background:G.white, color:G.warn, fontFamily:"'Barlow',sans-serif",
                  fontSize:12, fontWeight:600, cursor:"pointer" }}>
                Remove
              </button>
            </div>

            {/* Fan model selector */}
            <Field>
              <Label required>Fan Model</Label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {FAN_KEYS.map(fk => {
                  const on = cfg.model === fk;
                  return (
                    <button key={fk} onClick={() => updateFanConfig(idx, "model", fk)}
                      style={{ padding:"9px 22px", borderRadius:24,
                        border:`1.5px solid ${on ? G.mid : G.border}`,
                        background: on ? G.mid : G.white, color: on ? G.white : G.text,
                        fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:14,
                        cursor:"pointer", transition:"all .15s" }}>
                      {FAN_LABELS[fk]}
                    </button>
                  );
                })}
              </div>
              <ErrorMsg msg={errors[`fan_${idx}_model`]} />
            </Field>

            {/* Quantity */}
            <Field style={{ maxWidth:160 }}>
              <Label required>Quantity</Label>
              <Input type="number" value={cfg.qty}
                onChange={e => updateFanConfig(idx, "qty", e.target.value)}
                error={errors[`fan_${idx}_qty`]} />
              <ErrorMsg msg={errors[`fan_${idx}_qty`]} />
            </Field>

            {/* Diameter */}
            <Field>
              <Label required>Diameter</Label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {DIAMS.map(d => (
                  <RadioOpt key={d} name={`cfg_${idx}_diam`}
                    label={d.replace("ft"," ft.")} value={d}
                    checked={cfg.diameter === d}
                    onChange={() => updateFanConfig(idx, "diameter", d)} />
                ))}
              </div>
              <ErrorMsg msg={errors[`fan_${idx}_diameter`]} />
            </Field>

            {/* Voltage */}
            <Field>
              <Label required>Voltage / Phase</Label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {VOLTS.map(v => (
                  <RadioOpt key={v} name={`cfg_${idx}_volt`}
                    label={v} value={v}
                    checked={cfg.voltage === v}
                    onChange={() => updateFanConfig(idx, "voltage", v)} />
                ))}
              </div>
              <ErrorMsg msg={errors[`fan_${idx}_voltage`]} />
            </Field>

            {/* Downrod */}
            <Field style={{ marginBottom:0 }}>
              <Label required>Downrod Type / Size</Label>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {DOWNRODS.map(d => (
                  <RadioOpt key={d} name={`cfg_${idx}_rod`}
                    label={d} value={d}
                    checked={cfg.downrod === d}
                    onChange={() => updateFanConfig(idx, "downrod", d)} />
                ))}
              </div>
              <ErrorMsg msg={errors[`fan_${idx}_downrod`]} />
            </Field>
          </div>
        ))}

        {/* Add configuration button */}
        <button onClick={addFanConfig}
          style={{ width:"100%", padding:14, borderRadius:8,
            border:`2px dashed ${G.mid}`, background:"transparent",
            color:G.mid, fontFamily:"'Barlow',sans-serif", fontWeight:700,
            fontSize:15, cursor:"pointer", marginBottom:16 }}>
          + Add Fan Configuration
        </button>

        {/* Running total */}
        {totalFans > 0 && (
          <div style={{ background:G.pale, borderRadius:8, padding:"12px 18px",
            fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:15,
            color:G.mid, marginBottom:22, display:"flex", justifyContent:"space-between" }}>
            <span>Total Fans</span>
            <span>{totalFans}</span>
          </div>
        )}

        {/* Mounting kits */}
        <Field>
          <Label>Special Mounting Kits (if applicable)</Label>
          <div style={{ display:"flex", gap:10 }}>
            <CheckOpt label="Glulam"    checked={form.mountingKit.Glulam}   onChange={setNested("mountingKit","Glulam")} />
            <CheckOpt label="Wood Beam" checked={form.mountingKit.WoodBeam} onChange={setNested("mountingKit","WoodBeam")} />
          </div>
        </Field>
      </>
    );
  };

  const renderStep3 = () => (
    <>
      <SectionTitle>Installation Details</SectionTitle>

      <Field style={{ maxWidth:280 }}>
        <Label required>Ceiling Height (at highest fan mounting point)</Label>
        <Input value={form.ceilingHeight} onChange={set("ceilingHeight")} error={errors.ceilingHeight} />
        <ErrorMsg msg={errors.ceilingHeight} />
      </Field>

      <Field>
        <Label>Will a lift need to be provided?</Label>
        <Note>Customer-provided lifts must meet OSHA Safety Standards. Customer must also provide a ground guide if required.</Note>
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          <RadioOpt name="hunterLift" label="Yes — We will provide"  value="yes" checked={form.hunterLift==="yes"} onChange={() => setVal("hunterLift","yes")} />
          <RadioOpt name="hunterLift" label="No — Customer provides" value="no"  checked={form.hunterLift==="no"}  onChange={() => setVal("hunterLift","no")} />
        </div>
        <Label>Type of lift needed</Label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {LIFTS.map(l => (
            <RadioOpt key={l} name="liftType" label={l} value={l}
              checked={form.liftType===l} onChange={() => setVal("liftType",l)} />
          ))}
        </div>
      </Field>

      <Field>
        <Label required>Ceiling Structure Type</Label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {STRUCTURES.map(s => {
            const on = form.ceilingStructure === s;
            return (
              <button key={s} onClick={() => setVal("ceilingStructure", s)}
                style={{ padding:"10px 20px", borderRadius:24,
                  border:`1.5px solid ${on ? G.mid : G.border}`,
                  background: on ? G.mid : G.white, color: on ? G.white : G.text,
                  fontFamily:"'Barlow',sans-serif", fontWeight:600, fontSize:14,
                  cursor:"pointer", transition:"all .15s" }}>
                {s}
              </button>
            );
          })}
        </div>
        <ErrorMsg msg={errors.ceilingStructure} />
        {form.ceilingStructure === "Other" && (
          <ConditionalBox>
            <Label required>Describe the ceiling type</Label>
            <Input value={form.ceilingOther} onChange={set("ceilingOther")} error={errors.ceilingOther} />
            <ErrorMsg msg={errors.ceilingOther} />
          </ConditionalBox>
        )}
      </Field>

      <Field>
        <Label>Any unmovable obstructions under fan mounting locations?</Label>
        <div style={{ display:"flex", gap:10 }}>
          <RadioOpt name="obstructions" label="Yes" value="yes" checked={form.obstructions==="yes"} onChange={() => setVal("obstructions","yes")} />
          <RadioOpt name="obstructions" label="No"  value="no"  checked={form.obstructions==="no"}  onChange={() => setVal("obstructions","no")} />
        </div>
        {form.obstructions === "yes" && (
          <ConditionalBox>
            <Label required>Describe the obstructions</Label>
            <Textarea value={form.obstructionDetails} onChange={set("obstructionDetails")} rows={2} />
            <ErrorMsg msg={errors.obstructionDetails} />
          </ConditionalBox>
        )}
      </Field>

      <Field>
        <Label>Existing fans to be removed?</Label>
        <div style={{ display:"flex", gap:10 }}>
          <RadioOpt name="existingFans" label="Yes" value="yes" checked={form.existingFans==="yes"} onChange={() => setVal("existingFans","yes")} />
          <RadioOpt name="existingFans" label="No"  value="no"  checked={form.existingFans==="no"}  onChange={() => setVal("existingFans","no")} />
        </div>
        {form.existingFans === "yes" && (
          <ConditionalBox>
            <Label required>How many fans and what type(s)?</Label>
            <Textarea value={form.existingFansDetails} onChange={set("existingFansDetails")} rows={3} />
            <ErrorMsg msg={errors.existingFansDetails} />
          </ConditionalBox>
        )}
      </Field>

      <Note>📸 Please provide supporting photos with your submission (fan placement drawings, existing fans, etc.).</Note>
    </>
  );

  const renderStep4 = () => (
    <>
      <SectionTitle>Communication & Controls</SectionTitle>

      <Field>
        <Label>Will fan controls be 1:1?</Label>
        <div style={{ display:"flex", gap:10 }}>
          <RadioOpt name="controls11" label="Yes" value="yes" checked={form.controls11==="yes"} onChange={() => setVal("controls11","yes")} />
          <RadioOpt name="controls11" label="No"  value="no"  checked={form.controls11==="no"}  onChange={() => setVal("controls11","no")} />
        </div>
      </Field>

      <Field>
        <Label required>Controller(s) to be Installed</Label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:8 }}>
          {Object.keys(form.controllerTypes).map(c => (
            <CheckOpt key={c} label={c} checked={form.controllerTypes[c]}
              onChange={setNested("controllerTypes",c)} />
          ))}
        </div>
        <ErrorMsg msg={errors.controllerTypes} />
      </Field>

      <Field style={{ maxWidth:200 }}>
        <Label required>Total Number of Controllers</Label>
        <Input type="number" value={form.controllerQty} onChange={set("controllerQty")} error={errors.controllerQty} />
        <ErrorMsg msg={errors.controllerQty} />
      </Field>

      <Field>
        <Label>Will distance from fan-to-fan or fan-to-controller exceed 100 ft?</Label>
        <div style={{ display:"flex", gap:10 }}>
          <RadioOpt name="distanceExceeds" label="Yes" value="yes" checked={form.distanceExceeds==="yes"} onChange={() => setVal("distanceExceeds","yes")} />
          <RadioOpt name="distanceExceeds" label="No"  value="no"  checked={form.distanceExceeds==="no"}  onChange={() => setVal("distanceExceeds","no")} />
        </div>
        {form.distanceExceeds === "yes" && (
          <ConditionalBox>
            <Label required>Approximate distance (control-to-lead fan)</Label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>
              {["100–200 ft","200–300 ft","Greater than 300 ft"].map(r => (
                <RadioOpt key={r} name="distanceRange" label={r} value={r}
                  checked={form.distanceRange===r} onChange={() => setVal("distanceRange",r)} />
              ))}
            </div>
            <ErrorMsg msg={errors.distanceRange} />
          </ConditionalBox>
        )}
      </Field>

      <Field>
        <Label>Fans Daisy-Chained?</Label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {[["not_chained","Not Daisy-Chained"],["lt100","< 100 ft"],["lt200","< 200 ft"],["lt300","< 300 ft"],["gt300","> 300 ft"]].map(([v,l]) => (
            <RadioOpt key={v} name="daisyChain" label={l} value={v}
              checked={form.daisyChain===v} onChange={() => setVal("daisyChain",v)} />
          ))}
        </div>
      </Field>

      <Note>📸 Photos of mounting locations showing the full floor-to-ceiling structure are REQUIRED FOR SCHEDULING.</Note>
    </>
  );

  const renderStep5 = () => (
    <>
      <SectionTitle>Electrical & Fire Wire Details</SectionTitle>
      <Note>If you only purchased a Mechanical Installation, you may skip to the next step.</Note>

      <Field>
        <Label>Are spare breakers available?</Label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          {[["yes","Yes"],["no","No"],["unsure","Unsure"]].map(([v,l]) => (
            <RadioOpt key={v} name="spareBreakers" label={l} value={v}
              checked={form.spareBreakers===v} onChange={() => setVal("spareBreakers",v)} />
          ))}
        </div>
        {form.spareBreakers === "yes" && (
          <ConditionalBox>
            <Label required>How many spare breakers and what amperage?</Label>
            <Input value={form.breakerDetails} onChange={set("breakerDetails")} />
          </ConditionalBox>
        )}
        {form.spareBreakers === "no" && (
          <ConditionalBox>
            <Label>Is there space to add more breakers?</Label>
            <Input value={form.spaceToAdd} onChange={set("spaceToAdd")} />
          </ConditionalBox>
        )}
      </Field>

      <Field>
        <Label>Electrical Panel Manufacturer</Label>
        <Input value={form.panelManufacturer} onChange={set("panelManufacturer")} />
      </Field>

      <Field>
        <Label>Specific conduit type required?</Label>
        <div style={{ display:"flex", gap:10 }}>
          <RadioOpt name="conduitRequired" label="Yes" value="yes" checked={form.conduitRequired==="yes"} onChange={() => setVal("conduitRequired","yes")} />
          <RadioOpt name="conduitRequired" label="No"  value="no"  checked={form.conduitRequired==="no"}  onChange={() => setVal("conduitRequired","no")} />
        </div>
        {form.conduitRequired === "yes" && (
          <ConditionalBox>
            <Label required>List the conduit type required</Label>
            <Input value={form.conduitType} onChange={set("conduitType")} />
          </ConditionalBox>
        )}
      </Field>

      <Field>
        <Label>Will fire wire be connected to fans?</Label>
        <Note>Termination at fire panel is done by others.</Note>
        <div style={{ display:"flex", gap:10 }}>
          <RadioOpt name="fireWire" label="Yes" value="yes" checked={form.fireWire==="yes"} onChange={() => setVal("fireWire","yes")} />
          <RadioOpt name="fireWire" label="No"  value="no"  checked={form.fireWire==="no"}  onChange={() => setVal("fireWire","no")} />
        </div>
      </Field>

      <Note>📸 Include photos of your electrical panel and a building drawing with panel locations. Ensure photos show breakers, labels, and manufacturer tags.</Note>
    </>
  );

  const renderStep6 = () => {
    const addr       = [form.siteStreet, form.siteCity, form.siteState, form.siteZip].filter(Boolean).join(", ");
    const totalFans  = form.fanConfigs.reduce((s,c) => s + (parseInt(c.qty)||0), 0);
    const summary    = [
      ["Company",      form.companyName||"—"],
      ["Site Address", addr||"—"],
      ["Sales Rep",    form.salesRep||"—"],
      ["Quote #",      form.quoteNumber||"—"],
      ["Primary",      `${form.primaryFirst} ${form.primaryLast}`.trim()||"—"],
      ["Phone",        form.primaryPhone||"—"],
      ["Email",        form.primaryEmail||"—"],
      ["Total Fans",   totalFans > 0 ? String(totalFans) : "—"],
      ["Ceiling Ht.",  form.ceilingHeight||"—"],
      ["Structure",    form.ceilingStructure||"—"],
      ["Controllers",  Object.entries(form.controllerTypes).filter(([,v])=>v).map(([k])=>k).join(", ")||"—"],
    ];

    return (
      <>
        <SectionTitle>Review & Sign</SectionTitle>

        <div style={{ background:G.pale, borderRadius:10, padding:20, marginBottom:24 }}>
          <SubHeading>Submission Summary</SubHeading>

          {/* Key fields grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",
            gap:"10px 20px", marginBottom:20 }}>
            {summary.map(([k,v]) => (
              <div key={k}>
                <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:11, fontWeight:700,
                  color:G.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{k}</span>
                <p style={{ margin:"2px 0 0", fontFamily:"'Barlow',sans-serif", fontSize:14,
                  color:G.text, wordBreak:"break-word" }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Fan configuration list */}
          {form.fanConfigs.length > 0 && (
            <div>
              <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:11, fontWeight:700,
                color:G.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>Fan Configurations</span>
              <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:6 }}>
                {form.fanConfigs.map((c, i) => (
                  <div key={i} style={{ background:G.white, borderRadius:6, padding:"10px 14px",
                    border:`1px solid ${G.border}`, fontFamily:"'Barlow',sans-serif",
                    fontSize:13, color:G.text, display:"flex", flexWrap:"wrap", gap:"6px 16px" }}>
                    <span style={{ fontWeight:700, color:G.mid }}>{c.model ? FAN_LABELS[c.model] : "—"}</span>
                    <span>Qty: <strong>{c.qty||"—"}</strong></span>
                    <span>Size: <strong>{c.diameter ? c.diameter.replace("ft"," ft.") : "—"}</strong></span>
                    <span>Voltage: <strong>{c.voltage||"—"}</strong></span>
                    <span>Downrod: <strong>{c.downrod||"—"}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Field>
          <Label>Additional Notes / Out-of-Scope Items</Label>
          <Textarea value={form.additionalNotes} onChange={set("additionalNotes")} rows={4} />
        </Field>

        <div style={{ background:"#fffbeb", border:"1.5px solid #d97706", borderRadius:10, padding:18, marginBottom:18 }}>
          <p style={{ margin:"0 0 10px", fontFamily:"'Barlow',sans-serif", fontWeight:700,
            fontSize:12, color:"#92400e", textTransform:"uppercase", letterSpacing:"0.06em" }}>Permitting Acknowledgement</p>
          <p style={{ margin:"0 0 14px", fontFamily:"'Barlow',sans-serif", fontSize:13, color:G.text, lineHeight:1.6 }}>
            All federal, state, and city permitting, structural engineering review, letters, approvals, and fire panel
            terminations are solely the responsibility of the building owner or purchasing party.
          </p>
          <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer" }}>
            <input type="checkbox" checked={form.permitAck} onChange={setCheck("permitAck")}
              style={{ accentColor:G.mid, width:18, height:18, marginTop:2, flexShrink:0 }} />
            <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:14, color:G.text }}>
              I understand and acknowledge the permitting statement above.
            </span>
          </label>
          <ErrorMsg msg={errors.permitAck} />
        </div>

        <div style={{ background:G.pale, border:`1.5px solid ${G.border}`, borderRadius:10, padding:18, marginBottom:24 }}>
          <p style={{ margin:"0 0 10px", fontFamily:"'Barlow',sans-serif", fontWeight:700,
            fontSize:12, color:G.mid, textTransform:"uppercase", letterSpacing:"0.06em" }}>Mechanical Installation Note</p>
          <p style={{ margin:"0 0 14px", fontFamily:"'Barlow',sans-serif", fontSize:13, color:G.text, lineHeight:1.6 }}>
            Power must be available and in place for fans to be tested upon completion of installation.
            No return trips for testing or troubleshooting. Additional charges will apply if return trips are requested.
          </p>
          <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer" }}>
            <input type="checkbox" checked={form.mechAck} onChange={setCheck("mechAck")}
              style={{ accentColor:G.mid, width:18, height:18, marginTop:2, flexShrink:0 }} />
            <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:14, color:G.text }}>I understand the above.</span>
          </label>
          <ErrorMsg msg={errors.mechAck} />
        </div>

        <Field>
          <Label required>Signature — Type Your Full Name</Label>
          <Input value={form.signatureName} onChange={set("signatureName")} error={errors.signatureName}
            style={{ fontStyle:"italic", fontSize:18, letterSpacing:"0.03em" }} />
          <ErrorMsg msg={errors.signatureName} />
        </Field>
        <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:12, color:G.muted, marginTop:-8 }}>
          By entering your name you agree to our privacy policy and terms and conditions.
        </p>
      </>
    );
  };

  const stepRenderers = [
    renderStep0, renderStep1, renderStep2,
    renderStep3, renderStep4, renderStep5, renderStep6,
  ];

  // ── Confirmation ──────────────────────────────────────────
  if (submitted) return (
    <div style={{ minHeight:"100vh", background:G.dark, display:"flex",
      alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:G.white, borderRadius:16, padding:"48px 40px",
        maxWidth:520, width:"100%", textAlign:"center" }}>
        <div style={{ width:72, height:72, background:G.pale, borderRadius:"50%",
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 24px", fontSize:36 }}>✅</div>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800,
          fontSize:28, color:G.dark, margin:"0 0 12px", textTransform:"uppercase" }}>
          Form Submitted!
        </h1>
        <p style={{ fontFamily:"'Barlow',sans-serif", color:G.muted, fontSize:15, lineHeight:1.7, margin:"0 0 24px" }}>
          Thank you, <strong>{form.signatureName}</strong>. The site assessment for{" "}
          <strong>{form.companyName}</strong> has been received.
          Your Demand Drop representative <strong>{form.salesRep}</strong> will follow up shortly.
        </p>
        <p style={{ fontFamily:"'Barlow',sans-serif", color:G.muted, fontSize:13 }}>
          Questions? Call <strong>(629) 260-3600</strong>
        </p>
        <button onClick={() => { setSubmitted(false); setStep(0); setForm(defaultForm); }}
          style={{ marginTop:24, padding:"12px 28px", borderRadius:8,
            border:`2px solid ${G.border}`, background:G.white,
            fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:14,
            color:G.mid, cursor:"pointer" }}>
          Submit Another Form
        </button>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5" }}>

      {/* Header */}
      <div style={{ background:G.dark, padding:"18px 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:"0 2px 12px rgba(0,0,0,.4)" }}>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:28, letterSpacing:"0.04em" }}>
            <span style={{ color:G.mid }}>demand</span><span style={{ color:G.white }}>Drop</span>
          </div>
          <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:11,
            color:"rgba(255,255,255,.5)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
            Site Assessment Form
          </div>
        </div>
        <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:13, color:"rgba(255,255,255,.55)" }}>
          (629) 260-3600
        </div>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"32px 20px 60px" }}>

        {step === 0 && (
          <div style={{ background:G.white, borderRadius:12, padding:"16px 20px",
            marginBottom:24, border:`1px solid ${G.border}` }}>
            <p style={{ margin:0, fontFamily:"'Barlow',sans-serif", fontSize:14, color:G.muted, lineHeight:1.7 }}>
              Please complete all required fields to help us prepare for your fan installation.
              Have photos ready — you'll be prompted when they're needed.
              This form takes approximately <strong>15–20 minutes</strong>.
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:8, marginBottom:14 }}>
            {STEPS.map((s, i) => (
              <button key={i} onClick={() => { if (i < step) { setErrors({}); setStep(i); } }}
                style={{ flexShrink:0, padding:"6px 14px", borderRadius:20,
                  fontFamily:"'Barlow',sans-serif", fontSize:12, fontWeight:600,
                  textTransform:"uppercase", letterSpacing:"0.05em", border:"none",
                  cursor: i < step ? "pointer":"default",
                  background: i===step ? G.mid : i<step ? "#fce8eb" : "#e0e0e0",
                  color: i===step ? G.white : i<step ? G.mid : G.muted,
                  transition:"all .2s" }}>
                {i < step ? "✓ " : `${i+1}. `}{s}
              </button>
            ))}
          </div>
          <div style={{ height:4, background:"#e0e0e0", borderRadius:2 }}>
            <div style={{ height:"100%", width:`${((step+1)/STEPS.length)*100}%`,
              background:G.mid, borderRadius:2, transition:"width .3s" }} />
          </div>
          <p style={{ margin:"8px 0 0", fontFamily:"'Barlow',sans-serif", fontSize:12, color:G.muted }}>
            Step {step+1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        {/* Step card */}
        <div style={{ background:G.white, borderRadius:14, padding:"32px 28px",
          boxShadow:"0 1px 4px rgba(0,0,0,.06)", border:`1px solid ${G.border}` }}>

          {/* Called as function — not JSX — keeps DOM stable for iOS keyboard */}
          {stepRenderers[step]()}

          {/* Nav buttons */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:36, gap:12 }}>
            {step > 0
              ? <button onClick={back}
                  style={{ padding:"12px 28px", borderRadius:8, border:`2px solid ${G.border}`,
                    background:G.white, fontFamily:"'Barlow',sans-serif", fontWeight:700,
                    fontSize:14, color:G.gray, cursor:"pointer" }}>← Back</button>
              : <div />}
            <button onClick={step === STEPS.length-1 ? submit : next}
              style={{ padding:"12px 36px", borderRadius:8, border:"none",
                background:G.mid, color:G.white, fontFamily:"'Barlow',sans-serif",
                fontWeight:700, fontSize:14, cursor:"pointer",
                boxShadow:"0 2px 8px rgba(200,16,46,.35)" }}>
              {step === STEPS.length-1 ? "Submit Form ✓" : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
