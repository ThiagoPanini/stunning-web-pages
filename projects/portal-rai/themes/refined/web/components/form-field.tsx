// A field of the contact form (rf-input), with its label above: a dark field with a 1px border that shows
// on hover, its placeholder in the media marks' gray, and a focus ring closer than the page's. 48px tall
// at least; the message is a text area 132px tall at least, which takes the height left in its column.
const FIELD =
  "w-full rounded-10 border border-transparent bg-field px-4 py-3 text-16 text-bright tracking-tight-10 placeholder:text-mark hover:border-field-border focus-visible:outline-offset-field";

const LABEL = "font-medium text-13 text-muted tracking-tight-10";

type FormFieldProps = {
  id: string;
  label: string;
  name: string;
  placeholder: string;
  // A one-line field of this type, or the message's text area.
  type?: "text" | "email" | "message";
  autoComplete?: string;
};

export function FormField({
  id,
  label,
  name,
  placeholder,
  type = "text",
  autoComplete,
}: FormFieldProps) {
  if (type === "message") {
    return (
      <div className="flex flex-auto flex-col gap-2">
        <label className={LABEL} htmlFor={id}>
          {label}
        </label>
        <textarea
          id={id}
          className={`${FIELD} min-h-33 flex-auto resize-y`}
          name={name}
          rows={5}
          placeholder={placeholder}
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <label className={LABEL} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`${FIELD} min-h-12`}
        type={type}
        name={name}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
    </div>
  );
}
