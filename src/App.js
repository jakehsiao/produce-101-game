import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { Client } from 'boardgame.io/react'
import { AI } from 'boardgame.io/ai'
import { RandomBot } from 'boardgame.io/ai'
import { setPriority } from 'os';

import { Practice } from './Game';
import { Board } from './Board';

import { Cards } from "./Cards";
import { Buffs } from "./Buffs";
import { CardRow } from "./CardDisplay"


class TestBoard extends Component{
  render(){
    return <div>
      Test 3 
      <p>Nice test.</p> 
    </div>;
  }
}

const App2 = (props) => (
  <CardRow 
  cards = {Object.keys(Cards)}
  type = "card"
  onClickCard = {(i) => () => console.log("Operated!")}
  operation = "预约"
  cardCost = {(i) => {
    let card = Cards[Object.keys(Cards)[i]];
    if (card.cost != undefined){
      return card.cost + "";
    }
    else{
      return 1 + "";
    }
  }}
  />
)

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
