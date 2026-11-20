import { useLanguage } from "@/hooks/useLanguage";

const rowFields = [
  [
    { label: "Name", placeholder: "Your name", name: "name", type: "text", autoComplete: "name" },
    { label: "Email", placeholder: "you@email.com", name: "email", type: "email", autoComplete: "email" },
  ],
  [
    { label: "Phone", placeholder: "+90 5xx xxx xx xx", name: "phone", type: "tel", inputMode: "tel", autoComplete: "tel", maxLength: 30 },
    { label: "Project", placeholder: "What are you building?", name: "project", type: "text", maxLength: 160 },
  ],
];

const labelClass = "text-[10px] leading-none font-black tracking-[0.16em] text-black/40 uppercase transition-colors duration-300 group-focus-within:text-primary";
const fieldClass = "group grid gap-2.5 border-b border-black/10 py-3.5 transition-colors duration-300 hover:border-black/25 focus-within:border-black/35";
const inputClass = "h-9 w-full bg-transparent text-[15px] leading-none font-semibold tracking-[-0.01em] text-black outline-none placeholder:text-black/28 md:text-base";

function Field({ className, label, placeholder, multiline, ...props }) {
  const { t } = useLanguage();
  const Control = multiline ? "textarea" : "input";
  return (
    <label className={`${className} overflow-hidden`}>
      <span data-contact-field-reveal className="grid gap-2.5">
        <span className={labelClass}>{t(label)}</span>
        <Control className={multiline ? "min-h-28 w-full resize-none bg-transparent text-[15px] leading-tight font-semibold tracking-[-0.01em] text-black outline-none placeholder:text-black/28 md:min-h-32 md:text-base" : inputClass} placeholder={t(placeholder)} required {...props} />
      </span>
    </label>
  );
}

export default function ContactFields() {
  return (
    <>
      {rowFields.map(row => (
        <div key={row[0].name} className="grid md:grid-cols-2">
          {row.map((field, index) => (
            <Field key={field.name} {...field} className={`${fieldClass} ${index === 0 ? "md:border-r md:pr-5" : "md:pl-5"}`} />
          ))}
        </div>
      ))}
      <Field multiline name="message" label="Project details / Message"
        placeholder="Tell me more about your project and what you need..."
        className="contact-message group grid gap-2.5 py-3.5 transition-colors duration-300 md:py-4" />
    </>
  );
}
