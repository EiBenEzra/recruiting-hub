import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import type { Resource } from '@/types/database.types'

const TYPE_LABELS: Record<string, string> = {
  document: 'Documento',
  guide: 'Guía',
  rubric: 'Rúbrica',
  template: 'Plantilla',
  tool: 'Herramienta',
  ai_assistant: 'Asistente IA',
}

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Card className="group flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">
              {TYPE_LABELS[resource.resource_type] ?? resource.resource_type}
            </p>
            <h3 className="font-medium leading-snug line-clamp-2">{resource.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
        {resource.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 4 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{resource.tags.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
