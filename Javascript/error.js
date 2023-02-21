function notNumeric(title) {
  alert("Error - " + title + " must be numeric.");
}

function notGreaterZero(title) {
  alert("Error - " + title + " must be greater than zero.");
}

function notGreaterOrEqualZero(title) {
  alert("Error - " + title + " must be greater than or equal to zero.");
}

function notGreaterOrEqualOne(title) {
  alert("Error - " + title + " must be greater than or equal to 1.0");
}

export function msIsNumber(num) {
  return !isNaN(parseFloat(num)) && isFinite(num);
}

export function msCheckSubstrateValues() {
  if (!msIsNumber(document.getElementById("edt_msEr").value)) {
    notNumeric("\u03B5r");
    return false;
  }
  if (!(parseFloat(document.getElementById("edt_msEr").value) >= 1.0)) {
    notGreaterOrEqualOne("\u03B5r");
    return false;
  }
  if (!msIsNumber(document.getElementById("edt_msTand").value)) {
    notNumeric("Tan\u03B4");
    return false;
  }
  if (!(parseFloat(document.getElementById("edt_msTand").value) >= 0)) {
    notGreaterOrEqualZero("Tan\u03B4");
    return false;
  }
  if (!msIsNumber(document.getElementById("edt_msRho").value)) {
    notNumeric("Rho");
    return false;
  }
  if (!(parseFloat(document.getElementById("edt_msRho").value) > 0)) {
    notGreaterZero("Rho");
    return false;
  }
  if (!msIsNumber(document.getElementById("edt_msHeight").value)) {
    notNumeric("Height");
    return false;
  }
  if (!(parseFloat(document.getElementById("edt_msHeight").value) > 0)) {
    notGreaterZero("Height");
    return false;
  }
  if (!msIsNumber(document.getElementById("edt_msThickness").value)) {
    notNumeric("Thickness");
    return false;
  }
  if (!(parseFloat(document.getElementById("edt_msThickness").value) >= 0)) {
    notGreaterOrEqualZero("Thickness");
    return false;
  }
  if (!msIsNumber(document.getElementById("edt_msFreq").value)) {
    notNumeric("Frequency");
    return false;
  }
  if (!(parseFloat(document.getElementById("edt_msFreq").value) >= 0)) {
    notGreaterOrEqualZero("Frequency");
    return false;
  }
  return true;
}

export function msCheckAnalyzeValues() {
  if (!msIsNumber(document.getElementById("edt_msWidth").value)) {
    notNumeric("Width");
    return false;
  }
  if (!(parseFloat(document.getElementById("edt_msWidth").value) > 0)) {
    notGreaterZero("Width");
    return false;
  }
  if (!msIsNumber(document.getElementById("edt_msLength").value)) {
    notNumeric("Length");
    return false;
  }
  if (!(parseFloat(document.getElementById("edt_msLength").value) > 0)) {
    notGreaterZero("Length");
    return false;
  }
  return true;
}

export function msCheckSynthesizeValues() {
  if (!msIsNumber(document.getElementById("edt_msZo").value)) {
    notNumeric("Zo");
    return false;
  } else if (!(parseFloat(document.getElementById("edt_msZo").value) > 0)) {
    notGreaterZero("Zo");
    return false;
  }
  if (!msIsNumber(document.getElementById("edt_msAngle").value)) {
    notNumeric("Angle");
    return false;
  } else if (!(parseFloat(document.getElementById("edt_msAngle").value) > 0)) {
    notGreaterZero("Angle");
    return false;
  }
  return true;
}

export function onchangeError(title) {
  title = title.replace(title[0], title[0].toUpperCase());
  alert(
    "Can't convert " + title + " must be a number. Please check your input."
  );
}
