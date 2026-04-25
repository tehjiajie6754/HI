// Coordinate map for the Malaysian Visa Application Form (IMM.47-style flat PDF).
// The PDF has no AcroForm fields — we overlay text at absolute positions.
//
// PDF size is A4 (595 × 841 pts). Origin is BOTTOM-LEFT in pdf-lib.
// All coordinates below are educated estimates for a standard IMM.47 layout;
// adjust any individual entry if the text lands in the wrong spot on your PDF.
//
// `page` is 0-indexed (0 = first page).
// `x`/`y` are in PDF points from the bottom-left of that page.
// For checkboxes, `x`/`y` point to where the "X" mark should be drawn.

export interface TextCoord { page: number; x: number; y: number; size?: number; maxChars?: number }
export interface CheckCoord { page: number; x: number; y: number; size?: number }

export interface VisaPdfCoords {
  applicationType: {
    inMalaysia: CheckCoord
    oversea: CheckCoord
  }
  applicant: {
    fullName: TextCoord
    genderMale: CheckCoord
    genderFemale: CheckCoord
    placeCountryOfBirth: TextCoord
    dateOfBirth: TextCoord
    nationality: TextCoord
    occupation: TextCoord
    address: TextCoord
    maritalSingle: CheckCoord
    maritalMarried: CheckCoord
  }
  passport: {
    documentType: TextCoord
    documentNumber: TextCoord
    placeCountryOfIssue: TextCoord
    validUntil: TextCoord
  }
  sponsor: {
    name: TextCoord
    nric: TextCoord
    phone: TextCoord
    address: TextCoord
    state: TextCoord
  }
  details: {
    durationMonths: TextCoord
    purpose: {
      holiday: CheckCoord
      transit: CheckCoord
      business: CheckCoord
      official: CheckCoord
      visiting: CheckCoord
      conference: CheckCoord
      employment: CheckCoord
      study: CheckCoord
      other: CheckCoord
    }
    mobileNo: TextCoord
    email: TextCoord
    applicationDate: TextCoord
  }
}

// Default estimates. Y is measured from the bottom of the page.
// For A4 (height 841pt): a Y of 800 is near the top; Y of 50 is near the bottom.
export const VISA_PDF_COORDS: VisaPdfCoords = {
  applicationType: {
    inMalaysia: { page: 0, x: 225, y: 692, size: 12 },
    oversea: { page: 0, x: 351, y: 692, size: 12 },
  },
  applicant: {
    fullName: { page: 0, x: 68, y: 606, size: 11 },
    genderMale: { page: 0, x: 203, y: 576, size: 12 },
    genderFemale: { page: 0, x: 341, y: 576, size: 12 },
    placeCountryOfBirth: { page: 0, x: 148, y: 548, size: 11 },
    dateOfBirth: { page: 0, x: 148, y: 519, size: 11 },
    nationality: { page: 0, x: 354, y: 518, size: 11 },
    occupation: { page: 0, x: 148, y: 475, size: 11 },
    address: { page: 0, x: 149, y: 446, size: 10 },
    maritalSingle: { page: 0, x: 233, y: 384, size: 12 },
    maritalMarried: { page: 0, x: 334, y: 384, size: 12 },
  },
  passport: {
    documentType: { page: 0, x: 180, y: 305, size: 11 },
    documentNumber: { page: 0, x: 431, y: 304, size: 11 },
    placeCountryOfIssue: { page: 0, x: 180, y: 267, size: 11 },
    validUntil: { page: 0, x: 433, y: 266, size: 11 },
  },
  sponsor: {
    name: { page: 1, x: 172, y: 692, size: 11 },
    nric: { page: 1, x: 172, y: 654, size: 11 },
    phone: { page: 1, x: 398, y: 654, size: 11 },
    address: { page: 1, x: 174, y: 618, size: 10 },
    state: { page: 1, x: 174, y: 567, size: 11 },
  },
  details: {
    durationMonths: { page: 1, x: 435, y: 483, size: 11 },
    purpose: {
      holiday: { page: 1, x: 324, y: 439, size: 12 },
      transit: { page: 1, x: 432, y: 441, size: 12 },
      business: { page: 1, x: 324, y: 400, size: 12 },
      official: { page: 1, x: 432, y: 400, size: 12 },
      visiting: { page: 1, x: 324, y: 363, size: 12 },
      conference: { page: 1, x: 432, y: 363, size: 12 },
      employment: { page: 1, x: 326, y: 322, size: 12 },
      study: { page: 1, x: 435, y: 322, size: 12 },
      other: { page: 1, x: 328, y: 286, size: 12 },
    },
    mobileNo: { page: 1, x: 172, y: 210, size: 11 },
    email: { page: 1, x: 172, y: 185, size: 11 },
    applicationDate: { page: 1, x: 102, y: 135, size: 20 },
  },
}
