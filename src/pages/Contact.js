import React from 'react';
import '../css/Contact.css';

const Contact = () => {
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
    </div>
  );
};

export default Contact;
