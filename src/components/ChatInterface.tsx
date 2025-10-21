import { useState, useRef, useEffect } from "react";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatInterface = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      toast({
        title: "Verbunden",
        description: "Du kannst jetzt mit dem AI-Agenten sprechen",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
    },
    onMessage: (message) => {
      console.log("Message received:", message);
      
      if (message.message?.role && message.message?.content) {
        const newMessage: Message = {
          role: message.message.role,
          content: message.message.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsPermissionGranted(true);
      toast({
        title: "Mikrofonzugriff erlaubt",
        description: "Du kannst jetzt eine Konversation starten",
      });
    } catch (error) {
      console.error("Microphone permission denied:", error);
      toast({
        title: "Mikrofonzugriff verweigert",
        description: "Bitte erlaube den Mikrofonzugriff in deinen Browser-Einstellungen",
        variant: "destructive",
      });
    }
  };

  const startConversation = async () => {
    try {
      await conversation.startSession({
        agentId: "agent_1301k3zm8h2tfcbbt9qnm90ac35t",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Verbindung fehlgeschlagen",
        description: "Konnte nicht mit dem AI-Agenten verbinden",
        variant: "destructive",
      });
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
      toast({
        title: "Konversation beendet",
        description: "Die Verbindung wurde getrennt",
      });
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-shine rounded-2xl border border-border shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
            <MessageSquare className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Voice Agent</h1>
            <p className="text-sm text-muted-foreground">Powered by ElevenLabs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversation.status === "connected" && (
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/30">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-primary font-medium">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <Card className="flex-1 overflow-y-auto bg-card border-border p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-6 bg-gradient-primary rounded-full shadow-glow">
              <Mic className="w-12 h-12 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Bereit zum Sprechen
              </h2>
              <p className="text-muted-foreground max-w-md">
                Starte die Konversation und sprich direkt mit dem AI-Agenten. 
                Deine Gespräche werden hier als Text angezeigt.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-in fade-in slide-in-from-bottom-4 duration-300`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === "user"
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "bg-muted text-foreground border border-border"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-6 py-4 bg-gradient-shine rounded-2xl border border-border shadow-soft">
        {!isPermissionGranted ? (
          <Button
            onClick={requestMicrophonePermission}
            size="lg"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow px-8"
          >
            <Mic className="mr-2 h-5 w-5" />
            Mikrofonzugriff erlauben
          </Button>
        ) : conversation.status === "connected" ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-card rounded-full border border-border">
              {conversation.isSpeaking ? (
                <>
                  <div className="flex gap-1">
                    <div className="w-1 h-6 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                    <div className="w-1 h-8 bg-primary rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                    <div className="w-1 h-6 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Agent spricht...
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    Hört zu...
                  </span>
                </>
              )}
            </div>
            <Button
              onClick={endConversation}
              size="lg"
              variant="destructive"
              className="shadow-soft"
            >
              <MicOff className="mr-2 h-5 w-5" />
              Beenden
            </Button>
          </div>
        ) : (
          <Button
            onClick={startConversation}
            size="lg"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow px-8"
          >
            <Mic className="mr-2 h-5 w-5" />
            Konversation starten
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
