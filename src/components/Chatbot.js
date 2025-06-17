import React, { useState } from 'react';
import '../css/Chatbot.css';

const faqData = [
  {
    question: "When is the next match?",
    keywords: ["next match", "upcoming game", "fixtures", "schedule"],
    answer: "Our next match details are usually updated on the Fixtures page. Please check there for the latest schedule!"
  },
  {
    question: "How can I join the team?",
    keywords: ["join team", "tryouts", "become a player", "how to play"],
    answer: "For information on joining Kashani FC, please visit our Players or Management page, or reach out via the contact form."
  },
  {
    question: "Where is your office located?",
    keywords: ["office location", "address", "where are you"],
    answer: "Our office is located in Kampala, Uganda."
  },
  {
    question: "What is your contact email?",
    keywords: ["email", "contact email", "send email"],
    answer: "You can reach us at info@kashanifc.com."
  },
  {
    question: "What is your phone number?",
    keywords: ["phone number", "call us", "contact number"],
    answer: "You can call us at +256 764 990 740."
  },
  {
    question: "How can I support Kashani FC?",
    keywords: ["support", "donate", "sponsor", "help out"],
    answer: "Thank you for your interest in supporting Kashani FC! Please visit our Contact page or reach out to us directly to discuss support options."
  }
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { sender: 'user', text: input.trim() }];
    setMessages(newMessages);

    const lowerCaseInput = input.trim().toLowerCase();
    let botResponse = "I'm sorry, I don't understand that question yet. Please try rephrasing or check our contact page for more specific inquiries.";

    for (const faq of faqData) {
      if (faq.keywords.some(keyword => lowerCaseInput.includes(keyword))) {
        botResponse = faq.answer;
        break;
      }
    }

    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: botResponse }]);
    }, 500);

    setInput('');
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle-btn" onClick={toggleChatbot}>
        {isOpen ? '✖' : '💬'}
      </button>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Kashani FC Assistant</h3>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Ask me a question..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 