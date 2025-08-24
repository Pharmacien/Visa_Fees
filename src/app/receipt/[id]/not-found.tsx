import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileWarning } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
            <FileWarning className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="mt-4 font-headline text-3xl">Receipt Not Found</CardTitle>
          <CardDescription>
            We could not find the visa application receipt you were looking for. It may have been moved or deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
