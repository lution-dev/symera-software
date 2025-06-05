import fs from 'fs';
import path from 'path';

export function saveBase64Image(base64Data: string, eventId: number): string {
  try {
    // Remove o prefixo data:image/...;base64,
    const matches = base64Data.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image format');
    }

    const imageType = matches[1]; // jpeg, png, etc.
    const imageBuffer = Buffer.from(matches[2], 'base64');

    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'events');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Nome único para o arquivo
    const fileName = `event-${eventId}-${Date.now()}.${imageType}`;
    const filePath = path.join(uploadDir, fileName);

    // Salvar o arquivo
    fs.writeFileSync(filePath, imageBuffer);

    // Retornar a URL pública
    return `/uploads/events/${fileName}`;
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    throw new Error('Falha ao processar upload da imagem');
  }
}

export function deleteImage(imageUrl: string): void {
  try {
    if (imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
  }
}