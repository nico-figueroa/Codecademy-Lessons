import React, { useState, useEffect } from "react";

import { ContactForm } from "../../components/contactForm/ContactForm";
import { TileList } from "../../components/tileList/TileList";

export const ContactsPage = ({contacts, addContacts}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !email) return;
    if(!isDuplicate) {
      addContacts(name, phone, email);
      setName("");
      setPhone("");
      setEmail("");
    }
  };

  useEffect(() => {
    const duplicate = contacts.some(contact => contact.name === name);
    setIsDuplicate(duplicate);
  }, [name, contacts]);

  return (
    <div>
      <section>
        <h2>Add Contact</h2>
         <ContactForm
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
            handleSubmit={handleSubmit}
            isDuplicate={isDuplicate}
          /> 
      </section>
      <hr />
      <section>
        <h2>Contacts</h2>
        <TileList tiles={contacts} />
      </section>
    </div>
  );
};
