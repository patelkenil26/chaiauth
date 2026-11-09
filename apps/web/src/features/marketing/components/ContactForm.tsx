"use client";

import { useState } from "react";

// No backend endpoint yet: the form opens the user's mail client.
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`ChaiAuth enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:hello@chaiauth.com?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={onSubmit} className="ca-glass space-y-4 rounded-2xl p-6 sm:p-8">
      <div>
        <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
        <input id="c-name" required className="ca-input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
        <input id="c-email" type="email" required className="ca-input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="c-msg" className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
        <textarea
          id="c-msg"
          required
          rows={5}
          className="ca-input !h-auto py-3"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <button type="submit" className="ca-btn ca-btn-primary w-full">Send message</button>
    </form>
  );
}
