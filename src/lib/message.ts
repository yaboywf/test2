type MessageType = "error" | "success";
export type Message = {
    id: number;
    text: string;
    type: MessageType;
};

type Listener = (messages: Message[]) => void;
let messages: Message[] = [];
const listeners = new Set<Listener>();

const notify = () => listeners.forEach(l => l(messages));
export const showMessage = (text: string, type: MessageType = "error") => {
    const id = Date.now();
    messages = [...messages, { id, text, type }];
    notify();

    setTimeout(() => {
        messages = messages.filter(m => m.id !== id);
        notify();
    }, 5000);
}

export const subscribeMessages = (listener: Listener) => {
    listeners.add(listener);
    listener(messages);
    return () => {
        listeners.delete(listener);
    };
}