import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Send,
  Volume2,
  VolumeX,
  Wrench,
  Sparkles,
  Globe,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AiOrb, OrbState } from '../components/AiOrb';
import { EchoPulse } from '../components/EchoPulse';
import { Card, Badge, Button } from '../components/ui';
import { agentAPI, callsAPI } from '../lib/api';
import { formatDuration, getSentimentEmoji } from '../lib/utils';

interface Message {
  role: 'agent' | 'customer';
  content: string;
  timestamp: string;
  toolsUsed?: string[];
  sources?: Array<{ title: string; score: number }>;
}

const STAGES = ['Introduction', 'Discovery', 'Qualification', 'Proposal', 'Closing'];

export const VoiceAgent: React.FC = () => {
  const [callActive, setCallActive] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [muted, setMuted] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi' | 'hi-en'>('en');
  const [duration, setDuration] = useState(0);
  const [sessionId, setSessionId] = useState(() => `session-${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [interimText, setInterimText] = useState('');
  const [sending, setSending] = useState(false);
  const [geminiAvailable, setGeminiAvailable] = useState(true);

  // Live Intelligence metrics
  const [stage, setStage] = useState('Introduction');
  const [sentiment, setSentiment] = useState('neutral');
  const [buyingIntent, setBuyingIntent] = useState('medium');
  const [leadScore, setLeadScore] = useState(35);
  const [qualProgress, setQualProgress] = useState(20);
  const [toolsInvoked, setToolsInvoked] = useState<string[]>([]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const activeCallIdRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Live refs to prevent stale closures in Web Speech & TTS callbacks
  const callActiveRef = useRef(callActive);
  const mutedRef = useRef(muted);
  const ttsEnabledRef = useRef(ttsEnabled);
  const languageRef = useRef(language);
  const sessionIdRef = useRef(sessionId);
  const sendingRef = useRef(sending);

  useEffect(() => { callActiveRef.current = callActive; }, [callActive]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { sendingRef.current = sending; }, [sending]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!callActive) return;
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, [callActive]);

  useEffect(() => {
    return () => {
      stopAudioResources();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stopAudioResources = () => {
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  const startWaveform = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');
        if (!c) return;
        analyser.getByteFrequencyData(dataArray);
        c.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / dataArray.length;
        dataArray.forEach((val, i) => {
          const h = Math.max(4, (val / 255) * canvas.height);
          const grad = c.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, '#22D3EE');
          grad.addColorStop(1, '#8B5CF6');
          c.fillStyle = grad;
          c.fillRect(i * barWidth + 1, (canvas.height - h) / 2, Math.max(2, barWidth - 3), h);
        });
        animFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch {
      // Microphone denied or unavailable; text fallback still works cleanly
    }
  };

  const speakText = (text: string, onDone?: () => void) => {
    if (!ttsEnabledRef.current || !('speechSynthesis' in window)) {
      onDone?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utter;

    const targetLang = languageRef.current === 'hi' ? 'hi-IN' : 'en-IN';
    utter.lang = targetLang;
    utter.rate = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(languageRef.current === 'hi' ? 'hi' : 'en'));
    if (matchedVoice) utter.voice = matchedVoice;

    setOrbState('speaking');
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      utteranceRef.current = null;
      onDone?.();
    };
    utter.onend = finish;
    utter.onerror = finish;
    window.speechSynthesis.speak(utter);
  };

  const startListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec || mutedRef.current || !callActiveRef.current) {
      setOrbState('idle');
      return;
    }

    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    try {
      const rec = new SpeechRec();
      recognitionRef.current = rec;
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = languageRef.current === 'hi' ? 'hi-IN' : 'en-IN';

      let gotResult = false;
      setInterimText('');
      setOrbState('listening');

      rec.onresult = (e: any) => {
        let interim = '';
        let finalTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const piece = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscript += piece;
          } else {
            interim += piece;
          }
        }
        if (interim) setInterimText(interim);
        if (finalTranscript.trim()) {
          gotResult = true;
          setInterimText('');
          handleSendMessage(finalTranscript.trim());
        }
      };

      rec.onerror = (e: any) => {
        setInterimText('');
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          toast.error('Microphone permission denied. Please use text input or allow mic.');
          setOrbState('idle');
        }
      };

      rec.onend = () => {
        recognitionRef.current = null;
        setInterimText('');
        if (!gotResult && callActiveRef.current && !mutedRef.current && !sendingRef.current) {
          restartTimerRef.current = window.setTimeout(() => {
            if (callActiveRef.current && !mutedRef.current && !sendingRef.current) {
              startListening();
            }
          }, 350);
        } else if (!callActiveRef.current) {
          setOrbState('idle');
        }
      };

      rec.start();
    } catch {
      setOrbState('idle');
    }
  };

  const handleStartCall = async () => {
    const newSid = `session-${Date.now()}`;
    setSessionId(newSid);
    sessionIdRef.current = newSid;
    activeCallIdRef.current = null;
    setMessages([]);
    setDuration(0);
    setToolsInvoked([]);
    setCallActive(true);
    callActiveRef.current = true;
    setOrbState('thinking');
    startWaveform();

    try {
      const res = await agentAPI.initVoiceSession(newSid, languageRef.current);
      setGeminiAvailable(Boolean(res.data?.geminiAvailable));
      const greeting = res.data?.greeting || 'Hello! I am Aria from EchoSales AI. How can I help you today?';
      const initialMsgs: Message[] = [{ role: 'agent', content: greeting, timestamp: new Date().toISOString() }];
      setMessages(initialMsgs);

      callsAPI
        .create({
          customerName: 'Live Voice Prospect',
          duration: 0,
          status: 'active',
          sentiment: 'neutral',
          buyingIntent: 'medium',
          leadScore: 35,
          outcome: 'Active AI call',
          transcript: initialMsgs,
          language: languageRef.current,
          conversationStage: 'Introduction',
        })
        .then((cRes) => {
          if (cRes.data?.call?._id) activeCallIdRef.current = cRes.data.call._id;
        })
        .catch(() => {});

      speakText(greeting, () => {
        window.setTimeout(() => {
          if (callActiveRef.current && !mutedRef.current) startListening();
          else setOrbState('idle');
        }, 400);
      });
      toast.success('Voice Command Center Connected');
    } catch {
      const fallbackGreeting = 'Hello! I am Aria from EchoSales AI. How can I help accelerate your sales today?';
      setMessages([{ role: 'agent', content: fallbackGreeting, timestamp: new Date().toISOString() }]);
      speakText(fallbackGreeting, () => {
        window.setTimeout(() => {
          if (callActiveRef.current && !mutedRef.current) startListening();
          else setOrbState('idle');
        }, 400);
      });
    }
  };

  const handleEndCall = async () => {
    callActiveRef.current = false;
    setCallActive(false);
    setOrbState('completed');
    stopAudioResources();
    window.speechSynthesis?.cancel();

    const payload = {
      customerName: 'Live Voice Prospect',
      duration,
      status: 'completed',
      sentiment,
      buyingIntent,
      leadScore,
      outcome: leadScore >= 70 ? 'Qualified during AI session' : 'Discovery completed',
      transcript: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
      language,
      conversationStage: stage,
    };

    try {
      if (activeCallIdRef.current) {
        await callsAPI.update(activeCallIdRef.current, payload);
      } else if (messages.length > 0) {
        await callsAPI.create(payload);
      }
      toast.success('Call saved to Call History');
    } catch {
      // ignore save error in offline mode
    }
    activeCallIdRef.current = null;
    setTimeout(() => setOrbState('idle'), 2000);
  };

  const handleSendMessage = async (overrideText?: string) => {
    const msgText = (overrideText ?? textInput).trim();
    if (!msgText || sendingRef.current) return;

    if (!overrideText) setTextInput('');
    if (!callActiveRef.current) {
      callActiveRef.current = true;
      setCallActive(true);
    }

    const userMsg: Message = {
      role: 'customer',
      content: msgText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    sendingRef.current = true;
    setSending(true);
    setOrbState('thinking');

    try {
      const res = await agentAPI.chat({
        message: msgText,
        sessionId: sessionIdRef.current,
        language: languageRef.current,
      });

      const data = res.data;
      if (data.sentiment) setSentiment(data.sentiment);
      if (data.buyingIntent) setBuyingIntent(data.buyingIntent);
      if (data.conversationStage) setStage(data.conversationStage);
      if (typeof data.leadScore === 'number') setLeadScore(data.leadScore);
      if (typeof data.qualificationProgress === 'number') setQualProgress(data.qualificationProgress);
      if (data.toolsUsed?.length) {
        setToolsInvoked((prev) => Array.from(new Set([...prev, ...data.toolsUsed])));
      }

      const agentMsg: Message = {
        role: 'agent',
        content: data.response,
        timestamp: new Date().toISOString(),
        toolsUsed: data.toolsUsed,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, agentMsg]);

      sendingRef.current = false;
      setSending(false);

      speakText(data.response, () => {
        window.setTimeout(() => {
          if (callActiveRef.current && !mutedRef.current) startListening();
          else setOrbState('idle');
        }, 400);
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || 'Could not reach AI agent');
      sendingRef.current = false;
      setSending(false);
      if (callActiveRef.current && !mutedRef.current) startListening();
      else setOrbState('idle');
    }
  };

  const statusLabels: Record<OrbState, string> = {
    idle: callActive ? 'Ready — Speak or Type Below' : 'Ready to Connect',
    listening: 'Listening to Prospect...',
    thinking: 'Gemini Reasoning & Tool Selection...',
    speaking: 'Aria is Speaking...',
    completed: 'Session Saved to CRM',
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
      {/* Left Studio Stage: AI Orb & Acoustic Controls (7 cols) */}
      <Card className="lg:col-span-7 flex flex-col justify-between relative overflow-hidden min-h-[580px] border-primary/20">
        {/* Subtle studio radial backdrop */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, rgba(139,92,246,0.12) 0%, rgba(34,211,238,0.04) 45%, transparent 72%)',
          }}
        />

        {/* Studio Top Telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-3 z-10 pb-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h2 className="font-space font-semibold text-base text-white">AI Voice Studio</h2>
              <p className="text-[11px] text-gray-400">Aria • Autonomous Sales Representative</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!geminiAvailable && <Badge variant="warning">Demo Mode</Badge>}
            <Badge variant={callActive ? 'success' : 'default'}>
              {callActive ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live • {formatDuration(duration)}
                </span>
              ) : (
                'Standby'
              )}
            </Badge>
          </div>
        </div>

        {/* Center Orb + EchoPulse + Live Canvas Waveform */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 z-10">
          <AiOrb state={orbState} size="lg" />

          <div className="mt-5 flex flex-col items-center">
            <EchoPulse state={orbState} bars={24} height={26} />
            <motion.p
              key={orbState}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs font-semibold uppercase tracking-widest text-secondary"
            >
              {statusLabels[orbState]}
            </motion.p>
          </div>

          <AnimatePresence>
            {interimText && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 px-4 py-1.5 rounded-full glass-subtle text-xs text-gray-200 max-w-sm truncate"
              >
                “{interimText}”
              </motion.div>
            )}
          </AnimatePresence>

          <canvas
            ref={canvasRef}
            width={280}
            height={36}
            className={`mt-3 rounded-lg w-full max-w-[280px] transition-opacity duration-300 ${
              callActive ? 'h-9 opacity-85' : 'h-2 opacity-0'
            }`}
          />
        </div>

        {/* Studio Control Dock */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 border-t border-white/[0.08] z-10">
          {!callActive ? (
            <Button
              onClick={handleStartCall}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 shadow-lg shadow-emerald-500/25 border border-emerald-400/30"
            >
              <PhoneCall className="w-4 h-4" />
              Start AI Call
            </Button>
          ) : (
            <Button onClick={handleEndCall} variant="danger" size="lg">
              <PhoneOff className="w-4 h-4" />
              End Call
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => {
              const nextMuted = !muted;
              mutedRef.current = nextMuted;
              setMuted(nextMuted);
              if (!nextMuted && callActiveRef.current) {
                startListening();
              } else if (nextMuted && recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                } catch {}
                setOrbState('idle');
              }
            }}
            title={muted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {muted ? <MicOff className="w-4 h-4 text-error" /> : <Mic className="w-4 h-4 text-secondary" />}
            {muted ? 'Muted' : 'Mic On'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              setTtsEnabled(!ttsEnabled);
              if (ttsEnabled) window.speechSynthesis?.cancel();
            }}
            title="Toggle Voice Output"
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            {ttsEnabled ? 'Voice On' : 'Voice Off'}
          </Button>

          <div className="flex items-center gap-2 bg-bg-secondary/90 border border-white/10 rounded-xl px-3 py-2">
            <Globe className="w-4 h-4 text-secondary" />
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as 'en' | 'hi' | 'hi-en';
                setLanguage(newLang);
                languageRef.current = newLang;
                if (callActiveRef.current && !mutedRef.current && orbState === 'listening') {
                  startListening();
                }
              }}
              className="bg-transparent text-xs font-medium text-white focus:outline-none"
              aria-label="Conversation Language"
            >
              <option value="en" className="bg-bg-card">English</option>
              <option value="hi" className="bg-bg-card">Hindi</option>
              <option value="hi-en" className="bg-bg-card">Hinglish</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Right Panel: AI Sales DNA & Live Transcript (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Call Timeline / Stage Pipeline */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-secondary" />
              Call Timeline
            </span>
            <span className="text-[11px] font-medium text-primary">{stage}</span>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            {STAGES.map((st, idx) => {
              const currentIdx = STAGES.indexOf(stage);
              const active = idx <= (currentIdx === -1 ? 0 : currentIdx);
              return (
                <div key={st} className="flex-1 text-center">
                  <div
                    className={`h-1.5 rounded-full mb-1.5 transition-all duration-500 ${
                      active ? 'bg-gradient-to-r from-primary to-secondary shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'bg-white/10'
                    }`}
                  />
                  <span className={`text-[10px] ${active ? 'text-white font-medium' : 'text-gray-500'}`}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* AI Sales DNA Panel */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              AI Sales DNA
            </span>
            <span className="text-[11px] text-gray-400">Qualification {qualProgress}%</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.06] text-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Sentiment</p>
              <p className="text-sm mt-1 font-medium text-white capitalize">
                {getSentimentEmoji(sentiment)} {sentiment}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.06] text-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Intent</p>
              <Badge
                variant={buyingIntent === 'high' ? 'success' : buyingIntent === 'medium' ? 'primary' : 'warning'}
                className="mt-1"
              >
                {buyingIntent}
              </Badge>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.06] text-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Lead Score</p>
              <p className="font-space text-lg font-bold text-secondary mt-0.5 tabular-nums">{leadScore}/100</p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, leadScore))}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Tools Invoked */}
        <AnimatePresence>
          {toolsInvoked.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                  <Wrench className="w-3.5 h-3.5 text-secondary" />
                  Autonomous Tools Executed
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {toolsInvoked.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Transcript + Text Input */}
        <Card className="flex-1 flex flex-col min-h-[300px] max-h-[420px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h3 className="text-sm font-space font-semibold text-white">Live Transcript</h3>
            <span className="text-[11px] text-gray-400 tabular-nums">{messages.length} turns</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-3 pr-1">
            {messages.length === 0 && (
              <div className="text-center py-6 px-3 space-y-3">
                <p className="text-xs text-gray-400">
                  Click <span className="text-emerald-400 font-medium">Start AI Call</span> or try a quick prompt:
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {[
                    'What pricing plans do you offer?',
                    'We have 25 reps and want to book a demo',
                    'Hindi: क्या आप हिंदी में बात कर सकते हैं?',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-primary/20 border border-white/[0.08] hover:border-primary/40 text-gray-300 hover:text-white transition-all text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col ${m.role === 'agent' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'agent'
                      ? 'bg-primary/15 border border-primary/30 text-white'
                      : 'bg-white/[0.05] border border-white/[0.08] text-gray-200'
                  }`}
                >
                  <p>{m.content}</p>
                  {m.sources && m.sources.length > 0 && (
                    <p className="text-[10px] text-cyan-300/85 mt-1.5 pt-1 border-t border-white/[0.06]">
                      Sources: {m.sources.map((s) => s.title).join(', ')}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="pt-3 border-t border-white/[0.08] flex gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type a customer message (or speak)..."
              className="flex-1 bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-secondary/60"
            />
            <Button type="submit" loading={sending} size="md" aria-label="Send message">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
