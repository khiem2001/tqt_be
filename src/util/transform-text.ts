interface Input {
  value: string;
}

export const TransformTrim = ({ value }: Input) => {
  return (
    value &&
    value
      .toString()
      .trim()
      .replace(
        /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
        '',
      )
      .replace(/ + /g, ' ')
      .replace(/^\s+|\s+$/g, '')
  );
};

export const TransformTrimAndLowerCase = ({ value }: Input) => {
  return value && value.toLocaleLowerCase().trim();
};
