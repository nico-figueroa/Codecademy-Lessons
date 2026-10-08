export const INPUT_LIMITS = {
  name: 100,
  comment: 500,
};

const containsDisallowedControlCharacter = (value, allowCommentWhitespace) =>
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

export const validateName = (input) => {
  if (typeof input !== "string") {
    return { error: "Enter a valid name." };
  }

  const value = input.trim();
  if (!value) {
    return { error: "A name is required." };
  }
  if (value.length > INPUT_LIMITS.name) {
    return { error: `Names must be ${INPUT_LIMITS.name} characters or fewer.` };
  }
  if (containsDisallowedControlCharacter(value, false)) {
    return { error: "Names can’t contain control characters." };
  }

  return { value };
};

export const validateComment = (input) => {
  if (typeof input !== "string") {
    return { error: "Enter a valid comment." };
  }

  const value = input.trim();
  if (value.length > INPUT_LIMITS.comment) {
    return {
      error: `Comments must be ${INPUT_LIMITS.comment} characters or fewer.`,
    };
  }
  if (containsDisallowedControlCharacter(value, true)) {
    return { error: "Comments can’t contain control characters." };
  }

  return { value };
};
