import React from "react";

const EllipsisVertical = (props) => {
  const { width = 24, height = 24, fill = "currentColor" } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 128 512"
    >
      <path
        fill={fill}
        d="M64 144a56 56 0 1 1 0-112 56 56 0 1 1 0 112zm0 224c30.9 0 56 25.1 56 56s-25.1 56-56 56-56-25.1-56-56 25.1-56 56-56zm56-112c0 30.9-25.1 56-56 56s-56-25.1-56-56 25.1-56 56-56 56 25.1 56 56z"
      />
    </svg>
  );
};

export default EllipsisVertical;
