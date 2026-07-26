import { BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/**
 * ProjectEmptyState — Salvia stub. EKM has no projects; redirect to Knowledge Repository workspace.
 */
interface ProjectEmptyStateProps {
  moduleName: string
  description?: string
}

export function ProjectEmptyState({ moduleName, description }: ProjectEmptyStateProps) {
  const navigate = useNavigate()
  const defaultDescription = description ?? `Use Knowledge Repository & Content Management to manage ${moduleName.toLowerCase()}.`

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <BookOpen className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">Knowledge Repository & Content Management</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{defaultDescription}</p>
      <Button onClick={() => navigate('/knowledge')} variant="default">
        <BookOpen className="w-4 h-4 mr-2" />
        Go to Knowledge Repository
      </Button>
    </div>
  )
}
