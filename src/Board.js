import React, { Component } from 'react';
import { sleep, DIV } from './utils';
import { Images } from './Images'

// Don't forget to regenerate using "generate_image_obj.py" when images are updated

class AvatarRow extends Component {

    render(){
        return <div>
            { Object.values(this.props.players).map(
                player => 
                (<img 
                    src={Images[player.name]} 
                    alt={player.name+"_avatar"}
                />))}
        </div>
    }
}

class PlayerInfo extends Component {

    render(){
        return <div>
            <p>唱歌基础: {this.props.sing}</p>
            <p>跳舞基础: {this.props.dance}</p>
            <p>歌曲熟练度: {this.props.proficiency}</p>
            <p>粉丝数: {this.props.fans}</p>
            <p>体力: {this.props.lp}/{this.props.max_lp}</p>
        </div>
    }

}

export class Board extends Component {

    constructor(props){
      super(props);
    }
  
    componentDidUpdate(prevProps){
      console.log("Updated!");
  
      if (this.props.ctx.actionPlayers.indexOf("0") == -1){
        if (this.props.G.sleep_time > 0){
          console.log("AI has made a move!");
          sleep(this.props.G.sleep_time * 1000).then(this.props.step).then((move) => (console.log(move.payload.type)));
        }
        else{
          this.props.step();
        }
      }
    }
  
    render(){
      return <div>
        <p>第{Math.ceil(this.props.G.days/7)}阶段 {(this.props.G.days - 1) % 7 + 1}/7天</p>
        {/* Make actions hide when the current player is not 0 */}
        <AvatarRow players={this.props.G.players} />
        <button onClick={this.props.moves.endTurn}>Finish turn</button>

        </div>;
    }
  }
  
  

  