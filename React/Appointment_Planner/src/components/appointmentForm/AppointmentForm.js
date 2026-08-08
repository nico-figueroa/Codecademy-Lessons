import React from "react";
import { ContactPicker } from "../contactPicker/ContactPicker"

const getTodayString = () => {
  const [month, day, year] = new Date()
    .toLocaleDateString("en-US")
    .split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export const AppointmentForm = ({
  contacts,
  name,
  setName,
  contact,
  setContact,
  date,
  setDate,
  time,
  setTime,
  handleSubmit
}) => {

  return (
    <>
      <form id="appointment-form" onSubmit={handleSubmit}>
        <label>
          Name:
          <input 
            type="text"
            name="name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="true" />
        </label>
        <label>
          Date:
          <input 
            type="date"
            name="date"
            value={date}
            min = {getTodayString()}
            onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Time:
          <input 
            type="time"
            name="time"
            value={time}
            onChange={(e) => setTime(e.target.value)} />
        </label>
        <ContactPicker 
          name={name}
          contacts={contacts}
          value={contact}
          onChange={function onChange(e) {setContact(e.target.value)}}
        />
        <button 
          type="submit" 
          name="submit">Submit</button>
      </form>
    </>
  );
};
