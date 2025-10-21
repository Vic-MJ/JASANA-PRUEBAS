import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CatalogItem = {
  id: number;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
};

type CatalogType = 'areas' | 'damage-causers' | 'accident-types';

export function CatalogsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CatalogType>('areas');
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
    displayOrder: 0,
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['catalog', activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/catalogs/${activeTab}`);
      if (!res.ok) throw new Error('Error al cargar catálogo');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/catalogs/${activeTab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear elemento');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog', activeTab] });
      toast({ title: 'Elemento creado correctamente' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error al crear elemento', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/catalogs/${activeTab}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar elemento');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog', activeTab] });
      toast({ title: 'Elemento actualizado correctamente' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error al actualizar elemento', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/catalogs/${activeTab}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar elemento');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog', activeTab] });
      toast({ title: 'Elemento eliminado correctamente' });
    },
    onError: () => {
      toast({ title: 'Error al eliminar elemento', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
      displayOrder: 0,
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code || '',
      description: item.description || '',
      isActive: item.isActive,
      displayOrder: item.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este elemento?')) {
      deleteMutation.mutate(id);
    }
  };

  const getCatalogTitle = (type: CatalogType) => {
    switch (type) {
      case 'areas': return 'Áreas';
      case 'damage-causers': return 'Causantes de Daño';
      case 'accident-types': return 'Tipos de Accidente';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Catálogos</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CatalogType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="areas">Áreas</TabsTrigger>
            <TabsTrigger value="damage-causers">Causantes de Daño</TabsTrigger>
            <TabsTrigger value="accident-types">Tipos de Accidente</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{getCatalogTitle(activeTab)}</h3>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Nuevo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Editar' : 'Agregar'} {getCatalogTitle(activeTab)}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'areas' && (
                      <div>
                        <Label htmlFor="code">Código</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          required
                          disabled={!!editingItem}
                          placeholder="ej: corte"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Nombre del elemento"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descripción opcional"
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayOrder">Orden de visualización</Label>
                      <Input
                        id="displayOrder"
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Activo</Label>
                    </div>
                    <Button type="submit" className="w-full">
                      {editingItem ? 'Actualizar' : 'Crear'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <p>Cargando...</p>
            ) : (
              <div className="space-y-2">
                {items.map((item: CatalogItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        {item.code && (
                          <span className="text-sm text-gray-500">({item.code})</span>
                        )}
                        {!item.isActive && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Inactivo
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
