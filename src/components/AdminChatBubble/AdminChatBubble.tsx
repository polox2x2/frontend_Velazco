import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, FileDown } from 'lucide-react';
import { adminApi } from '../../services/api';
import { exportChatToPdf } from '../../utils/exportChatToPdf';
import ChatChart from './ChatChart';
import styles from './AdminChatBubble.module.css';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function AdminChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: '¡Hola! Soy tu Asistente Central. ¿En qué te puedo ayudar con el inventario o ventas hoy?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await adminApi.askAi(userMessage.text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.response || 'No recibí respuesta.',
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Hubo un error de conexión al consultar el asistente. Inténtalo más tarde.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Function to format text containing markdown tables or charts
  const formatText = (text: string) => {
    // Buscar bloques de json_chart
    const chartRegex = /```json_chart([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = chartRegex.exec(text)) !== null) {
      // Push text before the chart
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index).split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </span>
        );
      }
      
      // Push the chart
      parts.push(<ChatChart key={`chart-${match.index}`} payload={match[1].trim()} />);
      
      lastIndex = chartRegex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex).split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </span>
      );
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={styles.chatBubbleContainer}>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <h3><Bot size={20} /> Asistente de Control</h3>
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.chatMessages}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.messageWrapper} ${styles[msg.sender]}`}>
                <div className={`${styles.message} ${styles[msg.sender]}`}>
                  {msg.sender === 'ai' ? (
                    <span>{formatText(msg.text)}</span>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.sender === 'ai' && (
                  <button 
                    className={styles.pdfButton} 
                    onClick={() => exportChatToPdf(msg.text)}
                    title="Exportar a PDF"
                  >
                    <FileDown size={14} /> Generar PDF
                  </button>
                )}
              </div>
            ))}
            {isLoading && (
              <div className={styles.loading}>
                <Bot size={16} /> 
                <div className={styles.dots}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className={styles.chatInputContainer}>
            <textarea
              className={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta sobre ventas o inventario..."
              rows={1}
            />
            <button 
              className={styles.sendButton} 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button 
          className={styles.bubbleButton} 
          onClick={() => setIsOpen(true)}
          title="Asistente Central"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
}
