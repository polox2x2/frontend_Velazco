import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

export const initChatbot = () => {
    createChat({
        webhookUrl: 'http://localhost:5678/webhook/969bbc6e-e815-4f82-b856-dc903690a4ab/chat',
        showWelcomeScreen: false,
    });
};

// Initialize the chatbot when the module loads
initChatbot();
