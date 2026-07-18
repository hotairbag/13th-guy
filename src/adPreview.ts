const adPreview = document.querySelector("#ad-preview") as HTMLDivElement;
const adContext = document.querySelector(
    "#ad-preview-context",
) as HTMLParagraphElement;
const countdownLabel = document.querySelector(
    "#ad-preview-timer-label",
) as HTMLSpanElement;
const countdownValue = document.querySelector(
    "#ad-preview-timer-value",
) as HTMLElement;

let hideTimer: ReturnType<typeof setTimeout> | undefined;
let countdownTimer: ReturnType<typeof setInterval> | undefined;

interface AdPreviewOptions {
    duration?: number;
    onComplete?: () => void;
    context?: string;
    countdownLabel?: string;
}

export const hideAdPreview = (): void => {
    if (hideTimer) clearTimeout(hideTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    hideTimer = undefined;
    countdownTimer = undefined;
    adPreview.classList.remove("is-visible");
    adPreview.hidden = true;
};

export const showAdPreview = ({
    duration = 5500,
    onComplete,
    context = "GAME BREAK",
    countdownLabel: label = "CONTINUING IN",
}: AdPreviewOptions = {}): void => {
    hideAdPreview();

    adContext.textContent = context;
    countdownLabel.textContent = label;
    const endTime = performance.now() + duration;
    const updateCountdown = (): void => {
        countdownValue.textContent = Math.max(
            0,
            Math.ceil((endTime - performance.now()) / 1000),
        ).toString();
    };

    adPreview.hidden = false;
    requestAnimationFrame(() => adPreview.classList.add("is-visible"));
    updateCountdown();
    countdownTimer = setInterval(updateCountdown, 200);
    hideTimer = setTimeout(() => {
        hideAdPreview();
        onComplete?.();
    }, duration);
};
