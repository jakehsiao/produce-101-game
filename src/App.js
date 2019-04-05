import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { Client } from 'boardgame.io/react'
import { AI } from 'boardgame.io/ai'
import { RandomBot } from 'boardgame.io/ai'
import { setPriority } from 'os';

import { Practice } from './Game';
import { Board } from './Board';


class TestBoard extends Component{
  render(){
    return <div>
      Test 3 
      <p>Nice test.</p> 
    </div>;
  }
}

const App = Client({
  game: Practice,
  board: Board,
  numPlayers: 10,
  ai: AI({
    bot: RandomBot,
    iterations: 1000,
    playoutDepth: 55,

    enumerate: (G, ctx, playerID) => {
      // EH: automate this function, and add invitations
      let moves = G.get_allowed_moves(G, ctx).map((moveName) => ({move: moveName}));
      return moves;
    },

    objectives: G => {
      return G.player.proficiency;
    }

  })
})

export default App;
