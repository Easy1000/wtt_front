import React, { useState, Suspense } from "react";
import { Switch, Route, Redirect, withRouter } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { ReactQueryConfigProvider } from "react-query";
import Layout from "../components/Layout/Layout";
const NotFound = React.lazy(() => import("../pages/notFound/NotFound"));

const PrivateRoute = ({ component, isAuthenticated, map, email, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isAuthenticated ? (
        React.createElement(component, props)
      ) : (
        <Redirect
          to={{ pathname: "/login", state: { from: props.location } }}
        />
      )
    }
  />
);

const Loader = () => (
  <div 
    style={{
      "display": "flex",
      "flexDirection": "column",
      "justifyContent": "center",
      'alignItems': "center",
      "fontFamily": "Arial Black, Arial Bold, Helvetica, sans-serif",
      "color": "green",
      "fontSize": "24px"
    }}
  >
  Water the Trees</div>
);

const queryConfig = {
  shared: {
    suspense: true
  },
  queries: {
    refetchOnWindowFocus: true
  },
};

const App = (props) => {
  const component_name = "App!!!!\n\n\n";
  const email = "rose@waterthetrees.com";
  const isAuthenticated = true;

  return ( 
    <ReactQueryConfigProvider config={queryConfig}>
      <Suspense fallback={<Loader />}>
      <Switch>
        <PrivateRoute
          isAuthenticated={isAuthenticated}
          email={email}
          path="/"
          component={Layout}
        />
        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </ReactQueryConfigProvider>
  );
};

export default withRouter(App);