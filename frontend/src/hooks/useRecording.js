import { useState, useEffect, useRef, useCallback } from 'react';
import { analyzeRecording, countWords } from '../utils/api';

/**
 * Custom hook for managing speech recording
 * Handles speech recognition, audio recording, and visualization
 * @param {Function} onAnalysisComplete - Callback when analysis is done
 * @param {Function} onSaveToHistory - Callback to save recording to history
 */
export const useRecording = (onAnalysisComplete, onSaveToHistory) => {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusText, setStatusText] = useState('Ready to record');
  const [audioLevel, setAudioLevel] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Refs for media/audio management
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const userGoalRef = useRef('');
  const aiPersonalityRef = useRef('supportive');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recordingStartTimeRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Process recording after completion
  const processRecording = useCallback(
    async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: 'audio/webm',
      });
      console.log('Audio recorded:', audioBlob.size, 'bytes');

      const words = countWords(finalTranscriptRef.current);
      const duration = recordingStartTimeRef.current
        ? Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
        : 0;

      console.log('Recording stats:', { words, duration, wpm: duration > 0 ? Math.round((words / duration) * 60) : 0 });

      try {
        const data = await analyzeRecording(
          finalTranscriptRef.current.trim(),
          audioBlob.size > 0 ? audioBlob : null,
          duration,
          userGoalRef.current,
          aiPersonalityRef.current
        );

        setStatusText('✓ Analysis complete!');

        // Calculate stats for history
        const durationMinutes = duration / 60;
        const wpm = durationMinutes > 0 ? Math.round(words / durationMinutes) : 0;

        const historyData = {
          goal: userGoalRef.current,
          transcript: finalTranscriptRef.current.trim(),
          transcriptPreview: finalTranscriptRef.current.substring(0, 100) + '...',
          duration,
          wordCount: words,
          wpm,
          score: data.overall_score || 0,
          feedback: data,
        };

        // Save to history
        if (onSaveToHistory) {
          onSaveToHistory(historyData);
        }

        // Notify parent
        if (onAnalysisComplete) {
          onAnalysisComplete(data);
        }

        // Navigate to feedback page if sessionId present
        if (data && data.sessionId) {
          console.log('Navigating to /feedback/', data.sessionId);
          window.location.href = `/feedback/${data.sessionId}`;
        }
      } catch (error) {
        console.error('Error analyzing recording:', error);
        setStatusText(error.message ||'Failed to analyze. Is the backend running?');
        alert(error.message);
      }

      audioChunksRef.current = [];
    },
    [onAnalysisComplete, onSaveToHistory]
  );

  // Audio visualization
  const visualizeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.3;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      if (!isRecording) {
        setAudioLevel(0);
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      const voiceRange = dataArray.slice(5, 60);
      const rms = Math.sqrt(
        voiceRange.reduce((sum, value) => sum + value * value, 0) / voiceRange.length
      );

      let normalizedLevel = Math.min(rms / 80, 1);
      const smoothingFactor = 0.7;
      const currentLevel = audioLevel;
      normalizedLevel = currentLevel * (1 - smoothingFactor) + normalizedLevel * smoothingFactor;
      normalizedLevel = Math.pow(normalizedLevel, 0.8);

      setAudioLevel(normalizedLevel);
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, [isRecording, audioLevel]);

  // Start audio recording
  const startAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      visualizeAudio();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped');
        // Processing will be handled by handleRecording
      };

      mediaRecorder.start();
      console.log('Audio recording started');
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setIsRecording(false);

      let errorMessage = 'Could not access microphone. Please check permissions.';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Microphone is already in use by another application.';
      }

      setStatusText(`❌ ${errorMessage}`);
      throw error;
    }
  }, [visualizeAudio]);

  // Stop audio recording
  const stopAudioRecording = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setAudioLevel(0);
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Sorry, your browser does not support speech recognition. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setStatusText('🎤 Listening... Speak now!');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcriptPart + ' ';
        } else {
          interimTranscript += transcriptPart;
        }
      }

      const fullTranscript = finalTranscriptRef.current + interimTranscript;
      setTranscript(fullTranscript);
      setWordCount(countWords(fullTranscript));
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'no-speech' || event.error === 'aborted') {
        console.log('Ignorable error:', event.error);
        return;
      }

      let errorMessage = 'Recording error occurred';
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      } else if (event.error === 'network') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'No microphone detected. Please connect a microphone.';
      }

      setStatusText(`❌ ${errorMessage}`);
      setIsRecording(false);
      stopAudioRecording();

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');

      if (finalTranscriptRef.current.trim()) {
        setStatusText('✓ Recording complete. Analyzing...');
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } else {
        setStatusText('🎤 Ready to record your next speech');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stopAudioRecording]);

  // Start recording
  const startRecording = useCallback(
    async (userGoal, aiPersonality) => {
      if (!recognitionRef.current) {
        console.error('Recognition not initialized');
        return;
      }

      if (!userGoal || !userGoal.trim()) {
        alert('Please enter your speech goal before recording!');
        return;
      }

      console.log('Starting recording...');
      setIsRecording(true);
      userGoalRef.current = userGoal;
      aiPersonalityRef.current = aiPersonality;

      finalTranscriptRef.current = '';
      setTranscript('');
      setWordCount(0);
      setRecordingDuration(0);
      recordingStartTimeRef.current = Date.now();
      audioChunksRef.current = [];

      durationIntervalRef.current = setInterval(() => {
        if (recordingStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
          setRecordingDuration(elapsed);
        }
      }, 1000);

      try {
        recognitionRef.current.start();
        setStatusText('🎤 Listening... Speak now!');
        await startAudioRecording();
      } catch (e) {
        console.error('Failed to start recording:', e);
        setIsRecording(false);

        let errorMsg = 'Failed to start recording. Please try again.';
        if (e.message && e.message.includes('already started')) {
          errorMsg = 'Recording is already in progress. Please wait.';
        }

        setStatusText(`❌ ${errorMsg}`);

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      }
    },
    [startAudioRecording]
  );

  // Stop recording
  const stopRecording = useCallback(
    async () => {
      console.log('Stopping recording...');
      setIsRecording(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }

      stopAudioRecording();

      // Process the recording
      if (finalTranscriptRef.current.trim()) {
        await processRecording();
      }
    },
    [stopAudioRecording, processRecording]
  );

  // Reset for new recording
  const resetRecording = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
    setStatusText('Ready to record');
    setWordCount(0);
    setRecordingDuration(0);
  }, []);

  return {
    isRecording,
    transcript,
    statusText,
    audioLevel,
    wordCount,
    recordingDuration,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
