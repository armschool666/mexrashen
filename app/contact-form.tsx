"use client";

import { useState } from "react";

interface Props {
  labels: {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    sent: string;
  };
  recipientEmail: string;
}

/**
 * Открывает почтовый клиент пользователя с подготовленным письмом.
 * Это намеренное поведение: реальная отправка с сервера потребовала бы
 * SMTP-сервис (Resend/Nodemailer). Пока школе достаточно mailto-flow.
 */
export function ContactForm({ labels, recipientEmail }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "preparing" | "opened">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("preparing");

    const subject = encodeURIComponent(
      name ? `Հաղորդագրություն — ${name}` : "Հաղորդագրություն կայքից",
    );
    const lines = [
      name ? `Անուն: ${name}` : "",
      email ? `Էլ. փոստ: ${email}` : "",
      "",
      message,
    ].filter((line, i) => i > 1 || line);
    const body = encodeURIComponent(lines.join("\n"));

    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    setStatus("opened");
  }

  if (status === "opened") {
    return <p className="contact-sent">{labels.sent}</p>;
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <label>
        {labels.name}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={labels.namePlaceholder}
          autoComplete="name"
        />
      </label>

      <label>
        {labels.email}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={labels.emailPlaceholder}
          autoComplete="email"
        />
      </label>

      <label>
        {labels.message}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={labels.messagePlaceholder}
          required
        />
      </label>

      <button type="submit" disabled={status === "preparing" || !message.trim()}>
        {status === "preparing" ? labels.sending : labels.send}
      </button>
    </form>
  );
}
