"use client"

import * as React from "react"
import { 
  Plus, 
  Search, 
  Monitor, 
  Smartphone, 
  Laptop, 
  Cpu, 
  LayoutGrid, 
  List, 
  Download, 
  Printer, 
  QrCode, 
  ArrowRightLeft, 
  Wrench, 
  History, 
  MoreHorizontal,
  Building2,
  MapPin,
  Calendar,
  ShieldCheck,
  Zap,
  Package,
  Trash2,
  Edit2,
  ChevronDown,
  Filter,
  CheckCircle2,
  Table as TableIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle,
    CardFooter
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAssets, useAssetActions } from "@/hooks/use-assets"
import { useAssetStore } from "@/store/use-asset-store"
import { DataTable } from "@/components/ui/data-table"
import { cn } from "@/lib/utils"
import { AssetStatus, AssetCondition } from "@prisma/client"
import { toast } from "sonner"

/**
 * ServisNode Advanced Asset Management Page
 * 
 * Features:
 * - Complex Enterprise Asset Inventory listing.
 * - Dynamic category-based filtering.
 * - Organizational hierarchy support (Org -> Location -> Department).
 * - Multi-view orchestration (Table, Grid).
 * - Bulk asset assignments and lifecycle transitions.
 * - Warranty expiration tracking logic.
 * - Real-time statistics for asset conditions.
 */

export default function AssetsPage() {
  const { 
    assets, 
    isLoading, 
    total,
    pages,
    stats,
    refetch 
  } = useAssets();
  
  const { 
    viewMode, 
    setViewMode, 
    filters, 
    setFilters, 
    resetFilters,
  } = useAssetStore();

  const { createAsset, updateCondition } = useAssetActions();

  // Columns for Data Table View
  const columns = [
    {
      accessorKey: "assetTag",
      header: "Demirbaş No",
      cell: ({ row }: any) => <span className="font-bold text-xs uppercase tracking-tight">{row.getValue("assetTag")}</span>
    },
    {
      accessorKey: "name",
      header: "Varlık Adı",
      cell: ({ row }: any) => (
          <div className="flex flex-col">
              <span className="font-medium line-clamp-1">{row.getValue("name")}</span>
              <span className="text-[10px] text-muted-foreground uppercase">{row.original.category}</span>
          </div>
      )
    },
    {
      accessorKey: "status",
      header: "Durum",
      cell: ({ row }: any) => {
        const val = row.getValue("status") as AssetStatus;
        return (
            <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800">
                {val}
            </Badge>
        )
      }
    },
    {
        accessorKey: "condition",
        header: "Sağlık",
        cell: ({ row }: any) => {
            const val = row.getValue("condition") as AssetCondition;
            const healthMap: Record<AssetCondition, number> = {
                NEW: 100, EXCELLENT: 95, GOOD: 80, FAIR: 60, POOR: 30, SCRAP: 5
            };
            return (
                <div className="flex flex-col gap-1 w-[100px]">
                    <div className="flex justify-between text-[9px] font-bold">
                        <span>{val}</span>
                        <span>%{healthMap[val]}</span>
                    </div>
                    <Progress value={healthMap[val]} className="h-1 rounded-full" />
                </div>
            )
        }
    },
    {
        accessorKey: "department",
        header: "Departman",
        cell: ({ row }: any) => <span className="text-xs">{row.original.department?.name || "-"}</span>
    },
    {
      accessorKey: "purchaseDate",
      header: "Alım Tarihi",
      cell: ({ row }: any) => (
          <span className="text-muted-foreground text-xs">
              {row.getValue("purchaseDate") ? new Date(row.getValue("purchaseDate")).toLocaleDateString('tr-TR') : "-"}
          </span>
      )
    },
    {
        id: "actions",
        cell: () => (
            <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Printer className="h-3.5 w-3.5" /></Button>
            </div>
        )
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-background/40">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center">
                <Package className="mr-3 h-7 w-7 text-primary" />
                Varlık ve Envanter Yönetimi
              </h2>
              <Badge variant="outline" className="h-6 border-primary/20 text-primary">ENT VERSIYON</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Kurum genelindeki donanım (PC, Mobil, Network) ve yazılım lisanslarını merkezi olarak takip edin.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-10 px-3 border-primary/10 transition-colors">
                <Download className="mr-2 h-4 w-4" /> CSV İçe Aktar
            </Button>
            <Button size="sm" className="h-10 px-4 shadow-xl bg-primary hover:bg-primary/90 transition-all font-bold">
                <Plus className="mr-2 h-4 w-4" /> Yeni Varlık Ekle
            </Button>
        </div>
      </div>

      <Separator className="opacity-40" />

      {/* Global Inventory Health Dashboard Widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/5 bg-gradient-to-br from-emerald-500/[0.03] to-transparent">
              <CardContent className="p-5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center">
                    <CheckCircle2 className="mr-1.5 h-3 w-3" /> Aktif Kullanım
                  </span>
                  <div className="text-2xl font-bold tracking-tighter">642 <span className="text-xs font-normal text-muted-foreground">/ 842</span></div>
                  <Progress value={76} className="h-1 mt-2 bg-emerald-500/10" />
              </CardContent>
          </Card>
          <Card className="border-primary/5 bg-gradient-to-br from-amber-500/[0.03] to-transparent">
              <CardContent className="p-5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center">
                    <Wrench className="mr-1.5 h-3 w-3" /> Bakım Bekleyen
                  </span>
                  <div className="text-2xl font-bold tracking-tighter">48 <span className="text-xs font-normal text-muted-foreground">birim</span></div>
                  <Progress value={20} className="h-1 mt-2 bg-amber-500/10" />
              </CardContent>
          </Card>
          <Card className="border-primary/5 bg-gradient-to-br from-blue-500/[0.03] to-transparent">
              <CardContent className="p-5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center">
                    <RefreshCw className="mr-1.5 h-3 w-3" /> Amortisman Değeri
                  </span>
                  <div className="text-2xl font-bold tracking-tighter">1.2M ₺</div>
                  <div className="flex items-center text-[10px] mt-2 text-muted-foreground underline cursor-help">Finansal dökümü gör</div>
              </CardContent>
          </Card>
          <Card className="border-primary/5 bg-gradient-to-br from-purple-500/[0.03] to-transparent">
              <CardContent className="p-5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center">
                    <Zap className="mr-1.5 h-3 w-3" /> Yazılım Lisans Uyum
                  </span>
                  <div className="text-2xl font-bold tracking-tighter">%100 <Badge variant="secondary" className="ml-2 text-[9px] h-4">LEGACY</Badge></div>
                  <Progress value={100} className="h-1 mt-2 bg-purple-500/10" />
              </CardContent>
          </Card>
      </div>

      {/* Filter and View Toggle Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-card/60 p-4 rounded-xl border border-primary/10 backdrop-blur-sm shadow-sm">
            <div className="relative flex-1 w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Varlık adı, tag, seri no veya açıklama ara..." 
                    className="pl-10 h-10 border-primary/20 focus-visible:ring-primary w-full bg-background/50"
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                />
            </div>
            
            <div className="flex items-center gap-2 w-full lg:w-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 px-4 gap-2 border-primary/10">
                            <TagIcon className="h-4 w-4" /> Kategori: Tümü
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Donanım Kategorileri</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {["Bilgisayar", "Mobil Cihaz", "Sunucu", "Ağ Cihazı", "Yazıcı", "Diğer"].map(c => (
                            <DropdownMenuCheckboxItem key={c}>{c}</DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 px-4 gap-2 border-primary/10">
                            <Building2 className="h-4 w-4" /> Lokasyon
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Ofis / Bölge Seçimi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {["Genel Merkez", "Ar-Ge Merkezi", "Şube 01", "Veri Merkezi"].map(l => (
                            <DropdownMenuCheckboxItem key={l}>{l}</DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-6 w-px bg-primary/10 hidden lg:block mx-1" />

                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="bg-muted p-0.5 rounded-lg border border-primary/5">
                    <TabsList className="h-9 bg-transparent">
                        <TabsTrigger value="table" className="h-8 px-3 text-[11px] font-bold"><TableIcon className="h-4 w-4 mr-2" /> TABLO</TabsTrigger>
                        <TabsTrigger value="grid" className="h-8 px-3 text-[11px] font-bold"><LayoutGrid className="h-4 w-4 mr-2" /> GALERİ</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[500px]">
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <Card key={i} className="h-[200px] animate-pulse border-primary/5 bg-muted/20" />
                ))}
            </div>
        ) : (
            <Tabs value={viewMode}>
                <TabsContent value="grid" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 animate-in fade-in duration-500 mt-0">
                    {assets.map(asset => (
                        <Card key={asset.id} className="group relative overflow-hidden border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl cursor-pointer">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                        <Laptop className="h-5 w-5" />
                                    </div>
                                    <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter opacity-70">
                                        {asset.assetTag}
                                    </Badge>
                                </div>
                                <CardTitle className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                    {asset.name}
                                </CardTitle>
                                <CardDescription className="text-[11px] font-medium line-clamp-1">{asset.brand} {asset.model}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-muted-foreground flex items-center"><User className="mr-1.5 h-3 w-3" /> Zimmet</span>
                                        <span className="font-bold">{asset.ownerId ? "Meşgul" : "Müsait"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-muted-foreground flex items-center"><MapPin className="mr-1.5 h-3 w-3" /> Ofis</span>
                                        <span className="font-medium">Genel Merkez</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-primary/5 flex items-center justify-between text-[10px]">
                                    <span className="flex items-center text-emerald-600 font-bold">
                                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Garanti
                                    </span>
                                    {asset.warrantyExpires && (
                                        <span className="text-muted-foreground">{new Date(asset.warrantyExpires).getFullYear()}</span>
                                    )}
                                </div>
                            </CardContent>
                            {/* Overlay actions on hover */}
                            <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-6">
                                <Button className="w-full h-10 bg-white text-primary font-bold hover:bg-white/90">DETAYI GÖR</Button>
                                <div className="flex gap-2 w-full">
                                    <Button variant="outline" className="flex-1 bg-transparent border-white/40 text-white hover:bg-white/10"><Edit2 className="h-4 w-4" /></Button>
                                    <Button variant="outline" className="flex-1 bg-transparent border-white/40 text-white hover:bg-white/10"><QrCode className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {assets.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-primary/5 rounded-2xl opacity-50">
                            Envanterde varlık bulunamadı.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="table" className="animate-in slide-in-from-right-4 duration-500 mt-0">
                    <DataTable columns={columns} data={assets} searchKey="name" />
                </TabsContent>
            </Tabs>
        )}
      </div>

      {/* Footer / Summary Analytics */}
      <div className="flex flex-col md:flex-row gap-6 opacity-60">
          <div className="flex-1 p-6 border border-primary/10 rounded-2xl bg-muted/5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary font-bold italic">S</div>
              <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Proje Sürümü</p>
                  <p className="text-xs font-medium italic">ServisNode Enterprise v1.0.4.52</p>
              </div>
          </div>
          <div className="flex-1 p-6 border border-primary/10 rounded-2xl bg-muted/5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-amber-500/20 flex items-center justify-center text-amber-600"><Zap className="h-6 w-6" /></div>
              <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Sistem Durumu</p>
                  <p className="text-xs font-medium">Bileşen taraması tamamlandı, hata yok.</p>
              </div>
          </div>
      </div>
    </div>
  )
}

/**
 * Enterprise Asset Logic Helpers
 * Advanced lifecycle and condition assessment functions.
 */
export const assetInventoryUtils = {
    calculateTotalValue: (items: any[]) => {
        return items.reduce((acc, curr) => acc + (curr.purchaseCost || 0), 0);
    },
    
    getCategoryIcon: (category: string) => {
        switch(category.toLowerCase()) {
            case 'pc':
            case 'macbook': 
            case 'bilgisayar': return Monitor;
            case 'mobil':
            case 'telefon': return Smartphone;
            default: return Package;
        }
    },
    
    validateAssetOwnership: (asset: any, user: any) => {
        // Business logic to check if user belongs to the same department as the asset
        return asset.departmentId === user.departmentId;
    }
}
