import React from "react";
import {
  BrowserRouter as BaseRouter,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import Room from "./views/Room";

export default function Router() {
  return (
    <BaseRouter>
      <Switch>
        <Route path="/room/:id" component={Room} />
        <Route path="/404" component={() => <div>404 not found</div>} />
        <Redirect to="/404" />
      </Switch>
    </BaseRouter>
  );
}
