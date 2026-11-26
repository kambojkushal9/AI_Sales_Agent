import React, { useEffect, useState } from 'react';
import { Phone, Sparkles, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Badge, Button, Modal, EmptyState } from '../components/ui';
import { callsAPI } from '../lib/api';
import { demoCalls } from '../lib/demoData';
import { Call } from '../types';
import { formatDuration, formatTimeAgo, getSentimentEmoji } from '../lib/utils';

export const CallHistory: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>(demoCalls);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await callsAPI.getAll();
        if (res.data?.calls?.length) setCalls(res.data.calls);
      } catch {
        // fallback to demo calls
      }
    };
    load();
  }, []);

  const handleGenerateSummary = async (call: Call) => {
    setSummarizing(true);
    try {
      const res = await callsAPI.summarize(call._id);
      if (res.data?.summary) {
        const updated = { ...call, summary: res.data.summary };
        setCalls((prev) => prev.map((c) => (c._id === call._id ? updated : c)));
        setSelectedCall(updated);
        toast.success('AI Summary generated');
      }
    } catch {
      toast.error('Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="font-space text-2xl font-bold tracking-tight">Call History & Transcripts</h2>
        <p className="text-sm text-gray-400">Review recorded conversations, sentiment, and Gemini summaries.</p>
      </div>

      {/* Calls List */}
      {calls.length === 0 ? (
        <EmptyState
          icon={Phone}
          title="No calls recorded yet"
          description="Start a live session in the AI Voice Agent studio to see transcripts and summaries here."
        />
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <Card
              key={call._id}
              hover
              onClick={() => setSelectedCall(call)}
              className="cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-space font-semibold text-base text-white">{call.customerName}</h3>
                  <p className="text-xs text-gray-400">
                    {call.customerPhone || 'Web Voice Session'} • {formatTimeAgo(call.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-gray-300 tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> {formatDuration(call.duration)}
                </span>
                <span className="text-sm">{getSentimentEmoji(call.sentiment)}</span>
                <Badge variant={call.leadScore >= 75 ? 'success' : 'primary'}>
                  Score {call.leadScore}
                </Badge>
                <Badge variant={call.status === 'completed' ? 'success' : 'default'}>
                  {call.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Call Detail Modal */}
      <Modal
        isOpen={Boolean(selectedCall)}
        onClose={() => setSelectedCall(null)}
        title={`Call Details — ${selectedCall?.customerName || ''}`}
        maxWidth="max-w-2xl"
      >
        {selectedCall && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <Badge variant="primary">Stage: {selectedCall.conversationStage || 'Discovery'}</Badge>
                <Badge variant="secondary">Language: {selectedCall.language}</Badge>
              </div>
              <Button
                size="sm"
                loading={summarizing}
                onClick={() => handleGenerateSummary(selectedCall)}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate AI Summary
              </Button>
            </div>

            {/* AI Summary */}
            {selectedCall.summary && (
              <Card className="p-4 bg-primary/10 border-primary/25 space-y-3 text-sm">
                <p className="font-semibold text-white">Executive Summary</p>
                <p className="text-gray-300">{selectedCall.summary.summary}</p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div>
                    <p className="text-amber-300 font-medium mb-1">Pain Points</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-0.5">
                      {selectedCall.summary.painPoints?.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-emerald-300 font-medium mb-1">Buying Signals</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-0.5">
                      {selectedCall.summary.buyingSignals?.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-secondary pt-1">
                  Recommended Next Action: {selectedCall.summary.nextAction}
                </p>
              </Card>
            )}

            {/* Transcript */}
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Full Transcript</p>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {selectedCall.transcript?.length ? (
                  selectedCall.transcript.map((t, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-sm ${
                        t.role === 'agent'
                          ? 'bg-primary/15 border border-primary/25 ml-6'
                          : 'bg-white/[0.04] border border-white/10 mr-6'
                      }`}
                    >
                      <span className="text-[10px] uppercase text-gray-400 block mb-0.5">{t.role}</span>
                      {t.content}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No transcript lines recorded for this call.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
