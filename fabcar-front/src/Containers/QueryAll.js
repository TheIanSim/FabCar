import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  menu: {
    width: 200,
  },
});

class QueryAll extends React.Component {
  state = {

  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <div className="Main-inside" >
      <Typography  variant="display2">
      Query all cars
      </Typography>
      <br/>
      <br/>
        <Button variant="contained" color="primary" className={classes.button} disabled={!this.props.connected} onClick={ () => {
            this.props.switchFeedHandler(1)
            this.props.socket.emit('REQUEST', {action: "QUERYALL"})
            }}>
            {this.props.connected ? "SEARCH All" : "DISCONNECTED"}
        </Button>
      </div>
      
    );
  }
}


export default withStyles(styles)(QueryAll);