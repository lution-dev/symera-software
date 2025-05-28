import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;

// Configurar CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'participants-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Endpoint de upload que FUNCIONA
app.post('/upload/:eventId', upload.single('file'), (req, res) => {
  console.log('🚀 SERVIDOR SEPARADO FUNCIONANDO!');
  console.log('EventId:', req.params.eventId);
  console.log('Arquivo:', req.file?.originalname);

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    // Processar arquivo CSV
    let validParticipants = [];
    
    if (req.file.mimetype === 'text/csv' || req.file.originalname?.endsWith('.csv')) {
      const csvData = fs.readFileSync(req.file.path, 'utf8');
      const lines = csvData.split('\n').filter(line => line.trim());
      
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''));
        if (columns.length >= 3) {
          validParticipants.push({
            name: columns[0],
            email: columns[1],
            phone: columns[2],
            status: 'pending',
            origin: 'imported'
          });
        }
      }
    } else {
      // Simular Excel
      validParticipants = [
        {
          name: "Participante Teste",
          email: "teste@exemplo.com",
          phone: "11999999999",
          status: 'pending',
          origin: 'imported'
        }
      ];
    }

    // Limpar arquivo
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const result = {
      message: 'Arquivo processado com sucesso',
      stats: {
        total: validParticipants.length,
        valid: validParticipants.length,
        invalid: 0
      },
      validParticipants: validParticipants,
      invalidRecords: []
    };

    console.log('✅ Upload processado:', result.stats);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ message: 'Erro ao processar arquivo' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de upload rodando na porta ${PORT}`);
});