import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import CreatePoll from "./Pages/CreatePoll";
import PollApp from "./Pages/PollApp";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <CreatePoll />
      <PollApp />
    </>
  );
}

export default App;
