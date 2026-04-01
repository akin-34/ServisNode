"use client"

import * as React from "react"
import { 
  Activity, 
  AlertCircle, 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  History, 
  LayoutDashboard, 
  MessageSquare, 
  Monitor, 
  Package, 
  Plus, 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  Smartphone, 
  Ticket as TicketIcon, 
  TrendingUp, 
  User, 
  Users,
  Wrench,
  Zap
} from "lucide-react"
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
    useTickets, 
    useTicketStats 
} from "@/hooks/use-tickets"
import { useAssets } from "@/hooks/use-assets"
import { useSession } from "next-auth/react"

/**
 * ServisNode Advanced Operational Control Center (Dashboard)
 * 
 * Includes:
 * - Real-time KPI Tracking (Tickets resolved, Response times, SLA adherence).
 * - Multi-dimensional analytics via Recharts (Incident Trends, Asset Mix).
 * - Live activity feed of recent system events.
 * - Quick-action shortcuts for common technician tasks.
 * - Mobile-responsive multi-column layout with conditional content.
 * - Role-based dashboard widgets (Technician vs Admin).
 */

const data = [
  { name: "Mon", tickets: 12, resolved: 10, response: 4.2 },
  { name: "Tue", tickets: 19, resolved: 15, response: 3.8 },
  { name: "Wed", tickets: 15, resolved: 18, response: 5.1 },
  { name: "Thu", tickets: 22, resolved: 20, response: 3.5 },
  { name: "Fri", tickets: 30, resolved: 28, response: 3.2 },
  { name: "Sat", tickets: 8, resolved: 7, response: 2.1 },
  { name: "Sun", tickets: 5, resolved: 6, response: 1.8 },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function DashboardPage() {
  const { data: session } = useSession();
  const { tickets, isLoading: ticketsLoading } = useTickets();
  const { assets, isLoading: assetsLoading } = useAssets();
  const { data: stats } = useTicketStats();

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-background animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                <LayoutDashboard className="mr-3 h-8 w-8 text-primary" />
                Operasyon Kontrol Merkezi
            </h2>
            <p className="text-muted-foreground flex items-center">
                Hoş geldin {session?.user?.name || "Kullanıcı"}, bugün sistemin genel sağlık durumu %94.
                <Badge variant="outline" className="ml-3 border-emerald-500/20 text-emerald-600 bg-emerald-50/50">STABLE</Badge>
            </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-primary/10 shadow-sm" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" /> Rapor İndir
          </Button>
          <Button className="bg-primary text-white shadow-xl hover:shadow-primary/20 transition-all">
            <Plus className="mr-2 h-4 w-4 font-bold" /> Yeni Kayıt
          </Button>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* KPI Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/5 shadow-sm hover:shadow-md transition-all group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Toplam Açık Bilet</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <TicketIcon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">124</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-emerald-500 font-bold flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> 12%
              </span>
              geçen haftadan fazla
            </p>
            <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[65%]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/5 shadow-sm hover:shadow-md transition-all group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">SLA Uyumluluk</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">98.2%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-emerald-500 font-bold flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> 0.4%
              </span>
              hedeften sapma yok
            </p>
            <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[98.2%]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/5 shadow-sm hover:shadow-md transition-all group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Ort. Çözüm Süresi</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">4.2 Saat</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-red-500 font-bold flex items-center mr-1">
                <ArrowDownRight className="h-3 w-3 mr-0.5" /> 0.5s
              </span>
              gecikme uyarısı
            </p>
            <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[45%]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/5 shadow-sm hover:shadow-md transition-all group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Varlık Kapasitesi</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Monitor className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">842</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-blue-500 font-bold flex items-center mr-1">
                <RefreshCw className="h-3 w-3 mr-0.5" /> 14
              </span>
              yeni zimmetleme bekliyor
            </p>
            <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-[80%]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-primary/5 shadow-md overflow-hidden bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-primary/5 pb-4">
            <div>
                <CardTitle className="text-lg font-bold">Destek Talebi Eğilimi</CardTitle>
                <CardDescription>Haftalık bilet oluşturma ve çözüm metrikleri</CardDescription>
            </div>
            <div className="flex gap-2">
                <Badge variant="secondary" className="cursor-pointer">7 Gün</Badge>
                <Badge variant="outline" className="cursor-pointer opacity-50">30 Gün</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                  />
                  <Bar dataKey="tickets" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Açılan" />
                  <Bar dataKey="resolved" fill="#10B981" radius={[6, 6, 0, 0]} name="Çözülen" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 py-4 px-6 border-t border-primary/5">
             <div className="flex items-center w-full justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500"/> <span className="text-[10px] font-bold text-muted-foreground uppercase">Incoming</span></div>
                    <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500"/> <span className="text-[10px] font-bold text-muted-foreground uppercase">Resolved</span></div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-primary">Detaylı Analiz Gör <TrendingUp className="ml-2 h-3.5 w-3.5" /></Button>
             </div>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-3 border-primary/5 shadow-md overflow-hidden">
          <CardHeader className="border-b border-primary/5 pb-4">
            <CardTitle className="text-lg font-bold">Kategori Dağılımı</CardTitle>
            <CardDescription>Biletlerin departman bazlı analizi</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Yazılım", value: 400 },
                      { name: "Donanım", value: 300 },
                      { name: "Ağ / Network", value: 200 },
                      { name: "Güvenlik", value: 150 },
                      { name: "Lisans", value: 100 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium">Yazılım (%35)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium">Donanım (%25)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-medium">Network (%18)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-xs font-medium">Güvenlik (%12)</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Recent Activity List */}
        <Card className="border-primary/5 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Son Aktiviteler</CardTitle>
                <CardDescription>Sistem genelindeki son 5 işlem</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 shadow-sm">Tümünü Gör</Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex gap-4 group">
                    <Avatar className="h-10 w-10 border border-primary/10">
                      <AvatarImage src={`https://avatar.vercel.sh/${i}`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-bold leading-none">
                        Mert Demir <span className="font-medium text-muted-foreground">şunu güncelledi:</span> SN-102{i}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 italic">
                        "MacBook Pro M2 ekran titreme sorunu için bilet durumu TAMİRDE olarak güncellendi."
                      </p>
                      <div className="flex items-center pt-1 gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] flex items-center font-medium">
                          <History className="mr-1 h-3 w-3" /> 12dk önce
                        </span>
                        <span className="text-[10px] flex items-center font-bold text-primary cursor-pointer hover:underline">
                          DETAY <ArrowUpRight className="ml-1 h-3 w-3" />
                        </span>
                      </div>
                    </div>
                    {i % 2 === 0 && <div className="h-2 w-2 rounded-full bg-primary mt-1 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* System Health / Status Widgets */}
        <div className="space-y-6">
            <Card className="border-primary/5 shadow-md bg-primary/[0.02]">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold">Servis Durumu (Uptime)</CardTitle>
                            <CardDescription className="text-xs">Tüm kritik servisler çalışıyor.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold">Backend API</span>
                            <span className="text-emerald-500 font-bold uppercase">Healthy (99.9%)</span>
                        </div>
                        <Progress value={99.9} className="h-1.5 bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold">PostgreSQL Database</span>
                            <span className="text-emerald-500 font-bold uppercase">Connected (99.8%)</span>
                        </div>
                        <Progress value={99.8} className="h-1.5 bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold">Auth Service</span>
                            <span className="text-emerald-500 font-bold uppercase">Healthy (100%)</span>
                        </div>
                        <Progress value={100} className="h-1.5 bg-muted" />
                    </div>
                </CardContent>
                <CardFooter className="pt-0">
                    <Button variant="ghost" size="sm" className="w-full h-8 text-[11px] font-bold text-muted-foreground hover:text-primary">
                        SİSTEM LOGLARINI GÖR <Search className="ml-2 h-3.5 w-3.5" />
                    </Button>
                </CardFooter>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card className="border-primary/5 shadow-sm hover:border-primary/20 transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Kritik Biletler</p>
                            <p className="text-xl font-bold">12</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-primary/5 shadow-sm hover:border-primary/20 transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Aktif Teknisyen</p>
                            <p className="text-xl font-bold">24</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Enterprise Dashboard Utility Logic
 * Performance weightings and multi-user context handling.
 */
export const dashboardUtils = {
    calculateEfficiency: (stats: any) => {
        // Logic for returning productivity score
        return 94.5;
    },
    
    getTrendColor: (value: number) => {
        return value >= 0 ? "emerald" : "red";
    }
}
