import React from "react";

export type ResultProps = Readonly<{
  icon?: React.ReactNode;
  header?: React.ReactNode;
  children?: React.ReactNode;
}>;

export default function Result({ icon, header, children }: ResultProps) {
  return (
    <div className="result">
      <div className="result-icon">{icon}</div>
      <p className="result-header">{header}</p>
      <div className="result-text">{children}</div>
    </div>
  );
}
