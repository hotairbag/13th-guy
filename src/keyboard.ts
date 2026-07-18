/*
 * Copyright (c) 2024 Tero Jäntti, Sami Heikkinen
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {
    playTune,
    SFX_KB,
    // Ignore lint errors from JS import
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
} from "./sfx/sfx.js";

// These must match the definitions in KeyboardEvent.code
export type Key =
    | "ArrowLeft"
    | "ArrowRight"
    | "ArrowUp"
    | "ArrowDown"
    | "KeyW"
    | "KeyA"
    | "KeyS"
    | "KeyD";

type KeysMutable = Record<Key, boolean>;

export type Keys = Readonly<KeysMutable>;

const createKeys = (): KeysMutable => ({
    ["ArrowLeft"]: false,
    ["ArrowRight"]: false,
    ["ArrowUp"]: false,
    ["ArrowDown"]: false,
    ["KeyW"]: false,
    ["KeyA"]: false,
    ["KeyS"]: false,
    ["KeyD"]: false,
});

let keys: KeysMutable = createKeys();

type ActionListener = () => void;

const actionListeners = new Set<ActionListener>();
let hasRegisteredInputWaiter = false;
let pendingInitialVirtualAction = false;

const onKeyDown = (event: KeyboardEvent): void => {
    if (event.code in keys) {
        keys[event.code as Key] = true;
    }
};

const onKeyUp = (event: KeyboardEvent): void => {
    if (event.code in keys) {
        keys[event.code as Key] = false;
    }
};

export const initializeKeyboard = (): void => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", () => {
        keys = createKeys();
    });
};

export const setVirtualDirection = (x: number, y: number): void => {
    const deadZone = 0.22;

    keys.ArrowLeft = x < -deadZone;
    keys.ArrowRight = x > deadZone;
    keys.ArrowUp = y < -deadZone;
    keys.ArrowDown = y > deadZone;
};

export const releaseVirtualDirection = (): void => {
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    keys.ArrowUp = false;
    keys.ArrowDown = false;
};

export const triggerVirtualAction = (): void => {
    if (actionListeners.size === 0) {
        if (!hasRegisteredInputWaiter) pendingInitialVirtualAction = true;
        return;
    }

    playTune(SFX_KB);
    actionListeners.forEach((listener) => listener());
};

const waitForInput = (enterOnly: boolean): Promise<void> => {
    return new Promise((resolve) => {
        const finish = (): void => {
            window.removeEventListener("keydown", keyboardListener);
            actionListeners.delete(actionListener);
            resolve();
        };
        const keyboardListener = (event: KeyboardEvent): void => {
            if (!enterOnly || event.code === "Enter") {
                playTune(SFX_KB);
                finish();
            }
        };
        const actionListener = (): void => finish();

        hasRegisteredInputWaiter = true;
        window.addEventListener("keydown", keyboardListener);
        actionListeners.add(actionListener);

        if (pendingInitialVirtualAction) {
            pendingInitialVirtualAction = false;
            queueMicrotask(triggerVirtualAction);
        }
    });
};

export const waitForAnyKey = (): Promise<void> => {
    return waitForInput(false);
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const waitForEnter = (): Promise<void> => {
    return waitForInput(true);
};

export const getKeys = (): Keys => keys;
