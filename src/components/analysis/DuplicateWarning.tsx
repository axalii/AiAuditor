import { Copy } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const DuplicateWarning = () => (
  <Badge variant="warning" className="gap-1 animate-pulse">
    <Copy className="h-3 w-3" />
    Match Found
  </Badge>
);