import { createSignal, onMount } from "solid-js";
import SelfMessage from "~/components/selfMessage";

export type Message = {
  id: string;
  content: string;
  recipient: string;
}

export default function Home() {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [identity, setIdentity] = createSignal("");
  const [input, setInput] = createSignal("");
  const [socket, setSocket] = createSignal<WebSocket | null>(null);

  const connectToServer = async () => {
    const ws = new WebSocket("/chatter");
    console.log("Connecting to server...")

    ws.onopen = () => {
      console.log("Connected to server");
    };

    ws.onmessage = (event) => {
      console.log("Received message from server: ", event.data)
      switch (event.data as string) {
        case "!FRAMES": {
          ws.send(JSON.stringify(messages()))
          break
        }
        default: {
          setMessages(JSON.parse(event.data))
        }
      }
    }

    setSocket(ws);
  }

  const handleSend = () => {
    const msg = {
      id: identity(),
      content: input(),
      recipient: "all",
    };
    if (msg.content === "") return;
    setMessages([...messages(), msg]);
    setInput("");
    socket()?.send(JSON.stringify(messages()));
  };

  onMount(() => {
    const id = localStorage.getItem("identity");
    if (id) {
      setIdentity(id);
    } else {
      const id = Math.random().toString(36).substring(7);
      localStorage.setItem("identity", id);
      setIdentity(id);
    }
    connectToServer();
  });

  return (
    <main class="bg-stone-200 min-h-screen min-w-screen flex flex-col items-center justify-center p-4">
      <div class="bg-white w-full shadow-lg rounded-lg p-4 grid grid-flow-row grid-cols-2 space-y-2 h-3/4 overflow-y-auto">
        {messages().map((msg, index) => {
          if (msg.id === identity()) {
            return (
              <>
                <div></div>
                <SelfMessage msg={msg} />
              </>
            );
          } else {
            return (
              <>
                <div class="bg-green-600 text-white p-2 rounded">
                  {msg.content}
                </div>
                <div></div>
              </>
            );
          }
        })}
      </div>
      <div class="w-full max-w-md flex mt-4 bottom-5 sticky">
        <input
          class="flex-1 p-2 border border-gray-300 rounded-l-lg shadows"
          type="text"
          value={input()}
          onInput={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          class="bg-blue-500 text-white p-2 rounded-r-lg"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </main>
  );
}
