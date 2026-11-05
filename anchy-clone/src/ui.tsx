import { createContext, useContext, useEffect, useState } from "react";
import type { ButtonHTMLAttributes, ImgHTMLAttributes } from "react";
import {
  ChevronLeft,
  Sun,
  Moon,
  Mic,
  Keyboard,
  MessageCircle,
} from "lucide-react";
import { motion } from "motion/react";

export const discipline = "Comunicação e Assertividade";
export const disclaimer =
  "A Anchy responde só com o material oficial da disciplina e pode errar. Confira o que for importante.";
export type Mode = "voice" | "text";
export type Tool = "mindmap" | "quiz" | "cards";
export const ThemeContext = createContext({
  dark: true,
  toggle: (_x?: number, _y?: number) => {},
});
export function useMobile() {
  const [mobile, setMobile] = useState(
    () => matchMedia("(max-width:1023px)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(max-width:1023px)");
    const change = () => setMobile(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  return mobile;
}
export const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anchy-blue";
export function Owl({
  className = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const { dark } = useContext(ThemeContext);
  return (
    <img
      alt="Anchy, a coruja tutora"
      draggable={false}
      {...props}
      className={"object-contain shrink-0 select-none " + className}
      src={
        "/assets/" +
        (dark ? "logo_dark_mode-CS6ykYrL.png" : "logo-BxiGImZO.png")
      }
    />
  );
}
export function Logo({ className = "h-7" }) {
  return (
    <img
      alt="UniAnchieta"
      src="/assets/logo-unianchieta-Cqc7_wQ6.webp"
      className={className + " w-auto object-contain"}
    />
  );
}
export function ThemeButton({ plain = false }: { plain?: boolean }) {
  const { dark, toggle } = useContext(ThemeContext);
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      aria-label={"Usar tema " + (dark ? "claro" : "escuro")}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        toggle(rect.x + rect.width / 2, rect.y + rect.height / 2);
      }}
      className={
        "w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink hover:bg-surface-2 transition-colors " +
        (plain ? "" : "bg-transparent lg:bg-surface")
      }
    >
      <Icon size={20} />
    </button>
  );
}
export function BackHome({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Trocar o tipo de dúvida"
      onClick={onClick}
      className={
        "h-11 lg:h-12 w-11 lg:w-auto shrink-0 lg:px-5 rounded-full inline-flex items-center justify-center gap-2 bg-surface border border-line text-link text-base font-semibold hover:bg-surface-2 transition-colors " +
        focus
      }
    >
      <ChevronLeft size={20} />
      <span className="hidden lg:inline">Trocar tipo de dúvida</span>
    </button>
  );
}
export function Primary({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={
        "h-[52px] px-7 rounded-full inline-flex items-center justify-center gap-2.5 bg-anchy-blue text-on-blue text-base font-bold hover:brightness-[0.92] disabled:opacity-45 disabled:pointer-events-none transition-[filter] " +
        focus +
        " " +
        className
      }
    />
  );
}
export function Ask({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "h-11 px-5 rounded-full inline-flex items-center justify-center gap-2 bg-surface border border-line text-[15px] font-semibold hover:bg-surface-2 text-link " +
        focus +
        " " +
        className
      }
    >
      <MessageCircle size={18} />
      Perguntar à Anchy sobre isto
    </button>
  );
}
export function ModeSwitch({
  mode,
  onChange,
  wide = false,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
  wide?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Modo de conversa"
      className={
        "flex h-12 p-1 rounded-full bg-surface " +
        (wide ? "w-full" : "w-[220px]")
      }
    >
      {(["voice", "text"] as const).map((item) => {
        const Icon = item === "voice" ? Mic : Keyboard;
        return (
          <button
            key={item}
            type="button"
            aria-pressed={mode === item}
            onClick={() => onChange(item)}
            className={
              "relative flex-1 flex items-center justify-center gap-2 rounded-full text-base font-semibold transition-colors duration-[var(--dur-slow)] " +
              (mode === item ? "text-on-blue" : "text-ink hover:text-link")
            }
          >
            {mode === item ? (
              <motion.span
                layoutId={wide ? "mode-mobile" : "mode-desktop"}
                className="absolute inset-0 rounded-full bg-anchy-blue"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            ) : null}
            <Icon className="relative w-[18px] h-[18px]" />
            <span className="relative">
              {item === "voice" ? "Voz" : "Texto"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
