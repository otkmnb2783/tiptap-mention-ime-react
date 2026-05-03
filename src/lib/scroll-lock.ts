let lockCount = 0;
let previousBodyOverflow: string | null = null;
let previousBodyPaddingRight: string | null = null;
let previousDocumentOverflow: string | null = null;

export function lockScroll() {
  if (typeof window === "undefined") return;

  if (lockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    previousBodyPaddingRight = document.body.style.paddingRight;
    previousDocumentOverflow = document.documentElement.style.overflow;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }

  lockCount += 1;
}

export function unlockScroll() {
  if (typeof window === "undefined") return;
  if (lockCount === 0) return;

  lockCount -= 1;

  if (lockCount > 0) return;

  document.body.style.overflow = previousBodyOverflow ?? "";
  document.body.style.paddingRight = previousBodyPaddingRight ?? "";
  document.documentElement.style.overflow = previousDocumentOverflow ?? "";

  previousBodyOverflow = null;
  previousBodyPaddingRight = null;
  previousDocumentOverflow = null;
}
