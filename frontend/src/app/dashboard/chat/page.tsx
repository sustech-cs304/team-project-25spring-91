// frontend/src/app/dashboard/chat/page.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  RotateCcw,
  AlertTriangle,
  Copy,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRole } from "@/components/auth/sign-up-form";
import ButterflyLoader from "@/components/butterfly-loader";
import { useRoleProtection } from "@/hooks/use-role-protection";
import { useChat } from "@/hooks/useChat";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const formatTimestamp = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const SUGGESTED_PROMPTS = [
  "Explain the benefits of compound exercises",
  "Write a workout plan for building muscle mass in 4 weeks",
  "Give me 5 high-protein meal ideas for post-workout recovery",
  "Create a daily calorie and macronutrient breakdown for weight loss",
  "How can I track my workout progress effectively?",
  "Write a short explanation of how different rep ranges affect muscle growth"
];


export default function ChatPage() {
  const {
    isAuthorized,
    isLoading: authLoading,
    
  } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER],
  });

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    initialHistoryLoaded,
    sendMessage,
    clearChat,
    loadInitialHistory,
  } = useChat();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isAuthorized && !initialHistoryLoaded && loadInitialHistory) {
      loadInitialHistory();
    }
  }, [isAuthorized, initialHistoryLoaded, loadInitialHistory]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const messageToSend = inputValue;
    setInputValue("");
    const success = await sendMessage(messageToSend);
    if (!success) {
      toast.error("Message sending failed. Check chat for error details.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    clearChat();
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === "user";
    const isError = message.role === "assistant" && message.content.toLowerCase().startsWith("error:");

    const handleCopy = () => {
      navigator.clipboard.writeText(message.content.replace(/^Error: /i, ''));
      toast.success("Copied to clipboard!");
    };

    return (
      <div className={cn(
        "group flex items-start gap-3 mb-6 max-w-none",
        isUser ? "justify-end" : "justify-start"
      )}>
        {!isUser && (
          <Avatar className="w-6 h-6 flex-shrink-0 mt-0.5">
            <AvatarFallback className="bg-foreground text-background text-xs">
              <Bot className="w-3 h-3" />
            </AvatarFallback>
          </Avatar>
        )}

        <div className={cn(
          "max-w-[80%] space-y-1",
          isUser && "flex flex-col items-end"
        )}>
          <div className={cn(
            "rounded-xl px-3 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-foreground text-background"
              : isError
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-muted text-foreground"
          )}>
            {isError && (
              <div className="flex items-center gap-2 mb-2 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs">Error</span>
              </div>
            )}

            <div className="whitespace-pre-wrap">
              {(isError ? message.content.replace(/^Error: /i, '') : message.content)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(message.timestamp)}</span>

            {message.role === "assistant" && !isError && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                onClick={handleCopy}
                aria-label="Copy message"
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {isUser && (
          <Avatar className="w-6 h-6 flex-shrink-0 mt-0.5">
            <AvatarFallback className="bg-muted text-foreground text-xs">
              <User className="w-3 h-3" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  const TypingIndicator = () => (
    <div className="flex items-start gap-3 mb-6">
      <Avatar className="w-6 h-6 flex-shrink-0 mt-0.5">
        <AvatarFallback className="bg-foreground text-background text-xs">
          <Bot className="w-3 h-3" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-1">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-6">
        <Bot className="w-6 h-6 text-muted-foreground" />
      </div>

      <h2 className="text-xl font-medium mb-2 text-foreground">
        How can I help you with your fitness journey today?
      </h2>
      <p className="text-muted-foreground mb-8 text-sm">
        Ask me anything - I can help with workout plans, diet advice, calorie tracking, and more.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
        {SUGGESTED_PROMPTS.map((prompt, index) => (
          <Card
            key={index}
            className="cursor-pointer transition-all duration-200 hover:bg-accent border-border"
            onClick={() => handleSuggestedPrompt(prompt)}
          >
            <CardContent className="p-3">
              <p className="text-xs text-foreground text-left">
                {prompt}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const showPageLoader = authLoading || (!initialHistoryLoaded && isLoading && messages.length === 0);

  if (showPageLoader) {
    return (
      <div className="flex justify-center items-center h-full">
        <ButterflyLoader />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-6">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-medium mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm">You need to be logged in to access the AI Assistant.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-background">
      {/* Messages Area - Full height minus input */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto p-6">
            {!initialHistoryLoaded && isLoading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <ButterflyLoader />
              </div>
            ) : messages.length > 0 ? (
              <div>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading &&
                  messages.some(m => m.id.startsWith('user-live')) &&
                  !messages.some(m => m.id.startsWith('assistant-live') &&
                    m.id > messages.findLast(m => m.id.startsWith('user-live'))!.id) && (
                    <TypingIndicator />
                  )}
              </div>
            ) : (
              <EmptyState />
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="border-t bg-background p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <Button
              variant="outline"
              onClick={handleNewChat}
              disabled={isLoading && messages.length === 0}
              className="min-h-[44px] px-3 shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message..."
                disabled={isLoading}
                className="min-h-[44px] text-sm rounded-xl border-input focus:border-ring focus:ring-ring pr-12"
                autoFocus
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="min-h-[44px] px-3 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
