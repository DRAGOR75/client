"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { useTest } from '../context/TestContext';

export interface ProctoringState {
  isModelLoaded: boolean;
  isDetecting: boolean;
  facesDetected: number;
  cameraError: string | null;
  warningMessage: string | null;
}

export const useProctoring = () => {
  const { logInfraction, isCompleted } = useTest();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>();
  
  const [state, setState] = useState<ProctoringState>({
    isModelLoaded: false,
    isDetecting: false,
    facesDetected: 0,
    cameraError: null,
    warningMessage: null,
  });

  // Timers for infractions
  const missingFaceStartTime = useRef<number | null>(null);
  const multipleFacesStartTime = useRef<number | null>(null);
  const lookingAwayStartTime = useRef<number | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const initModel = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 2 // Detect up to 2 faces to trigger multiple face infraction
      });
      
      faceLandmarkerRef.current = faceLandmarker;
      setState(s => ({ ...s, isModelLoaded: true }));
      console.log("[Proctoring] FaceLandmarker Model Loaded");
    } catch (err) {
      console.error("[Proctoring] Error loading model:", err);
      setState(s => ({ ...s, cameraError: "Failed to load AI proctoring model." }));
    }
  };

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", predictWebcam);
      setState(s => ({ ...s, isDetecting: true, cameraError: null }));
    } catch (err) {
      console.error("[Proctoring] Camera access denied", err);
      setState(s => ({ ...s, cameraError: "Camera access required for proctored exam." }));
      logInfraction("Camera access denied or hardware missing");
    }
  };

  const checkInfractions = useCallback((numFaces: number, blendshapes: any[]) => {
    const now = Date.now();

    // 1. Missing Face
    if (numFaces === 0) {
      if (!missingFaceStartTime.current) {
        missingFaceStartTime.current = now;
      } else if (now - missingFaceStartTime.current > 5000) {
        logInfraction("Candidate left the camera frame");
        setState(s => ({ ...s, warningMessage: "Face not detected! Please return to the camera." }));
        missingFaceStartTime.current = now; // reset to prevent spamming
      }
    } else {
      missingFaceStartTime.current = null;
    }

    // 2. Multiple Faces
    if (numFaces > 1) {
      if (!multipleFacesStartTime.current) {
        multipleFacesStartTime.current = now;
      } else if (now - multipleFacesStartTime.current > 3000) {
        logInfraction("Multiple people detected in frame");
        setState(s => ({ ...s, warningMessage: "Multiple faces detected. Ensure you are alone." }));
        multipleFacesStartTime.current = now;
      }
    } else {
      multipleFacesStartTime.current = null;
    }

    // 3. Gaze Tracking / Looking Away (using Blendshapes if available)
    if (numFaces === 1 && blendshapes && blendshapes.length > 0) {
      // Find specific blendshapes indicating extreme head turn or looking away
      // For simplicity, checking left/right eye look outside or head pitch/yaw approximations
      const shapes = blendshapes[0].categories;
      
      // Find values for eyeLookInRight, eyeLookOutLeft, etc.
      // This is a simplified heuristic
      let lookingAway = false;
      const eyeLookInLeft = shapes.find((s: any) => s.categoryName === 'eyeLookInLeft')?.score || 0;
      const eyeLookOutLeft = shapes.find((s: any) => s.categoryName === 'eyeLookOutLeft')?.score || 0;
      
      if (eyeLookInLeft > 0.7 || eyeLookOutLeft > 0.7) {
        lookingAway = true;
      }

      if (lookingAway) {
        if (!lookingAwayStartTime.current) {
          lookingAwayStartTime.current = now;
        } else if (now - lookingAwayStartTime.current > 4000) {
          logInfraction("Candidate looking away from screen");
          setState(s => ({ ...s, warningMessage: "Please keep your eyes on the screen." }));
          lookingAwayStartTime.current = now;
        }
      } else {
        lookingAwayStartTime.current = null;
      }
    }

    // Clear warning if all good
    if (numFaces === 1 && !multipleFacesStartTime.current && !missingFaceStartTime.current && !lookingAwayStartTime.current) {
      setState(s => ({ ...s, warningMessage: null }));
    }

  }, [logInfraction]);

  let lastVideoTime = -1;
  const predictWebcam = () => {
    if (!videoRef.current || !faceLandmarkerRef.current || isCompleted) return;

    const video = videoRef.current;
    let startTimeMs = performance.now();
    
    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      const results = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);
      
      const numFaces = results.faceLandmarks.length;
      setState(s => s.facesDetected !== numFaces ? { ...s, facesDetected: numFaces } : s);
      
      checkInfractions(numFaces, results.faceBlendshapes);

      // Optional: Draw landmarks on canvas if provided
      if (canvasRef.current && results.faceLandmarks) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          const drawingUtils = new DrawingUtils(ctx);
          for (const landmarks of results.faceLandmarks) {
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#FF3030" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#30FF30" });
          }
        }
      }
    }
    
    if (!isCompleted) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  useEffect(() => {
    initModel();
  }, []);

  useEffect(() => {
    if (state.isModelLoaded && !state.isDetecting && !isCompleted) {
      startCamera();
    }
    
    if (isCompleted) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [state.isModelLoaded, isCompleted]);

  return { videoRef, canvasRef, ...state };
};
