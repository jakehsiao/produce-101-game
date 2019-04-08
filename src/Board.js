import React, { Component } from 'react';
import { sleep, DIV } from './utils';
import { Images } from './Images';
import { CardRow } from './CardDisplay';

import { Cards } from './Cards';
import { Buffs } from './Buffs';

import "./Board.css";
import { Pass } from 'boardgame.io/dist/core';

// Don't forget to regenerate using "generate_image_obj.py" when images are updated
class Controller extends Component {

    constructor(props) {
        super(props);

        this.state = {
            current_branch: "main",
            previous_branch: "main",
            practice_type: "sing",
        };

        this.set_branch = this.set_branch.bind(this);

        this.action_tree = {
            main: {
                练习: () => (this.set_branch("practice")),
                推广: this.props.moves.promote,
                行动卡: this.props.act,
                特训: () => (this.set_branch("train")),
            },
            practice: {
                唱歌基础: this.props.moves.practiceBasicSing,
                跳舞基础: this.props.moves.practiceBasicDance,
                歌曲: this.props.moves.practiceSong,
                合练: () => (this.set_branch("choose_practice_type"))
            },
            choose_practice_type: {
                唱歌基础: () => {
                    this.setState({practice_type: "sing"});
                    this.set_branch("choose_player");
                },
                跳舞基础: () => {
                    this.setState({practice_type: "dance"});
                    this.set_branch("choose_player");
                },
                歌曲: () => {
                    this.setState({practice_type: "proficiency"});
                    this.set_branch("choose_player");
                },
            },
            choose_player: () => {
                // TODO: make this rendered in another component 
                return this.props.get_feasible_players().map((id) => ({[id]: this.props.moves.invitePractice(id, this.state.practice_type)}));
            },
            train: {
                预约: this.props.appoint,
                上课: this.props.train,
            }
        }
    }

    set_branch(branch) {
        this.setState({
            previous_branch: this.state.current_branch,
            current_branch: branch,
        });
    }

    render() {
        let actions = this.action_tree[this.state.current_branch]; 
        if (typeof actions == "function"){
            actions = actions();
        }

        if (this.state.current_branch != "main"){    
            actions.返回 = () => this.set_branch(this.state.previous_branch);
        }

        return <div>
            <div className="controller-block">
            {Object.keys(actions).map((action_name) => (<button className="controller-button" onClick={actions[action_name]}>{action_name}</button>))}
            </div>
            <div className="controller-util">
            <p>体力: {this.props.player.lp}/{this.props.player.max_lp}
            <button className="endturn" onClick={this.props.moves.endTurn}>结束回合</button>
            </p>
            </div>
        </div>
    }
}

class AvatarRow extends Component {

    render(){
        return <div className="avatar-block">
            { Object.keys(this.props.players).map(
                (playerID) => 
                {return this.props.players[playerID].is_eliminated?
                "" : (<div className="avatar-container">
                    <img 
                    className="avatar-img"
                    src={Images[this.props.players[playerID].name]} 
                    alt={Images[this.props.players[playerID].name+"_avatar"]}
                    style={{
                        borderStyle: "solid",
                        borderColor: (this.props.currentPlayer == playerID)? "orange" : "transparent",
                        borderWidth: "3px", 
                    }}
            />
            {(playerID == this.props.camera_position)?
             (<img  
                className="camera"
                src={Images.camera}
             />)
             :""}
            </div>
            )})}
        </div>
    }
}

class PlayerInfo extends Component {

    render(){
        return <div class="player-info-block">
            <div className="player-info">
            <h3>{this.props.player.name}</h3>
            <p>唱歌基础: {DIV(this.props.player.sing, 8) + 1}阶 {this.props.player.sing % 8}/8</p>
            <p>跳舞基础: {DIV(this.props.player.dance, 8) + 1}阶 {this.props.player.dance % 8}/8</p>
            <p>歌曲熟练度: {DIV(this.props.player.proficiency, 16) + 1}阶 {this.props.player.proficiency % 16}/16</p>
            <p>粉丝数: {this.props.player.fans}</p>
            <p>体力: {this.props.player.lp}/{this.props.player.max_lp}</p>
            </div>
            <div className="player-photo">
            <img 
            className="photo"
            src={Images[this.props.player.name]} 
            alt={this.props.player.name+"_photo"} 
            />
            </div>
            {(this.props.camera)?(<img className="player-camera" src={Images.camera} />):""}
        </div>
    }

}

export class Board extends Component {

    constructor(props){
      super(props);
      this.state = {
          content: "board",
      }

      this.timeout_process_id = 0;
    }
  
    componentDidUpdate(prevProps){
    //   console.log("Updated!");
  
      if (this.props.ctx.actionPlayers.indexOf("0") == -1){
        if (this.props.G.sleep_time > 0){
        //   console.log("AI has made a move!");
          sleep(this.props.G.sleep_time * 1000).then((this.props.G.player.lp==0)?this.props.moves.endTurn:this.props.step);
        }
        else if (this.props.G.sleep_time == 0){
          this.props.step();
        }
      }
    }
  
    render(){
      if (this.props.G.players["0"].is_eliminated || this.props.ctx.gameover != undefined){
          return <div className="end-game">
              <h3>最终名次: {this.props.G.players["0"].rank}</h3>
              <b>{(this.props.G.players["0"].rank == 1)? "大吉大利，今晚出道！":"下次会更好！"}</b>
              <div style={{fontSize:"50%"}}>
                  <p></p>
              </div>
              <br/><br/><br/>
              <button onClick={this.props.reset} style={{width:"100px", height:"61.7px", backgroundColor:"gainsboro", fontSize:"100%"}}>再来一局</button>
          </div>
      }
    


      let contents = {
          board: (
            <div>
            <p className="stage-block">第{Math.ceil(this.props.G.days/7)}阶段 {this.props.G.stage} {(this.props.G.days - 1) % 7 + 1}/7天</p>
            {/* Make actions hide when the current player is not 0 */}
            <div className="message-block">{this.props.G.messages[0]}</div>
            <PlayerInfo player={this.props.G.player} camera={this.props.G.camera_position == this.props.ctx.currentPlayer} />
            {/* Change players is not required now, at least, or changing too much may not be a good idea. */}
            {/* Or only change between player and cards? Emmm...sounds good. */}
            <AvatarRow players={this.props.G.players} camera_position={this.props.G.camera_position} currentPlayer={this.props.ctx.currentPlayer} />
            {(this.props.ctx.currentPlayer == "0" || this.props.G.sleep_time == -1)? 
              (<Controller 
                player={this.props.G.player} 
                get_feasible_players={() => this.props.G.get_feasible_players(this.props.G, this.props.ctx)} 
                moves={this.props.moves} 
                act={() => this.setState({content: "act"})}
                appoint={() => this.setState({content: "appoint"})}
                train={() => this.setState({content: "train"})}
                />)
                :""}
            </div>
          ),

          act: (
              <div>
                  你的行动卡：
                  <CardRow 
                    cards = {this.props.G.player.hand} 
                    type = "card" 
                    onClickCard = {(i) => () => {
                        this.props.moves.useCard(i);
                        this.setState({content: "board"});
                    }}
                    operation = "使用"
                    cardCost = {(i) => {
                        let card = Cards[this.props.G.player.hand[i]];
                        if (card.cost != undefined){
                          return card.cost + "";
                        }
                        else{
                          return 1 + "";
                        }
                      }}
                  />
                  <button onClick={()=>this.setState({content:"board"})} className="back">返回</button>
              </div>
          ),

          appoint: (
            <div>
                可预约的特训课：
                <CardRow 
                  cards = {this.props.G.buffs} 
                  type = "buff" 
                  onClickCard = {(i) => () => {
                      this.props.moves.appoint(i);
                      this.setState({content: "board"});
                  }}
                  operation = "预约"
                  cardCost = {(i) => (this.props.G.appointment_costs[i])}
                />
                <button onClick={()=>this.setState({content:"board"})} className="back">返回</button>
            </div>
        ),

        train: (
            <div>
                已预约的特训课：
                <CardRow 
                  cards = {this.props.G.player.appointments} 
                  type = "buff" 
                  onClickCard = {(i) => () => {
                      this.props.moves.train(i);
                      this.setState({content: "board"});
                  }}
                  operation = "上课"
                  cardCost = {(i) => (3)}
                />
                <button onClick={()=>this.setState({content:"board"})} className="back">返回</button>
            </div>
        ),

      }

      return contents[this.state.content];

    //   return <div>
    //     <p className="stage-block">第{Math.ceil(this.props.G.days/7)}阶段 {(this.props.G.days - 1) % 7 + 1}/7天</p>
    //     {/* Make actions hide when the current player is not 0 */}
    //     <PlayerInfo player={this.props.G.player} />
    //     {/* Change players is not required now, at least, or changing too much may not be a good idea. */}
    //     {/* Or only change between player and cards? Emmm...sounds good. */}
    //     <AvatarRow players={this.props.G.players} camera_position={this.props.G.camera_position} currentPlayer={this.props.ctx.currentPlayer} />
    //     {(this.props.ctx.currentPlayer == "0" || this.props.G.sleep_time == -1)? 
    //       (<Controller 
    //         player={this.props.G.player} 
    //         get_feasible_players={() => this.props.G.get_feasible_players(this.props.G, this.props.ctx)} 
    //         moves={this.props.moves} 
    //         />)
    //         :""}
    //     </div>;
    }
  }
  
  

  