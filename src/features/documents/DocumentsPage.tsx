import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, FileText, Download, Search, X, Upload, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { TableSkeleton } from '@/components/shared/Skeletons'
import type { Document } from '@/types/database'

const documentSchema = z.object({
  title: z.string().min(1, 'Required'),
  document_type: z.enum(['death_certificate', 'receipt', 'meeting_minutes', 'other']),
  file_url: z.string().min(1, 'Please upload a file'),
  funeral_case_id: z.string().optional(),
})
type DocumentForm = z.infer<typeof documentSchema>

const typeVariant = { death_certificate: 'destructive', receipt: 'default', meeting_minutes: 'secondary', other: 'outline' } as const
const typeLabel = { death_certificate: 'Death Certificate', receipt: 'Receipt', meeting_minutes: 'Meeting Minutes', other: 'Other' }

export function DocumentsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Document | null>(null)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'bin'
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('documents').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)
      setValue('file_url', publicUrl)
      toast.success('File uploaded', file.name)
    } catch {
      toast.error('Upload failed', 'Ensure a public storage bucket named "documents" exists in Supabase.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data } = await supabase.from('documents').select('*, funeral_cases(case_number)').order('created_at', { ascending: false })
      return (data ?? []) as (Document & { funeral_cases: { case_number: string } | null })[]
    },
  })

  const { data: cases = [] } = useQuery({
    queryKey: ['cases-list'],
    queryFn: async () => {
      const { data } = await supabase.from('funeral_cases').select('id, case_number, deceased_name').order('case_number', { ascending: false })
      return (data ?? []) as { id: string; case_number: string; deceased_name: string }[]
    },
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<DocumentForm>({
    resolver: zodResolver(documentSchema),
    defaultValues: { document_type: 'other', funeral_case_id: '_none' },
  })

  const upsert = useMutation({
    mutationFn: async (values: DocumentForm) => {
      const caseId = values.funeral_case_id && values.funeral_case_id !== '_none' ? values.funeral_case_id : null
      const payload = { title: values.title, document_type: values.document_type, file_url: values.file_url, funeral_case_id: caseId }
      if (editing) {
        await supabase.from('documents').update(payload).eq('id', editing.id)
      } else {
        await supabase.from('documents').insert(payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setOpen(false); reset(); setEditing(null)
      toast.success(editing ? 'Document updated' : 'Document added', 'Saved successfully.')
    },
    onError: () => toast.error('Error', 'Please try again.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await supabase.from('documents').delete().eq('id', id) },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document deleted')
    },
    onError: () => toast.error('Delete failed', 'Please try again.'),
  })

  const openEdit = (d: Document) => {
    setEditing(d)
    reset({ title: d.title, document_type: d.document_type, file_url: d.file_url, funeral_case_id: d.funeral_case_id ?? '_none' })
    setOpen(true)
  }
  const openAdd = () => { setEditing(null); reset({ document_type: 'other', funeral_case_id: '_none' }); setOpen(true) }

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    ((d as Document & { funeral_cases: { case_number: string } | null }).funeral_cases?.case_number ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 pb-4">
      <div className="sticky top-0 z-20 bg-background pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('menu.documents')}</h1>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Document</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input className="pl-9 pr-8" placeholder="Search by title or case number..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton rows={5} cols={5} /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right w-28">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileText className="h-8 w-8" />
                        <p>{t('common.noData')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium max-w-xs truncate">{d.title}</TableCell>
                    <TableCell>
                      <Badge variant={typeVariant[d.document_type] as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {typeLabel[d.document_type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{(d as Document & { funeral_cases: { case_number: string } | null }).funeral_cases?.case_number}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(d.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Document</AlertDialogTitle>
                              <AlertDialogDescription>Delete "<strong>{d.title}</strong>"? This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(d.id)}>{t('common.delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Document' : 'Add Document'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((v) => upsert.mutate(v))} className="space-y-4">
            <div className="space-y-2">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input {...register('title')} placeholder="e.g. Death Certificate – Ahmad Khan" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Document Type <span className="text-destructive">*</span></Label>
              <Select value={watch('document_type')} onValueChange={(v) => setValue('document_type', v as DocumentForm['document_type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="death_certificate">Death Certificate</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="meeting_minutes">Meeting Minutes</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-none"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Upload className="mr-2 h-4 w-4" />}
                  {uploading ? 'Uploading…' : 'Choose File'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv,.txt"
                />
              </div>
              <p className="text-xs text-muted-foreground">Or paste a URL (Google Drive, Dropbox, etc.)</p>
              <Input {...register('file_url')} type="text" placeholder="https://…" />
              {errors.file_url && <p className="text-xs text-destructive">{errors.file_url.message}</p>}
              {watch('file_url') && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <FileText className="h-3 w-3" /> File ready
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Funeral Case <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Select value={watch('funeral_case_id') ?? '_none'} onValueChange={(v) => setValue('funeral_case_id', v)}>
                <SelectTrigger><SelectValue placeholder="Link to a case (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— None —</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.case_number} – {c.deceased_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={isSubmitting || upsert.isPending}>{editing ? t('common.update') : t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
