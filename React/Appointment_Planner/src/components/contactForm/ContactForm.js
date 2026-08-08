import React from "react";

export const ContactForm = ({
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  handleSubmit,
  isDuplicate
}) => {
  return (
    <>
      <form id="contact-form" onSubmit={handleSubmit}>
        <label>
          Name:
          <input 
            type="text"
            name="name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="true" />
        </label>

        {isDuplicate && <p className="warning">Name already exists</p>}

        <label>
          Phone:
          <input 
            type="tel"
            name="phone"
            value={phone} 
            pattern="^[2-9]\d{2}-\d{3}-\d{4}$"
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="true"/>
        </label>
        <label>
          Email:
          <input 
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="true" />
        </label>
        <button 
          type="submit" 
          name="submit">Submit</button>
      </form>
    </>
  );
};

