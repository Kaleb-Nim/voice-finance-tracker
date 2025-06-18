'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff, Square, Play, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceRecorderProps {
  onTranscription?: (transcript: string, audioBlob: Blob, apiResponse?: any) => void
  onError?: (error: string) => void
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'completed' | 'error'

// Extend MediaRecorder to include our timeout ID
interface ExtendedMediaRecorder extends MediaRecorder {
  timeoutId?: NodeJS.Timeout
}

export function VoiceRecorder({ onTranscription, onError }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState<string>('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioURL, setAudioURL] = useState<string>('')
  const [duration, setDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)

  const mediaRecorderRef = useRef<ExtendedMediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number>(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      })
      
      streamRef.current = stream
      
      // Set up audio visualization
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)
      
      // Start audio level monitoring
      const updateAudioLevel = () => {
        if (analyserRef.current && state === 'recording') {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(average / 255 * 100)
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      }) as ExtendedMediaRecorder
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        // Clear the failsafe timeout since onstop fired successfully
        if (mediaRecorder.timeoutId) {
          clearTimeout(mediaRecorder.timeoutId)
        }
        
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' })
        setAudioBlob(blob)
        setAudioURL(URL.createObjectURL(blob))
        
        // Note: cleanup already done in stopRecording function
        // Only do transcription processing here
        
        // Send to transcription API
        try {
          const formData = new FormData()
          formData.append('audio', blob, 'recording.webm')
          
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            throw new Error('Transcription service unavailable')
          }
          
          const data = await response.json()
          setTranscript(data.transcript)
          setState('completed')
          
          // Pass the full API response to parent component
          onTranscription?.(data.transcript, blob, data)
        } catch (error) {
          setState('error')
          const errorMessage = error instanceof Error ? error.message : 'Voice processing failed'
          onError?.(errorMessage)
        }
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setState('recording')
      startTimeRef.current = Date.now()
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
      
      updateAudioLevel()
      
    } catch (error) {
      setState('error')
      const errorMessage = error instanceof Error ? error.message : 'Failed to access microphone'
      onError?.(errorMessage)
    }
  }

  const stopRecording = () => {
    // Immediately set state to processing to prevent UI confusion
    setState('processing')
    
    // Stop duration timer immediately
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }
    
    // Stop audio level monitoring immediately
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setAudioLevel(0)
    
    // Clean up audio context immediately
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    // Stop MediaRecorder and stream
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    // Failsafe timeout in case MediaRecorder.onstop doesn't fire
    const timeoutId = setTimeout(() => {
      // Check if we're still in processing state (meaning onstop didn't fire)
      setState(currentState => {
        if (currentState === 'processing') {
          onError?.('Recording timeout - please try again')
          return 'error'
        }
        return currentState
      })
    }, 5000) // 5 second timeout
    
    // Store timeout ID for cleanup in onstop event
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.timeoutId = timeoutId
    }
  }

  const resetRecording = () => {
    setState('idle')
    setTranscript('')
    setAudioBlob(null)
    setAudioURL('')
    setDuration(0)
    setAudioLevel(0)
    
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    
    // Clear any pending timeout
    if (mediaRecorderRef.current?.timeoutId) {
      clearTimeout(mediaRecorderRef.current.timeoutId)
      mediaRecorderRef.current.timeoutId = undefined
    }
  }

  const playRecording = () => {
    if (audioURL) {
      const audio = new Audio(audioURL)
      audio.play()
    }
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (mediaRecorderRef.current?.timeoutId) {
        clearTimeout(mediaRecorderRef.current.timeoutId)
      }
    }
  }, [audioURL])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Recording Button */}
          <div className="relative">
            <Button
              size="lg"
              variant={state === 'recording' ? 'destructive' : 'default'}
              className="rounded-full h-20 w-20 transition-all duration-200"
              onClick={state === 'recording' ? stopRecording : startRecording}
              disabled={state === 'processing'}
            >
              <AnimatePresence mode="wait">
                {state === 'idle' && (
                  <motion.div
                    key="mic"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <Mic className="h-8 w-8" />
                  </motion.div>
                )}
                {state === 'recording' && (
                  <motion.div
                    key="recording"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <Square className="h-8 w-8" />
                  </motion.div>
                )}
                {state === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </motion.div>
                )}
                {(state === 'completed' || state === 'error') && (
                  <motion.div
                    key="mic-off"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <MicOff className="h-8 w-8" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            
            {/* Recording pulse animation */}
            {state === 'recording' && (
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/20"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>

          {/* Audio Visualization */}
          {state === 'recording' && (
            <div className="w-full">
              <div className="flex items-center justify-center space-x-1 h-16">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-blue-500 rounded-full"
                    animate={{ 
                      height: [4, Math.max(4, audioLevel * 0.6 + Math.random() * 20), 4] 
                    }}
                    transition={{ 
                      duration: 0.5 + Math.random() * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Status Text */}
          <div className="text-center">
            {state === 'idle' && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Click to start recording
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Try saying:</strong></p>
                  <p>"I spent $5 on chicken rice at Maxwell"</p>
                  <p>"MRT fare $2.50 to Orchard Road"</p>
                  <p>"Bubble tea at Gong Cha $4.80"</p>
                  <p>"Grab to Marina Bay Sands $15"</p>
                </div>
              </div>
            )}
            {state === 'recording' && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600">
                  Recording... {formatDuration(duration)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Speak clearly, then click to stop
                </p>
              </div>
            )}
            {state === 'processing' && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Processing audio...
                </p>
                <p className="text-xs text-muted-foreground">
                  Converting speech to transaction
                </p>
              </div>
            )}
            {state === 'completed' && transcript && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-green-600">
                  Transcription complete!
                </p>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm">{transcript}</p>
                </div>
              </div>
            )}
            {state === 'error' && (
              <div className="space-y-2">
                <p className="text-sm text-destructive">
                  Recording failed. Please try again.
                </p>
                <div className="text-xs text-muted-foreground">
                  <p>Make sure to:</p>
                  <p>• Allow microphone access</p>
                  <p>• Speak clearly and not too fast</p>
                  <p>• Check your internet connection</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {(state === 'completed' || state === 'error') && (
            <div className="flex space-x-2">
              {audioURL && (
                <Button variant="outline" size="sm" onClick={playRecording}>
                  <Play className="h-4 w-4 mr-1" />
                  Play
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={resetRecording}>
                Record Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}