import React from 'react';
import '../css/Contact.css';

const Contact = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '256706576928';
    const message = 'Hello Kashani FC! 👋 I would like to know more about the team, upcoming matches, and how to support. Thank you! ⚽';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>If you have any questions, feedback, or partnership inquiries, feel free to get in touch with us.</p>

      <div className="contact-details">
        <div className="contact-info">
          <h2>Our Office</h2>
          <p><strong>Location:</strong> Kampala, Uganda</p>
          <p><strong>Phone:</strong> +256 764 990 740</p>
          <p><strong>Email:</strong> info@kashanifc.com</p>
        </div>

        <div className="contact-form">
          <h2>Send a Message</h2>
          <form>
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="email" name="email" placeholder="Your Email" required />
            <textarea name="message" placeholder="Your Message" rows="5" required />
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <button className="whatsapp-float-btn" onClick={handleWhatsAppClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-whatsapp"
        >
          <path d="M21 12.79a9 9 0 1 1-1.74-2.88l.38-.85a1 1 0 0 1 1.76.84l-.38.85a9 9 0 0 1-1.74 2.88z"></path>
          <path d="M16 12s-1 1-2 1-2-1-2-1"></path>
          <path d="M12 16s-1-1-2-1-2 1-2 1"></path>
          <path d="M10 10s-1 1-2 1-2-1-2-1"></path>
          <path d="M8 8s-1 1-2 1-2-1-2-1"></path>
          <path d="M14.5 10.5s-1 1-2 1-2-1-2-1"></path>
          <path d="M12 21.8c-.3 0-.6-.1-.8-.3l-1.9-1.3c-.2-.1-.5-.2-.7-.2h0c-.2 0-.4 0-.6.1l-1.9 1.3c-.2.1-.5.2-.7.2-.6 0-1-.5-1-1v-1.9c0-.2 0-.4.1-.6l1.3-1.9c.1-.2.2-.5.2-.7v0c0-.2-.1-.4-.1-.6l-1.3-1.9c-.1-.2-.2-.5-.2-.7-.1-.6.3-1 1-1h1.9c.2 0 .4 0 .6.1l1.9 1.3c.2.1.5.2.7.2v0c.2 0 .4-.1.6-.1l1.9-1.3c.2-.1.5-.2.7-.2.6 0 1 .5 1 1v1.9c0 .2 0 .4-.1.6l-1.3 1.9c-.1.2-.2.5-.2.7v0c0 .2.1.4.1.6l1.3 1.9c.1.2.2.5.2.7.1.6-.3 1-1 1z"></path>
        </svg>
      </button>
    </div>
  );
};

export default Contact;
