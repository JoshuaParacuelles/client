import { useState, useEffect } from "react";

let _toastSetters = [];
let _toastSeq = 0;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    _toastSetters.push(setToasts);
    return () => { _toastSetters = _toastSetters.filter((s) => s !== setToasts); };
  }, []);
  return toasts;
}

export function pushToast(toast) {
  const id = ++_toastSeq;
  _toastSetters.forEach((set) => set((prev) => [
    ...prev.filter((t) => !(t.title === toast.title && t.message === toast.message)),
    { ...toast, id },
  ]));
}

export function removeToast(id) {
  _toastSetters.forEach((set) => set((prev) => prev.filter((t) => t.id !== id)));
}
