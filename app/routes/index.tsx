import type { MetaFunction, LinksFunction, LoaderFunction } from "remix";
import { useRouteData } from "remix";

import stylesUrl from "../styles/index.css";

export let meta: MetaFunction = () => {
  return {
    title: "Rate My Cache",
  };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async () => {
  return {};
};

export default function Index() {
  let data = useRouteData();

  return (
    <div className="container">
      <h1>Rate My Cache</h1>
      <form action="" method="get">
        <input type="url" name="url" placeholder="Enter a URL" size={60} />
      </form>
    </div>
  );
}
