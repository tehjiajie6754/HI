'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { X, Camera, CameraOff } from 'lucide-react'

// --- Module-level liveness state (reset on each mount) ---
let faceLandmarker: any = null
let runningMode: 'IMAGE' | 'VIDEO' = 'IMAGE'
let webcamRunning = false
let lastVideoTime = -1
let results: any = undefined
let drawingUtils: any = null

let livenessTestActive = false
let currentTestType: 'blink' | 'head_turn' | 'nod' = 'blink'
let testStatus: 'waiting' | 'in_progress' | 'passed' | 'failed' = 'waiting'
let eyeBlinkLeftHistory: number[] = []
let eyeBlinkRightHistory: number[] = []
const blinkThreshold = 0.5
let blinkCount = 0
const requiredBlinks = 2
let lastBlinkTime = 0
let isCurrentlyBlinking = false
let headPositionHistory: { yaw: number; timestamp: number }[] = []
let hasMovedLeft = false
let hasMovedRight = false
let centerYaw = 0
const headTurnThreshold = 15
let nodCount = 0
const requiredNods = 2
let lastNodTime = 0
let isCurrentlyNodding = false
let verticalPositionHistory: { pitch: number; timestamp: number }[] = []
let centerPitch = 0
const nodThreshold = 10

interface FaceLivenessModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
  title?: string
  description?: string
}

export default function FaceLivenessModal({
  isOpen,
  onClose,
  onVerified,
  title = 'Face Liveness Verification',
  description = 'Position your face clearly in front of the camera',
}: FaceLivenessModalProps) {
  const [isWebcamRunning, setIsWebcamRunning] = useState(false)
  const [testInstruction, setTestInstruction] = useState('Click "Start Verification" to begin')
  const [testStatusText, setTestStatusText] = useState('Ready for verification')
  const [isTestActive, setIsTestActive] = useState(false)
  const [testPassed, setTestPassed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const demosSectionRef = useRef<HTMLDivElement>(null)

  // Reset all state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsWebcamRunning(false)
      setTestInstruction('Click "Start Verification" to begin')
      setTestStatusText('Ready for verification')
      setIsTestActive(false)
      setTestPassed(false)
      setIsLoading(true)
      // Reset module vars
      webcamRunning = false
      livenessTestActive = false
      testStatus = 'waiting'
      drawingUtils = null
      lastVideoTime = -1
      createFaceLandmarker()
    } else {
      stopCamera()
    }
  }, [isOpen])

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopCamera() }
  }, [])

  function stopCamera() {
    webcamRunning = false
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
  }

  async function createFaceLandmarker() {
    try {
      const vision = await import('@mediapipe/tasks-vision')
      const { FaceLandmarker, FilesetResolver } = vision
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
      )
      runningMode = 'IMAGE'
      faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: true,
        runningMode,
        numFaces: 1,
      })
      setIsLoading(false)
      if (demosSectionRef.current) demosSectionRef.current.classList.remove('opacity-20')
    } catch (err) {
      console.error('Failed to load FaceLandmarker:', err)
      setIsLoading(false)
    }
  }

  function enableCam() {
    if (!faceLandmarker) return
    if (webcamRunning) {
      webcamRunning = false
      setIsWebcamRunning(false)
      stopCamera()
    } else {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.addEventListener('loadeddata', () => {
            webcamRunning = true
            setIsWebcamRunning(true)
            predictWebcam()
          })
        }
      })
    }
  }

  async function predictWebcam() {
    const video = videoRef.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    if (runningMode === 'IMAGE') {
      runningMode = 'VIDEO'
      await faceLandmarker.setOptions({ runningMode })
    }
    const startTimeMs = performance.now()
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime
      results = faceLandmarker.detectForVideo(video, startTimeMs)
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (results?.faceLandmarks) {
      if (!drawingUtils) {
        const vision = await import('@mediapipe/tasks-vision')
        const { DrawingUtils, FaceLandmarker: FL } = vision
        drawingUtils = new DrawingUtils(ctx)
        for (const lm of results.faceLandmarks) {
          drawingUtils.drawConnectors(lm, FL.FACE_LANDMARKS_TESSELATION, { color: '#C9A84C50', lineWidth: 1 })
          drawingUtils.drawConnectors(lm, FL.FACE_LANDMARKS_FACE_OVAL, { color: '#C9A84C' })
        }
      } else {
        const vision = await import('@mediapipe/tasks-vision')
        const { FaceLandmarker: FL } = vision
        for (const lm of results.faceLandmarks) {
          drawingUtils.drawConnectors(lm, FL.FACE_LANDMARKS_TESSELATION, { color: '#C9A84C50', lineWidth: 1 })
          drawingUtils.drawConnectors(lm, FL.FACE_LANDMARKS_FACE_OVAL, { color: '#C9A84C' })
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
    livenessTestActive = true
    testStatus = 'waiting'
    setIsTestActive(true)
    setTestPassed(false)
    resetAllVars()
    updateUI()
  }

  function stopTest() {
    livenessTestActive = false
    testStatus = 'waiting'
    setIsTestActive(false)
    updateUI()
  }

  function resetAllVars() {
    blinkCount = 0; eyeBlinkLeftHistory = []; eyeBlinkRightHistory = []; lastBlinkTime = 0; isCurrentlyBlinking = false
    headPositionHistory = []; hasMovedLeft = false; hasMovedRight = false; centerYaw = 0
    nodCount = 0; lastNodTime = 0; isCurrentlyNodding = false; verticalPositionHistory = []; centerPitch = 0
  }

  function detectLiveness(blendShapes: any[], landmarks: any[]) {
    if (!livenessTestActive || !blendShapes?.length || !landmarks?.length) return
    if (currentTestType === 'blink') detectBlink(blendShapes)
    else if (currentTestType === 'head_turn') detectHeadTurn(landmarks[0])
    else if (currentTestType === 'nod') detectNod(landmarks[0])
  }

  function detectBlink(blendShapes: any[]) {
    const categories = blendShapes[0].categories
    let eyeL = 0, eyeR = 0
    categories.forEach((s: any) => {
      if (s.categoryName === 'eyeBlinkLeft') eyeL = s.score
      if (s.categoryName === 'eyeBlinkRight') eyeR = s.score
    })
    const now = Date.now()
    const both = eyeL > blinkThreshold && eyeR > blinkThreshold
    if (both && !isCurrentlyBlinking && now - lastBlinkTime > 500) {
      isCurrentlyBlinking = true; blinkCount++; lastBlinkTime = now; testStatus = 'in_progress'; updateUI()
    }
    if (!both && isCurrentlyBlinking) isCurrentlyBlinking = false
    if (blinkCount >= requiredBlinks && testStatus !== 'passed') {
      testStatus = 'passed'; updateUI()
      setTimeout(() => { stopTest(); handleVerified() }, 1500)
    }
  }

  function detectHeadTurn(landmarks: any[]) {
    const noseTip = landmarks[1], leftEye = landmarks[33], rightEye = landmarks[362]
    const faceCenter = { x: (leftEye.x + rightEye.x) / 2 }
    const yaw = Math.atan2(noseTip.x - faceCenter.x, 0.1) * (180 / Math.PI)
    const now = Date.now()
    if (headPositionHistory.length === 0) centerYaw = yaw
    headPositionHistory.push({ yaw, timestamp: now })
    if (headPositionHistory.length > 30) headPositionHistory.shift()
    const rel = yaw - centerYaw
    if (rel < -headTurnThreshold && !hasMovedLeft) { hasMovedLeft = true; testStatus = 'in_progress'; updateUI() }
    if (rel > headTurnThreshold && !hasMovedRight) { hasMovedRight = true; testStatus = 'in_progress'; updateUI() }
    if (hasMovedLeft && hasMovedRight && testStatus !== 'passed') {
      testStatus = 'passed'; updateUI()
      setTimeout(() => { stopTest(); handleVerified() }, 1500)
    }
  }

  function detectNod(landmarks: any[]) {
    if (!landmarks?.length) return
    const now = performance.now()
    const noseTip = landmarks[1], forehead = landmarks[9], chin = landmarks[175]
    const faceH = Math.abs(forehead.y - chin.y)
    const pitch = ((noseTip.y - forehead.y) / faceH) * 45
    verticalPositionHistory.push({ pitch, timestamp: now })
    verticalPositionHistory = verticalPositionHistory.filter(e => now - e.timestamp < 1000)
    if (verticalPositionHistory.length === 5) centerPitch = verticalPositionHistory.slice(0, 5).reduce((s, e) => s + e.pitch, 0) / 5
    if (verticalPositionHistory.length < 5) return
    const rel = pitch - centerPitch
    const isNodding = Math.abs(rel) > nodThreshold
    if (isNodding && !isCurrentlyNodding && now - lastNodTime > 800) {
      isCurrentlyNodding = true; nodCount++; lastNodTime = now; testStatus = 'in_progress'; updateUI()
    }
    if (!isNodding && isCurrentlyNodding) isCurrentlyNodding = false
    if (nodCount >= requiredNods && testStatus !== 'passed') {
      testStatus = 'passed'; updateUI()
      setTimeout(() => { stopTest(); handleVerified() }, 1500)
    }
  }

  function updateUI() {
    if (testStatus === 'passed') {
      setTestPassed(true)
      setTestInstruction('🎉 Verification Successful!')
      setTestStatusText('Liveness confirmed')
      return
    }
    if (currentTestType === 'blink') {
      setTestInstruction(livenessTestActive ? `Blink your eyes TWICE (${blinkCount}/${requiredBlinks})` : 'Click Start Verification')
      setTestStatusText(testStatus === 'in_progress' ? `Progress: ${blinkCount}/2` : 'Waiting for blinks...')
    } else if (currentTestType === 'head_turn') {
      setTestInstruction(livenessTestActive ? 'Turn head LEFT then RIGHT' : 'Click Start Verification')
      setTestStatusText(`Left: ${hasMovedLeft ? '✓' : '…'} Right: ${hasMovedRight ? '✓' : '…'}`)
    } else {
      setTestInstruction(livenessTestActive ? `NOD twice (${nodCount}/${requiredNods})` : 'Click Start Verification')
      setTestStatusText(testStatus === 'in_progress' ? `Progress: ${nodCount}/2` : 'Waiting for nods...')
    }
  }

  function handleVerified() {
    stopCamera()
    onVerified()
  }

  function handleClose() {
    stopCamera()
    livenessTestActive = false
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--color-charcoal)]/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-[var(--color-white)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-stone)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-charcoal)]" style={{ fontFamily: 'var(--font-heading)' }}>
              {title}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{description}</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-[var(--color-stone)] transition-colors">
            <X className="w-5 h-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div ref={demosSectionRef} className="opacity-20 transition-opacity duration-500 p-5 space-y-4">
          {/* Loading overlay */}
          {isLoading && (
            <div className="flex items-center justify-center py-4 gap-3">
              <div className="w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[var(--color-text-muted)]">Loading face detection model...</p>
            </div>
          )}

          {/* Camera */}
          <div>
            <div className="flex justify-center mb-3">
              <button onClick={enableCam}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isWebcamRunning
                    ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                    : 'bg-[var(--color-charcoal)] text-white hover:bg-[var(--color-charcoal)]/90'
                }`}>
                {isWebcamRunning ? <><CameraOff className="w-4 h-4" /> Disable Camera</> : <><Camera className="w-4 h-4" /> Enable Camera</>}
              </button>
            </div>
            <div className="relative bg-[var(--color-charcoal)] rounded-xl overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-52 object-cover" style={{ transform: 'rotateY(180deg)' }} />
              <canvas ref={canvasRef} className="absolute left-0 top-0 w-full h-52" style={{ transform: 'rotateY(180deg)' }} />
              {isWebcamRunning && (
                <div className="absolute top-2 left-2 bg-[var(--color-gold)] text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                </div>
              )}
            </div>
          </div>

          {/* Test panel */}
          <div className="bg-[var(--color-cream)] rounded-xl p-4 text-center">
            <p className={`text-lg font-semibold mb-1 ${testPassed ? 'text-green-600' : 'text-[var(--color-charcoal)]'}`} style={{ fontFamily: 'var(--font-heading)' }}>
              {testPassed ? '✅ Verified!' : testStatusText}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">{testInstruction}</p>
            <button onClick={startRandomTest} disabled={!isWebcamRunning || testPassed}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                !isWebcamRunning || testPassed
                  ? 'bg-[var(--color-stone)] text-[var(--color-text-muted)] cursor-not-allowed'
                  : isTestActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white shadow-[var(--shadow-gold)]'
              }`}>
              {!isWebcamRunning ? 'Enable Camera First' : isTestActive ? 'Cancel Test' : 'Start Verification'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
