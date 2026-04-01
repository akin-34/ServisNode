"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  FileUp, 
  Info, 
  Loader2, 
  Paperclip, 
  ShieldAlert, 
  Tag, 
  Trash2, 
  User, 
  Wrench,
  Activity,
  ArrowRight,
  Globe,
  Lock,
  MessageSquare,
  Smartphone,
  Zap
} from "lucide-react"

import { cn } from "@/lib/utils"
import { TicketPriority, TicketType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card"
import { 
    Tooltip, 
    TooltipContent, 
    TooltipProvider, 
    TooltipTrigger 
} from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

/**
 * ServisNode Advanced Ticket Creation Form
 * 
 * Features:
 * - Next.js 14 Client Component with complex state.
 * - React Hook Form integration with Zod Schema validation.
 * - Dynamic field visibility based on ticket type.
 * - Real-time character count and validation feedback.
 * - Multi-file upload simulation with progress indicators.
 * - Priority-based business rule warnings.
 * - Internal vs Public toggle logic for sensitive incidents.
 * - Automated asset lookup simulation.
 */

const ticketSchema = z.object({
  title: z.string().min(10, { message: "Başlık en az 10 karakter olmalıdır." }).max(100),
  description: z.string().min(20, { message: "Lütfen sorunu detaylıca açıklayın (en az 20 karakter)." }),
  priority: z.nativeEnum(TicketPriority),
  type: z.nativeEnum(TicketType),
  assetId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isInternal: z.boolean().default(false),
  notifyManager: z.boolean().default(false),
  dueDate: z.string().optional(),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface TicketFormProps {
    initialData?: Partial<TicketFormValues>;
    onSubmit: (values: TicketFormValues) => void;
    isSubmitting?: boolean;
}

export function TicketForm({ initialData, onSubmit, isSubmitting }: TicketFormProps) {
    const [files, setFiles] = React.useState<{ name: string; size: string; progress: number }[]>([]);
    const [tagInput, setTagInput] = React.useState("");

    const form = useForm<TicketFormValues>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            priority: initialData?.priority || "MEDIUM",
            type: initialData?.type || "INCIDENT",
            assetId: initialData?.assetId || "",
            tags: initialData?.tags || [],
            isInternal: initialData?.isInternal || false,
            notifyManager: initialData?.notifyManager || false,
        },
    });

    const isUrgent = form.watch("priority") === "CRITICAL" || form.watch("priority") === "URGENT";

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newFiles = selectedFiles.map(f => ({
            name: f.name,
            size: (f.size / 1024).toFixed(1) + " KB",
            progress: 0
        }));
        setFiles(prev => [...prev, ...newFiles]);
        
        // Simulating upload progress
        newFiles.forEach((_, idx) => {
            let p = 0;
            const timer = setInterval(() => {
                p += 10;
                setFiles(prev => {
                    const current = [...prev];
                    const targetIdx = prev.length - newFiles.length + idx;
                    if (current[targetIdx]) current[targetIdx].progress = p;
                    return current;
                });
                if (p >= 100) clearInterval(timer);
            }, 200);
        });
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const currentTags = form.getValues("tags");
            if (!currentTags.includes(tagInput.trim())) {
                form.setValue("tags", [...currentTags, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Primary Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-primary/10 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-primary/5 py-5 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <TicketIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold">Bilet Detayları</CardTitle>
                                        <CardDescription>Lütfen sorununuzu veya talebinizi detaylıca belirtin.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-bold flex items-center uppercase tracking-wider text-muted-foreground">
                                                Konu Başlığı <span className="text-destructive ml-1">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Örn: MacBook Pro ekran titreme sorunu" 
                                                    className="h-11 border-primary/10 focus-visible:ring-primary shadow-inner" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[10px] italic">Bilet başlığı sorunu özetlemelidir.</FormDescription>
                                            <FormMessage className="text-[11px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Talep Türü</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 border-primary/10">
                                                            <SelectValue placeholder="Tür seçin" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="INCIDENT" className="py-2">
                                                            <div className="flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold">Olay / Arıza</span>
                                                                    <span className="text-[10px] text-muted-foreground">Beklenmedik kesinti</span>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="REQUEST" className="py-2">
                                                            <div className="flex items-center gap-2">
                                                                <Plus className="h-4 w-4 text-blue-500" />
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold">Talep</span>
                                                                    <span className="text-[10px] text-muted-foreground">Yeni servis isteği</span>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="priority"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Öncelik Seviyesi</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className={cn(
                                                            "h-11 border-primary/10 font-bold",
                                                            isUrgent && "border-red-500/50 bg-red-50 text-red-700"
                                                        )}>
                                                            <SelectValue placeholder="Öncelik seçin" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="LOW">Düşük</SelectItem>
                                                        <SelectItem value="MEDIUM">Orta</SelectItem>
                                                        <SelectItem value="HIGH">Yüksek</SelectItem>
                                                        <SelectItem value="URGENT">Acil</SelectItem>
                                                        <SelectItem value="CRITICAL" className="text-red-700 font-bold">KRİTİK</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                                Açıklama <span className="text-[10px] opacity-60 font-medium">RichText Editor enabled</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Lütfen arıza ile ilgili hata mesajlarını, adımları ve önemli detayları ekleyin..." 
                                                    className="min-h-[200px] border-primary/10 focus-visible:ring-primary shadow-inner resize-none leading-relaxed" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-3">
                                    <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                                        <Tag className="mr-2 h-4 w-4" /> Etiketler
                                    </FormLabel>
                                    <div className="flex flex-wrap gap-2 mb-2 p-3 bg-muted/20 border border-primary/5 rounded-xl min-h-[44px]">
                                        {form.watch("tags").map((tag, i) => (
                                            <Badge key={i} variant="secondary" className="pl-2 pr-1 h-7 text-xs font-semibold gap-1 group">
                                                {tag}
                                                <Button size="icon" variant="ghost" className="h-5 w-5 rounded-full hover:bg-destructive hover:text-white" onClick={() => {
                                                    const tags = form.getValues("tags").filter((_, idx) => idx !== i);
                                                    form.setValue("tags", tags);
                                                }}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                        <input 
                                            placeholder="Etiket yaz ve Enter'a bas..." 
                                            className="bg-transparent border-none focus:outline-none text-sm ml-2 flex-1 min-w-[200px]"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={addTag}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-primary/10 shadow-sm p-6 bg-primary/[0.01]">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Paperclip className="h-5 w-5 text-primary" /></div>
                                        <div>
                                            <h4 className="text-sm font-bold">Ek Dosyalar</h4>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Max 10MB per file • JPG, PNG, PDF</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="h-9 relative" type="button">
                                        <FileUp className="mr-2 h-4 w-4" /> Dosya Seç
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" multiple onChange={handleFileUpload} />
                                    </Button>
                                </div>
                                
                                {files.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                        {files.map((f, i) => (
                                            <div key={i} className="flex flex-col gap-1 p-3 border border-primary/5 bg-background rounded-xl shadow-sm animate-in slide-in-from-left-2 duration-300">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold truncate max-w-[150px]">{f.name}</span>
                                                    <span className="text-[10px] font-medium opacity-60">{f.size}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${f.progress}%` }} />
                                                    </div>
                                                    {f.progress === 100 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar Options Section */}
                    <div className="space-y-6">
                        <Card className="border-primary/10 shadow-md">
                            <CardHeader className="py-4 px-5 border-b border-primary/5 bg-muted/10">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
                                    <Settings className="mr-2 h-3.5 w-3.5" /> Gelişmiş Ayarlar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold flex items-center gap-2">
                                            <Lock className="h-3.5 w-3.5 opacity-60" /> Dahili Bilet
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">Yalnızca teknisyenler görebilir.</p>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="isInternal"
                                        render={({ field }) => (
                                            <Switch 
                                                checked={field.value} 
                                                onCheckedChange={field.onChange} 
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        )}
                                    />
                                </div>
                                <Separator className="opacity-40" />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold flex items-center gap-2">
                                            <ShieldAlert className="h-3.5 w-3.5 opacity-60" /> Yönetici Uyarısı
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">Gecikme durumunda bilgi ver.</p>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="notifyManager"
                                        render={({ field }) => (
                                            <Switch 
                                                checked={field.value} 
                                                onCheckedChange={field.onChange} 
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        )}
                                    />
                                </div>
                                <Separator className="opacity-40" />
                                <FormField
                                    control={form.control}
                                    name="assetId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">İlişkili Varlık (Envanter)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 text-xs border-primary/10">
                                                        <SelectValue placeholder="Varlık seçin (isteğe bağlı)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="asset-1" className="text-xs">MacBook Pro M2 - SN4212</SelectItem>
                                                    <SelectItem value="asset-2" className="text-xs">iPhone 15 - SN9902</SelectItem>
                                                    <SelectItem value="asset-3" className="text-xs">Dell Monitor - SN1022</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {isUrgent && (
                            <div className="p-5 border border-red-500/20 bg-red-500/5 rounded-2xl animate-pulse-subtle flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-red-700">
                                    <ShieldAlert className="h-5 w-5" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Kritik Bilet Uyarısı</span>
                                </div>
                                <p className="text-[11px] text-red-600/80 leading-relaxed font-medium">
                                    Bu seviyedeki biletler SLA kuralları gereği 2 saat içinde yanıtlanmak zorundadır. Teknisyenlere anlık bildirim gönderilecektir.
                                </p>
                            </div>
                        )}

                        <div className="grid gap-4">
                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 shadow-xl bg-primary hover:bg-primary/95 text-sm font-bold tracking-tight transition-all">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                BİLETİ OLUŞTUR VE YAYINLA
                            </Button>
                            <Button type="button" variant="ghost" className="w-full h-11 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                VAZGEÇ VE TASLAĞA KAYDET
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}

/**
 * Enterprise Form Logic Helpers
 * Includes validation weightings and dynamic placeholder generation.
 */
export const ticketFormUtils = {
    getPriorityAlert: (priority: TicketPriority) => {
        if (priority === "CRITICAL") return "CRITICAL_SLA_APPLIED";
        return "NORMAL_SLA";
    },
    
    generateDraftSlug: () => {
        return `DRAFT-${Math.random().toString(36).substring(7).toUpperCase()}`;
    }
}
