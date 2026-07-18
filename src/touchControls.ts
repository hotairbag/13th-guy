import {
    releaseVirtualDirection,
    setVirtualDirection,
    triggerVirtualAction,
} from "./keyboard";

const joystick = document.querySelector("#joystick") as HTMLDivElement;
const knob = document.querySelector("#joystick-knob") as HTMLDivElement;
const actionButton = document.querySelector(
    "#action-button",
) as HTMLButtonElement;
const touchControls = document.querySelector(
    "#touch-controls",
) as HTMLDivElement;
const publisherLogo = document.querySelector(
    "#publisher-logo",
) as HTMLDivElement;

const touchCapable =
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(hover: none), (pointer: coarse)").matches;

touchControls.style.display = touchCapable ? "block" : "none";

export const setActionButtonVisible = (visible: boolean): void => {
    actionButton.classList.toggle("is-hidden", !visible);
    actionButton.disabled = !visible;
};

export const setStartBrandVisible = (visible: boolean): void => {
    publisherLogo.classList.toggle("is-hidden", !visible);
};

let activePointer: number | null = null;

const resetJoystick = (): void => {
    activePointer = null;
    knob.style.transform = "translate3d(0, 0, 0)";
    joystick.classList.remove("is-active");
    releaseVirtualDirection();
};

const updateJoystick = (event: PointerEvent): void => {
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxDistance = rect.width * 0.32;
    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;
    const distance = Math.hypot(rawX, rawY);
    const scale = distance > maxDistance ? maxDistance / distance : 1;
    const x = rawX * scale;
    const y = rawY * scale;

    knob.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    setVirtualDirection(x / maxDistance, y / maxDistance);
};

joystick.addEventListener("pointerdown", (event) => {
    if (activePointer !== null) return;

    activePointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    joystick.classList.add("is-active");
    updateJoystick(event);
    event.preventDefault();
});

joystick.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activePointer) return;
    updateJoystick(event);
    event.preventDefault();
});

const releasePointer = (event: PointerEvent): void => {
    if (event.pointerId !== activePointer) return;
    resetJoystick();
    event.preventDefault();
};

joystick.addEventListener("pointerup", releasePointer);
joystick.addEventListener("pointercancel", releasePointer);
joystick.addEventListener("lostpointercapture", resetJoystick);

actionButton.addEventListener("click", (event) => {
    event.preventDefault();
    triggerVirtualAction();
});

window.addEventListener("blur", resetJoystick);
document.addEventListener("visibilitychange", () => {
    if (document.hidden) resetJoystick();
});
