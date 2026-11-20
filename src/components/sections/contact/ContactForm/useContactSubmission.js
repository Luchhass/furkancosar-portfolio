import { useRef, useState } from "react";
import { CONTACT_FIELDS, readContactFields } from "@/lib/contactFields";

export default function useContactSubmission() {
  const submitting = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting.current) return;
    submitting.current = true;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = readContactFields(field => formData.get(field));

    setIsSubmitting(true);
    const requestStartedAt = performance.now();

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      const remainingSpinnerTime = 420 - (performance.now() - requestStartedAt);
      if (remainingSpinnerTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingSpinnerTime));
      }

      if (!response.ok) {
        throw new Error(data.message || "Message could not be sent.");
      }

      form.reset();
      setCompletion(0);
      setIsSent(true);
    } catch (error) {
      setModal(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  function handleInput(event) {
    const data = new FormData(event.currentTarget);
    const filled = Object.values(readContactFields(field => data.get(field))).filter(Boolean).length;
    setCompletion(filled / CONTACT_FIELDS.length);
  }

  return { completion, isSent, isSubmitting, modal, setIsSent, setModal, handleInput, handleSubmit };
}
