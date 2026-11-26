import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Search, Trash2, Plus, Sparkles, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Badge, Input, Modal, EmptyState } from '../components/ui';
import { knowledgeAPI } from '../lib/api';
import { demoKnowledgeDocs } from '../lib/demoData';
import { KnowledgeDocument } from '../types';
import { formatDate } from '../lib/utils';

export const KnowledgeBase: React.FC = () => {
  const [docs, setDocs] = useState<KnowledgeDocument[]>(demoKnowledgeDocs);
  const [searchQuery, setSearchQuery] = useState('');
  const [ragResults, setRagResults] = useState<Array<{ title: string; content: string; score: number }>>([]);
  const [searching, setSearching] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [manualForm, setManualForm] = useState({ title: '', content: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await knowledgeAPI.getAll();
        if (res.data?.documents) setDocs(res.data.documents);
      } catch {
        // fallback to demo docs
      }
    };
    load();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return toast.error('Please select a .pdf, .txt, or .md file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      const res = await knowledgeAPI.upload(fd);
      if (res.data?.document) {
        setDocs((prev) => [res.data.document, ...prev]);
      }
      toast.success('Document embedded & added to RAG Knowledge Base');
      setSelectedFile(null);
      setUploadOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.title || !manualForm.content) return toast.error('Title and content are required');
    setUploading(true);
    try {
      const res = await knowledgeAPI.createManual(manualForm);
      if (res.data?.document) setDocs((prev) => [res.data.document, ...prev]);
      toast.success('Knowledge entry created');
      setManualForm({ title: '', content: '' });
      setManualOpen(false);
    } catch {
      toast.error('Failed to save document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await knowledgeAPI.delete(id);
      setDocs((prev) => prev.filter((d) => d._id !== id));
      toast.success('Document removed');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await knowledgeAPI.search(searchQuery);
      setRagResults(res.data?.results || []);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-space text-2xl font-bold tracking-tight">RAG Knowledge Base</h2>
          <p className="text-sm text-gray-400">
            Upload company documents so the AI agent answers with verified citations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setManualOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Entry
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* RAG Search Tester */}
      <Card>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Test RAG retrieval: e.g. 'What is the pricing for Growth plan?'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" loading={searching}>
            <Sparkles className="w-4 h-4" />
            Test RAG
          </Button>
        </form>

        <AnimatePresence>
          {ragResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 space-y-2.5 pt-4 border-t border-white/[0.08]"
            >
              <p className="text-xs font-medium text-secondary">Retrieved Context Chunks:</p>
              {ragResults.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{r.title}</span>
                    <Badge variant="secondary">Relevance: {Math.round(r.score * 100)}%</Badge>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">{r.content}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Documents Grid */}
      {docs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No knowledge documents yet"
          description="Upload PDFs, Markdown files, or create a text entry to ground your AI sales agent."
          action={<Button onClick={() => setUploadOpen(true)}>Upload Document</Button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <Card key={doc._id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{doc.type.toUpperCase()}</Badge>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-error hover:bg-error/10 transition-colors"
                      aria-label="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-space font-semibold text-base mb-1">{doc.title}</h3>
                <p className="text-xs text-gray-400">
                  {doc.chunkCount} embedded chunks • Added {formatDate(doc.createdAt)}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <Badge variant={doc.status === 'ready' ? 'success' : 'warning'}>{doc.status}</Badge>
                <span className="text-xs text-gray-500">
                  {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : 'Text'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Knowledge Document">
        <form onSubmit={handleUpload} className="space-y-4">
          <label className="block border-2 border-dashed border-white/15 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-white">
              {selectedFile ? selectedFile.name : 'Click to select PDF, TXT, or Markdown'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Max file size: 10MB</p>
            <input
              type="file"
              accept=".pdf,.txt,.md"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={uploading}>
              Upload & Embed
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manual Create Modal */}
      <Modal isOpen={manualOpen} onClose={() => setManualOpen(false)} title="Create Knowledge Entry">
        <form onSubmit={handleManualCreate} className="space-y-4">
          <Input
            label="Document Title *"
            value={manualForm.title}
            onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Content *</label>
            <textarea
              rows={6}
              value={manualForm.content}
              onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
              placeholder="Paste pricing, FAQs, or product specifications..."
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 text-sm text-white font-mono"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setManualOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={uploading}>
              Save & Embed
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
