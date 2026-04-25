import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs/promises'
import path from 'path'
import { VISA_PDF_COORDS, TextCoord, CheckCoord } from '@/lib/visa-pdf-coords'

const PDF_PATH = path.join(
  process.cwd(),
  'src', 'components', 'visa', 'Malaysian Visa Application Form.pdf',
)

interface VisaFormData {
  Application_Type: 'In Malaysia' | 'Oversea'
  Applicant_Particulars: {
    Full_Name: string
    Gender: 'Male' | 'Female'
    Place_Country_Of_Birth: string
    Date_Of_Birth: string
    Nationality: string
    Occupation: string
    Address: string
    Marital_Status: 'Single' | 'Married'
  }
  Passport_Travel_Document: {
    Document_Type: string
    Document_Number: string
    Place_Country_Of_Issue: string
    Valid_Until: string
  }
  Sponsor_In_Malaysia?: {
    Sponsor_Name?: string
    Sponsor_NRIC?: string
    Sponsor_Phone?: string
    Sponsor_Address?: string
    Sponsor_State?: string
  }
  Application_Details: {
    Duration_Of_Proposed_Stay_Months: number
    Purpose_Of_Journey:
      | 'Holiday' | 'Transit' | 'Business' | 'Official Trip'
      | 'Visiting Friends / Relatives' | 'Conference'
      | 'Employment' | 'Study' | 'Other'
    Mobile_No: string
    Email_Address: string
    Application_Date: string
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as VisaFormData

    const pdfBytes = await fs.readFile(PDF_PATH)
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const pages = pdfDoc.getPages()
    const black = rgb(0, 0, 0)

    const drawText = (coord: TextCoord | undefined, value: string) => {
      if (!coord || !value) return
      const page = pages[coord.page]
      if (!page) return
      const size = coord.size ?? 11
      const str = coord.maxChars ? value.slice(0, coord.maxChars) : value
      page.drawText(str, { x: coord.x, y: coord.y, size, font, color: black })
    }

    const drawCheck = (coord: CheckCoord | undefined) => {
      if (!coord) return
      const page = pages[coord.page]
      if (!page) return
      page.drawText('X', {
        x: coord.x, y: coord.y, size: coord.size ?? 12,
        font: fontBold, color: black,
      })
    }

    const C = VISA_PDF_COORDS

    // Application Type
    if (data.Application_Type === 'In Malaysia') drawCheck(C.applicationType.inMalaysia)
    else if (data.Application_Type === 'Oversea') drawCheck(C.applicationType.oversea)

    // Applicant Particulars
    const ap = data.Applicant_Particulars
    drawText(C.applicant.fullName,            (ap.Full_Name ?? '').toUpperCase())
    if (ap.Gender === 'Male')   drawCheck(C.applicant.genderMale)
    if (ap.Gender === 'Female') drawCheck(C.applicant.genderFemale)
    drawText(C.applicant.placeCountryOfBirth, ap.Place_Country_Of_Birth ?? '')
    drawText(C.applicant.dateOfBirth,         ap.Date_Of_Birth ?? '')
    drawText(C.applicant.nationality,         ap.Nationality ?? '')
    drawText(C.applicant.occupation,          ap.Occupation ?? '')
    drawText(C.applicant.address,             ap.Address ?? '')
    if (ap.Marital_Status === 'Single')  drawCheck(C.applicant.maritalSingle)
    if (ap.Marital_Status === 'Married') drawCheck(C.applicant.maritalMarried)

    // Passport
    const pt = data.Passport_Travel_Document
    drawText(C.passport.documentType,        pt.Document_Type ?? '')
    drawText(C.passport.documentNumber,      pt.Document_Number ?? '')
    drawText(C.passport.placeCountryOfIssue, pt.Place_Country_Of_Issue ?? '')
    drawText(C.passport.validUntil,          pt.Valid_Until ?? '')

    // Sponsor (optional)
    const sp = data.Sponsor_In_Malaysia
    if (sp) {
      drawText(C.sponsor.name,    (sp.Sponsor_Name ?? '').toUpperCase())
      drawText(C.sponsor.nric,     sp.Sponsor_NRIC ?? '')
      drawText(C.sponsor.phone,    sp.Sponsor_Phone ?? '')
      drawText(C.sponsor.address,  sp.Sponsor_Address ?? '')
      drawText(C.sponsor.state,    sp.Sponsor_State ?? '')
    }

    // Application Details
    const ad = data.Application_Details
    drawText(C.details.durationMonths, String(ad.Duration_Of_Proposed_Stay_Months ?? ''))
    const purposeKey: Record<string, keyof typeof C.details.purpose> = {
      'Holiday':                      'holiday',
      'Transit':                      'transit',
      'Business':                     'business',
      'Official Trip':                'official',
      'Visiting Friends / Relatives': 'visiting',
      'Conference':                   'conference',
      'Employment':                   'employment',
      'Study':                        'study',
      'Other':                        'other',
    }
    const pKey = purposeKey[ad.Purpose_Of_Journey]
    if (pKey) drawCheck(C.details.purpose[pKey])
    drawText(C.details.mobileNo,        ad.Mobile_No ?? '')
    drawText(C.details.email,           ad.Email_Address ?? '')
    drawText(C.details.applicationDate, ad.Application_Date ?? '')

    const out = await pdfDoc.save()
    const body = new Uint8Array(out)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Malaysian-Visa-Application-Filled.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error('[visa-pdf] error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to fill PDF' }, { status: 500 })
  }
}
