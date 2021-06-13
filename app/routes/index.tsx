import type { MetaFunction, LinksFunction, LoaderFunction } from "remix";
import { useRouteData } from "remix";

import stylesUrl from "../styles/index.css";

export const meta: MetaFunction = () => {
  return {
    title: "Rate My Cache",
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export const loader: LoaderFunction = async () => {
  return {};
};

export default function Index() {
  return (
    <div className="container">
      <h1>Rate My Cache</h1>
      <form action="" method="get">
        <input type="url" name="url" placeholder="Enter a URL" size={60} />
      </form>
    </div>
  );
}
