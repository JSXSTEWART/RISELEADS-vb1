
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { Mic, MicOff, Camera, CameraOff, Power, PowerOff, Loader2, Sparkles, Activity } from 'lucide-react';
import { useLanguage } from '../App';
import { encode, decode, decodeAudioData, blobToBase64 } from '../audioUtils';

const LiveAssistant: React.FC = () => {
  const { language, t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVisionEnabled, setIsVisionEnabled] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);

  const stopSession = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    if (sessionRef.current) {
      sessionRef.current = null;
    }
    if (frameIntervalRef.current) {
      window.clearInterval(frameIntervalRef.current);
    }
    for (const source of sourcesRef.current) {
      source.stop();
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVisionEnabled });
      if (videoRef.current && isVisionEnabled) {
        videoRef.current.srcObject = stream;
      }

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            
            // Audio input
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (!isMicEnabled) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);

            // Vision input
            if (isVisionEnabled && canvasRef.current && videoRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              frameIntervalRef.current = window.setInterval(() => {
                if (!videoRef.current || !ctx) return;
                canvasRef.current!.width = videoRef.current.videoWidth;
                canvasRef.current!.height = videoRef.current.videoHeight;
                ctx.drawImage(videoRef.current, 0, 0);
                canvasRef.current!.toBlob(async (blob) => {
                  if (blob) {
                    const base64Data = await blobToBase64(blob);
                    sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } }));
                  }
                }, 'image/jpeg', 0.6);
              }, 1000);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => {
            console.error(e);
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are the Acme ZoneDock Live Intelligence Core. 
          Current environment language: ${language}.
          You can see and hear the user. Help them with real-time terminal operations, ship manifests, and logistics crisis management.
          Be professional, concise, and futuristic.`,
        }
      });
      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-blue-500/30">
      <div className="bg-slate-800/50 p-6 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isActive ? 'bg-blue-600 animate-pulse shadow-lg shadow-blue-600/20' : 'bg-slate-700'}`}>
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold tracking-tight">LIVE INTELLIGENCE CORE</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              {isActive ? t('live_intel_status_active') : t('live_intel_status_idle')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isActive && (
             <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                <Activity size={12} className="text-blue-500 animate-pulse" />
                <span className="text-[10px] text-blue-400 font-bold uppercase">Streaming</span>
             </div>
          )}
        </div>
      </div>

      <div className="p-8 space-y-8 min-h-[300px] flex flex-col justify-center items-center relative">
        {/* Main Interface */}
        {!isActive && !isConnecting ? (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700 group cursor-pointer hover:border-blue-500 transition-all duration-500" onClick={startSession}>
              <Power className="text-slate-500 group-hover:text-blue-500" size={32} />
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-300 font-medium">{t('live_intel_start')}</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Initialize low-latency quantum communication link with Acme's central intelligence core.</p>
            </div>
          </div>
        ) : isConnecting ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-blue-500 animate-spin" size={48} />
            <span className="text-blue-400 font-medium animate-pulse">{t('live_intel_connecting')}</span>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-8">
            {/* Waveform Visualization Mockup */}
            <div className="flex items-center justify-center gap-1.5 h-16 w-full">
               {[...Array(12)].map((_, i) => (
                 <div key={i} className={`w-1.5 rounded-full bg-blue-500/40 animate-bounce`} style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
               ))}
            </div>

            {/* Video Preview */}
            {isVisionEnabled && (
              <div className="relative w-full max-w-md aspect-video bg-black rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute top-4 left-4 flex items-center gap-2 px-2 py-1 bg-red-600/80 rounded text-[10px] font-bold text-white uppercase animate-pulse">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  Live Feed
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-4">
              <button onClick={() => setIsMicEnabled(!isMicEnabled)} className={`p-4 rounded-2xl border transition-all ${isMicEnabled ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                {isMicEnabled ? <Mic size={24} /> : <MicOff size={24} />}
              </button>
              <button onClick={() => setIsVisionEnabled(!isVisionEnabled)} className={`p-4 rounded-2xl border transition-all ${isVisionEnabled ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                {isVisionEnabled ? <Camera size={24} /> : <CameraOff size={24} />}
              </button>
              <button onClick={stopSession} className="p-4 rounded-2xl bg-red-600 text-white border border-red-500 shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all">
                <PowerOff size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <div className="bg-blue-600/5 p-4 border-t border-blue-500/10 flex items-center justify-center">
            <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-[0.2em]">Neural processing optimized for {language.toUpperCase()}</p>
        </div>
      )}
    </div>
  );
};

export default LiveAssistant;
