import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const styles = {
  card: {
    minWidth: 100,
    height: 235,
    wordWrap: "break-word",
    overflow: 'scroll',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
};

function Block(props) {
  const { classes } = props;

  return (
    <div>
      <Card className={classes.card}>
        <CardContent>
          <Typography className={classes.title} color="textSecondary">
            BLOCK
          </Typography>
          <Typography variant="headline" component="h2" color="primary">
            {props.block.number}
          </Typography>
          <Typography className={classes.pos} color="textSecondary">
            {props.block.channel_id}
          </Typography>
          <Typography variant="subheading" >
            {props.block.filtered_tx.length} Transaction(s):
          </Typography>
            {props.block.filtered_tx.map((tx) => <Typography component="p" key={tx.txid}>- {tx.txid}</Typography>)}
        </CardContent>
      </Card>
    </div>
  );
}

Block.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Block);