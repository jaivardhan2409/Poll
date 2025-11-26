import { useState } from "react";

import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Card, CardBody as CardContent, CardHeader } from "@nextui-org/react";

import { io } from "socket.io-client";

const socket = io("https://pollwebappserver-woc.onrender.com"); // Replace with your server URL

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  //   const router = useRouter()

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && options.every((opt) => opt.trim())) {
      const poll = {
        question,
        options: options.map((text, id) => ({ id, text, votes: 0 })),
      };

      // Emit the poll creation event to the server
      socket.emit("create-poll", poll);

      // Redirect after poll is created
      //   router.push('/')
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="w-full max-w-md mx-auto p-3">
        {/* <CardHeader>
          <h1>Create a New Poll</h1>
          <p>Enter your question and at least two options</p>
        </CardHeader> */}

        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          {/* <p className="text-tiny uppercase font-bold">Daily Mix</p> */}
          <h4 className="font-bold text-large">Create a New Poll</h4>
          <small className="text-default-500">
            Enter your question and at least two options
          </small>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Enter your question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            {options.map((option, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  required
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeOption(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              color="default"
              type="button"
              onClick={() => {
                addOption();
              }}
              variant="bordered"
            >
              Add Option
            </Button>
            <Button color="primary" type="submit" className="w-full">
              Create Poll
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
