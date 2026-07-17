import { useState } from 'react';
import './AiChatSidebar.css';

const AiChatSidebar = ({ onAnimalFound }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { isUser: false, text: "¡Hola! Soy tu asistente de vida silvestre. Pregúntame sobre cualquier especie y te la mostraré en el mapa. 🌍" }
  ]);

  const toggleChat = () => setIsExpanded(!isExpanded);

  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = inputMessage;
    setInputMessage('');
    
    setMessages(prev => [...prev, { isUser: true, text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5085/api/Chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg })
      });
      
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      
      const answer = data.answer || data.Answer || 'Sin respuesta.';
      const animalName = data.animalName || data.AnimalName;
      const longitude = data.longitude !== undefined ? data.longitude : (data.Longitude !== undefined ? data.Longitude : null);
      const latitude = data.latitude !== undefined ? data.latitude : (data.Latitude !== undefined ? data.Latitude : null);
      const description = data.description || data.Description;
      const biome = data.biome || data.Biome;
      const fotoUrl = data.fotoUrl || data.FotoUrl;

      const normalizedData = { answer, animalName, longitude, latitude, description, biome, fotoUrl };

      setMessages(prev => [...prev, { isUser: false, text: answer }]);
      
      if (animalName && longitude !== null && latitude !== null) {
        if (onAnimalFound) {
          onAnimalFound(normalizedData);
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { isUser: false, text: "Lo siento, ocurrió un error al procesar tu solicitud." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chat-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="chat-toggle" onClick={toggleChat} title={isExpanded ? "Cerrar chat" : "Abrir asistente IA"}>
        {isExpanded ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="toggle-label">IA</span>
          </>
        )}
      </button>

      {isExpanded && (
        <>
          <div className="chat-head">
            <div className="chat-head-left">
              <div className="chat-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#a855f7"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#a855f7" strokeLinecap="round"/>
                  <circle cx="9" cy="10" r="1" fill="#a855f7"/>
                  <circle cx="15" cy="10" r="1" fill="#a855f7"/>
                </svg>
              </div>
              <div>
                <div className="chat-head-title">Asistente IA</div>
                <div className="chat-head-sub">
                  <span className="online-dot"></span> En línea
                </div>
              </div>
            </div>
          </div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.isUser ? 'msg-user' : 'msg-ai'}`}>
                {!msg.isUser && (
                  <div className="msg-ai-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                    </svg>
                  </div>
                )}
                <div className="msg-bubble">{msg.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="msg msg-ai">
                <div className="msg-ai-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  </svg>
                </div>
                <div className="msg-bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-foot">
            <div className="chat-input-wrap">
              <input 
                type="text" 
                value={inputMessage} 
                onChange={e => setInputMessage(e.target.value)} 
                onKeyUp={handleKeyUp} 
                placeholder="Pregunta sobre una especie..." 
                className="chat-field" 
                disabled={isLoading} 
              />
              <button className="chat-submit" onClick={sendMessage} disabled={!inputMessage.trim() || isLoading}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AiChatSidebar;
