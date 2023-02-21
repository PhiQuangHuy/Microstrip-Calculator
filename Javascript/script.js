import {
  c,
  mpm,
  fsmu,
  rc,
  Zofn,
  units,
  unitsVal,
  freqUnitsVal,
  freqUnits,
  defaultHeight,
  defaultThickness,
  defaultFreq,
  defaultWidth,
  defaultLength,
  // dielectricMaterials,
  metalMaterials,
} from "./constants.js";

import {
  msIsNumber,
  msCheckSubstrateValues,
  msCheckAnalyzeValues,
  msCheckSynthesizeValues,
  onchangeError,
} from "./error.js";

//Initial and choose dimensions for input values
let msEr; // Substrate dielectric constant
let msEeff; // Effective dielectric constant
let msTand; // Dielectric loss tangent
let msRho; // Resistivity of the conductor relative to copper. (i.e, a copper conductor has a Rho of 1)
let msHeight; // Substrate height. Note: In the MS equations this is H and in the Stripline equtsions, this is B
let msThickness; // Thickness of the conductor
let msWidth; // Width of the conductor
let msLength; // Length of the conductor
let msZo; // Characteristic impedance of the transmission line
let msAngle; // Electrical length of the transmission line at the given frequency in degress
let msFreq; // Frequency of which the transmission line is evaluated
let msLoss; // Loss of the transmission line in dB at the specified length and frequency

let currentSelectHeight = defaultHeight;
let currentSelectThickness = defaultThickness;
let currentSelectFreq = defaultFreq;
let currentSelectWidth = defaultWidth;
let currentSelectLength = defaultLength;

const synthesizeButton = document.getElementById("btn_ms_synthesize");
synthesizeButton.addEventListener("click", synthesize);
const analyzeButton = document.getElementById("btn_ms_analyze");
analyzeButton.addEventListener("click", analyze);

//Dielectric and metal
let metal = 0;
let dielectric = 0;
const selectDielectric = document.getElementById("dielectric-material");
const selectMetal = document.getElementById("metal-material");

async function getData() {
  try {
    let data = await fetch("http://localhost:5000/projectI-api");
    if (!data) data = await fetch("http://localhost:3000/projectI-api");
    const dataJson = await data.json();
    const dielectricMaterials = dataJson.data;
    // console.log(dielectricMaterials);

    dielectricMaterials.forEach((el, i) => {
      let option = document.createElement("option");
      option.value = i;
      option.text = el.name;
      selectDielectric.appendChild(option);
    });

    selectDielectric.onchange = function () {
      dielectric = Number(selectDielectric.value);
      document.getElementById("edt_msEr").value =
        dielectricMaterials[dielectric].dielectricConstant;
      document.getElementById("edt_msTand").value =
        dielectricMaterials[dielectric].tand;
    };
  } catch (err) {
    let option = document.createElement("option");
    option.value = 0;
    option.text = "No data";
    selectDielectric.appendChild(option);
    console.error("Error");
  }
}
getData();

metalMaterials.forEach((el, i) => {
  let option = document.createElement("option");
  option.value = i;
  option.text = el.name;
  selectMetal.appendChild(option);
});

selectMetal.onchange = function () {
  metal = Number(selectMetal.value);
  //console.log(metalMaterials[metal].Rh0);
  document.getElementById("edt_msRho").value = metalMaterials[metal].Rh0;
};

function initDefaultValues() {
  // change these values to your desired default values.
  msEr = 10;
  msTand = 0.001;
  msRho = 1.0;
  msHeight = 25;
  msThickness = 1;
  msWidth = 25;
  msLength = 111;
  msFreq = 10;
}

function initSetup() {
  initDefaultValues();
  setFormValues();
  setSelectorOptions();
  // document.getElementById("edt_msEeff").readOnly = true;
  // document.getElementById("edt_msLoss").readOnly = true;
  // analyze();
}
initSetup();

function setupDimensions(select, units) {
  units.forEach((el, i) => {
    let option = document.createElement("option");
    option.value = i;
    option.text = el;
    select.appendChild(option);
  });
}

function setSelectorOptions() {
  const selectHeight = document.getElementById("sel_msHeight");
  const selectThickness = document.getElementById("sel_msThickness");
  const selectFreq = document.getElementById("sel_msFreq");
  const selectWidth = document.getElementById("sel_msWidth");
  const selectLength = document.getElementById("sel_msLength");

  setupDimensions(selectHeight, units);
  selectHeight.value = defaultHeight;
  selectHeight.onfocus = function () {
    selectFocus("height", selectHeight);
  };
  selectHeight.onchange = function () {
    selectChange("height", selectHeight);
  };

  setupDimensions(selectThickness, units);
  selectThickness.value = defaultThickness;
  selectThickness.onfocus = function () {
    selectFocus("thickness", selectThickness);
  };
  selectThickness.onchange = function () {
    selectChange("thickness", selectThickness);
  };

  setupDimensions(selectFreq, freqUnits);
  selectFreq.value = defaultFreq;
  selectFreq.onfocus = function () {
    selectFocus("freq", selectFreq);
  };
  selectFreq.onchange = function () {
    selectChange("freq", selectFreq);
  };

  setupDimensions(selectWidth, units);
  selectWidth.value = defaultWidth;
  selectWidth.onfocus = function () {
    selectFocus("width", selectWidth);
  };
  selectWidth.onchange = function () {
    selectChange("width", selectWidth);
  };

  setupDimensions(selectLength, units);
  selectLength.value = defaultLength;
  selectLength.onfocus = function () {
    selectFocus("length", selectLength);
  };
  selectLength.onchange = function () {
    selectChange("length", selectLength);
  };
}

function selectFocus(str, selector) {
  if (str === "height") currentSelectHeight = selector.value;
  if (str === "thickness") currentSelectThickness = selector.value;
  if (str === "freq") currentSelectFreq = selector.value;
  if (str === "width") currentSelectWidth = selector.value;
  else currentSelectLength = selector.value;
}

function selectChange(str, selector) {
  if (str === "height") {
    if (msIsNumber(document.getElementById("edt_msHeight").value)) {
      convertHeight();
      currentSelectHeight = selector.value;
    } else onchangeError(str);
  }
  if (str === "thickness") {
    if (msIsNumber(document.getElementById("edt_msThickness").value)) {
      convertThickness();
      currentSelectThickness = selector.value;
    } else onchangeError(str);
  }
  if (str === "freq") {
    if (msIsNumber(document.getElementById("edt_msFreq").value)) {
      convertFrequency();
      currentSelectFreq = selector.value;
    } else onchangeError(str);
  }
  if (str === "width") {
    if (msIsNumber(document.getElementById("edt_msWidth").value)) {
      convertWidth();
      currentSelectWidth = selector.value;
    } else onchangeError(str);
  }
  if (str === "length") {
    if (msIsNumber(document.getElementById("edt_msLength").value)) {
      convertLength();
      currentSelectLength = selector.value;
    } else onchangeError(str);
  }
}

//Load values and set form to calculate

function loadSubstrateValues() {
  msEr = parseFloat(document.getElementById("edt_msEr").value);
  msTand = parseFloat(document.getElementById("edt_msTand").value);
  msRho = parseFloat(document.getElementById("edt_msRho").value);
  msHeight = parseFloat(document.getElementById("edt_msHeight").value);
  msThickness = parseFloat(document.getElementById("edt_msThickness").value);
  msFreq = parseFloat(document.getElementById("edt_msFreq").value);
}

function loadAnalyzeValues() {
  msWidth = parseFloat(document.getElementById("edt_msWidth").value);
  msLength = parseFloat(document.getElementById("edt_msLength").value);
}

function loadSynthesizeValues() {
  msZo = parseFloat(document.getElementById("edt_msZo").value);
  msAngle = parseFloat(document.getElementById("edt_msAngle").value);
}

function setFormValues() {
  document.getElementById("edt_msEr").value = msEr;
  document.getElementById("edt_msTand").value = msTand;
  document.getElementById("edt_msRho").value = msRho;
  document.getElementById("edt_msHeight").value = msHeight;
  document.getElementById("edt_msThickness").value = msThickness;
  document.getElementById("edt_msWidth").value = msWidth;
  document.getElementById("edt_msLength").value = msLength;
  document.getElementById("edt_msFreq").value = msFreq;
}

//Analyze and synthesize function
function analyze() {
  loadSubstrateValues();
  loadAnalyzeValues();
  if (msCheckSubstrateValues() && msCheckAnalyzeValues()) {
    let h = getHeight();
    let t = getThickness();
    let w = getWidth();
    let l = getLength();
    let f = convertFreqToHz();

    calcZo(h, t, w, f);
    calcAngle(l);
    msLoss =
      (calcConductorLoss(convertFreqToHz(), h, t, w) +
        calcDielectricLoss(convertFreqToHz()) / mpm) *
      l;

    displayZo(3);
    displayAngle(3);
    displayLoss(3);
    displayEeff(3);
  }
}

function synthesize() {
  loadSubstrateValues();
  loadSynthesizeValues();
  if (msCheckSubstrateValues() && msCheckSynthesizeValues()) {
    let h = getHeight();
    let t = getThickness();
    let w, l;
    w = calcWidth(h, t);
    l = calcLength();
    msLoss =
      (calcConductorLoss(convertFreqToHz(), h, t, w) +
        calcDielectricLoss(convertFreqToHz()) / mpm) *
      l;
    setWidth(w);
    setLength(l);
    displayWidth(5);
    displayLength(5);
    displayLoss(3);
  }
}

////////////////////////////
//Display
function displayHeight(precision) {
  document.getElementById("edt_msHeight").value = msHeight.toFixed(precision);
}

function displayThickness(precision) {
  document.getElementById("edt_msThickness").value =
    msThickness.toFixed(precision);
}

function displayFreq() {
  document.getElementById("edt_msFreq").value = msFreq;
}

function displayZo(precision) {
  document.getElementById("edt_msZo").value = msZo.toFixed(precision);
}

function displayAngle(precision) {
  if (msAngle.toFixed(precision + 1) < 0.1)
    document.getElementById("edt_msAngle").value = (msAngle * 1000).toFixed(
      precision
    );
  else
    document.getElementById("edt_msAngle").value = msAngle.toFixed(precision);
}

function displayLoss(precision) {
  if (msLoss.toFixed(precision + 1) < 0.000001)
    document.getElementById("edt_msLoss").value = (msLoss * 100).toFixed(
      precision
    );
  else document.getElementById("edt_msLoss").value = msLoss.toFixed(precision);
}

function displayEeff(precision) {
  document.getElementById("edt_msEeff").value = msEeff.toFixed(precision);
}

function displayWidth(precision) {
  document.getElementById("edt_msWidth").value =
    parseFloat(msWidth).toFixed(precision);
}

function displayLength(precision) {
  document.getElementById("edt_msLength").value = msLength.toFixed(precision);
}

//Get and set values
function calcFromToMil(from) {
  if (from < 2) return unitsVal[from];

  return (mpm * unitsVal[from]) / 1000.0;
}

function calcFromMilTo(to) {
  if (to < 2) return 1 / unitsVal[to];

  return 1000.0 / (mpm * unitsVal[to]);
}

function getHeight() {
  return msHeight * calcFromToMil(currentSelectHeight);
}

function getThickness() {
  return msThickness * calcFromToMil(currentSelectThickness);
}

function getWidth() {
  return msWidth * calcFromToMil(currentSelectWidth);
}

function setWidth(w) {
  msWidth = w * calcFromMilTo(currentSelectWidth);
}

function getLength() {
  return msLength * calcFromToMil(currentSelectLength);
}

function setLength(l) {
  msLength = l * calcFromMilTo(currentSelectLength);
}

//Convert values
function convertFreqToHz() {
  return (msFreq * freqUnitsVal[currentSelectFreq]) / 0.000000001;
}

function convertHeight() {
  let selectHeight = document.getElementById("sel_msHeight");

  msHeight = document.getElementById("edt_msHeight").value;

  if (
    (currentSelectHeight < 2 && selectHeight.value < 2) ||
    (currentSelectHeight > 1 && selectHeight.value > 1)
  ) {
    msHeight =
      (msHeight * unitsVal[currentSelectHeight]) / unitsVal[selectHeight.value];
  } else {
    if (currentSelectHeight < 2)
      msHeight =
        (msHeight * unitsVal[currentSelectHeight] * 1000) /
        (unitsVal[selectHeight.value] * mpm);
    else
      msHeight =
        msHeight *
        mpm *
        (unitsVal[currentSelectHeight] / (unitsVal[selectHeight.value] * 1000));
  }
  displayHeight(5);
}

function convertThickness() {
  let selected = document.getElementById("sel_msThickness");
  msThickness = document.getElementById("edt_msThickness").value;
  if (
    (currentSelectThickness < 2 && selected.value < 2) ||
    (currentSelectThickness > 1 && selected.value > 1)
  ) {
    msThickness =
      (msThickness * unitsVal[currentSelectThickness]) /
      unitsVal[selected.value];
  } else {
    if (currentSelectThickness < 2)
      msThickness =
        (msThickness * unitsVal[currentSelectThickness] * 1000) /
        (unitsVal[selected.value] * mpm);
    else
      msThickness =
        msThickness *
        mpm *
        (unitsVal[currentSelectThickness] / (unitsVal[selected.value] * 1000));
  }
  displayThickness(5);
}

function convertWidth() {
  let selected = document.getElementById("sel_msWidth");
  msWidth = document.getElementById("edt_msWidth").value;
  if (
    (currentSelectWidth < 2 && selected.value < 2) ||
    (currentSelectWidth > 1 && selected.value > 1)
  ) {
    msWidth =
      (msWidth * unitsVal[currentSelectWidth]) / unitsVal[selected.value];
  } else {
    if (currentSelectWidth < 2)
      msWidth =
        (msWidth * unitsVal[currentSelectWidth] * 1000) /
        (unitsVal[selected.value] * mpm);
    else
      msWidth =
        msWidth *
        mpm *
        (unitsVal[currentSelectWidth] / (unitsVal[selected.value] * 1000));
  }
  displayWidth(5);
}

function convertLength() {
  let selected = document.getElementById("sel_msLength");
  msLength = document.getElementById("edt_msLength").value;
  if (
    (currentSelectLength < 2 && selected.value < 2) ||
    (currentSelectLength > 1 && selected.value > 1)
  ) {
    msLength =
      (msLength * unitsVal[currentSelectLength]) / unitsVal[selected.value];
  } else {
    if (currentSelectLength < 2)
      msLength =
        (msLength * unitsVal[currentSelectLength] * 1000) /
        (unitsVal[selected.value] * mpm);
    else
      msLength =
        msLength *
        mpm *
        (unitsVal[currentSelectLength] / (unitsVal[selected.value] * 1000));
  }
  displayLength(5);
}

function convertFrequency() {
  let selected = document.getElementById("sel_msFreq");
  msFreq = document.getElementById("edt_msFreq").value;
  msFreq =
    (msFreq * freqUnitsVal[currentSelectFreq]) / freqUnitsVal[selected.value];
  displayFreq();
}

//////////////////////////////////////////////
//Caculating function
function coth2(x) {
  let retVal;
  retVal =
    (Math.exp(x) + Math.exp(-x)) / 2.0 / ((Math.exp(x) - Math.exp(-x)) / 2.0);
  return retVal * retVal;
}

function calcZo(h, t, w, f) {
  let u, u1, ur, dur, du1;
  let tu,
    eff0 = 0.0,
    fn;

  let Zo;
  u = w / h;
  du1 = 0;
  dur = 0;
  //Accurate model
  if (t > 0) {
    tu = t / h;
    du1 =
      (tu / Math.PI) *
      Math.log1p((4.0 * Math.E) / (tu * coth2(Math.pow(6.517 * u, 0.5))));
    dur = 0.5 * (1.0 + 1.0 / Math.cosh(Math.pow(msEr - 1.0, 0.5))) * du1;
  }

  u1 = u + du1;
  ur = u + dur;
  Zo = Zo1(ur) / Math.pow(calcEeff(ur, msEr), 0.5);
  eff0 = calcEeff(ur, msEr) * Math.pow(Zo1(u1) / Zo1(ur), 2.0);
  //Hoffman page 173(hybrid mode analysis)
  fn = (f * h * 0.0254) / 1.0e9;
  1;
  let p1 =
    0.27488 +
    u * (0.6315 + 0.525 / Math.pow(1.0 + 0.0157 * fn, 20.0)) -
    0.065683 * Math.exp(-8.7513 * u);
  let p2 = 0.33622 * (1.0 - Math.exp(-0.03442 * msEr));
  let p3 =
    0.0363 *
    Math.exp(-4.6 * u) *
    (1.0 - Math.exp(-1.0 * Math.pow(fn / 3.87, 4.97)));
  let p4 = 2.751 * (1.0 - Math.exp(-1.0 * Math.pow(msEr / 15.916, 8.0))) + 1.0;
  let p = p1 * p2 * Math.pow(fn * (0.1844 + p3 * p4), 1.5763);
  msEeff = (eff0 + msEr * p) / (1.0 + p);
  //Hoffman page 178
  let r1 = 0.03891 * Math.pow(msEr, 1.4);
  let r2 = 0.267 * Math.pow(u, 7.0);
  let r3 = 4.766 * Math.exp(-3.228 * Math.pow(ur, 0.641));
  let r4 = 0.016 + Math.pow(0.0514 * msEr, 4.524);
  let r5 = Math.pow(fn / 28.843, 12.0);
  let r6 = 22.2 * Math.pow(ur, 1.92);
  let r7 = 1.206 - 0.3144 * Math.exp(-r1) * (1.0 - Math.exp(-r2));
  let r8 =
    1.0 +
    1.275 *
      (1.0 -
        Math.exp(
          -0.004625 * r3 * Math.pow(msEr, 1.674) * Math.pow(fn / 18.365, 2.745)
        ));
  let r9 =
    (((5.086 * r4 * r5) / (0.3838 + 0.386 * r4)) *
      (Math.exp(-r6) / (1.0 + 1.2992 * r5)) *
      Math.pow(msEr - 1.0, 6.0)) /
    (1.0 + 10.0 * Math.pow(msEr - 1.0, 6.0));
  let r10 = 0.00044 * Math.pow(msEr, 2.136) + 0.0184;
  let r11 =
    Math.pow(fn / 19.47, 6.0) / (1.0 + 0.0962 * Math.pow(fn / 19.47, 6.0));
  let r12 = 1.0 / (1.0 + 0.00245 * u * u);
  let r13 = 0.9408 * Math.pow(msEeff, r8) - 0.9603;
  let r14 = (0.9408 - r9) * Math.pow(eff0, r8) - 0.9603;
  let r15 = 0.707 * r10 * Math.pow(fn / 12.3, 1.097);
  let r16 =
    1.0 +
    0.0503 *
      msEr *
      msEr *
      r11 *
      (1.0 - Math.exp(-1.0 * Math.pow(u / 15.0, 6.0)));
  let r17 =
    r7 *
    (1.0 -
      1.1241 * (r12 / r16) * Math.exp(-0.026 * Math.pow(fn, 1.15656) - r15));
  msZo = Zo * Math.pow(r13 / r14, r17);
}

function calcEeff(u, er) {
  // source: Hammerstad and Jensen, "Accurate Models for Microstrip Computer Aided Design", 1980 IEEE MTT-S International Microwave Symposium Digest
  // //		   R.K. Hoffman, Handbook of Microwave integrated Circuits, 1987 for the impedance dispersion curve fit.

  let a = 0.0;
  let b = 0.0;
  let ef = 0.0;
  a =
    1.0 +
    Math.log(
      (Math.pow(u, 4.0) + Math.pow(u / 52.0, 2.0)) / (Math.pow(u, 4.0) + 0.432)
    ) /
      49.0 +
    Math.log1p(Math.pow(u / 18.1, 3)) / 18.7;
  b = 0.564 * Math.pow((er - 0.9) / (er + 3.0), 0.053);
  ef =
    (er + 1.0) / 2.0 +
    ((er - 1) / 2.0) * Math.pow(1.0 + 10.0 / u, -1.0 * a * b);
  return ef;
}

function Zo1(u) {
  //Accurate model
  let f = 0.0;
  let z = 0.0;
  f =
    6.0 + (2.0 * Math.PI - 6.0) * Math.exp(-1.0 * Math.pow(30.666 / u, 0.7528));
  z = Zofn * Math.log(f / u + Math.pow(1.0 + 4.0 / (u * u), 0.5));
  return z;
}

function calcWidth(h, t) {
  //Hoffman hybrid mode
  let u, du, u1, u2, u3, u4;
  let v1, v2, v3, v4;
  let Zc;
  u = 0.1;
  du = 0.5;
  Zc = msZo;
  v1 = getV(h, t, u, Zc);
  u += du;
  v2 = getV(h, t, u, Zc);
  while (v1 * v2 > 0) {
    v1 = v2;
    u += du;
    v2 = getV(h, t, u, Zc);
  }
  u2 = u;
  u1 = u - du;
  u = u1 + (u2 - u1) * 0.381966;
  u3 = u;
  v3 = Math.abs(getV(h, t, u, Zc));
  u = u1 + (u2 - u1) / 1.618034;
  u4 = u;
  v4 = Math.abs(getV(h, t, u4, Zc));
  let Zerr = Zc / 10000.0;
  while (v3 + v4 > Zerr) {
    if (v3 > v4) {
      u1 = u3;
      u3 = u4;
      v3 = v4;
      u = u1 + (u2 - u1) / 1.618034;
      u4 = u;
      v4 = Math.abs(getV(h, t, u, Zc));
    } else {
      u2 = u4;
      u4 = u3;
      v4 = v3;
      u = u1 + (u2 - u1) * 0.381966;
      u3 = u;
      v3 = Math.abs(getV(h, t, u, Zc));
    }
  }
  u = (u1 + u2) / 2;
  return u * h;
}

function getV(h, t, u, z) {
  let v;
  let w;
  w = u * h;
  calcZo(h, t, w, convertFreqToHz());
  v = msZo - z;
  return v;
}

function calcLength() {
  return (msAngle / 360.0) * calcWavelength(convertFreqToHz()) * mpm;
}

function calcAngle(l) {
  msAngle = ((l * 360.0) / (calcWavelength(convertFreqToHz()) * mpm)) % 360;
}

function calcWavelength(freq) {
  return c / (freq * Math.pow(msEeff, 0.5));
}

// function calcWavelengthEr(freq, er) {
//   return c / (freq * Math.pow(er, 0.5));
// }

function calcDielectricLoss(freq) {
  // dielectric loss in db / meter
  // freq = frequency in Hz
  // source: Gupta, "Computer-Aided Design of Microwave Circuits" p. 65
  let dloss =
    27.3 *
    (msEr / (msEr - 1.0)) *
    ((msEeff - 1.0) / Math.pow(msEeff, 0.5)) *
    ((msTand * convertFreqToHz()) / c);
  return dloss;
}

function calcConductorLoss(freq, h, t, w) {
  // conductor loss in db / meter
  // freq = frequency in Hz
  //Accurate Model
  let ac, u, a, b, rs, rel;
  let tu, du1, dur, ur;
  u = w / h;
  rel = msRho / rc;
  dur = 0.0;
  if (t > 0.0) {
    tu = t / h;
    du1 =
      (tu / Math.PI) *
      Math.log1p((4.0 * Math.E) / (tu * coth2(Math.pow(6.517 * u, 0.5))));
    dur = 0.5 * (1.0 + 1.0 / Math.cosh(Math.pow(msEr - 1.0, 0.5))) * du1;
  }
  ur = u + dur;
  // source: Gupta, "Computer-Aided Design of Microwave Circuits" p. 64
  if (u >= 1.0 / (2 * Math.PI)) b = h;
  else b = 2 * Math.PI * w;
  rs = Math.pow(Math.PI * convertFreqToHz() * fsmu * rel, 0.5);
  if (t > 0) a = 1.0 + (1.0 + Math.log((2 * b) / t) / Math.PI) / ur;
  else a = 1.0;
  if (u <= 1.0)
    ac = (1.38 * a * (rs / (h * msZo)) * (32.0 - ur * ur)) / (32.0 + ur * ur);
  else
    ac =
      6.1e-5 *
      a *
      ((rs * msZo * msEeff) / h) *
      (u + (0.667 * ur) / (ur + 1.444));
  return ac;
}
