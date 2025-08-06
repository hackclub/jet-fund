import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Loader2, RefreshCw, X } from "lucide-react";
import type { HackatimeProject } from "@/lib/hackatime";

interface HackatimeProjectSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showClearButton?: boolean;
}

export default function HackatimeProjectSelect({ 
  value, 
  onValueChange, 
  placeholder = "Select a Hackatime project",
  disabled = false,
  showClearButton = false
}: HackatimeProjectSelectProps) {
  const [projects, setProjects] = useState<HackatimeProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchHackatimeProjects() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/hackatime/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch Hackatime projects");
      }
      
      const data = await response.json();
      setProjects(data.data.projects || []);
    } catch (err) {
      setError("Failed to load Hackatime projects. Please try again.");
      console.error("Error fetching Hackatime projects:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHackatimeProjects();
  }, []);

  if (error) {
    return (
      <div className="space-y-2">
        <Notice variant="destructive">
          {error}
        </Notice>
        <Button 
          onClick={fetchHackatimeProjects} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </>
          )}
        </Button>
      </div>
    );
  }

           return (
           <div className="flex items-center gap-2">
             <Select value={value} onValueChange={onValueChange} disabled={disabled || loading}>
               <SelectTrigger className="w-full">
                 <SelectValue placeholder={loading ? "Loading projects..." : placeholder}>
                   {value}
                 </SelectValue>
               </SelectTrigger>
               <SelectContent>
                 {loading ? (
                   <div className="flex items-center justify-center p-4">
                     <Loader2 className="w-4 h-4 animate-spin mr-2" />
                     Loading projects...
                   </div>
                 ) : projects.length === 0 ? (
                   <div className="p-4 text-center text-muted-foreground">
                     No Hackatime projects found
                   </div>
                 ) : (
                   projects.map((project) => (
                     <SelectItem key={project.name} value={project.name} className="text-base py-3">
                       <div className="flex flex-col">
                         <span className="font-medium">{project.name}</span>
                         <span className="text-sm text-muted-foreground">
                           {/* {project.text} ({project.percent.toFixed(1)}%) */}
                           {project.text}
                         </span>
                       </div>
                     </SelectItem>
                   ))
                 )}
               </SelectContent>
             </Select>
             
             {showClearButton && value && (
               <Button
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={() => onValueChange("")}
                 disabled={disabled || loading}
                 title="Clear Hackatime project"
               >
                 <X className="w-4 h-4" />
               </Button>
             )}
           </div>
         );
}