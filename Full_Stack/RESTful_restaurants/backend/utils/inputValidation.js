const NAME_MAX_LENGTH = 100;
const COMMENT_MAX_LENGTH = 500;
const containsControlCharacters = (value, allowCommentWhitespace) =>
  Array.from(value).some((character) => {
    const code = character.codePointAt(0);
    if (
      allowCommentWhitespace &&
      (code === 9 || code === 10 || code === 13)
    ) {
      return false;
    }
    return code <= 31 || code === 127;
  });

const validateName = (input) => {
  if (typeof input !== "string") {
    return { error: "Name must be text." };
  }

  const value = input.trim();
  if (!value) return { error: "Name is required." };
  if (value.length > NAME_MAX_LENGTH) {
    return { error: `Name must be ${NAME_MAX_LENGTH} characters or fewer.` };
  }
  if (containsControlCharacters(value, false)) {
    return { error: "Name cannot contain control characters." };
  }

  return { value };
};

const validateComment = (input) => {
  if (typeof input !== "string") {
    return { error: "Comment must be text." };
  }

  const value = input.trim();
  if (value.length > COMMENT_MAX_LENGTH) {
    return {
      error: `Comment must be ${COMMENT_MAX_LENGTH} characters or fewer.`,
    };
  }
  if (containsControlCharacters(value, true)) {
    return { error: "Comment cannot contain control characters." };
  }

  return { value };
};

module.exports = { validateComment, validateName };
