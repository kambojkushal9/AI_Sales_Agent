import React, { useEffect, useState } from 'react';
import { Save, Cpu, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Input, Badge } from '../components/ui';
import { agentAPI } from '../lib/api';

export const Settings: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [geminiAvailable, setGeminiAvailable] = useState(true);
  const [modelName, setModelName] = useState('gemini-2.0-flash');
  const [form, setForm] = useState({
    agentName: 'Aria (EchoSales AI)',
    companyName: 'EchoSales AI',
    companyDescription: 'Autonomous AI Sales Voice Agent platform that qualifies leads and books demos 24/7.',
    salesPitch: 'We help high-growth teams automate 24/7 lead qualification and boost conversion rates by 3x.',
    greeting: 'Hello! I am Aria from EchoSales AI. How can I help accelerate your sales pipeline today?',
    language: 'en',
    voiceEnabled: true,
    autoQualify: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await agentAPI.getConfig();
        if (res.data?.config) {
          setForm((prev) => ({ ...prev, ...res.data.config }));
        }
        if (typeof res.data?.geminiAvailable === 'boolean') {
          setGeminiAvailable(res.data.geminiAvailable);
        }
        if (res.data?.model) setModelName(res.data.model);
      } catch {
        // use defaults
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await agentAPI.updateConfig(form);
      toast.success('Agent configuration saved');
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="font-space text-2xl font-bold">Agent & Platform Settings</h2>
        <p className="text-sm text-gray-400">Configure your autonomous sales persona, pitch, and Gemini integration.</p>
      </div>

      {/* Gemini Status */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-space font-semibold text-base">Google Gemini AI Engine</h3>
            <p className="text-xs text-gray-400">Active Model: {modelName} (Server-side secured)</p>
          </div>
        </div>
        <Badge variant={geminiAvailable ? 'success' : 'warning'}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          {geminiAvailable ? 'Connected' : 'Demo Fallback'}
        </Badge>
      </Card>

      {/* Configuration Form */}
      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Agent Name"
              value={form.agentName}
              onChange={(e) => setForm({ ...form, agentName: e.target.value })}
            />
            <Input
              label="Company Name"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Company Description</label>
            <textarea
              rows={2}
              value={form.companyDescription}
              onChange={(e) => setForm({ ...form, companyDescription: e.target.value })}
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Sales Pitch</label>
            <textarea
              rows={2}
              value={form.salesPitch}
              onChange={(e) => setForm({ ...form, salesPitch: e.target.value })}
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Opening Greeting</label>
            <textarea
              rows={2}
              value={form.greeting}
              onChange={(e) => setForm({ ...form, greeting: e.target.value })}
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 text-sm text-white"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Default Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="hi-en">Hinglish</option>
              </select>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer mt-5 sm:mt-0">
              <input
                type="checkbox"
                checked={form.voiceEnabled}
                onChange={(e) => setForm({ ...form, voiceEnabled: e.target.checked })}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm">Voice Enabled</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer mt-5 sm:mt-0">
              <input
                type="checkbox"
                checked={form.autoQualify}
                onChange={(e) => setForm({ ...form, autoQualify: e.target.checked })}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm">Auto-Qualify Leads</span>
            </label>
          </div>

          <div className="flex justify-end pt-3">
            <Button type="submit" loading={saving}>
              <Save className="w-4 h-4" />
              Save Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
