import { useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useMenuItems, MenuItem, MenuItemInput } from '@/hooks/useMenuItems';
import { api } from '@/integrations/mongodb';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, RefreshCw, Leaf, Upload, X, Image, WheatOff, Nut, Milk, AlertTriangle, Flame } from 'lucide-react';

const CATEGORIES = ['Burgers', 'Pizza', 'Salads', 'Seafood', 'Appetizers', 'Desserts', 'Beverages', 'Drinks'];

const emptyForm: MenuItemInput = {
  name: '',
  description: '',
  price: 0,
  category: '',
  imageUrl: '',
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  containsNuts: false,
  containsDairy: false,
  allergenInfo: null,
  spiceLevel: 0,
  isAvailable: true,
};

const SPICE_LEVELS = [
  { value: 0, label: 'Not Spicy', color: 'text-muted-foreground' },
  { value: 1, label: 'Mild', color: 'text-yellow-500' },
  { value: 2, label: 'Medium', color: 'text-orange-500' },
  { value: 3, label: 'Hot', color: 'text-red-500' },
];

export default function AdminMenu() {
  const { items, loading, addItem, updateItem, deleteItem, toggleAvailability, refetch } = useMenuItems(true);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemInput>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter items based on category
  const filteredItems = filterCategory === 'all'
    ? items
    : items.filter(item => item.category === filterCategory);

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl || item.image_url || '',
        isVegetarian: item.isVegetarian ?? item.is_vegetarian ?? false,
        isVegan: item.isVegan ?? item.is_vegan ?? false,
        isGlutenFree: item.isGlutenFree ?? item.is_gluten_free ?? false,
        containsNuts: item.containsNuts ?? item.contains_nuts ?? false,
        containsDairy: item.containsDairy ?? item.contains_dairy ?? false,
        allergenInfo: item.allergenInfo ?? item.allergen_info ?? null,
        spiceLevel: item.spiceLevel ?? item.spice_level ?? 0,
        isAvailable: item.isAvailable ?? item.is_available ?? true,
      });
      setImagePreview(item.imageUrl || item.image_url || null);
    } else {
      setEditingItem(null);
      setFormData(emptyForm);
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData(emptyForm);
    setImagePreview(null);
  };

  const handleRemoveImage = () => {
    handleInputChange('imageUrl', '');
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || formData.price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Name, Category, Price)',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    if (editingItem) {
      await updateItem(editingItem.id, formData);
    } else {
      await addItem(formData);
    }

    setIsSaving(false);
    handleCloseDialog();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image size should be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      handleInputChange('imageUrl', url);
      setImagePreview(url);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    await deleteItem(deletingItem.id);
    setDeletingItem(null);
    setIsDeleteDialogOpen(false);
  };

  const handleInputChange = (field: keyof MenuItemInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Menu Management</h1>
            <p className="text-muted-foreground mt-1">Add, edit, and manage menu items</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items ({filteredItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No menu items found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map(item => (
                      <TableRow key={item.id} className={!item.isAvailable && !item.is_available ? 'opacity-50' : ''}>
                        <TableCell>
                          {item.imageUrl || item.image_url ? (
                            <img
                              src={item.imageUrl || item.image_url || ''}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                              No img
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex items-center gap-1">
                              {(item.isVegetarian || item.is_vegetarian) && (
                                <span title="Vegetarian">
                                  <Leaf className="h-4 w-4 text-green-600" />
                                </span>
                              )}
                              {(item.isVegan || item.is_vegan) && (
                                <span title="Vegan">
                                  <Leaf className="h-4 w-4 text-green-500" />
                                </span>
                              )}
                              {(item.isGlutenFree || item.is_gluten_free) && (
                                <span title="Gluten-Free">
                                  <WheatOff className="h-4 w-4 text-amber-600" />
                                </span>
                              )}
                              {(item.containsNuts || item.contains_nuts) && (
                                <span title="Contains Nuts">
                                  <Nut className="h-4 w-4 text-orange-600" />
                                </span>
                              )}
                              {(item.containsDairy || item.contains_dairy) && (
                                <span title="Contains Dairy">
                                  <Milk className="h-4 w-4 text-blue-600" />
                                </span>
                              )}
                              {(item.allergenInfo || item.allergen_info) && (
                                <span title={item.allergenInfo || item.allergen_info || ''}>
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="font-medium">₹{Number(item.price).toLocaleString()}</TableCell>
                        <TableCell>
                          <Switch
                            checked={item.isAvailable ?? item.is_available ?? true}
                            onCheckedChange={(checked) => toggleAvailability(item.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingItem(item);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Item name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Item description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Spice Level
                </Label>
                <div className="flex gap-2">
                  {SPICE_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => handleInputChange('spiceLevel', level.value)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${formData.spiceLevel === level.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex gap-0.5">
                          {level.value === 0 ? (
                            <span className="text-muted-foreground text-xs">—</span>
                          ) : (
                            Array.from({ length: level.value }).map((_, i) => (
                              <Flame key={i} className={`h-3.5 w-3.5 ${level.color}`} fill="currentColor" />
                            ))
                          )}
                        </div>
                        <span className="text-xs">{level.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {imagePreview ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="w-full h-40 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors"
                    >
                      <Image className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Image Preview</span>
                    </div>
                  )}

                  {/* Upload Button & URL Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste image URL or upload"
                      value={formData.imageUrl || ''}
                      onChange={(e) => {
                        handleInputChange('imageUrl', e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      className="flex-1"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload Image"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Dietary Options</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isVegetarian"
                      checked={formData.isVegetarian}
                      onCheckedChange={(checked) => handleInputChange('isVegetarian', checked)}
                    />
                    <Label htmlFor="isVegetarian" className="text-sm flex items-center gap-1.5">
                      <Leaf className="h-4 w-4 text-green-600" />
                      Vegetarian
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="isVegan"
                      checked={formData.isVegan}
                      onCheckedChange={(checked) => handleInputChange('isVegan', checked)}
                    />
                    <Label htmlFor="isVegan" className="text-sm flex items-center gap-1.5">
                      <Leaf className="h-4 w-4 text-green-500" />
                      Vegan
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="isGlutenFree"
                      checked={formData.isGlutenFree}
                      onCheckedChange={(checked) => handleInputChange('isGlutenFree', checked)}
                    />
                    <Label htmlFor="isGlutenFree" className="text-sm flex items-center gap-1.5">
                      <WheatOff className="h-4 w-4 text-amber-600" />
                      Gluten-Free
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="isAvailable"
                      checked={formData.isAvailable}
                      onCheckedChange={(checked) => handleInputChange('isAvailable', checked)}
                    />
                    <Label htmlFor="isAvailable" className="text-sm">Available</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-orange-600 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Allergen Warnings
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="containsNuts"
                      checked={formData.containsNuts}
                      onCheckedChange={(checked) => handleInputChange('containsNuts', checked)}
                    />
                    <Label htmlFor="containsNuts" className="text-sm flex items-center gap-1.5">
                      <Nut className="h-4 w-4 text-orange-600" />
                      Contains Nuts
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="containsDairy"
                      checked={formData.containsDairy}
                      onCheckedChange={(checked) => handleInputChange('containsDairy', checked)}
                    />
                    <Label htmlFor="containsDairy" className="text-sm flex items-center gap-1.5">
                      <Milk className="h-4 w-4 text-blue-600" />
                      Contains Dairy
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergenInfo" className="text-sm">Additional Allergen Info</Label>
                  <Input
                    id="allergenInfo"
                    value={formData.allergenInfo || ''}
                    onChange={(e) => handleInputChange('allergenInfo', e.target.value || null)}
                    placeholder="e.g., Contains shellfish, soy, sesame"
                    maxLength={200}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
