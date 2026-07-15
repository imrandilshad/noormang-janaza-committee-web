import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { FileText, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { Document } from '@/types/database'

const typeVariant = {
  death_certificate: 'destructive',
  receipt: 'default',
  meeting_minutes: 'secondary',
  other: 'outline',
} as const

export function DocumentsPage() {
  const { t } = useTranslation()

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data } = await supabase
        .from('documents')
        .select('*, funeral_cases(case_number)')
        .order('created_at', { ascending: false })
      return (data ?? []) as (Document & { funeral_cases: { case_number: string } | null })[]
    },
  })

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 bg-background pt-4 lg:pt-6 pb-3">
        <h1 className="text-2xl font-bold">{t('menu.documents')}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                        <FileText className="h-8 w-8" />
                        <p>{t('common.noData')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.title}</TableCell>
                      <TableCell>
                        <Badge variant={typeVariant[d.document_type] as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {d.document_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{d.funeral_cases?.case_number}</TableCell>
                      <TableCell>{formatDate(d.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
