import React, { useState, useEffect } from 'react';
import '../css/Chatbot.css';

const faqData = [
  {
    question: "Greeting",
    keywords: ["hello", "hi", "hey", "how are you", "whats up", "good morning", "good afternoon", "good evening", "hallo"],
    answer: "Hello there! How can I assist you today?"
  },
  {
    question: "Thank you",
    keywords: ["thank you", "thanks", "cheers", "appreciate it"],
    answer: "You're most welcome! Is there anything else I can help you with?"
  },
  {
    question: "When is the next match?",
    keywords: ["next match", "upcoming game", "fixtures", "schedule", "when", "next game"],
    answer: "Our next match details are usually updated on the Fixtures page. Please check there for the latest schedule!"
  },
  {
    question: "How can I join the team?",
    keywords: ["join team", "tryouts", "become a player", "how to play", "join", "recruitment"],
    answer: "For information on joining Kashani FC, please visit our Players or Management page, or reach out via the contact form. We're always looking for talented players!"
  },
  {
    question: "Where is your office located?",
    keywords: ["office location", "address", "where are you", "location", "venue"],
    answer: "Our office is located in Kampala, Uganda. We train at various locations in the city, which are updated regularly on our social media."
  },
  {
    question: "What is your contact email?",
    keywords: ["email", "contact email", "send email", "mail", "contact"],
    answer: "You can reach us at info@kashanifc.com. We typically respond within 24 hours."
  },
  {
    question: "What is your phone number?",
    keywords: ["phone number", "call us", "contact number", "phone", "call"],
    answer: "You can call us at +256 764 990 740. Our office hours are Monday to Friday, 9 AM to 5 PM."
  },
  {
    question: "How can I support Kashani FC?",
    keywords: ["support", "donate", "sponsor", "help out", "contribute"],
    answer: "Thank you for your interest in supporting Kashani FC! You can support us through sponsorship, donations, or by attending our matches. Please visit our Contact page or reach out to us directly to discuss support options."
  },
  {
    question: "What are your training times?",
    keywords: ["training", "practice", "training schedule", "practice times"],
    answer: "Our training schedule varies by team and season. Please check our social media or contact us directly for the current training schedule."
  },
  {
    question: "Do you have a youth team?",
    keywords: ["youth team", "junior team", "young players", "youth program"],
    answer: "Yes, we have a youth development program! We're committed to nurturing young talent. Please contact us for more information about our youth teams and programs."
  },
  {
    question: "Where can I buy tickets?",
    keywords: ["tickets", "buy tickets", "match tickets", "entry", "admission"],
    answer: "Match tickets can be purchased at the venue on match day or through our official social media channels. Prices and availability are announced before each match."
  },
  {
    question: "What are your team colors?",
    keywords: ["team colors", "jersey colors", "uniform", "kit"],
    answer: "Our team colors are gold and black, representing our strength and excellence on the field."
  }
];

const quickQuestions = [
  "When is the next match?",
  "How can I join?",
  "Where are you located?",
  "How can I support?"
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hello! I\'m your Kashani FC assistant. How can I help you today?',
      quickReplies: quickQuestions,
      id: Date.now() // Unique ID for each message
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Add animation classes
  useEffect(() => {
    const chatbotWindow = document.querySelector('.chatbot-window');
    if (chatbotWindow) {
      if (isOpen) {
        chatbotWindow.classList.add('open');
        chatbotWindow.classList.remove('closed');
      } else {
        chatbotWindow.classList.add('closed');
        chatbotWindow.classList.remove('open');
      }
    }
  }, [isOpen]);

  const handleFeedback = (messageId, feedbackType) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, feedbackGiven: feedbackType } : msg
      )
    );
    console.log(`Feedback for message ${messageId}: ${feedbackType}`);
    // In a real application, you'd send this feedback to a backend
  };

  const findBestMatch = (userInput) => {
    const lowerCaseInput = userInput.toLowerCase();
    let bestMatch = null;
    let highestMatchCount = 0;

    for (const faq of faqData) {
      const matchCount = faq.keywords.filter(keyword => 
        lowerCaseInput.includes(keyword.toLowerCase())
      ).length;

      if (matchCount > highestMatchCount) {
        highestMatchCount = matchCount;
        bestMatch = faq;
      }
    }

    return highestMatchCount > 0 ? bestMatch : null;
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage, id: Date.now() }]);

    setInput('');
    setIsTyping(true); // Show typing indicator

    const matchedFAQ = findBestMatch(userMessage);
    let botResponse = "I'm sorry, I don't understand that question yet. Please try rephrasing or ";
    let showHumanHandOff = true;

    if (matchedFAQ) {
      botResponse = matchedFAQ.answer;
      showHumanHandOff = false;
    }

    setTimeout(() => {
      setIsTyping(false); // Hide typing indicator
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: botResponse,
        quickReplies: quickQuestions,
        showFeedback: true, // Mark this message for feedback
        showHumanHandOff: showHumanHandOff,
        id: Date.now()
      }]);
    }, 1000); // Simulate bot typing delay
  };

  const handleQuickReply = (question) => {
    setInput(question);
    handleSendMessage();
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
            <button className="chatbot-close-btn" onClick={toggleChatbot}>✖</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.text}
                {msg.sender === 'bot' && msg.showFeedback && !msg.feedbackGiven && (
                  <div className="feedback-buttons">
                    <span>Was this helpful?</span>
                    <button className="feedback-btn" onClick={() => handleFeedback(msg.id, 'positive')}>👍</button>
                    <button className="feedback-btn" onClick={() => handleFeedback(msg.id, 'negative')}>👎</button>
                  </div>
                )}
                {msg.sender === 'bot' && msg.feedbackGiven && (
                  <div className="feedback-given">
                    Thank you for your feedback!
                  </div>
                )}
                {msg.sender === 'bot' && msg.showHumanHandOff && (
                  <div className="human-handoff">
                    <span>You can also <a href="/contact" target="_blank" rel="noopener noreferrer">contact us directly</a>.</span>
                  </div>
                )}
                {msg.quickReplies && (
                  <div className="quick-replies">
                    {msg.quickReplies.map((question, qIndex) => (
                      <button
                        key={qIndex}
                        className="quick-reply-btn"
                        onClick={() => handleQuickReply(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="message bot typing-indicator">
                <span>Kashani FC Assistant is typing...</span>
              </div>
            )}
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