import { createElement } from "react";

type MockCommentFormProps = { initialContent?: string };

export const mockCommentForm = ({
  initialContent,
}: MockCommentFormProps = {}) =>
  createElement(
    "form",
    { "aria-label": "Comment form" },
    createElement("textarea", {
      "aria-label": "Comment text",
      defaultValue: initialContent,
    }),
  );
