import React, { Component } from 'react';
import './App.css';
import Paper from '@material-ui/core/Paper';
import Main from './Containers/Main';
import Connected from './Containers/Connected';
import FeedController from './Containers/FeedController';
import Blocks from './Components/Blocks';

import socketIOClient from 'socket.io-client'


class App extends Component {

  constructor() {
    super()  
    this.state = {
      showFeed: false,
      connected: false,
      socket : socketIOClient("http://localhost:4001"),
      blocks : [],
    }  

    this.switchFeedHandler = this.switchFeedHandler.bind(this);
  }

  switchFeedHandler(val) {
    this.setState({
      ...this.state,
      showFeed : (val === 0)
    })
  }

  componentDidMount() {
    this.state.socket.on('connect', () => {
      this.setState({
        ...this.state,
        connected: true
      })
      console.log(`Connected to server with id ${this.state.socket.id}`)
    })

    this.state.socket.on('disconnect', () => {
      this.setState({
        ...this.state,
        connected: false
      })
      console.log('disconnected from server')
    })

    this.state.socket.on( 'BLOCKUDPATE', (newBlock) => {
      for (let i=0 ; i<this.state.blocks.length ; i++) {
        if (this.state.blocks[i].number === newBlock.number){
          //block already in blocks array
          return
        }
      }
      this.setState({
        ...this.state,
        blocks: [newBlock ,...this.state.blocks].sort((a,b) =>  parseInt(a.number,10) < parseInt(b.number,10))
      })
      console.log(`New block ${newBlock.number} added`);
    })
    
  }

  render() {
    return (
      <div className="App">
        <div className="Main-container">
          <Main socket={this.state.socket} switchFeedHandler={this.switchFeedHandler} connected={this.state.connected}/>
        </div>
        <div className="Feed-container">
          <Paper classes={{root: "Page-container"}}>
            <FeedController showFeed={this.state.showFeed} switchFeedHandler={this.switchFeedHandler} socket={this.state.socket}/>
          </ Paper>
        </div>
        <div className="Blocks-container">  
            <Blocks blocks={this.state.blocks}/>
        </div>
        <div className="Connected-button">
          <Connected connected={this.state.connected} socketID={this.state.socket.id}/>
        </div>
      </div>
    );
  }
}

export default App;


