import { useEffect, useRef } from "react";

export default function OtpInput({
  length = 6,
  value = "",
  onChange,
  onComplete,
  disabled = false,
  invalid = false,
  label = "Enter verification code",
  id = "otp-label",
}) {
  const refs = useRef([]);
  const completedValue = useRef("");
  const activeIndex = Math.min(value.length, length - 1);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (value.length === length && completedValue.current !== value) {
      completedValue.current = value;
      onComplete?.(value);
    } else if (value.length !== length) {
      completedValue.current = "";
    }
  }, [value, length, onComplete]);

  const applyDigits = (index, text) => {
    const digits = text.replace(/\D/g, "");
    if (!digits) return;

    const start = digits.length >= length ? 0 : index;
    const next = value.split("");
    digits.slice(0, length - start).split("").forEach((digit, offset) => {
      next[start + offset] = digit;
    });
    onChange(next.join("").slice(0, length));
    refs.current[Math.min(start + digits.length, length) - 1]?.focus();
  };

  const handleChange = (index, event) => {
    const text = event.currentTarget.value;
    if (!text) {
      onChange(value.slice(0, index) + value.slice(index + 1));
      return;
    }
    applyDigits(index, text);
  };

  const handleKeyDown = (index, event) => {
    if (/^\d$/.test(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      applyDigits(index, event.key);
    } else if (event.key === "Backspace") {
      event.preventDefault();
      if (value[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1));
        refs.current[index]?.focus();
      } else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index));
        refs.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index, event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    applyDigits(index, pasted);
  };

  const handleFocus = (index) => {
    if (index > activeIndex) refs.current[activeIndex]?.focus();
  };

  return (
    <div className="otp-wrap">
      <p id={id} className="otp-label">{label}</p>
      <div className="otp-boxes" role="group" aria-labelledby={id}>
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(element) => { refs.current[index] = element; }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={length}
            className={[
              "otp-box",
              index === activeIndex && !disabled ? "active" : "",
              invalid ? "invalid" : "",
            ].filter(Boolean).join(" ")}
            value={value[index] ?? ""}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
    </div>
  );
}
