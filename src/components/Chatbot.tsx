import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Fallback knowledge base for common questions
const FARMING_KNOWLEDGE: Record<string, string> = {
  'aphid': '🐛 Aphids are small sap-sucking insects. Control them by:\n• Spray with neem oil or insecticidal soap\n• Introduce ladybugs (natural predators)\n• Use strong water spray to dislodge them\n• Apply garlic or onion spray\n• Remove heavily infested parts',
  'disease': '🌿 Common plant disease signs:\n• Yellow/brown spots on leaves\n• Wilting despite adequate water\n• Powdery white coating (mildew)\n• Stunted growth\n• Root rot (dark, mushy roots)\n\nPrevention: Good air circulation, proper watering, crop rotation',
  'water': '💧 Watering tips:\n• Best time: Early morning (6-10 AM)\n• Water deeply but less frequently\n• Check soil moisture 2 inches deep\n• Avoid overhead watering (prevents disease)\n• Adjust based on weather and plant type',
  'pest': '🦗 Natural pest control:\n• Neem oil spray\n• Companion planting (marigolds, basil)\n• Diatomaceous earth\n• Encourage beneficial insects\n• Crop rotation\n• Regular monitoring and early intervention',
  'fertilizer': '🌱 Fertilizer guide:\n• NPK ratio based on growth stage\n• Organic: compost, manure, bone meal\n• Apply during growing season\n• Avoid over-fertilization (burns plants)\n• Test soil before heavy application',
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hello! I'm your CropGuard AI assistant. I can help you with:\n\n• Pest identification and treatment\n• Disease prevention tips\n• Crop care advice\n• Weather-related farming guidance\n• Fertilizer recommendations\n\nHow can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    // Check fallback knowledge base first
    const lowerMessage = userMessage.toLowerCase();
    for (const [key, answer] of Object.entries(FARMING_KNOWLEDGE)) {
      if (lowerMessage.includes(key)) {
        return answer;
      }
    }

    // Try AI if knowledge base doesn't have answer
    if (!GEMINI_API_KEY) {
      return "I'm currently in offline mode. Here's general advice:\n\n• For pest issues: Use neem oil or insecticidal soap\n• For diseases: Ensure good air circulation and proper watering\n• For general care: Water in the morning, use organic fertilizers\n\nTry the pest detection feature for detailed analysis!";
    }

    try {
      const prompt = `You are CropGuard AI, an expert agricultural assistant specializing in crop protection, pest management, and farming advice. 

User question: ${userMessage}

Provide a helpful, accurate, and concise response (max 150 words). Focus on:
- Practical farming advice
- Pest and disease identification
- Treatment recommendations
- Prevention methods
- Weather-related guidance

Keep your tone friendly and professional. Use emojis where appropriate.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API error:', errorData);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!botReply) {
        throw new Error('No response from AI');
      }

      return botReply;
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Return helpful fallback response
      return "I'm having trouble connecting to my AI brain right now 😅\n\nHere's what I can suggest:\n• Use the **Pest Detection** feature to analyze crop images\n• Check the **Weather Alerts** for pest risk in your area\n• Try asking simpler questions like 'aphids', 'watering', or 'diseases'\n\nI'll have more specific knowledge available soon!";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponseText = await generateBotResponse(inputValue);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How do I prevent aphids?",
    "Best time to water crops?",
    "Signs of plant disease?",
    "Natural pest control methods?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-96 h-[100vh] md:h-[600px] md:max-h-[90vh] shadow-2xl z-50 flex flex-col md:rounded-lg rounded-none">
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground md:rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5" />
                CropGuard Assistant
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-3 md:p-4" ref={scrollRef}>
              <div className="space-y-3 md:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-1.5 md:gap-2 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] sm:max-w-[75%] rounded-lg px-2.5 md:px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-xs md:text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.text}</p>
                      <span className="text-[10px] md:text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {message.sender === 'user' && (
                      <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-1.5 md:gap-2 justify-start">
                    <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 md:px-4 py-2">
                      <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                      className="text-xs h-auto py-2 whitespace-normal text-left justify-start"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 md:p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about crops, pests..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-primary to-accent flex-shrink-0"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
