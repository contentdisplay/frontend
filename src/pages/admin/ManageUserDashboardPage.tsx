// pages/admin/ManageUserDashboardPage.tsx
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Gift,
  Megaphone,
  Award,
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  Link as LinkIcon,
  Image as ImageIcon,
  Hash,
  Check,
  AlertCircle,
  BriefcaseBusiness,
  User,
  FileText,
  Tag,
  BarChart
} from 'lucide-react';

import adminDashboardService from '@/services/admin/manageuserdashboardService';
import { Offer, Promotion, TopRewardEarner, TopTransaction } from '@/services/dashboardService';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const ManageUserDashboardPage = () => {
  // State for offers
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentOffer, setCurrentOffer] = useState<Partial<Offer> | null>(null);
  const [isEditingOffer, setIsEditingOffer] = useState(false);
  const [showDeleteOfferDialog, setShowDeleteOfferDialog] = useState(false);

  // State for promotions
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [currentPromotion, setCurrentPromotion] = useState<Partial<Promotion> | null>(null);
  const [isEditingPromotion, setIsEditingPromotion] = useState(false);
  const [showDeletePromotionDialog, setShowDeletePromotionDialog] = useState(false);

  // State for top reward earners
  const [topRewardEarners, setTopRewardEarners] = useState<TopRewardEarner[]>([]);
  const [currentTopRewardEarner, setCurrentTopRewardEarner] = useState<Partial<TopRewardEarner> | null>(null);
  const [isEditingTopRewardEarner, setIsEditingTopRewardEarner] = useState(false);
  const [showDeleteTopRewardEarnerDialog, setShowDeleteTopRewardEarnerDialog] = useState(false);

  // State for top transactions
  const [topTransactions, setTopTransactions] = useState<TopTransaction[]>([]);
  const [currentTopTransaction, setCurrentTopTransaction] = useState<Partial<TopTransaction> | null>(null);
  const [isEditingTopTransaction, setIsEditingTopTransaction] = useState(false);
  const [showDeleteTopTransactionDialog, setShowDeleteTopTransactionDialog] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [offersData, promotionsData, topRewardEarnersData, topTransactionsData] = await Promise.all([
        adminDashboardService.getOffers(),
        adminDashboardService.getPromotions(),
        adminDashboardService.getTopRewardEarners(),
        adminDashboardService.getTopTransactions()
      ]);
  
      // Add proper type checking and transformation
      setOffers(Array.isArray(offersData) ? offersData : []);
      setPromotions(Array.isArray(promotionsData) ? promotionsData : []);
      setTopRewardEarners(Array.isArray(topRewardEarnersData) ? topRewardEarnersData : []);
      setTopTransactions(Array.isArray(topTransactionsData) ? topTransactionsData : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    }
  };

  // =========== OFFERS HANDLERS ===========
  const handleCreateOffer = async () => {
    if (!currentOffer) return;
    
    try {
      const result = await adminDashboardService.createOffer(currentOffer as Omit<Offer, 'id'>);
      if (result) {
        setOffers([...offers, result]);
        setCurrentOffer(null);
        toast({
          title: "Success",
          description: "Offer created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create offer",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOffer = async () => {
    if (!currentOffer || !currentOffer.id) return;
    
    try {
      const result = await adminDashboardService.updateOffer(
        currentOffer.id, 
        currentOffer
      );
      if (result) {
        setOffers(offers.map(offer => 
          offer.id === result.id ? result : offer
        ));
        setCurrentOffer(null);
        setIsEditingOffer(false);
        toast({
          title: "Success",
          description: "Offer updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update offer",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOffer = async () => {
    if (!currentOffer || !currentOffer.id) return;
    
    try {
      const success = await adminDashboardService.deleteOffer(currentOffer.id);
      if (success) {
        setOffers(offers.filter(offer => offer.id !== currentOffer.id));
        setCurrentOffer(null);
        setShowDeleteOfferDialog(false);
        toast({
          title: "Success",
          description: "Offer deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive",
      });
    }
  };

  // =========== PROMOTIONS HANDLERS ===========
  const handleCreatePromotion = async () => {
    if (!currentPromotion) return;
    
    try {
      const result = await adminDashboardService.createPromotion(currentPromotion as Omit<Promotion, 'id'>);
      if (result) {
        setPromotions([...promotions, result]);
        setCurrentPromotion(null);
        toast({
          title: "Success",
          description: "Promotion created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create promotion",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePromotion = async () => {
    if (!currentPromotion || !currentPromotion.id) return;
    
    try {
      const result = await adminDashboardService.updatePromotion(
        currentPromotion.id, 
        currentPromotion
      );
      if (result) {
        setPromotions(promotions.map(promotion => 
          promotion.id === result.id ? result : promotion
        ));
        setCurrentPromotion(null);
        setIsEditingPromotion(false);
        toast({
          title: "Success",
          description: "Promotion updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update promotion",
        variant: "destructive",
      });
    }
  };

  const handleDeletePromotion = async () => {
    if (!currentPromotion || !currentPromotion.id) return;
    
    try {
      const success = await adminDashboardService.deletePromotion(currentPromotion.id);
      if (success) {
        setPromotions(promotions.filter(promotion => promotion.id !== currentPromotion.id));
        setCurrentPromotion(null);
        setShowDeletePromotionDialog(false);
        toast({
          title: "Success",
          description: "Promotion deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete promotion",
        variant: "destructive",
      });
    }
  };

  // =========== TOP REWARD EARNERS HANDLERS ===========
  const handleCreateTopRewardEarner = async () => {
    if (!currentTopRewardEarner) return;
    
    try {
      const result = await adminDashboardService.createTopRewardEarner(currentTopRewardEarner as Omit<TopRewardEarner, 'id'>);
      if (result) {
        setTopRewardEarners([...topRewardEarners, result]);
        setCurrentTopRewardEarner(null);
        toast({
          title: "Success",
          description: "Top reward earner created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create top reward earner",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTopRewardEarner = async () => {
    if (!currentTopRewardEarner || !currentTopRewardEarner.id) return;
    
    try {
      const result = await adminDashboardService.updateTopRewardEarner(
        currentTopRewardEarner.id, 
        currentTopRewardEarner
      );
      if (result) {
        setTopRewardEarners(topRewardEarners.map(earner => 
          earner.id === result.id ? result : earner
        ));
        setCurrentTopRewardEarner(null);
        setIsEditingTopRewardEarner(false);
        toast({
          title: "Success",
          description: "Top reward earner updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update top reward earner",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTopRewardEarner = async () => {
    if (!currentTopRewardEarner || !currentTopRewardEarner.id) return;
    
    try {
      const success = await adminDashboardService.deleteTopRewardEarner(currentTopRewardEarner.id);
      if (success) {
        setTopRewardEarners(topRewardEarners.filter(earner => earner.id !== currentTopRewardEarner.id));
        setCurrentTopRewardEarner(null);
        setShowDeleteTopRewardEarnerDialog(false);
        toast({
          title: "Success",
          description: "Top reward earner deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete top reward earner",
        variant: "destructive",
      });
    }
  };

  // =========== TOP TRANSACTIONS HANDLERS ===========
  const handleCreateTopTransaction = async () => {
    if (!currentTopTransaction) return;
    
    try {
      const result = await adminDashboardService.createTopTransaction(currentTopTransaction as Omit<TopTransaction, 'id'>);
      if (result) {
        setTopTransactions([...topTransactions, result]);
        setCurrentTopTransaction(null);
        toast({
          title: "Success",
          description: "Top transaction created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create top transaction",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTopTransaction = async () => {
    if (!currentTopTransaction || !currentTopTransaction.id) return;
    
    try {
      const result = await adminDashboardService.updateTopTransaction(
        currentTopTransaction.id, 
        currentTopTransaction
      );
      if (result) {
        setTopTransactions(topTransactions.map(transaction => 
          transaction.id === result.id ? result : transaction
        ));
        setCurrentTopTransaction(null);
        setIsEditingTopTransaction(false);
        toast({
          title: "Success",
          description: "Top transaction updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update top transaction",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTopTransaction = async () => {
    if (!currentTopTransaction || !currentTopTransaction.id) return;
    
    try {
      const success = await adminDashboardService.deleteTopTransaction(currentTopTransaction.id);
      if (success) {
        setTopTransactions(topTransactions.filter(transaction => transaction.id !== currentTopTransaction.id));
        setCurrentTopTransaction(null);
        setShowDeleteTopTransactionDialog(false);
        toast({
          title: "Success",
          description: "Top transaction deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete top transaction",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Manage User Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage offers, promotions, top reward earners, and top transactions displayed on the user dashboard.</p>
        
        <Tabs defaultValue="offers" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="offers" className="flex items-center gap-2">
              <Gift size={18} />
              <span className="hidden sm:inline">Offers</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <Megaphone size={18} />
              <span className="hidden sm:inline">Promotions</span>
            </TabsTrigger>
            <TabsTrigger value="top-earners" className="flex items-center gap-2">
              <Award size={18} />
              <span className="hidden sm:inline">Top Earners</span>
            </TabsTrigger>
            <TabsTrigger value="top-transactions" className="flex items-center gap-2">
              <CreditCard size={18} />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
          </TabsList>
          
          {/* OFFERS TAB */}
          <TabsContent value="offers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Manage Offers
                  </CardTitle>
                  <CardDescription>
                    Create and manage special offers that users can redeem for rewards.
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        setCurrentOffer({
                          title: '',
                          description: '',
                          image: '',
                          reward_amount: 0,
                          redemption_link: '',
                          redemption_code: '',
                          expires_at: new Date().toISOString(),
                          is_active: true
                        });
                        setIsEditingOffer(false);
                      }}
                    >
                      <Plus size={16} />
                      Add Offer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{isEditingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
                      <DialogDescription>
                        {isEditingOffer 
                          ? 'Update the details of an existing offer.' 
                          : 'Fill in the details to create a new special offer.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input
                          id="title"
                          className="col-span-3"
                          value={currentOffer?.title || ''}
                          onChange={(e) => setCurrentOffer({...currentOffer, title: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea
                          id="description"
                          className="col-span-3"
                          value={currentOffer?.description || ''}
                          onChange={(e) => setCurrentOffer({...currentOffer, description: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">Image URL</Label>
                        <Input
                          id="image"
                          className="col-span-3"
                          value={currentOffer?.image || ''}
                          onChange={(e) => setCurrentOffer({...currentOffer, image: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reward_amount" className="text-right">Reward Amount</Label>
                        <Input
                          id="reward_amount"
                          type="number"
                          className="col-span-3"
                          value={currentOffer?.reward_amount || 0}
                          onChange={(e) => setCurrentOffer({...currentOffer, reward_amount: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="redemption_link" className="text-right">Redemption Link</Label>
                        <Input
                          id="redemption_link"
                          className="col-span-3"
                          value={currentOffer?.redemption_link || ''}
                          onChange={(e) => setCurrentOffer({...currentOffer, redemption_link: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="redemption_code" className="text-right">Redemption Code</Label>
                        <Input
                          id="redemption_code"
                          className="col-span-3"
                          value={currentOffer?.redemption_code || ''}
                          onChange={(e) => setCurrentOffer({...currentOffer, redemption_code: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expires_at" className="text-right">Expiry Date</Label>
                        <Input
                          id="expires_at"
                          type="datetime-local"
                          className="col-span-3"
                          value={currentOffer?.expires_at ? new Date(currentOffer.expires_at).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setCurrentOffer({...currentOffer, expires_at: new Date(e.target.value).toISOString()})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="is_active" className="text-right">Active Status</Label>
                        <div className="flex items-center space-x-2 col-span-3">
                          <Switch
                            id="is_active"
                            checked={currentOffer?.is_active || false}
                            onCheckedChange={(checked) => setCurrentOffer({...currentOffer, is_active: checked})}
                          />
                          <Label htmlFor="is_active">{currentOffer?.is_active ? 'Active' : 'Inactive'}</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={isEditingOffer ? handleUpdateOffer : handleCreateOffer}>
                          {isEditingOffer ? 'Update Offer' : 'Create Offer'}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of all available offers.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Title</TableHead>
                      <TableHead className="w-1/5">Reward</TableHead>
                      <TableHead className="w-1/5">Expires</TableHead>
                      <TableHead className="w-1/6">Status</TableHead>
                      <TableHead className="w-1/6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <Gift size={36} className="mb-2 opacity-50" />
                            <p>No offers available. Create your first offer!</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      offers.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">
                              {offer.image ? (
                                <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                              ) : (
                                <Gift size={16} className="text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                            <span className="truncate max-w-[150px]">{offer.title}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign size={16} className="text-green-600 dark:text-green-400" />
                              <span>{offer.reward_amount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              <span>{formatDate(offer.expires_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`rounded-full w-2 h-2 mr-2 ${offer.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span>{offer.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setCurrentOffer(offer);
                                      setIsEditingOffer(true);
                                    }}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Edit Offer</DialogTitle>
                                    <DialogDescription>
                                      Update the details of the existing offer.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-title" className="text-right">Title</Label>
                                      <Input
                                        id="edit-title"
                                        className="col-span-3"
                                        value={currentOffer?.title || ''}
                                        onChange={(e) => setCurrentOffer({...currentOffer, title: e.target.value})}
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-description" className="text-right">Description</Label>
                                      <Textarea
                                        id="edit-description"
                                        className="col-span-3"
                                        value={currentOffer?.description || ''}
                                        onChange={(e) => setCurrentOffer({...currentOffer, description: e.target.value})}
                                        rows={3}
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-image" className="text-right">Image URL</Label>
                                      <Input
                                        id="edit-image"
                                        className="col-span-3"
                                        value={currentOffer?.image || ''}
                                        onChange={(e) => setCurrentOffer({...currentOffer, image: e.target.value})}
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-reward_amount" className="text-right">Reward Amount</Label>
                                      <Input
                                        id="edit-reward_amount"
                                        type="number"
                                        className="col-span-3"
                                        value={currentOffer?.reward_amount || 0}
                                        onChange={(e) => setCurrentOffer({...currentOffer, reward_amount: parseFloat(e.target.value)})}
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-redemption_link" className="text-right">Redemption Link</Label>
                                      <Input
                                        id="edit-redemption_link"
                                        className="col-span-3"
                                        value={currentOffer?.redemption_link || ''}
                                        onChange={(e) => setCurrentOffer({...currentOffer, redemption_link: e.target.value})}
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-redemption_code" className="text-right">Redemption Code</Label>
                                      <Input
                                        id="edit-redemption_code"
                                        className="col-span-3"
                                        value={currentOffer?.redemption_code || ''}
                                        onChange={(e) => setCurrentOffer({...currentOffer, redemption_code: e.target.value})}
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-expires_at" className="text-right">Expiry Date</Label>
                                      <Input
                                        id="edit-expires_at"
                                        type="datetime-local"
                                        className="col-span-3"
                                        value={currentOffer?.expires_at ? new Date(currentOffer.expires_at).toISOString().slice(0, 16) : ''}
                                        onChange={(e) => setCurrentOffer({...currentOffer, expires_at: new Date(e.target.value).toISOString()})}
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-is_active" className="text-right">Active Status</Label>
                                      <div className="flex items-center space-x-2 col-span-3">
                                        <Switch
                                          id="edit-is_active"
                                          checked={currentOffer?.is_active || false}
                                          onCheckedChange={(checked) => setCurrentOffer({...currentOffer, is_active: checked})}
                                        />
                                        <Label htmlFor="edit-is_active">{currentOffer?.is_active ? 'Active' : 'Inactive'}</Label>
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                      <Button onClick={handleUpdateOffer}>Update Offer</Button>
                                    </DialogClose>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setCurrentOffer(offer);
                                  setShowDeleteOfferDialog(true);
                                }}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* PROMOTIONS TAB */}
          <TabsContent value="promotions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Manage Promotions
                  </CardTitle>
                  <CardDescription>
                    Create and manage promotional content displayed on the dashboard.
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        setCurrentPromotion({
                          title: '',
                          description: '',
                          image: '',
                          link: '',
                          start_date: new Date().toISOString(),
                          end_date: new Date().toISOString(),
                          priority: 0,
                          is_active: true
                        });
                        setIsEditingPromotion(false);
                      }}
                    >
                      <Plus size={16} />
                      Add Promotion
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{isEditingPromotion ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
                      <DialogDescription>
                        {isEditingPromotion 
                          ? 'Update the details of an existing promotion.' 
                          : 'Fill in the details to create a new promotion.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-title" className="text-right">Title</Label>
                        <Input
                          id="promo-title"
                          className="col-span-3"
                          value={currentPromotion?.title || ''}
                          onChange={(e) => setCurrentPromotion({...currentPromotion, title: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-description" className="text-right">Description</Label>
                        <Textarea
                          id="promo-description"
                          className="col-span-3"
                          value={currentPromotion?.description || ''}
                          onChange={(e) => setCurrentPromotion({...currentPromotion, description: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-image" className="text-right">Image URL</Label>
                        <Input
                          id="promo-image"
                          className="col-span-3"
                          value={currentPromotion?.image || ''}
                          onChange={(e) => setCurrentPromotion({...currentPromotion, image: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-link" className="text-right">Link URL</Label>
                        <Input
                          id="promo-link"
                          className="col-span-3"
                          value={currentPromotion?.link || ''}
                          onChange={(e) => setCurrentPromotion({...currentPromotion, link: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-start-date" className="text-right">Start Date</Label>
                        <Input
                          id="promo-start-date"
                          type="datetime-local"
                          className="col-span-3"
                          value={currentPromotion?.start_date ? new Date(currentPromotion.start_date).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setCurrentPromotion({...currentPromotion, start_date: new Date(e.target.value).toISOString()})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-end-date" className="text-right">End Date</Label>
                        <Input
                          id="promo-end-date"
                          type="datetime-local"
                          className="col-span-3"
                          value={currentPromotion?.end_date ? new Date(currentPromotion.end_date).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setCurrentPromotion({...currentPromotion, end_date: new Date(e.target.value).toISOString()})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-priority" className="text-right">Priority</Label>
                        <Input
                          id="promo-priority"
                          type="number"
                          className="col-span-3"
                          value={currentPromotion?.priority || 0}
                          onChange={(e) => setCurrentPromotion({...currentPromotion, priority: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-is-active" className="text-right">Active Status</Label>
                        <div className="flex items-center space-x-2 col-span-3">
                          <Switch
                            id="promo-is-active"
                            checked={currentPromotion?.is_active || false}
                            onCheckedChange={(checked) => setCurrentPromotion({...currentPromotion, is_active: checked})}
                          />
                          <Label htmlFor="promo-is-active">{currentPromotion?.is_active ? 'Active' : 'Inactive'}</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={isEditingPromotion ? handleUpdatePromotion : handleCreatePromotion}>
                          {isEditingPromotion ? 'Update Promotion' : 'Create Promotion'}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of all available promotions.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Title</TableHead>
                      <TableHead className="w-1/6">Period</TableHead>
                      <TableHead className="w-1/6">Priority</TableHead>
                      <TableHead className="w-1/6">Status</TableHead>
                      <TableHead className="w-1/6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <Megaphone size={36} className="mb-2 opacity-50" />
                            <p>No promotions available. Create your first promotion!</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      promotions.map((promotion) => (
                        <TableRow key={promotion.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center overflow-hidden">
                              {promotion.image ? (
                                <img src={promotion.image} alt={promotion.title} className="w-full h-full object-cover" />
                              ) : (
                                <Megaphone size={16} className="text-purple-600 dark:text-purple-400" />
                              )}
                            </div>
                            <span className="truncate max-w-[150px]">{promotion.title}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{formatDate(promotion.start_date)}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Calendar size={12} />
                                <span>{formatDate(promotion.end_date)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <BarChart size={16} />
                              <span>{promotion.priority}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`rounded-full w-2 h-2 mr-2 ${promotion.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span>{promotion.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setCurrentPromotion(promotion);
                                      setIsEditingPromotion(true);
                                    }}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Edit Promotion</DialogTitle>
                                    <DialogDescription>
                                      Update the details of the existing promotion.
                                    </DialogDescription>
                                  </DialogHeader>
                                  {/* Same form fields as create promotion dialog */}
                                  <div className="grid gap-4 py-4">
                                    {/* Form fields for editing promotion */}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-promo-title" className="text-right">Title</Label>
                                      <Input
                                        id="edit-promo-title"
                                        className="col-span-3"
                                        value={currentPromotion?.title || ''}
                                        onChange={(e) => setCurrentPromotion({...currentPromotion, title: e.target.value})}
                                      />
                                    </div>
                                    {/* Other fields similar to the create form */}
                                  </div>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                      <Button onClick={handleUpdatePromotion}>Update Promotion</Button>
                                    </DialogClose>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setCurrentPromotion(promotion);
                                  setShowDeletePromotionDialog(true);
                                }}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* TOP REWARD EARNERS TAB */}
          <TabsContent value="top-earners">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Manage Top Reward Earners
                  </CardTitle>
                  <CardDescription>
                    Manage the list of top reward earners displayed on the dashboard.
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        setCurrentTopRewardEarner({
                          full_name: '',
                          username: '',
                          date: new Date().toISOString().split('T')[0],
                          total_rewards: 0,
                          rank: 1
                        });
                        setIsEditingTopRewardEarner(false);
                      }}
                    >
                      <Plus size={16} />
                      Add Earner
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{isEditingTopRewardEarner ? 'Edit Top Earner' : 'Add New Top Earner'}</DialogTitle>
                      <DialogDescription>
                        {isEditingTopRewardEarner 
                          ? 'Update the details of an existing top earner.' 
                          : 'Fill in the details to add a new top earner.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="earner-full-name" className="text-right">Full Name</Label>
                        <Input
                          id="earner-full-name"
                          className="col-span-3"
                          value={currentTopRewardEarner?.full_name || ''}
                          onChange={(e) => setCurrentTopRewardEarner({...currentTopRewardEarner, full_name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="earner-username" className="text-right">Username</Label>
                        <Input
                          id="earner-username"
                          className="col-span-3"
                          value={currentTopRewardEarner?.username || ''}
                          onChange={(e) => setCurrentTopRewardEarner({...currentTopRewardEarner, username: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="earner-date" className="text-right">Date</Label>
                        <Input
                          id="earner-date"
                          type="date"
                          className="col-span-3"
                          value={currentTopRewardEarner?.date ? new Date(currentTopRewardEarner.date).toISOString().split('T')[0] : ''}
                          onChange={(e) => setCurrentTopRewardEarner({...currentTopRewardEarner, date: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="earner-total-rewards" className="text-right">Total Rewards</Label>
                        <Input
                          id="earner-total-rewards"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          value={currentTopRewardEarner?.total_rewards || 0}
                          onChange={(e) => setCurrentTopRewardEarner({...currentTopRewardEarner, total_rewards: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="earner-rank" className="text-right">Rank</Label>
                        <Input
                          id="earner-rank"
                          type="number"
                          className="col-span-3"
                          value={currentTopRewardEarner?.rank || 1}
                          onChange={(e) => setCurrentTopRewardEarner({...currentTopRewardEarner, rank: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={isEditingTopRewardEarner ? handleUpdateTopRewardEarner : handleCreateTopRewardEarner}>
                          {isEditingTopRewardEarner ? 'Update Earner' : 'Add Earner'}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of all top reward earners.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/6">Rank</TableHead>
                      <TableHead className="w-1/4">User</TableHead>
                      <TableHead className="w-1/5">Date</TableHead>
                      <TableHead className="w-1/5">Total Rewards</TableHead>
                      <TableHead className="w-1/5 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topRewardEarners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <Award size={36} className="mb-2 opacity-50" />
                            <p>No top earners available. Add your first top earner!</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      topRewardEarners.map((earner) => (
                        <TableRow key={earner.id}>
                          <TableCell>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900">
                              <span className="font-bold text-amber-600 dark:text-amber-400">{earner.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{earner.full_name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">@{earner.username}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              <span>{formatDate(earner.date)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign size={16} className="text-green-600 dark:text-green-400" />
                              <span>{earner.total_rewards}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setCurrentTopRewardEarner(earner);
                                      setIsEditingTopRewardEarner(true);
                                    }}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  {/* Dialog content for editing top earner */}
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setCurrentTopRewardEarner(earner);
                                  setShowDeleteTopRewardEarnerDialog(true);
                                }}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* TOP TRANSACTIONS TAB */}
          <TabsContent value="top-transactions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Manage Top Transactions
                  </CardTitle>
                  <CardDescription>
                    Manage the list of top financial transactions displayed on the dashboard.
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        setCurrentTopTransaction({
                          full_name: '',
                          username: '',
                          transaction_id: '',
                          transaction_date: new Date().toISOString(),
                          total_amount: 0,
                          amount_earned: 0,
                          amount_spent: 0,
                          amount_withdrawn: 0,
                          notes: ''
                        });
                        setIsEditingTopTransaction(false);
                      }}
                    >
                      <Plus size={16} />
                      Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{isEditingTopTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
                      <DialogDescription>
                        {isEditingTopTransaction 
                          ? 'Update the details of an existing transaction.' 
                          : 'Fill in the details to add a new top transaction.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tx-full-name" className="text-right">Full Name</Label>
                        <Input
                          id="tx-full-name"
                          className="col-span-3"
                          value={currentTopTransaction?.full_name || ''}
                          onChange={(e) => setCurrentTopTransaction({...currentTopTransaction, full_name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tx-username" className="text-right">Username</Label>
                        <Input
                          id="tx-username"
                          className="col-span-3"
                          value={currentTopTransaction?.username || ''}
                          onChange={(e) => setCurrentTopTransaction({...currentTopTransaction, username: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tx-id" className="text-right">Transaction ID</Label>
                        <Input
                          id="tx-id"
                          className="col-span-3"
                          value={currentTopTransaction?.transaction_id || ''}
                          onChange={(e) => setCurrentTopTransaction({...currentTopTransaction, transaction_id: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tx-date" className="text-right">Transaction Date</Label>
                        <Input
                          id="tx-date"
                          type="datetime-local"
                          className="col-span-3"
                          value={currentTopTransaction?.transaction_date ? new Date(currentTopTransaction.transaction_date).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setCurrentTopTransaction({...currentTopTransaction, transaction_date: new Date(e.target.value).toISOString()})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tx-total-amount" className="text-right">Total Amount</Label>
                        <Input
                          id="tx-total-amount"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          value={currentTopTransaction?.total_amount || 0}
                          onChange={(e) => setCurrentTopTransaction({...currentTopTransaction, total_amount: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tx-amount-earned" className="text-right">Amount Earned</Label>
                        <Input
                          id="tx-amount-earned"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          value={currentTopTransaction?.amount_earned || 0}
                          onChange={(e) => setCurrentTopTransaction({...currentTopTransaction, amount_earned: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tx-amount-spent" className="text-right">Amount Spent</Label>
                        <Input
                          id="tx-amount-spent"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          value={currentTopTransaction?.amount_spent || 0}
                          onChange={(e) => setCurrentTopTransaction({...currentTopTransaction, amount_spent: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tx-amount-withdrawn" className="text-right">Amount Withdrawn</Label>
                        <Input
                          id="tx-amount-withdrawn"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          value={currentTopTransaction?.amount_withdrawn || 0}
                          onChange={(e) => setCurrentTopTransaction({...currentTopTransaction, amount_withdrawn: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tx-notes" className="text-right">Notes</Label>
                        <Textarea
                          id="tx-notes"
                          className="col-span-3"
                          value={currentTopTransaction?.notes || ''}
                          onChange={(e) => setCurrentTopTransaction({...currentTopTransaction, notes: e.target.value})}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={isEditingTopTransaction ? handleUpdateTopTransaction : handleCreateTopTransaction}>
                          {isEditingTopTransaction ? 'Update Transaction' : 'Add Transaction'}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of all top transactions.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">User</TableHead>
                      <TableHead className="w-1/6">Transaction ID</TableHead>
                      <TableHead className="w-1/6">Date</TableHead>
                      <TableHead className="w-1/6">Total Amount</TableHead>
                      <TableHead className="w-1/6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <CreditCard size={36} className="mb-2 opacity-50" />
                            <p>No top transactions available. Add your first transaction!</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      topTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{transaction.full_name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">@{transaction.username}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Hash size={16} />
                              <span className="truncate max-w-[100px]">{transaction.transaction_id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              <span>{formatDate(transaction.transaction_date)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign size={16} className="text-green-600 dark:text-green-400" />
                              <span>{transaction.total_amount}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setCurrentTopTransaction(transaction);
                                      setIsEditingTopTransaction(true);
                                    }}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  {/* Dialog content for editing transaction */}
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCurrentTopTransaction(transaction);
                                  setShowDeleteTopTransactionDialog(true);
                                }}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialogs */}
      <AlertDialog open={showDeleteOfferDialog} onOpenChange={setShowDeleteOfferDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the offer 
              "{currentOffer?.title}" from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOffer} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeletePromotionDialog} onOpenChange={setShowDeletePromotionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the promotion 
              "{currentPromotion?.title}" from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePromotion} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteTopRewardEarnerDialog} onOpenChange={setShowDeleteTopRewardEarnerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the top reward earner 
              "{currentTopRewardEarner?.full_name}" from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTopRewardEarner} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteTopTransactionDialog} onOpenChange={setShowDeleteTopTransactionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction 
              with ID "{currentTopTransaction?.transaction_id}" from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTopTransaction} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageUserDashboardPage;