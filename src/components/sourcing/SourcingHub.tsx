'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BooleanGenerator } from './BooleanGenerator'
import { OutreachGenerator } from './OutreachGenerator'
import type { SourcingMessage } from '@/types/database.types'

interface SourcingHubProps {
  savedTemplates: Partial<SourcingMessage>[]
}

export function SourcingHub({ savedTemplates }: SourcingHubProps) {
  return (
    <Tabs defaultValue="boolean">
      <TabsList>
        <TabsTrigger value="boolean">Booleanos</TabsTrigger>
        <TabsTrigger value="outreach">Outreach</TabsTrigger>
      </TabsList>
      <TabsContent value="boolean" className="mt-6">
        <BooleanGenerator />
      </TabsContent>
      <TabsContent value="outreach" className="mt-6">
        <OutreachGenerator savedTemplates={savedTemplates} />
      </TabsContent>
    </Tabs>
  )
}
