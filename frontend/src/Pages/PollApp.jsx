import { useState, useEffect } from "react";

import { Button } from "@nextui-org/react";
import {
  Card,
  CardBody as CardContent,
  CardHeader,
  CardFooter,
} from "@nextui-org/react";

import { io } from "socket.io-client";

const socket = io("https://pollwebappserver-woc.onrender.com"); // Replace with your server URL

export default function PollApp() {
  const [poll, setPoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState(null);

  useEffect(() => {
    const storedVote = JSON.parse(localStorage.getItem("currentPollVote"));

    if (storedVote) {
      setHasVoted(true);
      setVotedOptionId(storedVote.votedOptionId);
    }

    const handleNewPoll = (newPoll) => {
      const storedVote = JSON.parse(localStorage.getItem("currentPollVote"));

      // If this is a new poll, reset voting state
      if (!storedVote || storedVote.pollId !== newPoll.pollId) {
        localStorage.removeItem("currentPollVote");
        setHasVoted(false);
        setVotedOptionId(null);
      }

      setPoll(newPoll);
    };

    const handleVoteUpdate = (updatedPoll) => {
      setPoll(updatedPoll);
    };

    socket.on("new-poll", handleNewPoll);
    socket.on("vote-update", handleVoteUpdate);

    return () => {
      socket.off("new-poll", handleNewPoll);
      socket.off("vote-update", handleVoteUpdate);
    };
  }, []);

  const handleVote = (id) => {
    if (hasVoted || !poll) return;

    // Emit the vote to the server
    socket.emit("vote", { pollId: poll.pollId, optionId: id });

    // Save the vote locally
    localStorage.setItem(
      "currentPollVote",
      JSON.stringify({ pollId: poll.pollId, votedOptionId: id })
    );

    setHasVoted(true);
    setVotedOptionId(id);
  };

  const totalVotes =
    poll?.options.reduce((sum, option) => sum + option.votes, 0) || 0;

  const maxVotes = poll
    ? Math.max(...poll.options.map((option) => option.votes))
    : 0;

  if (!poll) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>No poll available. Create one first!</p>
        <Button
          onClick={() => console.log("Redirect to poll creation")}
          className="mt-4"
        >
          Create a Poll
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto p-3">
        <CardHeader className="flex flex-col items-start">
          <h1 className="font-bold">{poll.question}</h1>
          <small>Vote for your choice</small>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {poll.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between"
              >
                <Button
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted}
                  variant={hasVoted ? "outline" : "default"}
                  className={`w-full justify-between ${
                    votedOptionId === option.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : ""
                  }`}
                >
                  <span className="flex items-center">
                    {option.text}
                    {hasVoted && option.votes === maxVotes && (
                      <span className="ml-2 text-yellow-500">🏆</span>
                    )}
                  </span>
                  <span className="ml-2">
                    {option.votes} vote{option.votes !== 1 ? "s" : ""} (
                    {totalVotes > 0
                      ? ((option.votes / totalVotes) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </Button>
              </div>
            ))}
          </div>
          {hasVoted && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Thank you for voting! Total votes: {totalVotes}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
