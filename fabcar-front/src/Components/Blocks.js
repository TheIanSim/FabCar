import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Block from './Block';


const styles = theme => ({
  gridList: {
    flexWrap: 'nowrap',
  }
});


function Blocks(props) {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <GridList cellHeight={240} className={classes.gridList} cols={5}>
        {props.blocks.map(block => (
          <GridListTile key={block.number}>
            <Block block={block}/>
            />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

Blocks.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Blocks);