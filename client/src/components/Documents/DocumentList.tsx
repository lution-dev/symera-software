import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Document {
  id: number;
  filename: string;
  fileUrl: string;
  filesize: number;
  category: string;
  description: string | null;
  uploadedAt: string;
  eventId: number;
}

interface DocumentListProps {
  eventId: number;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DocumentList: React.FC<DocumentListProps> = ({ eventId }) => {
  const { toast } = useToast();
  const isMobile = window.innerWidth < 768;
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Form states for upload
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  
  // Query to fetch all documents
  const { data: documentsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/events', eventId, 'documents'],
    queryFn: () => apiRequest(`/api/events/${eventId}/documents`),
  });
  
  // Ensure documents is always an array
  const documents = Array.isArray(documentsResponse) ? documentsResponse : [];
  
  // Organize documents by category
  const documentsByCategory = {
    'contratos': documents.filter((doc: Document) => doc.category === 'contratos'),
    'orcamentos': documents.filter((doc: Document) => doc.category === 'orcamentos'),
    'imagens': documents.filter((doc: Document) => doc.category === 'imagens'),
    'videos': documents.filter((doc: Document) => doc.category === 'videos'),
    'apresentacoes': documents.filter((doc: Document) => doc.category === 'apresentacoes'),
    'licencas': documents.filter((doc: Document) => doc.category === 'licencas'),
    'roteiros': documents.filter((doc: Document) => doc.category === 'roteiros'),
    'checklists': documents.filter((doc: Document) => doc.category === 'checklists'),
    'outros': documents.filter((doc: Document) => !['contratos', 'orcamentos', 'imagens', 'videos', 'apresentacoes', 'licencas', 'roteiros', 'checklists'].includes(doc.category)),
  };
  
  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const finalCategory = category === 'outros' && customCategory ? customCategory : category;
      
      const documentData = {
        filename: filename || file?.name || 'Documento sem nome',
        fileUrl: 'https://example.com/placeholder.pdf', // Placeholder - In a real implementation this would be the result of an upload
        filesize: file?.size || 0,
        category: finalCategory,
        description: description || null,
        eventId: eventId
      };
      
      return apiRequest(`/api/events/${eventId}/documents`, {
        method: 'POST',
        body: JSON.stringify(documentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'documents'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'documents'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'documents'] });
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
  
  // Handle document upload
  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename || file.name);
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }
    
    uploadMutation.mutate(formData);
  };
  
  // Handle document edit
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDocument) return;
    
    const documentData = {
      filename,
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
    setFilename(document.filename);
    
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
  
  // Calculate document counts by category
  const documentCounts = {
    contratos: documentsByCategory.contratos.length,
    orcamentos: documentsByCategory.orcamentos.length,
    imagens: documentsByCategory.imagens.length,
    videos: documentsByCategory.videos.length,
    apresentacoes: documentsByCategory.apresentacoes.length,
    licencas: documentsByCategory.licencas.length,
    roteiros: documentsByCategory.roteiros.length,
    checklists: documentsByCategory.checklists.length,
    outros: documentsByCategory.outros.length,
    total: documents.length,
  };
  
  // Get badge color based on category
  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'contratos':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'orcamentos':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'imagens':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'videos':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'apresentacoes':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'licencas':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'roteiros':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'checklists':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get document icon based on filename extension
  const getDocumentIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <i className="fas fa-file-pdf text-red-500"></i>;
      case 'doc':
      case 'docx':
        return <i className="fas fa-file-word text-blue-500"></i>;
      case 'xls':
      case 'xlsx':
        return <i className="fas fa-file-excel text-green-500"></i>;
      case 'ppt':
      case 'pptx':
        return <i className="fas fa-file-powerpoint text-orange-500"></i>;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <i className="fas fa-file-image text-purple-500"></i>;
      default:
        return <i className="fas fa-file text-gray-500"></i>;
    }
  };
  
  // Render desktop view with tabs
  const renderDesktopView = () => (
    <Tabs defaultValue="contratos" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="contratos" onClick={() => setActiveCategory('contratos')}>
          Contratos ({documentCounts.contratos})
        </TabsTrigger>
        <TabsTrigger value="orcamentos" onClick={() => setActiveCategory('orcamentos')}>
          Orçamentos ({documentCounts.orcamentos})
        </TabsTrigger>
        <TabsTrigger value="outros" onClick={() => setActiveCategory('outros')}>
          Outros ({documentCounts.outros})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="contratos">
        {renderDocumentList('contratos')}
      </TabsContent>
      
      <TabsContent value="orcamentos">
        {renderDocumentList('orcamentos')}
      </TabsContent>
      
      <TabsContent value="outros">
        {renderDocumentList('outros')}
      </TabsContent>
    </Tabs>
  );
  
  // Render mobile view with accordion
  const renderMobileView = () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="contratos">
        <AccordionTrigger>
          Contratos ({documentCounts.contratos})
        </AccordionTrigger>
        <AccordionContent>
          {renderDocumentList('contratos')}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="orcamentos">
        <AccordionTrigger>
          Orçamentos ({documentCounts.orcamentos})
        </AccordionTrigger>
        <AccordionContent>
          {renderDocumentList('orcamentos')}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="outros">
        <AccordionTrigger>
          Outros ({documentCounts.outros})
        </AccordionTrigger>
        <AccordionContent>
          {renderDocumentList('outros')}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
  
  // Render document list for a specific category
  const renderDocumentList = (category: string) => {
    const docs = documentsByCategory[category as keyof typeof documentsByCategory];
    
    if (docs.length === 0) {
      return (
        <div className="text-center py-8">
          <i className="fas fa-file text-3xl text-muted-foreground/50 mb-3"></i>
          <h3 className="font-medium text-lg mb-2">Nenhum documento nesta categoria</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adicione documentos para organizar melhor seu evento
          </p>
          <Button variant="default" onClick={() => { setCategory(category); setUploadDialogOpen(true); }}>
            <i className="fas fa-upload mr-2"></i> Fazer Upload
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 gap-4">
        {docs.map((doc: Document) => (
          <Card key={doc.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  {getDocumentIcon(doc.filename)}
                  <div>
                    <h4 className="font-medium">{doc.filename}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className={getCategoryBadgeColor(doc.category)}>
                        {doc.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(doc.filesize)}
                      </span>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Avatar className="h-5 w-5 mr-1">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <span>
                        Enviado em {formatDate(doc.uploadedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <Button size="sm" variant="outline" onClick={() => window.open(doc.fileUrl, '_blank')}>
                    <i className="fas fa-eye"></i>
                    <span className="ml-1 md:hidden lg:inline">Ver</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(doc.fileUrl, '_blank')}>
                    <i className="fas fa-download"></i>
                    <span className="ml-1 md:hidden lg:inline">Baixar</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setupEditForm(doc)}>
                    <i className="fas fa-pencil-alt"></i>
                    <span className="ml-1 md:hidden lg:inline">Editar</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50">
                        <i className="fas fa-trash-alt"></i>
                        <span className="ml-1 md:hidden lg:inline">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir documento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o documento "{doc.filename}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-500 hover:bg-red-600" 
                          onClick={() => deleteMutation.mutate(doc.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render empty state when there are no documents
  const renderEmptyState = () => (
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
  );
  
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
        
        <form onSubmit={handleUpload} className="space-y-4 mt-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Arquivo</Label>
            <Input 
              id="file" 
              type="file" 
              onChange={handleFileChange}
              className="cursor-pointer"
              required
            />
            <p className="text-xs text-muted-foreground">
              Suporta arquivos PDF, Word, Excel, e imagens
            </p>
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="filename">Nome do Documento</Label>
            <Input 
              id="filename" 
              value={filename} 
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Ex: Contrato Principal"
              required
            />
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
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
  
  // Edit Document Dialog
  const renderEditDialog = () => (
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
          <DialogDescription>
            Atualize as informações deste documento.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleEdit} className="space-y-4 mt-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="edit-filename">Nome do Documento</Label>
            <Input 
              id="edit-filename" 
              value={filename} 
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Ex: Contrato Principal"
              required
            />
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="edit-category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contratos">Contratos</SelectItem>
                <SelectItem value="orcamentos">Orçamentos</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="edit-description">Descrição (opcional)</Label>
            <Textarea 
              id="edit-description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição sobre este documento"
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
              {editMutation.isPending ? 'Salvando...' : 'Atualizar Documento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
  
  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Carregando documentos...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erro ao carregar documentos. Tente novamente.</p>
        <Button className="mt-4" onClick={() => refetch()}>Tentar Novamente</Button>
      </div>
    );
  }
  
  return (
    <div className="document-list">
      {/* Document list */}
      <Card>
        <CardContent className="p-6">
          {documents.length === 0 ? (
            renderEmptyState()
          ) : (
            isMobile ? renderMobileView() : renderDesktopView()
          )}
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      {renderUploadDialog()}
      {renderEditDialog()}
    </div>
  );
};

export default DocumentList;