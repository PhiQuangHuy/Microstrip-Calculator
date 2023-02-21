export const c = 2.998e8; // speed of light in meters / second 2.997925e8
export const mpm = 39370.079; // 1 meter = 39370.07874 mils
export const fsmu = 4.0 * Math.PI * 1.0e-7; // freespace mu
export const rc = 5.96e7; // conductivity of copper.
export const Zofn = 59.9585;

// change these values to change default dimension/frequency unit selectors
// 0=mils, 1=inches, 2=mm, 3=cm
export let defaultHeight = 0;
export let defaultThickness = 0;
export let defaultFreq = 0;
export let defaultWidth = 0;
export let defaultLength = 0;

export const units = ["mils", "Inches", "mm", "cm"];
export const unitsVal = [1.0, 1000.0, 1, 10];
export const freqUnits = ["GHz", "MHz", "kHz", "Hz"];
export const freqUnitsVal = [1, 0.001, 0.000001, 0.000000001];

// export const dielectricMaterials = [
//   { name: "Choose...", dielectricConstant: 10, tand: 0.001 },
//   { name: "Bakelite", dielectricConstant: 4.78, tand: 0.03045 },
//   { name: "FR4", dielectricConstant: 4.36, tand: 0.013 },
//   { name: "RO4003", dielectricConstant: 3.4, tand: 0.002 },
//   { name: "TaconicTLC", dielectricConstant: 3.2, tand: 0.002 },
//   { name: "RT Duroid", dielectricConstant: 2.2, tand: 0.0004 },
//   { name: "Teflon", dielectricConstant: 2.1, tand: 0.00028 },
// ];
export const metalMaterials = [
  { name: "Copper", Rh0: 1 },
  { name: "Gold", Rh0: 1.45 },
  { name: "Silver", Rh0: 0.946 },
];
