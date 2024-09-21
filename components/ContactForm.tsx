import React, { useState } from "react";

interface FormData {
  name: string;
  class: string;
  subject: string;
  phone: string;
  email: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    class: "",
    subject: "",
    phone: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simple form validation
    if (
      !formData.name ||
      !formData.class ||
      !formData.subject ||
      !formData.phone ||
      !formData.email ||
      !formData.message
    ) {
      alert("Please fill out all fields.");
      return;
    }

    // Submit logic here (e.g., send data to a server)
    setSubmitted(true);
    console.log("Form submitted", formData);
    setFormData({
      name: "",
      class: "",
      subject: "",
      phone: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto my-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter your name"
          />
        </div>

        {/* Class */}
        <div>
          <label
            htmlFor="class"
            className="block text-sm font-medium text-gray-700"
          >
            Class
          </label>
          <input
            type="text"
            name="class"
            id="class"
            value={formData.class}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter your class"
          />
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700"
          >
            Subject
          </label>
          <input
            type="text"
            name="subject"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter subject"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter your phone number"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter your email"
          />
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700"
          >
            Message
          </label>
          <input
            type="message"
            name="message"
            id="message"
            value={formData.message}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 "
            placeholder="Enter your message"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-[#7C6EDB] text-white font-bold py-2 px-4 rounded hover:bg-[#6255C3] transition"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Confirmation message after submission */}
      {submitted && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          <p>Form submitted successfully!</p>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
