'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Copy, Check, Filter, User, Wallet, Search, Package } from 'lucide-react';
import { Button } from '@cropchain/ui-web';
import { Input } from '@cropchain/ui-web';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cropchain/ui-web';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@cropchain/ui-web';
import { Badge } from '@cropchain/ui-web';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@cropchain/ui-web';

type OrderState = 'Ready' | 'In transit' | 'Processing' | 'Now Showing';
interface OrderItem { id: string; name: string; location: string; number: string; quantity: number; retailPrice: number; shelfNumber: string; expiry: string; remark: string; state: OrderState; scannedAt: string; farmer: string; }

const stateStyles: Record<OrderState, string> = {
  Ready: 'bg-green-100 text-green-700 border-green-300',
  'In transit': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Processing: 'bg-orange-100 text-orange-700 border-orange-300',
  'Now Showing': 'bg-teal-100 text-teal-700 border-teal-300',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([
    { id: '1', name: 'Tomato', location: 'Warehouse A', number: 'SKU-1001', quantity: 150, retailPrice: 45.99, shelfNumber: 'A-12', expiry: '2025-11-15', remark: 'Fresh batch', state: 'Ready', scannedAt: '2025-10-15 09:30', farmer: 'Naveen' },
    { id: '2', name: 'Rice', location: 'Warehouse B', number: 'SKU-1002', quantity: 25, retailPrice: 32.5, shelfNumber: 'B-05', expiry: '2025-10-20', remark: 'Needs quick sale', state: 'In transit', scannedAt: '2025-10-15 10:15', farmer: 'Rajesh' },
    { id: '3', name: 'Wheat', location: 'Warehouse C', number: 'SKU-1003', quantity: 80, retailPrice: 55.0, shelfNumber: 'C-08', expiry: '2025-12-01', remark: 'Organic certified', state: 'Processing', scannedAt: '2025-10-15 11:00', farmer: 'Amit' },
    { id: '4', name: 'Potato', location: 'Warehouse A', number: 'SKU-1004', quantity: 120, retailPrice: 28.75, shelfNumber: 'A-15', expiry: '2025-11-25', remark: 'Best quality', state: 'Ready', scannedAt: '2025-10-15 11:30', farmer: 'Suresh' },
    { id: '5', name: 'Corn', location: 'Warehouse B', number: 'SKU-1005', quantity: 60, retailPrice: 42.0, shelfNumber: 'B-10', expiry: '2025-11-18', remark: 'Handle with care', state: 'Processing', scannedAt: '2025-10-15 12:00', farmer: 'Rahul' },
  ]);

  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  const stats = {
    total: orders.length,
    ready: orders.filter(o => o.state === 'Ready').length,
    inTransit: orders.filter(o => o.state === 'In transit').length,
    processing: orders.filter(o => o.state === 'Processing').length,
    nowShowing: orders.filter(o => o.state === 'Now Showing').length,
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = s;
      streamRef.current = s; setScanning(true);
    } catch { alert('Camera access denied.'); }
  };
  const stopCamera = () => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; setScanning(false); setShowScanner(false); };
  const mockFetchDataFromQR = (qr: string): OrderItem => ({
    id: `${Math.floor(Math.random() * 1000)}`,
    name: ['Tomato', 'Rice', 'Wheat', 'Potato', 'Corn', 'Onion'][Math.floor(Math.random() * 6)],
    location: ['Warehouse A', 'Warehouse B', 'Warehouse C'][Math.floor(Math.random() * 3)],
    number: `SKU-${Math.floor(Math.random() * 9000) + 1000}`,
    quantity: Math.floor(Math.random() * 200) + 10,
    retailPrice: parseFloat((Math.random() * 100 + 10).toFixed(2)),
    shelfNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}-${Math.floor(Math.random() * 20) + 1}`,
    expiry: new Date(Date.now() + Math.random() * 90 * 86400000).toISOString().split('T')[0],
    remark: ['Fresh batch', 'Handle with care', 'Organic certified', 'Best quality'][Math.floor(Math.random() * 4)],
    state: (['Ready', 'In transit', 'Processing'] as const)[Math.floor(Math.random() * 3)],
    scannedAt: new Date().toLocaleString(),
    farmer: ['Naveen', 'Rajesh', 'Amit', 'Suresh', 'Rahul'][Math.floor(Math.random() * 5)],
  });
  const captureAndProcessQR = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const c = canvasRef.current, v = videoRef.current, ctx = c.getContext('2d');
    if (ctx) {
      c.width = v.videoWidth; c.height = v.videoHeight;
      ctx.drawImage(v, 0, 0);
      const newOrder = mockFetchDataFromQR('QR_' + Date.now());
      setOrders(p => [newOrder, ...p]); stopCamera();
      alert(`✅ ${newOrder.name} scanned!\nQty: ${newOrder.quantity}`);
    }
  };
  const copyWallet = () => { navigator.clipboard.writeText(walletAddress); setWalletCopied(true); setTimeout(() => setWalletCopied(false), 2000); };
  const filtered = orders.filter(o =>
    (o.name + o.number + o.id + o.farmer).toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!filterState || o.state === filterState) &&
    (!filterLocation || o.location === filterLocation)
  );
  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Top Green Bar */}
      <div className="bg-green-500 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Package className="text-white" /> Product Management
        </h1>
        <Button 
          variant="outline" 
          className="bg-white text-green-700 hover:bg-green-50 border-white text-sm px-3 py-1"
          onClick={() => { setShowScanner(true); startCamera(); }}
        >
          Show QR
        </Button>
      </div>

      <div className="p-6">
        {/* Dashboard Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Package className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Distributor Dashboard</h2>
                <p className="text-gray-500 text-sm">Manage your inventory</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input 
                placeholder="Search..." 
                className="w-48"
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => { setShowScanner(true); startCamera(); }}
              >
                QR
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
              <div className="text-3xl font-bold text-green-600">{stats.total}</div>
              <div className="text-sm text-green-700 mt-1">Total Products</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{stats.ready}</div>
              <div className="text-sm text-blue-700 mt-1">Ready</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">{stats.inTransit}</div>
              <div className="text-sm text-yellow-700 mt-1">In Transit</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">{stats.processing}</div>
              <div className="text-sm text-purple-700 mt-1">Processing</div>
            </div>
            <div className="bg-teal-50 rounded-lg p-4 text-center border border-teal-200">
              <div className="text-3xl font-bold text-teal-600">{stats.nowShowing}</div>
              <div className="text-sm text-teal-700 mt-1">Now Showing</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-wrap gap-3 items-center mb-6">
          <span className="text-sm font-medium text-gray-700">All Status</span>
          <Select onValueChange={setFilterState}>
            <SelectTrigger className="w-[140px] text-sm">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {['Ready', 'In transit', 'Processing', 'Now Showing'].map(s => 
                <SelectItem key={s} value={s}>{s}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            Add Product
          </Button>
          {(filterState || filterLocation || searchTerm) && 
            <Button variant="ghost" size="sm" onClick={() => { setFilterState(''); setFilterLocation(''); setSearchTerm(''); }}>
              Clear
            </Button>
          }
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-green-50">
              <TableRow>
                <TableHead className="text-green-800 font-semibold">ITEM</TableHead>
                <TableHead className="text-green-800 font-semibold">FARMER</TableHead>
                <TableHead className="text-green-800 font-semibold">STATUS</TableHead>
                <TableHead className="text-green-800 font-semibold">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? filtered.map(o => (
                <TableRow key={o.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-bold text-sm">
                          {o.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{o.name}</div>
                        <div className="text-xs text-gray-500">ID: {o.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-semibold text-xs">
                          {o.farmer.charAt(0)}
                        </span>
                      </div>
                      <span className="text-gray-700">{o.farmer}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={stateStyles[o.state]}>{o.state}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                        VIEW
                      </Button>
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                        EDIT
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="p-4 text-sm text-gray-600 border-t bg-gray-50 flex justify-between items-center">
            <span>{filtered.length} / {orders.length} ITEMS</span>
            <span className="text-xs text-gray-500">© 2025 CropChain - Built with ♥</span>
          </div>
        </div>
      </div>

      {/* Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-green-700">Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <video ref={videoRef} autoPlay playsInline className="w-full h-96 object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-green-500 rounded-lg shadow-lg" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-4">Position QR code inside the frame</p>
            <Button 
              onClick={captureAndProcessQR} 
              disabled={!scanning}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Capture & Process
            </Button>
            <Button variant="ghost" className="ml-3" onClick={stopCamera}>
              <X className="w-4 h-4 mr-1" /> Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}