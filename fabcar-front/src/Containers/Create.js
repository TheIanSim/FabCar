import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
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

class Create extends React.Component {
  state = {
    ID: null,
    color: null,
    make: null,
    model: null,
    owner: null
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  createHandler = () => {
    //Check form validity
    if (!(this.state.ID && this.state.make && this.state.model && this.state.color && this.state.owner)){
      alert('All fields must be filled in');
    } else if (this.state.ID.slice(0,3) !== 'CAR') {
        alert('ID MUST CONTAIN "CAR" FOLLOWED BY ID')
    } else if (this.state.ID.slice(3).length > 3 || isNaN(this.state.ID.slice(3))) {
        alert('ID MUST CONTAIN "CAR" FOLLOWED BY ID BETWEEN 0 AND 999')
    } else {
      this.props.switchFeedHandler(1)
      this.props.socket.emit('REQUEST', {action: "CREATE", data:this.state})
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <form className="Main-inside" noValidate autoComplete="off">
        <Typography  variant="display2">
          Create a car
        </Typography>
        <TextField
          label="CAR ID"
          className={classes.textField}
          value={this.state.name}
          onChange={this.handleChange('ID')}
          margin="normal"
        />
        <TextField
          label="Colour"
          className={classes.textField}
          value={this.state.name}
          onChange={this.handleChange('color')}
          margin="normal"
        />
        <TextField
          label="Make"
          className={classes.textField}
          value={this.state.name}
          onChange={this.handleChange('make')}
          margin="normal"
        />
        <TextField
          label="Model"
          className={classes.textField}
          value={this.state.name}
          onChange={this.handleChange('model')}
          margin="normal"
        />
        <TextField
          label="Owner"
          className={classes.textField}
          value={this.state.name}
          onChange={this.handleChange('owner')}
          margin="normal"
        />
        <Button variant="contained" 
                color="primary" 
                disabled={!this.props.connected}
                className={classes.button} 
                onClick={this.createHandler}>
           {this.props.connected ? "CREATE" : "DISCONNECTED"}
        </Button>
        <p>Car ID is case sensitive and should start with 'CAR' followed by digits (e.g. CAR10)</p>
      </form>
      
    );
  }
}


export default withStyles(styles)(Create);