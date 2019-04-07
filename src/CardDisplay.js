import React, { Component } from 'react';
import { Images } from './Images'
import { Cards } from './Cards'
import { Buffs } from './Buffs'

import './CardDisplay.css'

const CARD_TYPE_REF = {
    "card": Cards,
    "buff": Buffs,
}

class Card extends Component{
    render() {
        return <div className="card">
            <div className="card-cost" >
            <b style={{backgroundColor:(this.props.type=="card")?"#89cff0":"orange"}}> {this.props.cardCost || ""} </b>
            </div>
            <div className="card-name-container">
            <p className="card-name">{this.props.cardName}</p>
            </div>
            <img src={Images[this.props.card.img]} className="card-img" />
            <div className="card-desc-container">
            <p className="card-desc">{this.props.card.desc}</p>
            </div>
        </div>
    }
}

class CardRow extends Component{

    constructor(props){
        super(props);

        this.ref = CARD_TYPE_REF[props.type];
    }

    render() {
        return <div className="card-row">
          {this.props.cards.map((card, i) => (
          <div>
          <Card 
          cardName={card} 
          card={(this.ref[card])} 
          cardCost={this.props.cardCost(i) || undefined}
          type={this.props.type}
          />
          {(this.props.onClickCard)? (<button className="operate" onClick={this.props.onClickCard(i)}>{this.props.operation}</button>) : ""}
          </div>
          ))}
        </div>

    }

}


export {Card, CardRow};