import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';

import FeedNav from './FeedNav';
import Info from '../Components/Info';
import FeedList from '../Components/FeedList';
import { Divider } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';



class FeedController extends Component {

  constructor(props) {
    super(props)

    this.state = {
      feed : [],
      info : []
    }
  }

  dataHandler(data) {
    if (data.type === 'FEED'){
      const newFeed = [
        <ListItem key={this.state.feed.length + 1}>
          <ListItemText primary={data.payload} />
        </ListItem>,
        ...this.state.feed 
      ]
      this.setState({
        feed : newFeed
      })
    }else if(data.type === 'INFO'){
      const newFeed = [<Divider key={data.payload}/>, ...this.state.feed]
      this.props.switchFeedHandler(0);
      this.setState({
        feed : newFeed,
        info: data.payload.sort((a,b) => {
          return parseInt(a.Key.replace('CAR', ''),10) > parseInt(b.Key.replace('CAR', ''),10)
        })
      })
    } else if(data.type === 'START'){
      const newFeed = [
        <ListItem key={this.state.feed.length + 1}>
          <ListItemText primary={data.payload} secondary='Start'/>
        </ListItem>,
        <Divider key={this.state.feed.length + 2}/>,
        ...this.state.feed 
      ]
      this.setState({
      feed : newFeed
      })
    } else if(data.type === 'END'){
      const newFeed = [
        <Divider key={this.state.feed.length + 1}/>,
        <ListItem key={this.state.feed.length + 2} >
          <ListItemText primary={data.payload} secondary='End'/>
        </ListItem>,
        ...this.state.feed 
      ]
      this.setState({
      feed : newFeed
      })
    } else {
      const newFeed = [
        <Divider  key={this.state.feed.length + 1} />,
        <ListItem key={this.state.feed.length + 2}>
          <h1 className={'error'} key="1">ERROR</h1>
          <ListItemText primary={data.payload} key="2" secondary='Please check your input' />
        </ListItem>,
        <Divider  key={this.state.feed.length + 3} />,
        ...this.state.feed 
      ]
      this.setState({
      feed : newFeed
      })

    }
  }


  componentDidMount() {
    this.props.socket.on('queryResponse', (data) => {
      this.dataHandler(data);
      })
    this.props.socket.on('queryAllResponse', (data) => {
      this.dataHandler(data);
      })
    this.props.socket.on('transferResponse', (data) => {
      this.dataHandler(data);
      })
    this.props.socket.on('createResponse', (data) => {
      this.dataHandler(data);
      })

    this.props.socket.on('RESPONSE', (data) => {
      this.dataHandler(data);
      })
    
  }

  render() {
    return (
          <Paper classes={{root: "Page-container"}}>
            <FeedNav switchFeedHandler={this.props.switchFeedHandler} value={this.props.showFeed}/>
            {(this.props.showFeed ? <Info data={this.state.info}/> : <FeedList data={this.state.feed}/> )}
          </ Paper>
    );
  }
}

export default FeedController;


