// pages/admin/PromoCodeManagement.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import promoCodeService, { PromoCode, CreatePromoCodeData } from '@/services/admin/promoCodeService';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Gift,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

export default function PromoCodeManagement() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
  const [usageData, setUsageData] = useState<any>(null);
  
  const [newPromoCode, setNewPromoCode] = useState<CreatePromoCodeData>({
    code: '',
    bonus_amount: 0,
    usage_limit: 1000,
    expiry_date: '',
    is_active: true
  });
  
  const [editedPromoCode, setEditedPromoCode] = useState<CreatePromoCodeData>({
    code: '',
    bonus_amount: 0,
    usage_limit: 1000,
    expiry_date: '',
    is_active: true
  });

  // Set default expiry date to 30 days from now
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return format(date, 'yyyy-MM-dd\'T\'HH:mm');
  };

  useEffect(() => {
    setNewPromoCode(prev => ({
      ...prev,
      expiry_date: getDefaultExpiryDate()
    }));
  }, []);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setIsLoading(true);
      const data = await promoCodeService.getPromoCodes();
      
      // Ensure data is an array - this is the key fix
      if (Array.isArray(data)) {
        setPromoCodes(data);
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        // Handle case where API returns { data: [...] }
        setPromoCodes(data.data);
      } else if (data && typeof data === 'object' && Array.isArray(data.promoCodes)) {
        // Handle case where API returns { promoCodes: [...] }
        setPromoCodes(data.promoCodes);
      } else {
        console.warn('API response is not an array:', data);
        setPromoCodes([]);
        toast.warning('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Error fetching promo codes:', err);
      setPromoCodes([]); // Ensure promoCodes is always an array
      toast.error(err.message || 'Failed to fetch promo codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePromoCode = async () => {
    try {
      if (!newPromoCode.code || !newPromoCode.bonus_amount || !newPromoCode.expiry_date) {
        toast.error('Code, bonus amount, and expiry date are required');
        return;
      }
      
      await promoCodeService.createPromoCode(newPromoCode);
      
      toast.success('Promo code created successfully');
      setIsCreateDialogOpen(false);
      setNewPromoCode({
        code: '',
        bonus_amount: 0,
        usage_limit: 1000,
        expiry_date: getDefaultExpiryDate(),
        is_active: true
      });
      fetchPromoCodes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create promo code');
      console.error(err);
    }
  };

  const handleUpdatePromoCode = async () => {
    try {
      if (!selectedPromoCode) return;
      
      await promoCodeService.updatePromoCode(selectedPromoCode.id, editedPromoCode);
      
      toast.success('Promo code updated successfully');
      setIsEditDialogOpen(false);
      setSelectedPromoCode(null);
      fetchPromoCodes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update promo code');
      console.error(err);
    }
  };

  const handleDeletePromoCode = async (promoCode: PromoCode) => {
    if (!confirm(`Are you sure you want to delete promo code "${promoCode.code}"? This action cannot be undone.`)) return;
    
    try {
      await promoCodeService.deletePromoCode(promoCode.id);
      toast.success(`Promo code "${promoCode.code}" deleted successfully`);
      fetchPromoCodes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete promo code');
      console.error(err);
    }
  };

  const openEditDialog = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode);
    setEditedPromoCode({
      code: promoCode.code,
      bonus_amount: parseFloat(promoCode.bonus_amount),
      usage_limit: promoCode.usage_limit,
      expiry_date: format(new Date(promoCode.expiry_date), 'yyyy-MM-dd\'T\'HH:mm'),
      is_active: promoCode.is_active
    });
    setIsEditDialogOpen(true);
  };

  const viewUsage = async (promoCode: PromoCode) => {
    try {
      setIsLoading(true);
      const data = await promoCodeService.getPromoCodeUsage(promoCode.id);
      setUsageData(data);
      setSelectedPromoCode(promoCode);
      setIsUsageDialogOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch usage data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (promoCode: PromoCode) => {
    if (promoCode.is_expired) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Expired</Badge>;
    }
    if (!promoCode.is_active) {
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Inactive</Badge>;
    }
    if (promoCode.used_count >= promoCode.usage_limit) {
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Limit Reached</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
  };

  // Safe calculations with fallbacks
  const safePromoCodes = Array.isArray(promoCodes) ? promoCodes : [];
  
  const totalCodes = safePromoCodes.length;
  const activeCodes = safePromoCodes.filter(code => 
    code.is_active && !code.is_expired && code.used_count < code.usage_limit
  ).length;
  const totalUsage = safePromoCodes.reduce((sum, code) => sum + (code.used_count || 0), 0);
  const expiredCodes = safePromoCodes.filter(code => code.is_expired).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          Promo Code Management
        </h1>
        <div className="flex gap-2">
          <Button 
            onClick={fetchPromoCodes} 
            variant="outline" 
            size="icon" 
            className="rounded-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Promo Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Promo Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Promo Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., GADIT247"
                    value={newPromoCode.code}
                    onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bonus_amount">Bonus Amount *</Label>
                  <Input
                    id="bonus_amount"
                    type="number"
                    placeholder="200"
                    value={newPromoCode.bonus_amount || ''}
                    onChange={(e) => setNewPromoCode({ ...newPromoCode, bonus_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="usage_limit">Usage Limit *</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    placeholder="1000"
                    value={newPromoCode.usage_limit}
                    onChange={(e) => setNewPromoCode({ ...newPromoCode, usage_limit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiry_date">Expiry Date *</Label>
                  <Input
                    id="expiry_date"
                    type="datetime-local"
                    value={newPromoCode.expiry_date}
                    onChange={(e) => setNewPromoCode({ ...newPromoCode, expiry_date: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={newPromoCode.is_active}
                    onCheckedChange={(checked) => setNewPromoCode({ ...newPromoCode, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                
                <Button onClick={handleCreatePromoCode} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
                  Create Promo Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Codes</p>
                <p className="text-2xl font-bold">{totalCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Codes</p>
                <p className="text-2xl font-bold">{activeCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usage</p>
                <p className="text-2xl font-bold">{totalUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expired</p>
                <p className="text-2xl font-bold">{expiredCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader>
            <CardTitle>Promo Codes ({totalCodes})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : totalCodes === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No promo codes found</p>
                <p className="text-sm">Create your first promo code to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Bonus Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Expiry Date</TableHead>
                      <TableHead className="hidden xl:table-cell">Created By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safePromoCodes.map((promoCode) => (
                      <TableRow key={promoCode.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="font-mono font-bold text-purple-600">
                          {promoCode.code}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {promoCode.bonus_amount} credits
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col min-w-[120px]">
                            <span className="text-sm font-medium">
                              {promoCode.used_count} / {promoCode.usage_limit}
                            </span>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                              <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${promoCode.usage_percentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {promoCode.usage_percentage || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(promoCode)}
                        </TableCell>
                        <TableCell className="text-sm hidden lg:table-cell">
                          {format(new Date(promoCode.expiry_date), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="text-sm hidden xl:table-cell">
                          {promoCode.created_by_username || 'Admin'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => viewUsage(promoCode)}
                              className="h-8 w-8 p-0"
                              title="View Usage"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(promoCode)}
                              className="h-8 w-8 p-0"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeletePromoCode(promoCode)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
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
      </motion.div>

      {/* Edit Promo Code Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-code">Promo Code *</Label>
              <Input
                id="edit-code"
                value={editedPromoCode.code}
                onChange={(e) => setEditedPromoCode({ ...editedPromoCode, code: e.target.value.toUpperCase() })}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">Code cannot be changed after creation</p>
            </div>
            
            <div>
              <Label htmlFor="edit-bonus_amount">Bonus Amount *</Label>
              <Input
                id="edit-bonus_amount"
                type="number"
                value={editedPromoCode.bonus_amount || ''}
                onChange={(e) => setEditedPromoCode({ ...editedPromoCode, bonus_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-usage_limit">Usage Limit *</Label>
              <Input
                id="edit-usage_limit"
                type="number"
                value={editedPromoCode.usage_limit}
                onChange={(e) => setEditedPromoCode({ ...editedPromoCode, usage_limit: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-expiry_date">Expiry Date *</Label>
              <Input
                id="edit-expiry_date"
                type="datetime-local"
                value={editedPromoCode.expiry_date}
                onChange={(e) => setEditedPromoCode({ ...editedPromoCode, expiry_date: e.target.value })}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={editedPromoCode.is_active}
                onCheckedChange={(checked) => setEditedPromoCode({ ...editedPromoCode, is_active: checked })}
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>
            
            <Button onClick={handleUpdatePromoCode} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
              Update Promo Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Usage Details Dialog */}
      <Dialog open={isUsageDialogOpen} onOpenChange={setIsUsageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Promo Code Usage: {selectedPromoCode?.code}
            </DialogTitle>
          </DialogHeader>
          {usageData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Uses</p>
                  <p className="text-2xl font-bold text-purple-600">{usageData.total_usages || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(selectedPromoCode?.usage_limit || 0) - (usageData.total_usages || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usage Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedPromoCode?.usage_percentage || 0}%
                  </p>
                </div>
              </div>
              
              {usageData.usages && usageData.usages.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Bonus Received</TableHead>
                        <TableHead>Used At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usageData.usages.map((usage: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{usage.username || 'N/A'}</TableCell>
                          <TableCell>{usage.email || 'N/A'}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {usage.bonus_received || 0} credits
                          </TableCell>
                          <TableCell className="text-sm">
                            {usage.used_at ? format(new Date(usage.used_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No usage recorded yet</p>
                  <p className="text-sm">This promo code hasn't been used by anyone yet.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}