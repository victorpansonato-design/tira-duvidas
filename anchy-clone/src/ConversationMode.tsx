import { Keyboard, Mic } from "lucide-react";
import { motion } from "motion/react";
export type ConversationMode = "voice" | "text";
export function ConversationModeSwitch({
  mode,
  onChange,
  reduced,
}: {
  mode: ConversationMode;
  onChange: (mode: ConversationMode) => void;
  reduced: boolean;
}) {
  return (
    <div className="td-mode-switch" role="group" aria-label="Modo de conversa">
      {(["voice", "text"] as const).map((value) => {
        const Icon = value === "voice" ? Mic : Keyboard;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => onChange(value)}
          >
            {mode === value ? (
              <motion.span
                className="td-mode-active"
                layoutId="td-conversation-mode"
                transition={{
                  type: "spring",
                  bounce: 0,
                  duration: reduced ? 0 : 0.3,
                }}
              />
            ) : null}
            <Icon size={17} />
            <span>{value === "voice" ? "Voz" : "Texto"}</span>
          </button>
        );
      })}
    </div>
  );
}
