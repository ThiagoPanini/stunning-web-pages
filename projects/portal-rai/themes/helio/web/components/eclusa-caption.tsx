// The caption under the Eclusa logo: what each mark of the drawing stands for, in one line that does not
// wrap. Each icon is drawn in the color of its word.
export function EclusaCaption() {
  return (
    <div className="flex flex-nowrap justify-center gap-6 whitespace-nowrap font-mono text-12">
      <div className="flex items-center gap-2 text-red">
        <svg aria-hidden="true" width="8" height="8" viewBox="0 0 8 8" className="block flex-none">
          <path
            d="M1.25 1.25 6.75 6.75 M6.75 1.25 1.25 6.75"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span>ataque</span>
      </div>
      <div className="flex items-center gap-2 text-blue">
        <svg
          aria-hidden="true"
          width="13"
          height="8"
          viewBox="0 0 13 8"
          className="block flex-none"
        >
          <path
            d="M0.5 5.4 A25 25 0 0 1 12.5 5.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
        <span>guardrails</span>
      </div>
      <div className="flex items-center gap-2 text-muted">
        <svg aria-hidden="true" width="9" height="9" viewBox="0 0 9 9" className="block flex-none">
          <circle cx="4.5" cy="4.5" r="3.5" fill="currentColor" />
        </svg>
        <span>agente</span>
      </div>
    </div>
  );
}
