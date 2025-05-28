import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Download, 
  Eye, 
  Trash2, 
  Upload, 
  Plus,
  File,
  FileX,
  Calendar,
  Edit,
  User
} from 'lucide-react';
import type { Document } from '@shared/schema';

interface DocumentManagerProps {
  eventId: number;
}

const DOCUMENT_CATEGORIES = [
  'Contrato',
  'Imagem', 
  'PDF',
  'Vídeo',
  'Orçamento',
  'Outros'
];

const getFileIcon = (fileType: string, category: string) => {
  const safeFileType = fileType || '';
  
  if (category === 'Imagem' || safeFileType.startsWith('image/')) {
    return <Image className="h-5 w-5" />;
  }
  if (category === 'Vídeo' || safeFileType.startsWith('video/')) {
    return <Video className="h-5 w-5" />;
  }
  if (safeFileType.startsWith('audio/')) {
    return <Music className="h-5 w-5" />;
  }
  if (safeFileType === 'application/pdf' || category === 'PDF') {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  return <File className="h-5 w-5" />;
};

const getFileTypeColor = (fileType: string, category: string) => {
  const safeFileType = fileType || '';
  
  if (category === 'Imagem' || safeFileType.startsWith('image/')) return 'bg-green-100 text-green-800';
  if (category === 'Vídeo' || safeFileType.startsWith('video/')) return 'bg-purple-100 text-purple-800';
  if (safeFileType === 'application/pdf' || category === 'PDF') return 'bg-red-100 text-red-800';
  if (category === 'Contrato') return 'bg-blue-100 text-blue-800';
  if (category === 'Orçamento') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

export function DocumentManager({ eventId }: DocumentManagerProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    category: '',
    file: null as File | null
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar documentos
  const { data: documents = [], isLoading, error } = useQuery<Document[]>({
    queryKey: [`/api/events/${eventId}/documents`],
    enabled: !!eventId
  });



  // Agrupar documentos por categoria
  const documentsByCategory = (documents || []).reduce((acc: Record<string, Document[]>, doc: Document) => {
    const category = doc.category || 'Outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {});

  // Upload de documento
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/events/${eventId}/documents`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro no upload');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/documents`] });
      setIsUploadOpen(false);
      setUploadForm({ name: '', description: '', category: '', file: null });
      toast({
        title: "Sucesso!",
        description: "Documento enviado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao enviar documento.",
        variant: "destructive"
      });
    }
  });

  // Deletar documento
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest(`/api/events/${eventId}/documents/${documentId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/documents`] });
      toast({
        title: "Documento removido",
        description: "Documento excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir documento.",
        variant: "destructive"
      });
    }
  });

  // Editar documento
  const editMutation = useMutation({
    mutationFn: async ({ documentId, updateData }: { documentId: number, updateData: any }) => {
      const response = await apiRequest(`/api/events/${eventId}/documents/${documentId}`, {
        method: 'PATCH',
        body: updateData
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/documents`] });
      setIsEditOpen(false);
      setEditingDocument(null);
      setEditForm({ name: '', description: '', category: '' });
      toast({
        title: "Sucesso!",
        description: "Documento atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar documento.",
        variant: "destructive"
      });
    }
  });

  const handleUpload = () => {
    if (!uploadForm.file || !uploadForm.name || !uploadForm.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('filename', uploadForm.name);
    formData.append('category', uploadForm.category);
    if (uploadForm.description) {
      formData.append('description', uploadForm.description);
    }

    setIsUploading(true);
    uploadMutation.mutate(formData);
    setIsUploading(false);
  };

  const handleFileView = (document: Document) => {
    window.open(document.fileUrl, '_blank');
  };

  const handleFileDownload = (document: Document) => {
    const link = window.document.createElement('a');
    link.href = document.fileUrl;
    link.download = document.name;
    link.click();
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setEditForm({
      name: document.name,
      description: document.description || '',
      category: document.category
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editingDocument || !editForm.name || !editForm.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e categoria são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    editMutation.mutate({
      documentId: editingDocument.id,
      updateData: {
        name: editForm.name,
        description: editForm.description || null,
        category: editForm.category
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <FileX className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Erro ao carregar documentos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de upload */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#fff]">Documentos do Evento</h2>
          <p className="text-sm text-[#858090]">
            Organize e gerencie todos os documentos relacionados ao evento
          </p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Documento</DialogTitle>
              <DialogDescription>
                Faça upload de um novo documento para o evento
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Arquivo *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.mp3,.wav,.txt"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                />
              </div>
              
              <div>
                <Label htmlFor="name">Nome do Documento *</Label>
                <Input
                  id="name"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="Ex: Contrato principal"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Descrição opcional do documento"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading || uploadMutation.isPending}
                  className="flex-1"
                >
                  {(isUploading || uploadMutation.isPending) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Lista de documentos por categoria */}
      {(documents || []).length === 0 ? (
        <div className="text-center py-12">
          <FileX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
          <p className="text-gray-500 mb-4">Comece adicionando o primeiro documento do evento</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {Object.entries(documentsByCategory).map(([category, docs]) => (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <Badge variant="secondary">{docs.length}</Badge>
                </div>
                <CardDescription>
                  {docs.length} documento{docs.length !== 1 ? 's' : ''} nesta categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {docs.map((document: Document) => (
                    <div
                      key={document.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {getFileIcon(document.fileType, document.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate text-[#fff]">
                            {document.name}
                          </h4>
                          
                          {document.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {document.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getFileTypeColor(document.fileType, document.category)}`}
                            >
                              {document.fileType ? document.fileType.split('/').pop()?.toUpperCase() : 'FILE'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs mt-2 text-[#858090]">
                            <Calendar className="h-3 w-3" />
                            {new Date(document.uploadedAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 mt-3 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFileView(document)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFileDownload(document)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Baixar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDocument(document)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(document.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de edição de documento */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
            <DialogDescription>
              Atualize as informações do documento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome do documento *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do documento"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional do documento"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Categoria *</Label>
              <Select 
                value={editForm.category} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contratos">Contratos</SelectItem>
                  <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                  <SelectItem value="Orçamento">Orçamento</SelectItem>
                  <SelectItem value="Cronograma">Cronograma</SelectItem>
                  <SelectItem value="Convites">Convites</SelectItem>
                  <SelectItem value="Documentos Legais">Documentos Legais</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditOpen(false)}
              disabled={editMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}