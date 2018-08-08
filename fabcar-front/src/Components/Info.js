import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import CarIcon from '@material-ui/icons/DirectionsCar';
import Logo from '../Components/Logo';

const styles = theme => ({
  root: {
    position: 'relative',
    overflow: 'auto',
    maxHeight: '85%',
    backgroundColor: theme.palette.background.paper,
  },
});

function FolderList(props) {
  const { classes } = props;
  return (
    <div className={classes.root}>
    { props.data.length > 0 ?
      <List>
          {props.data.map((car) => {
              return(
            <ListItem key={car.Key}>
                <Avatar>
                  <CarIcon />
                </Avatar>
                {car.Record ? <ListItemText primary={car.Key} secondary={`${car.Record.owner}'s ${car.Record.make} ${car.Record.model} (${car.Record.colour})`} />
                : <ListItemText primary={car.Key} secondary={car.Msg}/>
                }
            </ListItem>
          )})}
      </List>
    : <Logo />
    }
    </div>
  );
}

FolderList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FolderList);