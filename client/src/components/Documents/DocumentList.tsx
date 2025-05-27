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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  
  // Form states for upload
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  
  // Query to fetch all documents
  const { data: documentsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/events', eventId, 'documents'],
    queryFn: async () => {
      const response = await apiRequest(`/api/events/${eventId}/documents`);
      return response.json();
    },
  });
  
  // Ensure documents is always an array
  const documents = Array.isArray(documentsResponse) ? documentsResponse : [];
  
  console.log("Documents received:", documents);
  
  // Filter documents based on search term and category
  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = searchTerm === '' || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'todos' || doc.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Organize documents by category for counts
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
    mutationFn: async (documentData: { filename: string; category: string; description: string | null }) => {
      if (!file) {
        throw new Error("Nenhum arquivo selecionado");
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', documentData.filename);
      formData.append('category', documentData.category);
      formData.append('description', documentData.description || '');
      formData.append('eventId', eventId.toString());
      
      return apiRequest(`/api/events/${eventId}/documents`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for FormData
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
    
    if (category === 'outros' && !customCategory) {
      toast({
        title: 'Nome da categoria necessário',
        description: 'Por favor, digite o nome da categoria personalizada.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create document data object instead of FormData
    const documentData = {
      filename: filename || file.name,
      category: category === 'outros' ? customCategory : category,
      description: description || null
    };
    
    uploadMutation.mutate(documentData);
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
  
  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contratos':
        return <i className="fas fa-file-contract text-blue-500 text-2xl"></i>;
      case 'orcamentos':
        return <i className="fas fa-calculator text-green-500 text-2xl"></i>;
      case 'imagens':
        return <i className="fas fa-images text-purple-500 text-2xl"></i>;
      case 'videos':
        return <i className="fas fa-video text-red-500 text-2xl"></i>;
      case 'apresentacoes':
        return <i className="fas fa-presentation text-orange-500 text-2xl"></i>;
      case 'licencas':
        return <i className="fas fa-certificate text-yellow-500 text-2xl"></i>;
      case 'roteiros':
        return <i className="fas fa-script text-indigo-500 text-2xl"></i>;
      case 'checklists':
        return <i className="fas fa-check-square text-teal-500 text-2xl"></i>;
      case 'outros':
        return <i className="fas fa-folder text-gray-500 text-2xl"></i>;
      default:
        return <i className="fas fa-file text-gray-500 text-2xl"></i>;
    }
  };

  // Get document icon based on filename extension
  const getDocumentIcon = (filename: string) => {
    if (!filename) return <i className="fas fa-file text-gray-500 text-lg"></i>;
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <i className="fas fa-file-pdf text-red-500 text-lg"></i>;
      case 'doc':
      case 'docx':
        return <i className="fas fa-file-word text-blue-500 text-lg"></i>;
      case 'xls':
      case 'xlsx':
        return <i className="fas fa-file-excel text-green-500 text-lg"></i>;
      case 'ppt':
      case 'pptx':
        return <i className="fas fa-file-powerpoint text-orange-500 text-lg"></i>;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <i className="fas fa-file-image text-purple-500 text-lg"></i>;
      default:
        return <i className="fas fa-file text-gray-500 text-lg"></i>;
    }
  };

  // Helper function to check if file is an image
  const isImageFile = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '');
  };

  // Helper function to get file size display
  const getFileTypeDisplay = (filename: string, fileType: string) => {
    const extension = filename.split('.').pop()?.toUpperCase();
    return extension ? `${extension} • ${fileType}` : fileType;
  };

  // Render all documents (without category filter)
  const renderAllDocuments = () => {
    if (documents.length === 0) {
      return (
        <div className="text-center py-8">
          <i className="fas fa-file text-3xl text-muted-foreground/50 mb-3"></i>
          <h3 className="font-medium text-lg mb-2">Nenhum documento disponível</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adicione documentos para organizar melhor seu evento
          </p>
          <Button variant="default" onClick={() => setUploadDialogOpen(true)}>
            <i className="fas fa-upload mr-2"></i> Fazer Upload
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc: Document) => (
          <Card key={doc.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  {getDocumentIcon(doc.name)}
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className={getCategoryBadgeColor(doc.category)}>
                        {doc.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {doc.fileType}
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
                      <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200">
                        <i className="fas fa-trash-alt"></i>
                        <span className="ml-1 md:hidden lg:inline">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir documento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o documento "{doc.name}"? 
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
  
  // Render search and filter controls
  const renderSearchAndFilters = () => (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Campo de pesquisa */}
        <div className="flex-1">
          <Label htmlFor="search">Pesquisar documentos</Label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder="Digite o nome do documento ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
        
        {/* Campo de filtro por categoria */}
        <div className="w-full md:w-64">
          <Label htmlFor="category-filter">Filtrar por categoria</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as categorias ({documents.length})</SelectItem>
              <SelectItem value="contratos">Contratos ({documentsByCategory.contratos.length})</SelectItem>
              <SelectItem value="orcamentos">Orçamentos ({documentsByCategory.orcamentos.length})</SelectItem>
              <SelectItem value="imagens">Imagens ({documentsByCategory.imagens.length})</SelectItem>
              <SelectItem value="videos">Vídeos ({documentsByCategory.videos.length})</SelectItem>
              <SelectItem value="apresentacoes">Apresentações ({documentsByCategory.apresentacoes.length})</SelectItem>
              <SelectItem value="licencas">Licenças ({documentsByCategory.licencas.length})</SelectItem>
              <SelectItem value="roteiros">Roteiros ({documentsByCategory.roteiros.length})</SelectItem>
              <SelectItem value="checklists">Checklists ({documentsByCategory.checklists.length})</SelectItem>
              <SelectItem value="outros">Outros ({documentsByCategory.outros.length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Botão de adicionar documento */}
        <div className="flex items-end">
          <Button onClick={() => setUploadDialogOpen(true)} className="w-full md:w-auto">
            <i className="fas fa-plus mr-2"></i>
            Adicionar Documento
          </Button>
        </div>
      </div>
      
      {/* Indicador de resultados */}
      <div className="text-sm text-muted-foreground">
        {searchTerm || filterCategory !== 'todos' ? (
          <span>
            Mostrando {filteredDocuments.length} de {documents.length} documentos
            {searchTerm && ` para "${searchTerm}"`}
            {filterCategory !== 'todos' && ` na categoria ${filterCategory}`}
          </span>
        ) : (
          <span>Mostrando todos os {documents.length} documentos</span>
        )}
      </div>
    </div>
  );
  
  // Render mobile view with accordion
  const renderMobileView = () => (
    <Accordion type="single" collapsible className="w-full" defaultValue="todos">
      <AccordionItem value="todos">
        <AccordionTrigger>
          Todos os Documentos ({documents.length})
        </AccordionTrigger>
        <AccordionContent>
          {renderAllDocuments()}
        </AccordionContent>
      </AccordionItem>
      
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
      
      <AccordionItem value="imagens">
        <AccordionTrigger>
          Imagens ({documentCounts.imagens})
        </AccordionTrigger>
        <AccordionContent>
          {renderDocumentList('imagens')}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="videos">
        <AccordionTrigger>
          Vídeos ({documentCounts.videos})
        </AccordionTrigger>
        <AccordionContent>
          {renderDocumentList('videos')}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="apresentacoes">
        <AccordionTrigger>
          Apresentações ({documentCounts.apresentacoes})
        </AccordionTrigger>
        <AccordionContent>
          {renderDocumentList('apresentacoes')}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="licencas">
        <AccordionTrigger>
          Licenças ({documentCounts.licencas})
        </AccordionTrigger>
        <AccordionContent>
          {renderDocumentList('licencas')}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="roteiros">
        <AccordionTrigger>
          Roteiros ({documentCounts.roteiros})
        </AccordionTrigger>
        <AccordionContent>
          {renderDocumentList('roteiros')}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="checklists">
        <AccordionTrigger>
          Checklists ({documentCounts.checklists})
        </AccordionTrigger>
        <AccordionContent>
          {renderDocumentList('checklists')}
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
                      <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200">
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
        
        <form onSubmit={handleUpload} className="space-y-4 mt-4 p-4 rounded-lg" style={{ backgroundColor: '#1A0A29' }}>
          <div className="w-full">
            <Label htmlFor="file" className="text-sm font-medium">Arquivo</Label>
            <div className="mt-2">
              <label 
                htmlFor="file" 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-gray-300 transition-all duration-200"
                style={{ backgroundColor: '#1A0A29' }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <i className="fas fa-file-check text-3xl text-green-500 mb-2"></i>
                      <p className="text-sm text-gray-600 font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, XLS, PNG, JPG (máx. 10MB)
                      </p>
                    </>
                  )}
                </div>
                <input 
                  id="file" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                  required
                />
              </label>
              {file && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setFile(null)}
                >
                  <i className="fas fa-times mr-2"></i>
                  Remover arquivo
                </Button>
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
  
  // Render filtered documents list
  const renderFilteredDocuments = () => {
    if (filteredDocuments.length === 0) {
      if (searchTerm || filterCategory !== 'todos') {
        return (
          <div className="text-center py-8">
            <i className="fas fa-search text-3xl text-muted-foreground/50 mb-3"></i>
            <h3 className="font-medium text-lg mb-2">Nenhum documento encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tente ajustar os filtros de pesquisa ou categoria
            </p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterCategory('todos'); }}>
              <i className="fas fa-times mr-2"></i> Limpar Filtros
            </Button>
          </div>
        );
      } else {
        return renderEmptyState();
      }
    }
    
    return (
      <div className="grid grid-cols-1 gap-4">
        {filteredDocuments.map((doc: Document) => (
          <Card key={doc.id} className="group hover:shadow-lg transition-all duration-300 border border-gray-800/20 bg-[#1A0A29]/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-6">
                {/* Document Preview/Icon Section */}
                <div className="flex-shrink-0">
                  {isImageFile(doc.name) ? (
                    <div className="relative">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#1A0A29] border border-purple-500/30 shadow-lg">
                        <img 
                          src={doc.fileUrl} 
                          alt={doc.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden absolute inset-0 flex items-center justify-center bg-[#1A0A29]">
                          {getCategoryIcon(doc.category)}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#1A0A29] rounded-full p-1.5 shadow-lg border border-purple-500/50">
                        {getDocumentIcon(doc.name)}
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#1A0A29] border border-purple-500/30 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      {getCategoryIcon(doc.category)}
                    </div>
                  )}
                </div>

                {/* Document Info Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-lg text-white truncate">{doc.name}</h4>
                        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {doc.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                          {getDocumentIcon(doc.name)}
                          <span>{getFileTypeDisplay(doc.name, doc.fileType || 'Arquivo')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fas fa-calendar text-purple-400"></i>
                          <span>{formatDate(doc.uploadedAt)}</span>
                        </div>
                      </div>
                      
                      {doc.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{doc.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-xs bg-purple-500/20 text-purple-300">U</AvatarFallback>
                        </Avatar>
                        <span>Enviado por você</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    className="h-8 w-8 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 text-gray-400 transition-colors"
                    title="Visualizar documento"
                  >
                    <i className="fas fa-eye"></i>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    className="h-8 w-8 rounded-lg hover:bg-blue-500/20 hover:text-blue-300 text-gray-400 transition-colors"
                    title="Baixar documento"
                  >
                    <i className="fas fa-download"></i>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setupEditForm(doc)}
                    className="h-8 w-8 rounded-lg hover:bg-green-500/20 hover:text-green-300 text-gray-400 transition-colors"
                    title="Editar documento"
                  >
                    <i className="fas fa-pencil-alt"></i>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg hover:bg-red-500/20 hover:text-red-300 text-gray-400 transition-colors"
                        title="Excluir documento"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir documento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o documento "{doc.name}"? 
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

  return (
    <div className="document-list">
      {/* Integrated Document List with Controls */}
      <Card>
        <CardContent className="p-6">
          {renderSearchAndFilters()}
          <div className="border-t pt-6">
            {renderFilteredDocuments()}
          </div>
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      {renderUploadDialog()}
      {renderEditDialog()}
    </div>
  );
};

export default DocumentList;