'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, FileCheck, Check, AlertTriangle, ExternalLink,
  ArrowRight, ArrowLeft, Globe, FileText, Download, Sparkles,
} from 'lucide-react'

type Step =
  | 'nationality'
  | 'checking'
  | 'result'
  | 'form'
  | 'generating'
  | 'application'

interface VisaInfo {
  required: boolean
  visaType: string
  maxStayDays?: number
  fee?: string
  processingDays?: string
  officialUrl?: string
  requiredDocuments?: string[]
  summary?: string
}

interface ApplicantForm {
  Application_Type: 'In Malaysia' | 'Oversea'
  Full_Name: string
  Gender: 'Male' | 'Female' | ''
  Place_Country_Of_Birth: string
  Date_Of_Birth: string
  Nationality: string
  Occupation: string
  Address: string
  Marital_Status: 'Single' | 'Married' | ''
  Document_Type: string
  Document_Number: string
  Place_Country_Of_Issue: string
  Valid_Until: string
  Sponsor_Name: string
  Sponsor_NRIC: string
  Sponsor_Phone: string
  Sponsor_Address: string
  Sponsor_State: string
  Duration_Of_Proposed_Stay_Months: string
  Purpose_Of_Journey: string
  Mobile_No: string
  Email_Address: string
  Application_Date: string
}

const COMMON_NATIONALITIES = [
  'Malaysia', 'Singapore', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines',
  'China', 'Japan', 'South Korea', 'India', 'Pakistan', 'Bangladesh',
  'United States', 'United Kingdom', 'Australia', 'New Zealand', 'Canada',
  'Germany', 'France', 'Netherlands', 'Italy', 'Spain',
  'UAE', 'Saudi Arabia', 'Egypt', 'South Africa', 'Nigeria', 'Brazil', 'Mexico',
]

const PURPOSE_OPTIONS = [
  'Holiday', 'Transit', 'Business', 'Official Trip',
  'Visiting Friends / Relatives', 'Conference',
  'Employment', 'Study', 'Other',
] as const

const todayDDMMYYYY = () => {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

const emptyForm = (overrides: Partial<ApplicantForm> = {}): ApplicantForm => ({
  Application_Type: 'Oversea',
  Full_Name: '',
  Gender: '',
  Place_Country_Of_Birth: '',
  Date_Of_Birth: '',
  Nationality: '',
  Occupation: '',
  Address: '',
  Marital_Status: '',
  Document_Type: 'Passport',
  Document_Number: '',
  Place_Country_Of_Issue: '',
  Valid_Until: '',
  Sponsor_Name: '',
  Sponsor_NRIC: '',
  Sponsor_Phone: '',
  Sponsor_Address: '',
  Sponsor_State: '',
  Duration_Of_Proposed_Stay_Months: '',
  Purpose_Of_Journey: 'Holiday',
  Mobile_No: '',
  Email_Address: '',
  Application_Date: todayDDMMYYYY(),
  ...overrides,
})

export default function VisaCheckModal({
  open, onClose, tripData, destination = 'Malaysia',
}: {
  open: boolean
  onClose: () => void
  tripData: any
  destination?: string
}) {
  const [step, setStep] = useState<Step>('nationality')
  const [nationality, setNationality] = useState('')
  const [customNat, setCustomNat] = useState('')
  const [visa, setVisa] = useState<VisaInfo | null>(null)
  const [form, setForm] = useState<ApplicantForm>(emptyForm())
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const effectiveNationality = (nationality === 'Other' ? customNat : nationality).trim()

  const reset = () => {
    setStep('nationality')
    setNationality(''); setCustomNat('')
    setVisa(null)
    setForm(emptyForm())
    setError(null)
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null) }
  }

  const handleClose = () => { reset(); onClose() }

  const checkVisa = async () => {
    if (!effectiveNationality) return
    setStep('checking')
    setError(null)
    const sys = `You are a visa requirements expert with access to Google Search. Return STRICT JSON only (no markdown fences, no prose) describing tourist visa requirements for a citizen of "${effectiveNationality}" visiting ${destination} for ${tripData?.duration ?? 3} days.

Schema (every field required):
{
  "required": boolean,
  "visaType": string,                  // "Visa-Free" | "Visa-on-Arrival" | "eVisa" | "Visa Required"
  "maxStayDays": number,
  "fee": string,
  "processingDays": string,
  "officialUrl": string,               // official Malaysian eVisa URL
  "requiredDocuments": ["Passport valid 6+ months","Return flight ticket","Hotel booking","Passport photo","Proof of funds"],
  "summary": "1-2 sentence plain-English summary"
}

Use Google Search to confirm CURRENT policy. Do NOT return anything other than this JSON.`

    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: `Check current ${destination} visa requirements for a ${effectiveNationality} citizen on a ${tripData?.duration ?? 3}-day tourist trip. Return the JSON now.` },
          ],
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const text: string = data.choices?.[0]?.message?.content ?? ''
      const m = text.match(/\{[\s\S]*\}/)
      const parsed: VisaInfo = JSON.parse(m ? m[0] : text)
      setVisa(parsed)
      // Pre-fill what we know
      setForm(f => ({
        ...f,
        Nationality: effectiveNationality,
        Duration_Of_Proposed_Stay_Months: String(Math.max(1, Math.ceil((tripData?.duration ?? 3) / 30))),
      }))
      setStep('result')
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? 'Failed to check visa requirements')
      setStep('nationality')
    }
  }

  const update = <K extends keyof ApplicantForm>(key: K, value: ApplicantForm[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  const requiredFields: (keyof ApplicantForm)[] = [
    'Full_Name', 'Gender', 'Place_Country_Of_Birth', 'Date_Of_Birth',
    'Nationality', 'Occupation', 'Address', 'Marital_Status',
    'Document_Number', 'Place_Country_Of_Issue', 'Valid_Until',
    'Duration_Of_Proposed_Stay_Months', 'Purpose_Of_Journey',
    'Mobile_No', 'Email_Address', 'Application_Date',
  ]
  const canSubmitForm = requiredFields.every(k => String(form[k] ?? '').trim().length > 0)

  const buildPayload = () => ({
    Application_Type: form.Application_Type,
    Applicant_Particulars: {
      Full_Name: form.Full_Name.toUpperCase(),
      Gender: form.Gender,
      Place_Country_Of_Birth: form.Place_Country_Of_Birth,
      Date_Of_Birth: form.Date_Of_Birth,
      Nationality: form.Nationality,
      Occupation: form.Occupation,
      Address: form.Address,
      Marital_Status: form.Marital_Status,
    },
    Passport_Travel_Document: {
      Document_Type: form.Document_Type || 'Passport',
      Document_Number: form.Document_Number,
      Place_Country_Of_Issue: form.Place_Country_Of_Issue,
      Valid_Until: form.Valid_Until,
    },
    Sponsor_In_Malaysia: form.Sponsor_Name ? {
      Sponsor_Name: form.Sponsor_Name.toUpperCase(),
      Sponsor_NRIC: form.Sponsor_NRIC,
      Sponsor_Phone: form.Sponsor_Phone,
      Sponsor_Address: form.Sponsor_Address,
      Sponsor_State: form.Sponsor_State,
    } : undefined,
    Application_Details: {
      Duration_Of_Proposed_Stay_Months: parseInt(form.Duration_Of_Proposed_Stay_Months, 10) || 0,
      Purpose_Of_Journey: form.Purpose_Of_Journey,
      Mobile_No: form.Mobile_No,
      Email_Address: form.Email_Address,
      Application_Date: form.Application_Date,
    },
  })

  const generateApplication = async () => {
    if (!canSubmitForm) return
    setStep('generating')
    setError(null)
    try {
      const res = await fetch('/api/visa-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || `PDF generation failed (${res.status})`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setStep('application')
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? 'Failed to generate filled PDF')
      setStep('form')
    }
  }

  // ── UI helpers ────────────────────────────────────────────────────────────────
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{children}</label>
  )
  const inputClass = "w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-[#1A1A2E] font-medium focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 outline-none transition-all placeholder:text-gray-400"

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mt-8 mb-4 pb-2 border-b border-[#C9A84C]/30">
      <span className="w-1.5 h-5 bg-[#C9A84C] rounded" />
      <h4 className="font-serif font-bold text-[#1A1A2E] text-base uppercase tracking-wide">{title}</h4>
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
            initial={{ scale: 0.92, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-[#1A1A2E] to-[#2a2a4e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/20 flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-white text-xl leading-tight">Visa Check</h2>
                  <p className="text-sm text-white/50 mt-0.5">
                    Auto-fill your Malaysian Visa Application Form
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Progress Pips */}
            <div className="px-8 pt-4 flex items-center gap-2 text-xs flex-shrink-0">
              {[
                { key: 'nationality', label: 'Nationality' },
                { key: 'result',      label: 'Requirements' },
                { key: 'form',        label: 'Your Details' },
                { key: 'application', label: 'Filled PDF' },
              ].map((p, i, arr) => {
                const order = ['nationality', 'checking', 'result', 'form', 'generating', 'application']
                const activeIdx = order.indexOf(step)
                const myIdx = order.indexOf(p.key)
                const isActive = activeIdx >= myIdx
                return (
                  <div key={p.key} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center gap-2 ${isActive ? 'text-[#C9A84C]' : 'text-gray-300'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-[#C9A84C] text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {i + 1}
                      </div>
                      <span className="font-semibold whitespace-nowrap">{p.label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`flex-1 h-px ${isActive ? 'bg-[#C9A84C]/40' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-8 flex-1">
              {error && (
                <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-4">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Step: nationality */}
              {step === 'nationality' && (
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Globe className="w-5 h-5 text-[#C9A84C]" />
                    <h3 className="font-serif font-bold text-[#1A1A2E] text-lg">Select your nationality</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    We'll check if you need a visa to enter {destination} for a {tripData?.duration ?? 3}-day tourist trip.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                    {COMMON_NATIONALITIES.map(n => {
                      const selected = nationality === n
                      return (
                        <button
                          key={n}
                          onClick={() => setNationality(n)}
                          className={`text-sm font-medium px-4 py-3 rounded-xl transition-all border-2 ${
                            selected
                              ? 'bg-[#C9A84C] text-white border-[#C9A84C] shadow-md'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#C9A84C]/60 hover:text-[#1A1A2E]'
                          }`}
                        >
                          {n}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setNationality('Other')}
                      className={`text-sm font-medium px-4 py-3 rounded-xl transition-all border-2 ${
                        nationality === 'Other'
                          ? 'bg-[#1A1A2E] text-white border-[#1A1A2E] shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A1A2E]/60 hover:text-[#1A1A2E]'
                      }`}
                    >
                      Other…
                    </button>
                  </div>
                  {nationality === 'Other' && (
                    <input
                      type="text"
                      value={customNat}
                      onChange={(e) => setCustomNat(e.target.value)}
                      placeholder="Enter your nationality (e.g. Kenya)"
                      className={inputClass + ' mb-4'}
                    />
                  )}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={checkVisa}
                      disabled={!effectiveNationality}
                      className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all ${
                        effectiveNationality
                          ? 'bg-[#C9A84C] text-white hover:bg-[#A68A3D] shadow-lg hover:-translate-y-0.5'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Check Requirements <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step: checking */}
              {step === 'checking' && (
                <div className="flex flex-col items-center justify-center py-14">
                  <div className="w-16 h-16 relative mb-5">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[#C9A84C] rounded-full border-t-transparent animate-spin" />
                  </div>
                  <h3 className="font-serif font-bold text-[#1A1A2E] text-lg mb-1">
                    Checking {destination} visa policy…
                  </h3>
                  <p className="text-sm text-gray-500">
                    Our AI is searching the latest immigration data for {effectiveNationality} passport holders.
                  </p>
                </div>
              )}

              {/* Step: result */}
              {step === 'result' && visa && (
                <div>
                  <div className={`rounded-2xl p-6 border ${visa.required ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      {visa.required
                        ? <AlertTriangle className="w-6 h-6 text-amber-600" />
                        : <Check className="w-6 h-6 text-emerald-600" />}
                      <div>
                        <h3 className="font-serif font-bold text-[#1A1A2E] text-xl leading-tight">
                          {visa.required ? 'Visa required' : 'No visa required'}
                        </h3>
                        <p className={`text-sm font-semibold ${visa.required ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {visa.visaType}
                        </p>
                      </div>
                    </div>
                    {visa.summary && <p className="text-sm text-gray-700 leading-relaxed">{visa.summary}</p>}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                    {visa.maxStayDays != null && (
                      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Max stay</p>
                        <p className="text-[#1A1A2E] font-semibold">{visa.maxStayDays} days</p>
                      </div>
                    )}
                    {visa.fee && (
                      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Fee</p>
                        <p className="text-[#1A1A2E] font-semibold">{visa.fee}</p>
                      </div>
                    )}
                    {visa.processingDays && (
                      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Processing</p>
                        <p className="text-[#1A1A2E] font-semibold">{visa.processingDays}</p>
                      </div>
                    )}
                  </div>

                  {visa.required && visa.requiredDocuments && visa.requiredDocuments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-serif font-bold text-[#1A1A2E] text-base mb-3">Documents you'll need</h4>
                      <ul className="space-y-2">
                        {visa.requiredDocuments.map((d, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-[#C9A84C] mt-0.5 shrink-0" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => setStep('nationality')}
                      className="inline-flex items-center gap-2 text-sm text-gray-500 font-semibold hover:text-[#C9A84C] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Change nationality
                    </button>
                    {visa.officialUrl && (
                      <a href={visa.officialUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" /> Official portal
                      </a>
                    )}
                    {visa.required && (
                      <button
                        onClick={() => setStep('form')}
                        className="ml-auto inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm bg-[#C9A84C] text-white hover:bg-[#A68A3D] shadow-lg hover:-translate-y-0.5 transition-all"
                      >
                        Fill Application <Sparkles className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step: form — structured to match Malaysian Visa PDF */}
              {step === 'form' && (
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <FileText className="w-5 h-5 text-[#C9A84C]" />
                    <h3 className="font-serif font-bold text-[#1A1A2E] text-lg">Malaysian Visa Application Form</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Fill in your details. We'll auto-fill the official PDF and hand it back for you to download.
                  </p>

                  {/* Application Type */}
                  <SectionHeader title="Application Type" />
                  <div className="flex gap-3">
                    {(['In Malaysia', 'Oversea'] as const).map(v => (
                      <button
                        key={v}
                        onClick={() => update('Application_Type', v)}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                          form.Application_Type === v
                            ? 'bg-[#C9A84C] text-white border-[#C9A84C] shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#C9A84C]/60 hover:text-[#1A1A2E]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>

                  {/* Applicant Particulars */}
                  <SectionHeader title="Applicant Particulars" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label>Full Name (Capital Letters)</Label>
                      <input className={inputClass} value={form.Full_Name}
                        onChange={e => update('Full_Name', e.target.value.toUpperCase())}
                        placeholder="JOHN DOE" />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <div className="flex gap-2">
                        {(['Male', 'Female'] as const).map(g => (
                          <button key={g} onClick={() => update('Gender', g)}
                            className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                              form.Gender === g
                                ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A1A2E]/60'
                            }`}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Marital Status</Label>
                      <div className="flex gap-2">
                        {(['Single', 'Married'] as const).map(m => (
                          <button key={m} onClick={() => update('Marital_Status', m)}
                            className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                              form.Marital_Status === m
                                ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A1A2E]/60'
                            }`}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Place / Country of Birth</Label>
                      <input className={inputClass} value={form.Place_Country_Of_Birth}
                        onChange={e => update('Place_Country_Of_Birth', e.target.value)} placeholder="Kuala Lumpur, Malaysia" />
                    </div>
                    <div>
                      <Label>Date of Birth (DD/MM/YYYY)</Label>
                      <input className={inputClass} value={form.Date_Of_Birth}
                        onChange={e => update('Date_Of_Birth', e.target.value)} placeholder="15/08/1995" />
                    </div>
                    <div>
                      <Label>Nationality</Label>
                      <input className={inputClass} value={form.Nationality}
                        onChange={e => update('Nationality', e.target.value)} placeholder="Malaysian" />
                    </div>
                    <div>
                      <Label>Occupation</Label>
                      <input className={inputClass} value={form.Occupation}
                        onChange={e => update('Occupation', e.target.value)} placeholder="Software Engineer" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Address</Label>
                      <input className={inputClass} value={form.Address}
                        onChange={e => update('Address', e.target.value)} placeholder="Full home address" />
                    </div>
                  </div>

                  {/* Passport */}
                  <SectionHeader title="Passport / Travel Document" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Document Type</Label>
                      <input className={inputClass} value={form.Document_Type}
                        onChange={e => update('Document_Type', e.target.value)} placeholder="Passport" />
                    </div>
                    <div>
                      <Label>Document Number</Label>
                      <input className={inputClass} value={form.Document_Number}
                        onChange={e => update('Document_Number', e.target.value)} placeholder="A12345678" />
                    </div>
                    <div>
                      <Label>Place / Country of Issue</Label>
                      <input className={inputClass} value={form.Place_Country_Of_Issue}
                        onChange={e => update('Place_Country_Of_Issue', e.target.value)} placeholder="Malaysia" />
                    </div>
                    <div>
                      <Label>Valid Until (DD/MM/YYYY)</Label>
                      <input className={inputClass} value={form.Valid_Until}
                        onChange={e => update('Valid_Until', e.target.value)} placeholder="30/06/2030" />
                    </div>
                  </div>

                  {/* Sponsor */}
                  <SectionHeader title="Sponsor in Malaysia (Optional)" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Sponsor Name (Capital Letters)</Label>
                      <input className={inputClass} value={form.Sponsor_Name}
                        onChange={e => update('Sponsor_Name', e.target.value.toUpperCase())} placeholder="JANE DOE" />
                    </div>
                    <div>
                      <Label>Sponsor NRIC</Label>
                      <input className={inputClass} value={form.Sponsor_NRIC}
                        onChange={e => update('Sponsor_NRIC', e.target.value)} placeholder="950101-12-3456" />
                    </div>
                    <div>
                      <Label>Sponsor Phone</Label>
                      <input className={inputClass} value={form.Sponsor_Phone}
                        onChange={e => update('Sponsor_Phone', e.target.value)} placeholder="+60 12-345 6789" />
                    </div>
                    <div>
                      <Label>Sponsor State</Label>
                      <input className={inputClass} value={form.Sponsor_State}
                        onChange={e => update('Sponsor_State', e.target.value)} placeholder="Penang" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Sponsor Address</Label>
                      <input className={inputClass} value={form.Sponsor_Address}
                        onChange={e => update('Sponsor_Address', e.target.value)} placeholder="Full address" />
                    </div>
                  </div>

                  {/* Application Details */}
                  <SectionHeader title="Application Details" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Duration of Proposed Stay (Months)</Label>
                      <input type="number" min={1} className={inputClass}
                        value={form.Duration_Of_Proposed_Stay_Months}
                        onChange={e => update('Duration_Of_Proposed_Stay_Months', e.target.value)}
                        placeholder="1" />
                    </div>
                    <div>
                      <Label>Purpose of Journey</Label>
                      <select className={inputClass} value={form.Purpose_Of_Journey}
                        onChange={e => update('Purpose_Of_Journey', e.target.value)}>
                        {PURPOSE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Mobile Number</Label>
                      <input className={inputClass} value={form.Mobile_No}
                        onChange={e => update('Mobile_No', e.target.value)} placeholder="+60 12-345 6789" />
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <input type="email" className={inputClass} value={form.Email_Address}
                        onChange={e => update('Email_Address', e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div>
                      <Label>Application Date (DD/MM/YYYY)</Label>
                      <input className={inputClass} value={form.Application_Date}
                        onChange={e => update('Application_Date', e.target.value)} placeholder={todayDDMMYYYY()} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => setStep('result')}
                      className="inline-flex items-center gap-2 text-sm text-gray-500 font-semibold hover:text-[#C9A84C] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={generateApplication}
                      disabled={!canSubmitForm}
                      className={`ml-auto inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm transition-all ${
                        canSubmitForm
                          ? 'bg-[#C9A84C] text-white hover:bg-[#A68A3D] shadow-lg hover:-translate-y-0.5'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Generate Filled PDF <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step: generating */}
              {step === 'generating' && (
                <div className="flex flex-col items-center justify-center py-14">
                  <div className="w-16 h-16 relative mb-5">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[#C9A84C] rounded-full border-t-transparent animate-spin" />
                  </div>
                  <h3 className="font-serif font-bold text-[#1A1A2E] text-lg mb-1">
                    Filling your official PDF…
                  </h3>
                  <p className="text-sm text-gray-500">
                    Overlaying your details on the Malaysian Visa Application Form.
                  </p>
                </div>
              )}

              {/* Step: application (filled PDF ready) */}
              {step === 'application' && pdfUrl && (
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-serif font-bold text-[#1A1A2E] text-lg">Your filled application is ready</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-5">
                    Preview the auto-filled Malaysian Visa Application Form below, then download and submit on the official portal.
                  </p>

                  <div className="w-full h-[520px] border-2 border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                    <iframe src={pdfUrl} className="w-full h-full" title="Filled Malaysia Visa Application" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    <a
                      href={pdfUrl}
                      download="Malaysian-Visa-Application-Filled.pdf"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-[#C9A84C] text-white hover:bg-[#A68A3D] shadow-md transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </a>
                    {visa?.officialUrl && (
                      <a
                        href={visa.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-[#1A1A2E] bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" /> Submit on official portal
                      </a>
                    )}
                    <button
                      onClick={() => setStep('form')}
                      className="ml-auto inline-flex items-center gap-2 text-sm text-gray-500 font-semibold hover:text-[#C9A84C] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Edit details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
