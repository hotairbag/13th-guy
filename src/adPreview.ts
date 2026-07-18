const adPreview = document.querySelector("#ad-preview") as HTMLDivElement;

let hideTimer: ReturnType<typeof setTimeout> | undefined;

export const hideAdPreview = (): void => {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = undefined;
    adPreview.classList.remove("is-visible");
    adPreview.hidden = true;
};

export const showAdPreview = (duration = 5500): void => {
    if (hideTimer) clearTimeout(hideTimer);

    adPreview.hidden = false;
    requestAnimationFrame(() => adPreview.classList.add("is-visible"));
    hideTimer = setTimeout(hideAdPreview, duration);
};
