import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import walletService, { QRCode } from '@/services/walletService';
import { toast } from 'sonner';

export default function QRCodeManagement() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      setIsLoading(true);
      const data = await walletService.getQRCodes();
      setQRCodes(data);
    } catch (error) {
      toast.error("Failed to load QR codes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !description) {
      toast.error("Please select a file and provide a description");
      return;
    }

    try {
      await walletService.uploadQRCode(file, description);
      toast.success("QR code uploaded successfully");
      setFile(null);
      setDescription('');
      loadQRCodes();
    } catch (error) {
      toast.error("Failed to upload QR code");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await walletService.deleteQRCode(id);
      toast.success("QR code deleted successfully");
      loadQRCodes();
    } catch (error) {
      toast.error("Failed to delete QR code");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage QR Codes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qrCodeFile">Upload QR Code Image</Label>
            <Input
              id="qrCodeFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for the QR code"
            />
          </div>
          <Button onClick={handleUpload} disabled={!file || !description}>
            Upload QR Code
          </Button>
        </div>

        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    Loading QR codes...
                  </TableCell>
                </TableRow>
              ) : qrCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No QR codes available
                  </TableCell>
                </TableRow>
              ) : (
                qrCodes.map((qrCode) => (
                  <TableRow key={qrCode.id}>
                    <TableCell>{qrCode.id}</TableCell>
                    <TableCell>{qrCode.description}</TableCell>
                    <TableCell>
                      <img src={qrCode.image} alt={qrCode.description} className="w-16 h-16 object-cover" />
                    </TableCell>
                    <TableCell>{new Date(qrCode.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(qrCode.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}