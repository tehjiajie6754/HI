import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// ==========================================
// THE MDAC COORDINATE MAP
// Format: "JSON_Key": {"page": Page_Index, "x": X_Coord, "y": Y_Coord, "type": "text"}
// ==========================================

const mdac_layout_map: Record<string, { page: number; x: number; y: number; type: string }> = {
  // --- Personal Information ---
  Name:                     { page: 0, x: 150, y: 100, type: 'text' },
  Passport_No:              { page: 0, x: 150, y: 130, type: 'text' },
  Nationality:              { page: 0, x: 400, y: 130, type: 'text' },
  Date_Of_Birth:            { page: 0, x: 150, y: 160, type: 'text' },
  Sex:                      { page: 0, x: 400, y: 160, type: 'text' },
  Place_Of_Birth:           { page: 0, x: 150, y: 190, type: 'text' },
  Date_Of_Passport_Expiry:  { page: 0, x: 400, y: 190, type: 'text' },
  Email_Address:            { page: 0, x: 150, y: 220, type: 'text' },
  Country_Region_Code:      { page: 0, x: 150, y: 250, type: 'text' },
  Mobile_No:                { page: 0, x: 300, y: 250, type: 'text' },

  // --- Traveling Information ---
  Date_Of_Arrival:                  { page: 0, x: 150, y: 300, type: 'text' },
  Date_Of_Departure:                { page: 0, x: 400, y: 300, type: 'text' },
  Mode_Of_Travel:                   { page: 0, x: 150, y: 330, type: 'text' },
  Flight_Vessel_Transportation_No:  { page: 0, x: 400, y: 330, type: 'text' },
  Last_Port_Of_Embarkation:         { page: 0, x: 150, y: 360, type: 'text' },
  Accommodation_Of_Stay:            { page: 0, x: 400, y: 360, type: 'text' },
  Address_In_Malaysia:              { page: 0, x: 150, y: 390, type: 'text' },
  State:                            { page: 0, x: 150, y: 420, type: 'text' },
  City:                             { page: 0, x: 300, y: 420, type: 'text' },
  Postcode:                         { page: 0, x: 450, y: 420, type: 'text' },
}

export interface MdacFormData {
  // Personal Information
  Name: string
  Passport_No: string
  Nationality: string
  Date_Of_Birth: string
  Sex: string
  Place_Of_Birth: string
  Date_Of_Passport_Expiry: string
  Email_Address: string
  Country_Region_Code: string
  Mobile_No: string
  // Traveling Information
  Date_Of_Arrival: string
  Date_Of_Departure: string
  Mode_Of_Travel: string
  Flight_Vessel_Transportation_No: string
  Last_Port_Of_Embarkation: string
  Accommodation_Of_Stay: string
  Address_In_Malaysia: string
  State: string
  City: string
  Postcode: string
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as MdacFormData

    // Create a new single-page PDF with all the MDAC data
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // A4 page size (595 x 842 pt)
    const page = pdfDoc.addPage([595, 842])
    const black = rgb(0, 0, 0)
    const gold = rgb(0.79, 0.66, 0.30)     // #C9A84C
    const darkGray = rgb(0.2, 0.2, 0.2)
    const lightGray = rgb(0.92, 0.92, 0.92)

    // ---- Title Section ----
    page.drawText('MALAYSIA DIGITAL ARRIVAL CARD (MDAC)', {
      x: 65, y: 790, size: 16, font: fontBold, color: rgb(0.1, 0.1, 0.18),
    })
    page.drawText('Auto-filled by Zen Travel', {
      x: 65, y: 770, size: 9, font, color: rgb(0.5, 0.5, 0.5),
    })
    // Gold accent bar
    page.drawRectangle({ x: 65, y: 757, width: 465, height: 2, color: gold })

    // ---- Section: Personal Information ----
    const drawSectionHeader = (label: string, y: number) => {
      page.drawRectangle({ x: 65, y: y - 4, width: 465, height: 22, color: rgb(0.1, 0.1, 0.18) })
      page.drawText(label, { x: 75, y: y, size: 11, font: fontBold, color: rgb(1, 1, 1) })
    }

    const drawField = (label: string, value: string, x: number, y: number, width: number = 200) => {
      page.drawText(label, { x, y: y + 13, size: 8, font, color: rgb(0.45, 0.45, 0.45) })
      // Field box
      page.drawRectangle({ x, y: y - 5, width, height: 16, borderColor: lightGray, borderWidth: 1, color: rgb(0.98, 0.98, 0.98) })
      page.drawText(value || '—', { x: x + 4, y: y - 1, size: 10, font, color: black })
    }

    let y = 730
    drawSectionHeader('PERSONAL INFORMATION', y)

    y -= 40
    drawField('Full Name', data.Name || '', 65, y, 465)

    y -= 38
    drawField('Passport No.', data.Passport_No || '', 65, y, 225)
    drawField('Nationality', data.Nationality || '', 305, y, 225)

    y -= 38
    drawField('Date of Birth', data.Date_Of_Birth || '', 65, y, 225)
    drawField('Sex', data.Sex || '', 305, y, 225)

    y -= 38
    drawField('Place of Birth', data.Place_Of_Birth || '', 65, y, 225)
    drawField('Passport Expiry', data.Date_Of_Passport_Expiry || '', 305, y, 225)

    y -= 38
    drawField('Email Address', data.Email_Address || '', 65, y, 465)

    y -= 38
    drawField('Country/Region Code', data.Country_Region_Code || '', 65, y, 225)
    drawField('Mobile No.', data.Mobile_No || '', 305, y, 225)

    // ---- Section: Traveling Information ----
    y -= 45
    drawSectionHeader('TRAVELING INFORMATION', y)

    y -= 40
    drawField('Date of Arrival', data.Date_Of_Arrival || '', 65, y, 225)
    drawField('Date of Departure', data.Date_Of_Departure || '', 305, y, 225)

    y -= 38
    drawField('Mode of Travel', data.Mode_Of_Travel || '', 65, y, 225)
    drawField('Flight / Vessel No.', data.Flight_Vessel_Transportation_No || '', 305, y, 225)

    y -= 38
    drawField('Last Port of Embarkation', data.Last_Port_Of_Embarkation || '', 65, y, 225)
    drawField('Accommodation', data.Accommodation_Of_Stay || '', 305, y, 225)

    y -= 38
    drawField('Address in Malaysia', data.Address_In_Malaysia || '', 65, y, 465)

    y -= 38
    drawField('State', data.State || '', 65, y, 145)
    drawField('City', data.City || '', 220, y, 145)
    drawField('Postcode', data.Postcode || '', 380, y, 150)

    // ---- Footer ----
    y -= 50
    page.drawRectangle({ x: 65, y: y - 4, width: 465, height: 1, color: lightGray })
    page.drawText('This form was auto-generated by Zen Travel for submission to Malaysia Digital Arrival Card (MDAC) system.', {
      x: 65, y: y - 20, size: 7.5, font, color: rgb(0.5, 0.5, 0.5),
    })
    page.drawText('Please verify all information before official submission at https://imigresen-online.imi.gov.my/mdac/', {
      x: 65, y: y - 32, size: 7.5, font, color: rgb(0.5, 0.5, 0.5),
    })

    const out = await pdfDoc.save()
    const body = new Uint8Array(out)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="MDAC-Filled.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error('[mdac-pdf] error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to generate MDAC PDF' }, { status: 500 })
  }
}
