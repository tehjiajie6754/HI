import { NextRequest, NextResponse } from 'next/server'
import AWS from 'aws-sdk'
import { createClient } from '@supabase/supabase-js'

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION || 'us-east-1',
})

const rekognition = new AWS.Rekognition()
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData } = body
    if (!imageData) return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 })

    const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    let rekognitionResponse
    try {
      rekognitionResponse = await rekognition.searchFacesByImage({
        CollectionId: process.env.AWS_REKOGNITION_COLLECTION_ID || 'zentravel-users',
        Image: { Bytes: imageBuffer },
        MaxFaces: 1,
        FaceMatchThreshold: 75,
      }).promise()
    } catch (rekError: any) {
      return NextResponse.json({ success: false, error: `Face recognition service error: ${rekError.message}` }, { status: 500 })
    }

    if (!rekognitionResponse.FaceMatches || rekognitionResponse.FaceMatches.length === 0) {
      return NextResponse.json({ success: false, error: 'Face not recognized. Please use manual login.' }, { status: 404 })
    }

    const bestMatch = rekognitionResponse.FaceMatches[0]
    const faceId = bestMatch.Face?.FaceId
    const confidence = bestMatch.Face?.Confidence

    const { data: userProfiles, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('rekognition_id', faceId)

    if (userError || !userProfiles || userProfiles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Face recognized but traveller profile not found. Please contact support.',
      }, { status: 404 })
    }

    const userProfile = userProfiles[0]
    return NextResponse.json({
      success: true,
      user: { profile: userProfile, confidence, recognitionId: faceId },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
