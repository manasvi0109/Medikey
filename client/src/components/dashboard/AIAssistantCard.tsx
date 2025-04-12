import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Bot, Send } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AIAssistantCard() {
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const askAIMutation = useMutation({
    mutationFn: (message: string) => {
      return apiRequest("POST", "/api/ai-chat", { message });
    },
    onSuccess: () => {
      setQuery("");
      toast({
        title: "Message sent",
        description: "Check the AI Assistant page for the full conversation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      askAIMutation.mutate(query);
    }
  };

  return (
    <Card className="mt-6 bg-primary-50 rounded-lg shadow overflow-hidden">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">AI Health Assistant</h3>
            <p className="text-sm text-gray-600">
              Ask questions about your health records or get information about medical terms
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <form onSubmit={handleSubmit} className="flex items-center">
              <Input
                placeholder="Ask a question about your health..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow"
                disabled={askAIMutation.isPending}
              />
              <Button 
                className="ml-3" 
                type="submit"
                disabled={!query.trim() || askAIMutation.isPending}
              >
                {askAIMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Ask
              </Button>
            </form>
            <div className="mt-3 text-xs text-gray-500">
              Example questions: "What does my last blood test show?", "What are normal cholesterol levels?"
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/assistant">
            <Button variant="link" className="text-primary-600 hover:text-primary-800 text-sm">
              Go to AI Assistant for full conversation
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
