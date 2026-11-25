import { Router } from 'express';
import multer from 'multer';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import {
  listDocuments,
  processAndStoreDocument,
  deleteDocument,
  searchKnowledgeBase,
} from '../services/knowledgeService';

const router = Router();
router.use(optionalAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.md'];
    const lower = file.originalname.toLowerCase();
    if (allowed.some((ext) => lower.endsWith(ext))) {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .txt, and .md files are allowed'));
    }
  },
});

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const documents = await listDocuments(req.user!.id);
  res.json({ success: true, documents });
}));

router.post('/upload', upload.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const originalName = req.file.originalname;
  const lower = originalName.toLowerCase();
  let type: 'pdf' | 'txt' | 'md' = 'txt';
  let content = '';

  if (lower.endsWith('.pdf')) {
    type = 'pdf';
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = await pdfParse(req.file.buffer);
      content = parsed.text || '';
    } catch (err) {
      console.warn('PDF parse fallback:', err);
      content = req.file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
    }
  } else if (lower.endsWith('.md')) {
    type = 'md';
    content = req.file.buffer.toString('utf-8');
  } else {
    type = 'txt';
    content = req.file.buffer.toString('utf-8');
  }

  if (!content.trim()) {
    throw new AppError('Could not extract readable text from file', 400);
  }

  const title = (req.body?.title as string) || originalName.replace(/\.[^.]+$/, '');
  const document = await processAndStoreDocument({
    userId: req.user!.id,
    title,
    content,
    type,
    originalFilename: originalName,
    fileSize: req.file.size,
  });

  res.status(201).json({ success: true, document });
}));

router.post('/manual', asyncHandler(async (req: AuthRequest, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    throw new AppError('Title and content are required', 400);
  }

  const document = await processAndStoreDocument({
    userId: req.user!.id,
    title,
    content,
    type: 'manual',
    fileSize: Buffer.byteLength(content, 'utf-8'),
  });

  res.status(201).json({ success: true, document });
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  await deleteDocument(req.params.id, req.user!.id);
  res.json({ success: true, message: 'Document deleted' });
}));

router.post('/search', asyncHandler(async (req: AuthRequest, res) => {
  const { query, topK = 4 } = req.body;
  if (!query) throw new AppError('Search query is required', 400);

  const results = await searchKnowledgeBase(query, req.user!.id, Number(topK));
  res.json({ success: true, results });
}));

export default router;
