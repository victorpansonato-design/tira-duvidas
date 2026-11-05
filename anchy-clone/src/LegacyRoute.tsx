import App from "./App";
import { ConversationProvider } from "./Chat";
export default function LegacyRoute() {
  return (
    <ConversationProvider>
      <App />
    </ConversationProvider>
  );
}
