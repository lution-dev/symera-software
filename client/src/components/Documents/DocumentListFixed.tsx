import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, Edit2, Trash2, Search, Plus, FileText, Upload, X } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  fileUrl: string;
  fileType: string;
  category: string;
  description: string | null;
  uploadedAt: string;
  eventId: number;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentListProps {
  eventId: number;
}

export default function DocumentList({ eventId }: DocumentListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for UI
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // State for form fields
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');

  // Fetch documents with proper error handling
  const { data: documentsResponse, isLoading, refetch, error } = useQuery({
    queryKey: [`documents-${eventId}`],
    queryFn: async () => {
      try {
        return await apiRequest(`/api/events/${eventId}/documents`);
      } catch (err) {
        console.log('Erro ao buscar documentos:', err);
        return []; // Return empty array on error
      }
    },
    staleTime: 0,
    gcTime: 0,
    retry: false,
    enabled: true,
  });

  // Ensure documents is always an array
  const documents = Array.isArray(documentsResponse) ? documentsResponse : [];
  
  console.log('Documents response:', documentsResponse);
  console.log('Documents array:', documents);
  console.log('Documents length:', documents.length);
  console.log('Is loading:', isLoading);

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (documentData: { filename: string; category: string; description: string | null }) => {
      if (!file) {
        throw new Error("Nenhum arquivo selecionado");
      }

      console.log('=== INICIANDO UPLOAD NO FRONTEND ===');
      console.log('Dados do documento:', documentData);
      console.log('Arquivo selecionado:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', documentData.filename);
      formData.append('category', documentData.category);
      formData.append('description', documentData.description || '');
      formData.append('eventId', eventId.toString());
      
      console.log('FormData criado:');
      console.log('- file:', file.name);
      console.log('- filename:', documentData.filename);
      console.log('- category:', documentData.category);
      console.log('- description:', documentData.description);
      
      try {
        const result = await apiRequest(`/api/events/${eventId}/documents`, {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - let browser set it with boundary for FormData
        });
        console.log('Upload bem-sucedido:', result);
        return result;
      } catch (error) {
        console.error('Erro durante upload:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('Document upload success:', response);
      // Force refresh the documents list
      queryClient.invalidateQueries({ queryKey: [`documents-${eventId}`] });
      refetch(); // Also call refetch directly
      toast({
        title: 'Documento enviado com sucesso',
        description: 'O documento foi adicionado ao evento.',
      });
      resetUploadForm();
      setUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar documento',
        description: 'Não foi possível fazer o upload do documento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Edit document mutation
  const editMutation = useMutation({
    mutationFn: async (documentData: Partial<Document>) => {
      if (!selectedDocument) return null;
      
      const finalCategory = category === 'outros' && customCategory ? customCategory : category;
      const updatedData = { ...documentData, category: finalCategory };
      
      return apiRequest(`/api/events/${eventId}/documents/${selectedDocument.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`documents-${eventId}`] });
      refetch();
      toast({
        title: 'Documento atualizado',
        description: 'As informações do documento foram atualizadas com sucesso.',
      });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar documento',
        description: 'Não foi possível atualizar o documento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return apiRequest(`/api/events/${eventId}/documents/${documentId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`documents-${eventId}`] });
      refetch();
      toast({
        title: 'Documento excluído',
        description: 'O documento foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir documento',
        description: 'Não foi possível excluir o documento. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill filename with the file's name if not already set
      if (!filename) {
        setFilename(selectedFile.name);
      }
    }
  };
  

  
  // Handle document edit
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDocument) return;
    
    const documentData = {
      name: filename,
      category,
      description: description || null,
    };
    
    editMutation.mutate(documentData);
  };
  
  // Reset upload form
  const resetUploadForm = () => {
    setFile(null);
    setFilename('');
    setCategory('');
    setCustomCategory('');
    setDescription('');
  };
  
  // Set up edit form with selected document data
  const setupEditForm = (document: Document) => {
    setSelectedDocument(document);
    setFilename(document.name); // Usar 'name' ao invés de 'filename'
    
    // Check if the category is one of the predefined ones
    const predefinedCategories = ['contratos', 'orcamentos', 'imagens', 'videos', 'apresentacoes', 'licencas', 'roteiros', 'checklists'];
    if (predefinedCategories.includes(document.category)) {
      setCategory(document.category);
      setCustomCategory('');
    } else {
      setCategory('outros');
      setCustomCategory(document.category);
    }
    
    setDescription(document.description || '');
    setEditDialogOpen(true);
  };

  // Filter documents based on search term and selected category
  const filteredDocuments = Array.isArray(documents) ? documents.filter((doc: Document) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) : [];

  // Upload Document Dialog
  const renderUploadDialog = () => (
    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Fazer Upload de Documento</DialogTitle>
          <DialogDescription>
            Adicione documentos como contratos, orçamentos e outros arquivos importantes do evento.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          
          // Validation
          if (!file) {
            toast({
              title: 'Arquivo necessário',
              description: 'Por favor, selecione um arquivo para upload.',
              variant: 'destructive',
            });
            return;
          }
          
          if (!category) {
            toast({
              title: 'Categoria necessária',
              description: 'Por favor, selecione uma categoria para o documento.',
              variant: 'destructive',
            });
            return;
          }
          
          if (category === 'outros' && !customCategory) {
            toast({
              title: 'Nome da categoria necessário',
              description: 'Por favor, digite o nome da categoria personalizada.',
              variant: 'destructive',
            });
            return;
          }

          // Create document data object
          const documentData = {
            filename: filename || file.name,
            category: category === 'outros' ? customCategory : category,
            description: description || null
          };
          
          uploadMutation.mutate(documentData);
        }} className="space-y-4 mt-4 p-4 rounded-lg" style={{ backgroundColor: '#1A0A29' }}>
          <div className="w-full">
            <Label htmlFor="file" className="text-sm font-medium">Arquivo</Label>
            <div className="mt-2">
              {!file ? (
                <label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800/20 transition-colors"
                  style={{ borderColor: '#374151' }}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste o arquivo
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, XLS, PNG, JPG (máx. 10MB)</p>
                  </div>
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                    required
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between w-full p-4 border-2 border-green-500 bg-green-500/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-400">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => {
                      setFile(null);
                      setFilename('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="filename">Nome do Documento</Label>
            <Input 
              id="filename" 
              value={filename} 
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Ex: Contrato Principal"
              required
              style={{ backgroundColor: '#1A0A29', border: '1px solid #374151', color: 'white' }}
            />
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category" style={{ backgroundColor: '#1A0A29', border: '1px solid #374151', color: 'white' }}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contratos">Contratos</SelectItem>
                <SelectItem value="orcamentos">Orçamentos</SelectItem>
                <SelectItem value="imagens">Imagens (Ex: artes do evento, fotos de locação, logos)</SelectItem>
                <SelectItem value="videos">Vídeos (Ex: teaser, making of, cobertura anterior)</SelectItem>
                <SelectItem value="apresentacoes">Apresentações (PPT, PDF de pitch, cronogramas visuais)</SelectItem>
                <SelectItem value="licencas">Licenças e Autorizações</SelectItem>
                <SelectItem value="roteiros">Roteiros (para eventos com palco, falas, etc.)</SelectItem>
                <SelectItem value="checklists">Checklist impresso</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Campo customizado quando "Outros" for selecionado */}
          {category === 'outros' && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="custom-category">Nome da Categoria Personalizada</Label>
              <Input 
                id="custom-category" 
                value={customCategory} 
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ex: Decoração, Música, etc."
                required
                style={{ backgroundColor: '#1A0A29', border: '1px solid #374151', color: 'white' }}
              />
            </div>
          )}
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição sobre este documento"
              style={{ backgroundColor: '#1A0A29', border: '1px solid #374151', color: 'white' }}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { resetUploadForm(); setUploadDialogOpen(false); }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Enviando...' : 'Salvar Documento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return <div className="p-4">Carregando documentos...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with search and filter */}
      <div className="p-4 border-b" style={{ backgroundColor: '#1A0A29', borderColor: '#374151' }}>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Documentos</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie contratos, orçamentos e outros documentos do evento
            </p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <i className="fas fa-upload mr-2"></i> Fazer Upload
          </Button>
        </div>
        
        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            style={{ backgroundColor: '#1A0A29', border: '1px solid #374151', color: 'white' }}
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]" style={{ backgroundColor: '#1A0A29', border: '1px solid #374151', color: 'white' }}>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="contratos">Contratos</SelectItem>
              <SelectItem value="orcamentos">Orçamentos</SelectItem>
              <SelectItem value="imagens">Imagens</SelectItem>
              <SelectItem value="videos">Vídeos</SelectItem>
              <SelectItem value="apresentacoes">Apresentações</SelectItem>
              <SelectItem value="licencas">Licenças</SelectItem>
              <SelectItem value="roteiros">Roteiros</SelectItem>
              <SelectItem value="checklists">Checklists</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-file-alt text-3xl text-muted-foreground/50 mb-3"></i>
            <h3 className="font-medium text-lg mb-2">Nenhum documento disponível</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Faça upload de contratos, orçamentos e outros documentos relacionados ao evento
            </p>
            <Button variant="default" onClick={() => setUploadDialogOpen(true)}>
              <i className="fas fa-upload mr-2"></i> Fazer Upload do Primeiro Documento
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDocuments.map((doc: Document) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-file text-gray-500 text-lg"></i>
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline">
                            {doc.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {doc.fileType}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(doc.uploadedAt)}
                          </span>
                        </div>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {/* View button for viewable files (PDFs, images) */}
                      {(doc.fileType === 'pdf' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(doc.fileType.toLowerCase())) && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <i className="fas fa-eye mr-2"></i> Visualizar
                          </a>
                        </Button>
                      )}
                      
                      {/* Download button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Create a download link
                          const link = document.createElement('a');
                          link.href = doc.fileUrl;
                          link.download = doc.name;
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <i className="fas fa-download mr-2"></i> Download
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setupEditForm(doc)}
                      >
                        <i className="fas fa-edit mr-2"></i> Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <i className="fas fa-trash mr-2"></i> Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {renderUploadDialog()}
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
            <DialogDescription>
              Altere as informações do documento selecionado.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEdit} className="space-y-4 mt-4 p-4 rounded-lg" style={{ backgroundColor: '#1A0A29' }}>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="edit-filename">Nome do Documento</Label>
              <Input 
                id="edit-filename" 
                value={filename} 
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Ex: Contrato Principal"
                required
                style={{ backgroundColor: '#1A0A29', border: '1px solid #374151', color: 'white' }}
              />
            </div>
            
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="edit-category" style={{ backgroundColor: '#1A0A29', border: '1px solid #374151', color: 'white' }}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contratos">Contratos</SelectItem>
                  <SelectItem value="orcamentos">Orçamentos</SelectItem>
                  <SelectItem value="imagens">Imagens</SelectItem>
                  <SelectItem value="videos">Vídeos</SelectItem>
                  <SelectItem value="apresentacoes">Apresentações</SelectItem>
                  <SelectItem value="licencas">Licenças e Autorizações</SelectItem>
                  <SelectItem value="roteiros">Roteiros</SelectItem>
                  <SelectItem value="checklists">Checklist</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Campo customizado quando "Outros" for selecionado */}
            {category === 'outros' && (
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="edit-custom-category">Nome da Categoria Personalizada</Label>
                <Input 
                  id="edit-custom-category" 
                  value={customCategory} 
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Ex: Decoração, Música, etc."
                  required
                  style={{ backgroundColor: '#1A0A29', border: '1px solid #374151', color: 'white' }}
                />
              </div>
            )}
            
            <div className="grid w-full gap-1.5">
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Textarea 
                id="edit-description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição sobre este documento"
                style={{ backgroundColor: '#1A0A29', border: '1px solid #374151', color: 'white' }}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o documento "{selectedDocument?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedDocument) {
                  deleteMutation.mutate(selectedDocument.id);
                  setDeleteDialogOpen(false);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}