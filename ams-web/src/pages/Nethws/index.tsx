import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PrivateRoute from '@pkgs/Auth/PrivateRoute';
import Management from './Management';
import MIB from './MIB';

export default class Routes extends Component {
  render() {
    const prePath = '/nethws';
    return (
      <Switch>
        <Route exact path={prePath} render={() => <Redirect to={`${prePath}/mgt`} />} />
        <PrivateRoute path={`${prePath}/mgt`} component={Management as any} />
        <PrivateRoute path={`${prePath}/mib`} component={MIB as any} />
        <Route render={() => <Redirect to="/404" />} />
      </Switch>
    );
  }
}
