import { useId, useRef } from "react";
import "./CodeBox.css";

export default function CodeBox({ value, onChange, length = 6, disabled = false, id }) {
  const generatedId = useId();
  const inputRefs = useRef([]);
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, length).split("");
  const boxes = Array.from({ length }, (_, index) => digits[index] ?? "");
  const inputId = (index) => {
    const baseId = id || generatedId;
    return index === 0 ? baseId : `${baseId}-${index + 1}`;
  };

  const updateDigit = (index, digit) => {
    const next = [...boxes];
    next[index] = digit;
    onChange(next.join(""));
  };

  const handleChange = (index, event) => {
    const entered = event.currentTarget.value.replace(/\D/g, "");
    if (!entered) {
      updateDigit(index, "");
      return;
    }

    const start = entered.length > 1 ? 0 : index;
    const next = [...boxes];
    entered.slice(0, length - start).split("").forEach((digit, offset) => {
      next[start + offset] = digit;
    });
    onChange(next.join(""));
    inputRefs.current[Math.min(start + entered.length, length) - 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (/^\d$/.test(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      updateDigit(index, event.key);
      inputRefs.current[Math.min(index + 1, length - 1)]?.focus();
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      if (boxes[index]) updateDigit(index, "");
      if (index > 0) inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index, event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    event.preventDefault();
    const start = pasted.length >= length ? 0 : index;
    const next = [...boxes];
    pasted.slice(0, length - start).split("").forEach((digit, offset) => {
      next[start + offset] = digit;
    });
    onChange(next.join(""));
    inputRefs.current[Math.min(start + pasted.length, length) - 1]?.focus();
  };

  return (
    <div
      className="code-box__group"
      style={{ "--code-box-length": length }}
      role="group"
      aria-label="Verification code"
    >
      {boxes.map((digit, index) => (
        <input
          key={inputId(index)}
          ref={(element) => { inputRefs.current[index] = element; }}
          id={inputId(index)}
          className="code-box__input"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          aria-label={`Digit ${index + 1} of ${length}`}
          value={digit}
          disabled={disabled}
          autoFocus={index === 0}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
        />
      ))}
    </div>
  );
}
