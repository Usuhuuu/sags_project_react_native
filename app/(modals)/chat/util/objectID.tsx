const generateObjectId = () => {
  let counter = 0;

  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  counter = (counter + 1) % 0xffffff;
  const count = counter.toString(16).padStart(6, "0");
  return (timestamp + random + count).padEnd(24, "0");
};

export { generateObjectId as generatedId };
