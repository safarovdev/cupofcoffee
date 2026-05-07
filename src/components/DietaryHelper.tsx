"use client";

import { useState } from "react";
import { ScanEye, AlertTriangle, CheckCircle2, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MenuItem } from "./Menu";
import { dietaryCompanion, DietaryCompanionOutput } from "@/ai/flows/dietary-companion-flow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface DietaryHelperProps {
  currentMenu: MenuItem[];
}

export function DietaryHelper({ currentMenu }: DietaryHelperProps) {
  const [restrictions, setRestrictions] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DietaryCompanionOutput | null>(null);
  const [selectedForAnalysis, setSelectedForAnalysis] = useState<string[]>([]);

  const handleAnalyze = async () => {
    if (!restrictions.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);

    try {
      const itemsToAnalyze = currentMenu
        .filter(item => selectedForAnalysis.includes(item.id))
        .map(item => ({
          name: item.name,
          ingredients: item.ingredients,
        }));

      // If nothing selected, analyze the whole current "visible" category or just provide general advice?
      // Let's force selection for precision or use all if none selected.
      const finalItems = itemsToAnalyze.length > 0 ? itemsToAnalyze : currentMenu.slice(0, 5).map(i => ({ name: i.name, ingredients: i.ingredients }));

      const output = await dietaryCompanion({
        selectedItems: finalItems,
        dietaryRestrictions: restrictions,
      });
      setResult(output);
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedForAnalysis(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-accent/40 hover:bg-accent/10 hover:text-accent font-bold rounded-full">
          <ScanEye className="w-4 h-4" />
          Analyze Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl bg-card border-border sm:rounded-3xl p-8">
        <DialogHeader>
          <div className="flex items-center gap-2 text-accent mb-2">
            <Sparkles className="w-5 h-5 fill-accent" />
            <span className="text-xs font-bold uppercase tracking-widest">AI-Powered Companion</span>
          </div>
          <DialogTitle className="text-3xl font-headline font-bold">Dietary Assistant</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tell us about your allergies or preferences, and I'll analyze our menu for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-3">
            <label className="text-sm font-bold text-primary uppercase tracking-wider">Your Restrictions</label>
            <Textarea 
              placeholder="e.g. Peanut allergy, vegan, gluten-free, no dairy..." 
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              className="bg-background border-border focus:ring-accent min-h-[100px] rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-primary uppercase tracking-wider">Select Items to Check</label>
            <ScrollArea className="h-[120px] rounded-xl border border-border bg-background/50 p-3">
              <div className="flex flex-wrap gap-2">
                {currentMenu.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleItemSelection(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      selectedForAnalysis.includes(item.id)
                        ? "bg-accent/20 border-accent text-accent"
                        : "bg-card border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !restrictions.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Analyzing Menu...
              </>
            ) : (
              "Check Compatibility"
            )}
          </Button>

          {result && (
            <div className={`p-6 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-2 ${
              result.issuesFound 
                ? "bg-destructive/10 border-destructive/20" 
                : "bg-primary/10 border-primary/20"
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {result.issuesFound ? (
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                )}
                <h4 className={`font-bold font-headline text-lg ${result.issuesFound ? "text-destructive" : "text-primary"}`}>
                  {result.issuesFound ? "Safety Alert" : "Safe Selection"}
                </h4>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Analysis</p>
                  <p className="text-sm text-foreground leading-relaxed">{result.analysis}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Our Suggestions</p>
                  <p className="text-sm text-foreground italic leading-relaxed">{result.suggestions}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}