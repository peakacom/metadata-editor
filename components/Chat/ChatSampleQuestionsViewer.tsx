import { GenerateSampleQuestionsResult } from "@/services/metadata";
import { Tag, Typography } from "antd";
const { Text } = Typography;

export interface ChatSampleQuestionViewerProps {
  sampleQuestions?: GenerateSampleQuestionsResult;
  onSubmit: (question: string) => void;
}

export default function ChatSampleQuestionsViewer({
  sampleQuestions,
  onSubmit,
}: ChatSampleQuestionViewerProps) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {sampleQuestions?.questions.slice(0, 3).map((question, index) => (
        <div
          key={index}
          className="border p-4 rounded shadow-sm w-64 h-64 flex flex-col justify-center items-start gap-3 cursor-pointer"
          onClick={() => {
            onSubmit(question.question);
          }}
        >
          <Tag color="blue" className="mb-2">
            {question.category}
          </Tag>
          <Text>{question.question}</Text>
        </div>
      ))}
    </div>
  );
}
