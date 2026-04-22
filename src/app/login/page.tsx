'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import Iridescence from '@/components/backgrounds/Iridescence'

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

export default function LoginPage() {
  const [isWebcamRunning, setIsWebcamRunning] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showFaceRecognitionModal, setShowFaceRecognitionModal] = useState(false)
  const [faceRecognitionStatus, setFaceRecognitionStatus] = useState('')
  const [faceRecognitionError, setFaceRecognitionError] = useState('')
  const [testInstruction, setTestInstruction] = useState('Click "Start Verification" to begin the liveness test')
  const [testStatusText, setTestStatusText] = useState('🔄 Ready for verification')
  const [isTestActive, setIsTestActive] = useState(false)
  const [testPassed, setTestPassed] = useState(false)

  const router = useRouter()
  const { login, loginWithUser } = useUser()
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
      setTestPassed(true); setTestInstruction('<b>🎉 Verification Successful!</b>'); setTestStatusText('✅ LOGIN APPROVED'); return
    }
    if (currentTestType === 'blink') {
      setTestInstruction(livenessTestActive ? `<b>Please blink your eyes TWICE</b>` : 'Click "Start Verification" to begin')
      setTestStatusText(testStatus === 'in_progress' ? `👁️ Progress: ${blinkCount}/2 blinks` : '👁️ Waiting for blinks...')
    } else if (currentTestType === 'head_turn') {
      setTestInstruction(livenessTestActive ? '<b>Turn your head LEFT, then RIGHT</b>' : 'Click "Start Verification" to begin')
      setTestStatusText(`🔄 Left: ${hasMovedLeft ? '✅' : '⏳'} Right: ${hasMovedRight ? '✅' : '⏳'}`)
    } else {
      setTestInstruction(livenessTestActive ? `<b>Please NOD your head up and down TWICE</b>` : 'Click "Start Verification" to begin')
      setTestStatusText(testStatus === 'in_progress' ? `🔄 Progress: ${nodCount}/2 nods` : '🔄 Waiting for nods...')
    }
  }

  // HARDCODED: Always pass face recognition — no backend call
  function showSuccessAndRecognize() {
    setShowSuccessModal(true)
    setTimeout(() => {
      setShowSuccessModal(false)
      // Hardcoded: skip face recognition API, go directly to success
      setShowFaceRecognitionModal(true)
      setFaceRecognitionStatus('Identifying traveller...')
      setFaceRecognitionError('')

      setTimeout(() => {
        setFaceRecognitionStatus('Welcome back, Traveller!')
        // Hardcoded login with mock user
        loginWithUser({
          id: 'demo-user-001',
          full_name: 'Demo Traveller',
          email: 'demo@zentravel.com',
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginLoading(true); setLoginError('')
    try {
      const result = await login(email, password)
      if (result.success) router.push('/onboarding')
      else setLoginError(result.error || 'Login failed')
    } catch { setLoginError('Login failed. Please try again.') }
    finally { setLoginLoading(false) }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Iridescence color={[1, 1, 1]} mouseReact={false} amplitude={0.1} speed={1.0} className="absolute inset-0" />

      <style>{`video { transform: rotateY(180deg); } canvas.mirror { transform: rotateY(180deg); } .invisible { opacity: 0.15; pointer-events: none; }`}</style>

      <div className="relative z-10 px-4 py-8 max-w-4xl mx-auto overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-black via-purple-800 to-blue-800 bg-clip-text text-transparent">
              🔐 Secure Login
            </span>
          </h1>
          <p className="text-gray-600">Complete face liveness verification to access your account</p>
        </div>

        <section ref={demosSectionRef} className="invisible transition-opacity duration-500">
          {/* Camera panel */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/30 overflow-hidden mb-6">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Face Verification</h2>
              <p className="text-sm text-gray-500 mt-1">Position your face clearly in front of the camera</p>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-5">
                <button ref={enableWebcamButtonRef} onClick={enableCam}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isWebcamRunning ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {isWebcamRunning ? 'DISABLE CAMERA' : 'ENABLE CAMERA'}
                </button>
              </div>
              <div className="flex justify-center">
                <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ maxWidth: 480, width: '100%' }}>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto object-cover" />
                  <canvas ref={canvasRef} className="mirror absolute left-0 top-0 w-full h-auto" />
                  {isWebcamRunning && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Liveness test panel */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/30 p-6">
            <div className="text-center">
              <div className={`text-2xl font-bold mb-3 ${testPassed ? 'text-green-600' : 'text-gray-900'}`}>
                {testPassed ? '✅ Verification Successful!' : testStatusText}
              </div>
              <p className="text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: testInstruction }} />
              <button onClick={startRandomTest} disabled={!isWebcamRunning}
                className={`px-8 py-4 rounded-lg text-base font-semibold transition-all duration-200 ${!isWebcamRunning ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : isTestActive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg hover:shadow-xl'}`}>
                {!isWebcamRunning ? 'Enable Camera First' : isTestActive ? 'Stop Test' : 'Start Verification'}
              </button>
              {!isWebcamRunning && <p className="text-xs text-gray-400 mt-2">Please enable your camera before starting verification</p>}
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
            <p className="text-gray-500">Identifying your travel passport...</p>
          </div>
        </div>
      )}

      {/* Face Recognition Modal */}
      {showFaceRecognitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center animate-scale-in">
            <div className="mb-5">
              {faceRecognitionError ? (
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center text-2xl">⚠️</div>
              ) : faceRecognitionStatus.includes('Welcome') ? (
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-2xl">✅</div>
              ) : (
                <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-3">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {faceRecognitionError ? 'Not Recognised' : faceRecognitionStatus.includes('Welcome') ? '🎉 Welcome Back!' : '🔍 Identifying...'}
              </span>
            </h2>
            <p className="text-gray-500">{faceRecognitionStatus || 'Processing...'}</p>
            {faceRecognitionError && <p className="text-red-600 text-sm mt-2">{faceRecognitionError}</p>}
          </div>
        </div>
      )}

      {/* Fallback Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full animate-scale-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Sign In to Zen Travel</span>
              </h2>
              <p className="text-gray-500 text-sm">Enter your credentials to continue</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required disabled={loginLoading} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required disabled={loginLoading} />
              {loginError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{loginError}</p>}
              <button type="submit" disabled={loginLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${loginLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg'}`}>
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </button>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs font-semibold text-gray-800 mb-2">Demo Accounts:</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>sarah.chen@zentravel.com</div>
                  <div>marcus.rivera@zentravel.com</div>
                  <div className="font-medium text-blue-600 mt-1">Password: password123</div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
