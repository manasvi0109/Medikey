import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AiChatHistory } from "@shared/schema";
import { Loader2, Send, Bot, User, Info, HelpCircle, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id?: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Assistant() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hi there! I'm your AI Health Assistant. I can help you understand your medical records, explain medical terms, answer health-related questions, or find information. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: chatHistory, isLoading: historyLoading } = useQuery<AiChatHistory[]>({
    queryKey: ["/api/ai-chat/history"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => {
      return apiRequest("POST", "/api/ai-chat", { message });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setMessages(prev => [
        ...prev,
        {
          id: data.id,
          content: data.response,
          isUser: false,
          timestamp: new Date()
        }
      ]);
      queryClient.invalidateQueries({ queryKey: ["/api/ai-chat/history"] });
    },
  });

  // Load chat history on component mount
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0 && messages.length === 1) {
      const formattedHistory = chatHistory.flatMap((item) => [
        {
          id: item.id,
          content: item.message,
          isUser: true,
          timestamp: new Date(item.createdAt)
        },
        {
          id: item.id,
          content: item.response,
          isUser: false,
          timestamp: new Date(item.createdAt)
        }
      ]);
      
      setMessages(prev => [prev[0], ...formattedHistory]);
    }
  }, [chatHistory]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus on input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const newMessage: Message = {
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    sendMessageMutation.mutate(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const getSuggestions = () => {
    return [
      "What does my last blood test show?",
      "Explain what high cholesterol means",
      "What are the side effects of Lisinopril?",
      "How often should I get a mammogram?",
      "What does BMI stand for?",
      "How can I manage my asthma better?"
    ];
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">AI Health Assistant</h1>
        <p className="mt-1 text-sm text-gray-600">
          Ask questions about your health records or get information about medical terms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-220px)] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-primary-600" />
                MediVault Assistant
              </CardTitle>
              <CardDescription>
                Your personal AI-powered medical assistant
              </CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[80%] ${
                        message.isUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className={`h-8 w-8 ${message.isUser ? "ml-2" : "mr-2"}`}>
                        {message.isUser ? (
                          <>
                            <AvatarImage src="" alt="User" />
                            <AvatarFallback className="bg-primary-100 text-primary-800">
                              {user?.username.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src="" alt="AI" />
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              AI
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 ${
                          message.isUser
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div
                          className={`text-xs mt-1 ${
                            message.isUser ? "text-primary-100" : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <Input
                  ref={inputRef}
                  placeholder="Ask me anything about your health..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1"
                />
                <Button
                  className="ml-2"
                  onClick={handleSendMessage}
                  disabled={inputValue.trim() === "" || sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Info className="h-4 w-4 mr-2 text-primary-600" />
                About the Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  Your AI Health Assistant can access your medical records to provide personalized answers.
                </p>
                <p>
                  It can explain medical terms, help you understand lab results, and provide general health information.
                </p>
                <p>
                  All conversations are private and securely stored in your account.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <HelpCircle className="h-4 w-4 mr-2 text-primary-600" />
                Suggested Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getSuggestions().map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2 px-3 text-sm"
                    onClick={() => {
                      setInputValue(suggestion);
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }}
                  >
                    <Search className="h-3 w-3 mr-2 text-gray-500" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
