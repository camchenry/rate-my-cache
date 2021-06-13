import type { MetaFunction } from "remix";

export let meta: MetaFunction = () => {
  return { title: "404 Not Found" };
};

export default function FourOhFour() {
  return (
    <div>
      <h1>404 Not Found</h1>
    </div>
  );
}
