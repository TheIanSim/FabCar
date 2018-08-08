import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';

export default class Header extends Component {
  render() {
    return (
      
    <div className="Logo">
        <Typography color="textSecondary">
            Welcome to
          </Typography>
        <Typography color="primary" variant="display3">
            FabCar
          </Typography>
        <br />
        <br />
          <Typography color="textSecondary">
            Built on
          </Typography>
        <img src="https://www.hyperledger.org/wp-content/uploads/2016/09/logo_hl_new.png" alt="HYPERLEDGER"  width="80%"/>
        <br />
        <br />
        <br />
        <Typography color="textSecondary">
            Select an option to begin
          </Typography>
    </div>

    );
  }
} 