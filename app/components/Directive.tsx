import React from "react";

export type DirectiveProps = Readonly<{
  icon?: React.ReactNode;
  name?: React.ReactNode;
  children?: React.ReactNode;
}>;

export default function Result({ icon, name, children }: DirectiveProps) {
  return (
    <li className="directive">
      <div className="directive-icon">{icon}</div>
      <div className="directive-name">{name}</div>
      <div className="directive-text">{children}</div>
    </li>
  );
}
