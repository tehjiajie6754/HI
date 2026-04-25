'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import {
  Camera, CameraOff, ScanFace, Eye, MoveHorizontal, MoveVertical,
  CheckCircle2, Sparkles, ShieldCheck,
} from 'lucide-react'


// Global liveness state
let faceLandmarker: any = null
let runningMode: 'IMAGE' | 'VIDEO' = 'IMAGE'
let webcamRunning = false
let lastVideoTime = -1
let results: any = undefined
let drawingUtils: any = null

let livenessTestActive = false
let currentTestType: 'blink' | 'head_turn' | 'nod' = 'blink'
let testStatus: 'waiting' | 'in_progress' | 'passed' | 'failed' = 'waiting'
let blinkCount = 0, requiredBlinks = 2, lastBlinkTime = 0, isCurrentlyBlinking = false
let blinkThreshold = 0.5
let headPositionHistory: { yaw: number; timestamp: number }[] = []
let hasMovedLeft = false, hasMovedRight = false, centerYaw = 0, headTurnThreshold = 15
let nodCount = 0, requiredNods = 2, lastNodTime = 0, isCurrentlyNodding = false
let verticalPositionHistory: { pitch: number; timestamp: number }[] = []
let centerPitch = 0, nodThreshold = 10

const videoWidth = 480

export default function RegisterPage() {
  const [isWebcamRunning, setIsWebcamRunning] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFaceRecognitionModal, setShowFaceRecognitionModal] = useState(false)
  const [faceRecognitionStatus, setFaceRecognitionStatus] = useState('')
  const [testInstruction, setTestInstruction] = useState('Click "Start Verification" to begin the liveness test')
  const [testStatusText, setTestStatusText] = useState('Ready for verification')
  const [isTestActive, setIsTestActive] = useState(false)
  const [testPassed, setTestPassed] = useState(false)

  const router = useRouter()
  const { loginWithUser } = useUser()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const enableWebcamButtonRef = useRef<HTMLButtonElement>(null)
  const demosSectionRef = useRef<HTMLElement>(null)

  useEffect(() => { createFaceLandmarker() }, [])

  async function createFaceLandmarker() {
    const vision = await import('@mediapipe/tasks-vision')
    const { FaceLandmarker, FilesetResolver } = vision
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    )
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true, runningMode, numFaces: 1,
    })
    if (demosSectionRef.current) demosSectionRef.current.classList.remove('invisible')
  }

  function enableCam() {
    if (!faceLandmarker) return
    if (webcamRunning) {
      webcamRunning = false; setIsWebcamRunning(false)
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
        videoRef.current.srcObject = null
      }
    } else {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.addEventListener('loadeddata', () => {
            webcamRunning = true; setIsWebcamRunning(true); predictWebcam()
          })
        }
      }).catch(() => { webcamRunning = false; setIsWebcamRunning(false) })
    }
  }

  async function predictWebcam() {
    const video = videoRef.current!, canvas = canvasRef.current!, ctx = canvas.getContext('2d')!
    const radio = video.videoHeight / video.videoWidth
    video.style.width = videoWidth + 'px'; video.style.height = videoWidth * radio + 'px'
    canvas.style.width = videoWidth + 'px'; canvas.style.height = videoWidth * radio + 'px'
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    if (runningMode === 'IMAGE') { runningMode = 'VIDEO'; await faceLandmarker.setOptions({ runningMode }) }
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime
      results = faceLandmarker.detectForVideo(video, performance.now())
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (results?.faceLandmarks) {
      if (!drawingUtils) {
        const vision = await import('@mediapipe/tasks-vision')
        const { DrawingUtils, FaceLandmarker } = vision
        drawingUtils = new DrawingUtils(ctx)
        for (const lm of results.faceLandmarks) {
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: '#C0C0C070', lineWidth: 1 })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: '#FF3030' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: '#FF3030' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: '#30FF30' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: '#30FF30' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: '#E0E0E0' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: '#E0E0E0' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: '#FF3030' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: '#30FF30' })
        }
      } else {
        const vision = await import('@mediapipe/tasks-vision')
        const { FaceLandmarker } = vision
        for (const lm of results.faceLandmarks) {
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: '#C0C0C070', lineWidth: 1 })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: '#FF3030' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: '#FF3030' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: '#30FF30' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: '#30FF30' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: '#E0E0E0' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: '#E0E0E0' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: '#FF3030' })
          drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: '#30FF30' })
        }
      }
    }
    if (results?.faceBlendshapes && results?.faceLandmarks) detectLiveness(results.faceBlendshapes, results.faceLandmarks)
    if (webcamRunning) window.requestAnimationFrame(predictWebcam)
  }

  function startRandomTest() {
    if (livenessTestActive) { stopTest(); return }
    const tests: ('blink' | 'head_turn' | 'nod')[] = ['blink', 'head_turn', 'nod']
    currentTestType = tests[Math.floor(Math.random() * tests.length)]
    livenessTestActive = true; testStatus = 'waiting'; setIsTestActive(true); setTestPassed(false)
    resetAllVars(); updateUI()
  }

  function stopTest() { livenessTestActive = false; testStatus = 'waiting'; setIsTestActive(false); updateUI() }

  function resetAllVars() {
    blinkCount = 0; lastBlinkTime = 0; isCurrentlyBlinking = false
    headPositionHistory = []; hasMovedLeft = false; hasMovedRight = false; centerYaw = 0
    nodCount = 0; lastNodTime = 0; isCurrentlyNodding = false; verticalPositionHistory = []; centerPitch = 0
  }

  function detectLiveness(blendShapes: any[], landmarks: any[]) {
    if (!livenessTestActive || !blendShapes?.length || !landmarks?.length) return
    if (currentTestType === 'blink') detectBlink(blendShapes)
    else if (currentTestType === 'head_turn') detectHeadTurn(landmarks[0])
    else detectNod(landmarks[0])
  }

  function onTestPassed() {
    testStatus = 'passed'; updateUI()
    setTimeout(() => { stopTest(); showSuccessAndRecognize() }, 3000)
  }

  function detectBlink(blendShapes: any[]) {
    let eyeL = 0, eyeR = 0
    blendShapes[0].categories.forEach((s: any) => { if (s.categoryName === 'eyeBlinkLeft') eyeL = s.score; if (s.categoryName === 'eyeBlinkRight') eyeR = s.score })
    const now = Date.now(), both = eyeL > blinkThreshold && eyeR > blinkThreshold
    if (both && !isCurrentlyBlinking && now - lastBlinkTime > 500) { isCurrentlyBlinking = true; blinkCount++; lastBlinkTime = now; testStatus = 'in_progress'; updateUI() }
    if (!both && isCurrentlyBlinking) isCurrentlyBlinking = false
    if (blinkCount >= requiredBlinks && testStatus !== 'passed') onTestPassed()
  }

  function detectHeadTurn(landmarks: any[]) {
    const noseTip = landmarks[1], leftEye = landmarks[33], rightEye = landmarks[362]
    const yaw = Math.atan2(noseTip.x - (leftEye.x + rightEye.x) / 2, 0.1) * (180 / Math.PI)
    if (headPositionHistory.length === 0) centerYaw = yaw
    headPositionHistory.push({ yaw, timestamp: Date.now() })
    if (headPositionHistory.length > 30) headPositionHistory.shift()
    const rel = yaw - centerYaw
    if (rel < -headTurnThreshold && !hasMovedLeft) { hasMovedLeft = true; testStatus = 'in_progress'; updateUI() }
    if (rel > headTurnThreshold && !hasMovedRight) { hasMovedRight = true; testStatus = 'in_progress'; updateUI() }
    if (hasMovedLeft && hasMovedRight && testStatus !== 'passed') onTestPassed()
  }

  function detectNod(landmarks: any[]) {
    if (!landmarks?.length) return
    const now = performance.now()
    const noseTip = landmarks[1], forehead = landmarks[9], chin = landmarks[175]
    const pitch = ((noseTip.y - forehead.y) / Math.abs(forehead.y - chin.y)) * 45
    verticalPositionHistory.push({ pitch, timestamp: now })
    verticalPositionHistory = verticalPositionHistory.filter(e => now - e.timestamp < 1000)
    if (verticalPositionHistory.length === 5) centerPitch = verticalPositionHistory.slice(0, 5).reduce((s, e) => s + e.pitch, 0) / 5
    if (verticalPositionHistory.length < 5) return
    const isNodding = Math.abs(pitch - centerPitch) > nodThreshold
    if (isNodding && !isCurrentlyNodding && now - lastNodTime > 800) { isCurrentlyNodding = true; nodCount++; lastNodTime = now; testStatus = 'in_progress'; updateUI() }
    if (!isNodding && isCurrentlyNodding) isCurrentlyNodding = false
    if (nodCount >= requiredNods && testStatus !== 'passed') onTestPassed()
  }

  function updateUI() {
    if (testStatus === 'passed') {
      setTestPassed(true); setTestInstruction('<b>🎉 Verification Successful!</b>'); setTestStatusText('✅ REGISTRATION APPROVED'); return
    }
    if (currentTestType === 'blink') {
      setTestInstruction(livenessTestActive ? '<b>Please blink your eyes twice</b>' : 'Click "Start Verification" to begin')
      setTestStatusText(testStatus === 'in_progress' ? `Progress: ${blinkCount}/2 blinks` : 'Waiting for blinks')
    } else if (currentTestType === 'head_turn') {
      setTestInstruction(livenessTestActive ? '<b>Turn your head LEFT, then RIGHT</b>' : 'Click "Start Verification" to begin')
      setTestStatusText(`Left: ${hasMovedLeft ? 'Done' : 'Pending'} · Right: ${hasMovedRight ? 'Done' : 'Pending'}`)
    } else {
      setTestInstruction(livenessTestActive ? '<b>Please nod your head up and down twice</b>' : 'Click "Start Verification" to begin')
      setTestStatusText(testStatus === 'in_progress' ? `Progress: ${nodCount}/2 nods` : 'Waiting for nods')
    }
  }

  function showSuccessAndRecognize() {
    setShowSuccessModal(true)
    setTimeout(() => {
      setShowSuccessModal(false)
      setShowFaceRecognitionModal(true)
      setFaceRecognitionStatus('Registering your face...')

      setTimeout(() => {
        setFaceRecognitionStatus('Registration successful!')
        loginWithUser({
          id: 'new-user-001',
          full_name: 'New Traveller',
          email: 'new@zentravel.com',
          phone: '+60123456789',
          nationality: 'Malaysian',
        })
        setTimeout(() => {
          setShowFaceRecognitionModal(false)
          router.push('/onboarding')
        }, 1500)
      }, 2000)
    }, 2000)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Globe World Tour background via iframe */}
      <iframe
        src="/globe-bg.html"
        className="absolute inset-0 w-full h-full border-0"
        style={{ zIndex: 0, pointerEvents: 'none' }}
        title="Globe Background"
        aria-hidden="true"
        tabIndex={-1}
      />

      <style>{`video { transform: rotateY(180deg); } canvas.mirror { transform: rotateY(180deg); } .invisible { opacity: 0.15; pointer-events: none; }`}</style>

      <div className="relative z-10 px-4 py-8 max-w-4xl mx-auto overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-white via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              📝 Create Account
            </span>
          </h1>
          <p className="text-white/70">Complete face verification to register your account</p>
        </div>

        <section ref={demosSectionRef} className="invisible transition-opacity duration-500 space-y-6">
          {/* ── Camera panel ──────────────────────────────────────────────────── */}
          <div className="relative group">
            {/* Aurora glow behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#C9A84C]/30 via-cyan-400/20 to-[#C9A84C]/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-90 transition-opacity" />

            {/* Card */}
            <div className="relative bg-gradient-to-br from-[#0E1423]/85 to-[#1A1A2E]/85 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Top gold + cyan stripe */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
              <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent blur-sm" />

              {/* Header */}
              <div className="px-7 py-5 border-b border-white/10 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C9A84C]/30 to-[#C9A84C]/5 border border-[#C9A84C]/30 flex items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(201,168,76,0.2)]">
                  <ScanFace className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl text-white leading-tight">Face Registration</h2>
                  <p className="text-sm text-white/50 tracking-wide">Align your face inside the targeting reticle</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-cyan-300/70 font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full ${isWebcamRunning ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                  {isWebcamRunning ? 'Online' : 'Offline'}
                </div>
              </div>

              <div className="p-6 md:p-7">
                {/* Enable / disable camera */}
                <div className="flex justify-center mb-6">
                  <button
                    ref={enableWebcamButtonRef}
                    onClick={enableCam}
                    className={`group/btn relative inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm tracking-wider uppercase transition-all duration-300 ${
                      isWebcamRunning
                        ? 'bg-white/5 border border-red-300/40 text-red-300 hover:bg-red-500/10 hover:border-red-300/70'
                        : 'bg-gradient-to-r from-[#C9A84C] to-[#A68A3D] text-white shadow-[0_0_25px_rgba(201,168,76,0.5)] hover:shadow-[0_0_35px_rgba(201,168,76,0.7)] hover:-translate-y-0.5'
                    }`}
                  >
                    {isWebcamRunning
                      ? <><CameraOff className="w-4 h-4" /> Disable Camera</>
                      : <><Camera className="w-4 h-4" /> Enable Camera</>}
                  </button>
                </div>

                {/* Camera viewport with corner targeting brackets */}
                <div className="flex justify-center">
                  <div className="relative" style={{ maxWidth: 480, width: '100%' }}>
                    {/* Sci-fi targeting reticle corners */}
                    <span className="pointer-events-none absolute -top-1 -left-1 w-7 h-7 border-t-2 border-l-2 border-[#C9A84C] rounded-tl-2xl z-20" />
                    <span className="pointer-events-none absolute -top-1 -right-1 w-7 h-7 border-t-2 border-r-2 border-[#C9A84C] rounded-tr-2xl z-20" />
                    <span className="pointer-events-none absolute -bottom-1 -left-1 w-7 h-7 border-b-2 border-l-2 border-[#C9A84C] rounded-bl-2xl z-20" />
                    <span className="pointer-events-none absolute -bottom-1 -right-1 w-7 h-7 border-b-2 border-r-2 border-[#C9A84C] rounded-br-2xl z-20" />

                    {/* Soft outer glow when live */}
                    {isWebcamRunning && (
                      <div className="absolute -inset-2 rounded-2xl bg-[#C9A84C]/15 blur-xl animate-pulse pointer-events-none" />
                    )}

                    <div className="relative bg-[#05080F] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-inner">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto object-cover" />
                      <canvas ref={canvasRef} className="mirror absolute left-0 top-0 w-full h-auto" />

                      {/* LIVE badge */}
                      {isWebcamRunning && (
                        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-[#C9A84C] to-[#A68A3D] text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] flex items-center gap-1.5 shadow-lg shadow-[#C9A84C]/40">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          LIVE
                        </div>
                      )}

                      {/* Empty-state hint */}
                      {!isWebcamRunning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-2 z-10">
                          <ScanFace className="w-12 h-12" strokeWidth={1.2} />
                          <p className="text-xs uppercase tracking-[0.25em] font-semibold">Camera Offline</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Liveness test panel ───────────────────────────────────────────── */}
          <div className="relative group">
            <div className={`absolute -inset-1 rounded-3xl blur-xl opacity-70 group-hover:opacity-90 transition-opacity ${
              testPassed
                ? 'bg-gradient-to-r from-emerald-400/30 via-emerald-300/20 to-emerald-400/30'
                : 'bg-gradient-to-r from-[#C9A84C]/25 via-cyan-400/15 to-[#C9A84C]/25'
            }`} />

            <div className="relative bg-gradient-to-br from-[#0E1423]/85 to-[#1A1A2E]/85 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] p-8 md:p-10 text-center overflow-hidden">
              {/* Top accent stripes */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
              <div className="absolute top-0 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent blur-sm" />

              {/* Big circular indicator */}
              <div className="relative w-24 h-24 mx-auto mb-5">
                {/* Outer pulsing halo */}
                <div className={`absolute inset-0 rounded-full ${isTestActive && !testPassed ? 'animate-ping' : ''} ${
                  testPassed ? 'bg-emerald-400/30' : 'bg-[#C9A84C]/20'
                }`} />
                {/* Mid ring */}
                <div className={`absolute inset-1 rounded-full border ${
                  testPassed ? 'border-emerald-300/40' : 'border-[#C9A84C]/30'
                }`} />
                {/* Inner glass disc with icon */}
                <div className={`absolute inset-3 rounded-full border-2 backdrop-blur-sm flex items-center justify-center ${
                  testPassed
                    ? 'border-emerald-300/60 bg-gradient-to-br from-emerald-400/25 to-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                    : 'border-[#C9A84C]/50 bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 shadow-[0_0_30px_rgba(201,168,76,0.35)]'
                }`}>
                  {testPassed
                    ? <CheckCircle2 className="w-9 h-9 text-emerald-300" />
                    : currentTestType === 'blink'
                      ? <Eye className="w-9 h-9 text-[#C9A84C]" />
                      : currentTestType === 'head_turn'
                        ? <MoveHorizontal className="w-9 h-9 text-[#C9A84C]" />
                        : <MoveVertical className="w-9 h-9 text-[#C9A84C]" />}
                </div>
              </div>

              {/* Status pill */}
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border backdrop-blur-sm ${
                testPassed
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-300/30'
                  : isTestActive
                    ? 'bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]/40'
                    : 'bg-white/5 text-white/60 border-white/10'
              }`}>
                {testPassed ? <ShieldCheck className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                {testStatusText}
              </div>

              {/* Headline */}
              <div className={`text-3xl md:text-4xl font-serif font-bold mb-3 ${testPassed ? 'text-emerald-200' : 'text-white'}`}>
                {testPassed ? 'Verification Successful' : 'Liveness Test'}
              </div>

              {/* Instruction */}
              <p className="text-white/70 text-base md:text-lg mb-8 max-w-md mx-auto leading-relaxed" dangerouslySetInnerHTML={{ __html: testInstruction }} />

              {/* CTA */}
              <button
                onClick={startRandomTest}
                disabled={!isWebcamRunning}
                className={`relative inline-flex items-center gap-2 px-12 py-4 rounded-full font-bold text-base tracking-wider uppercase transition-all duration-300 ${
                  !isWebcamRunning
                    ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                    : isTestActive
                      ? 'bg-white/5 border border-red-300/40 text-red-300 hover:bg-red-500/10'
                      : 'bg-gradient-to-r from-[#C9A84C] via-[#D4B25A] to-[#A68A3D] text-white shadow-[0_0_30px_rgba(201,168,76,0.5)] hover:shadow-[0_0_45px_rgba(201,168,76,0.75)] hover:-translate-y-0.5'
                }`}
              >
                {!isWebcamRunning ? 'Enable Camera First' : isTestActive ? 'Stop Test' : 'Start Verification'}
              </button>

              {!isWebcamRunning && (
                <p className="text-xs text-white/40 mt-4 tracking-wide">Enable your camera before starting verification</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center animate-scale-in">
            <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-5" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">✅ Liveness Verified!</h2>
            <p className="text-gray-500">Registering your face...</p>
          </div>
        </div>
      )}

      {/* Face Recognition Modal */}
      {showFaceRecognitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center animate-scale-in">
            <div className="mb-5">
              {faceRecognitionStatus.includes('successful') ? (
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-2xl">✅</div>
              ) : (
                <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-3">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {faceRecognitionStatus.includes('successful') ? '🎉 Account Created!' : '📝 Registering...'}
              </span>
            </h2>
            <p className="text-gray-500">{faceRecognitionStatus}</p>
          </div>
        </div>
      )}
    </div>
  )
}
