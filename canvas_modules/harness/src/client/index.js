/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import CommonPropertiesComponents from "./components/common-properties-components.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "ap-components-react/dist/ap-components-react.min.css";
import "@wdp/common-canvas/dist/common-canvas.css";
import "../styles/properties.css";
import "../styles/App.css";
import "../styles/index.css";
import { IntlProvider } from "react-intl";
import { HashRouter, Switch, Route } from "react-router-dom";

ReactDOM.render(
	<IntlProvider locale="en">
		<HashRouter>
			<Switch>
				<Route exact path="/" component={ App } />
				<Route path="/properties" component={ CommonPropertiesComponents } />
			</Switch>
		</HashRouter>
	</IntlProvider>,
	document.getElementById("root")
);
