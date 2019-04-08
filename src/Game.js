import { Game, TurnOrder } from 'boardgame.io/core';
import { DIV } from './utils';
import { PlayerInfo } from './PlayerInfo';

import { Cards } from './Cards';
import { Buffs } from './Buffs';

const STAGES = [
  "主题曲评价",
  "分组对抗",
  "位置评价",
  "概念评价",
  "出道评价",
  "游戏结束",
]


function getAllowedMoves(G, ctx) {
    if (ctx.currentPlayer != ctx.actionPlayers[0]){
      return ["acceptInvitation", "rejectInvitation"];
  
    }
    else{
      let moves = [
        "practiceBasicSing",
        "practiceBasicDance",
        "practiceSong",
        "endTurn",
        "invitePractice",
        //"testMove",
        "promote",
        "useCard",
        "appoint",
        "train",
      ];
  
      return moves;
  
    }
  }

function onStageEnd(G, ctx){
    console.log("It is show time!");
  
    for (var player_id in G.players){
            let player = G.players[player_id];
            let score = DIV(player.proficiency, 4) + 1;
            if (score < 5){
            score = 0;
            }
            if (score > 8){
            score += score - 9;
            score += Math.floor(player.sing / 4);
            score += Math.floor(player.dance / 4);
            }

            player.fans += score;

            player.votes = ctx.random.Die(6, player.fans).reduce((a,b)=>a+b, 0);

            G.players[player_id] = player;
        }

    let sorted_players = Object.keys(G.players).sort(
            (p1, p2) => (G.players[p1].votes - G.players[p2].votes)
        )
        .filter(
            p => !G.players[p].is_eliminated
        );

    console.log(sorted_players.map(p => [G.players[p].name, G.players[p].votes]))

    sorted_players.map((p, i, arr) => (G.players[p].rank = arr.length - i))

    if (G.days / 7 > 1){
    alert(
      sorted_players.reverse().map((i, rank) => ((rank+1)+": "+G.players[i+""].name+" "+G.players[i+""].votes+"票")).join("\n")
      );
    //reverse again
    sorted_players.reverse();
    }

    // Eliminate players
    if (G.days / 7 > 1 && G.days / 7 < 5){
        G.players[sorted_players[0]].is_eliminated = true;
        G.players[sorted_players[1]].is_eliminated = true;
    }

    // Get the winner
    if (G.days / 7 == 5){
        let game_result = { winner: G.players[sorted_players[sorted_players.length - 1]] };
        console.log("Winner:", game_result.winner.name);
        ctx.events.endGame();
    }

}

function onStageBegin(G, ctx){
    G.buffs = [];

    for (var player_id in G.players){
        let player = G.players[player_id];

        player.proficiency = 0;
        player.hand = [];
        player.appointments = [];

        for (let i = 0; i < (G.days + 1) / 7; i++){
          player.hand.push(G.random_choice(Cards));  //TODO: change this according to which phase
        }

        G.players[player_id] = player;
    }

    if (G.stage != STAGES[G.days / 7]){
      G.stage = STAGES[G.days / 7];
    }
}

function onDayBegin(G, ctx){
    G.days += 1;

    for (var player in G.players){
        G.players[player].lp = G.players[player].max_lp;
        G.players[player].promoted = false;
    }

    G.camera_position = (ctx.random.Die(ctx.numPlayers) - 1) + "";

    for(let i=0; i<3; i++){
      G.buffs.push(G.random_choice(Buffs));
      G.appointment_costs.push(5);}
    G.appointment_costs = G.appointment_costs.map(i => Math.max(i-1, 0));

    // Fix the player not updated bug
    G.player = G.players[(G.days - 1) % ctx.numPlayers];
    G.start_turn(G, ctx);

}

function getFeasiblePlayers(G, ctx){
    let feasible_players = [];

    let player1 = G.player;
    for (var i = 0; i < ctx.numPlayers; i++) {
        let player2 = G.players[i];
        // console.log(ctx.actionPlayers[0], player1, player2);
  
        let pts_per_stage = (G.practice_type == "proficiency")? 16 : 8; 
        let delta = Math.floor(player1[G.practice_type] / pts_per_stage) - Math.floor(player2[G.practice_type] / pts_per_stage);
  
        let canPracticeTogether = true;
        let teacher, student;
        
        if (delta > 0){
          teacher = player1;
          student = player2;
        }
        else if (delta < 0){
          teacher = player2;
          student = player1;
        }
        else{
          canPracticeTogether = false;
        }

        if (canPracticeTogether){
            feasible_players.push(i);
        }
    }

    return feasible_players;

}

function randomChoice(obj, ctx){
    return ctx.random.Shuffle(Object.keys(obj))[0];
}

function drawCard(G, ctx, count){
    count = count || 1;
    for(let i=0; i<count; i++){
        G.player.hand.push(G.random_choice(Cards));
    }
}

function costLP(G, count){
    if (G.player.lp >= count){
        console.log("It is larger!");
        G.player.lp -= count;
        return true;
    }
}

function startTurn(G, ctx){
    if (G.player.is_eliminated){
        ctx.events.endTurn();
    }
}

function execute(G, ctx, functions){
  for (let i = 0; i < functions.length; i++){
    functions[i](G, ctx);
  }
}

const playerSetup = () => ({
    sing: 0,
    dance: 0,
    proficiency: 0,
    lp: 4,
    max_lp: 4,
    fans: 0,
    promoted: false,
    is_eliminated: false,
    hand: [],
    appointments: [],
    buffs: [],

    rank: 0,

    onPracticeBasicSing: [(G, ctx) => G.messages.unshift(G.player.name+" 练习了唱歌基础")],
    onPracticeBasicDance: [(G, ctx) => G.messages.unshift(G.player.name+" 练习了跳舞基础")],
    onPracticeSong: [(G, ctx) => G.messages.unshift(G.player.name+" 练习了歌曲")],
    onBasicSingLevelUp: [(G, ctx) => G.messages.unshift(G.player.name+" 唱歌基础提升至"+(DIV(G.player.sing, 8)+1+"")+"阶")],
    onBasicDanceLevelUp: [(G, ctx) => G.messages.unshift(G.player.name+" 跳舞基础提升至"+(DIV(G.player.dance, 8)+1+"")+"阶")],
    onProficiencyLevelUp: [(G, ctx) => G.messages.unshift(G.player.name+" 歌曲熟练度提升至"+(DIV(G.player.proficiency, 16)+1+"")+"阶")],
    onPromote: [(G, ctx) => G.messages.unshift(G.player.name+" 发了一条微视视频推广自己")],
    onAppoint: [],
    onTrain: [],
  });

export const Practice = Game({
  
    setup: (ctx) => {
      // Set players info
      let players = {};
      let player_info = ctx.random.Shuffle(PlayerInfo);
      // YCY should always be at the first place
      let ycy_index = 0;
      for (var i = 0; i < player_info.length; i++){
          if (player_info[i].name == "杨超越"){
              ycy_index = i;
          }
      }
      let temp = player_info[0];
      player_info[0] = player_info[ycy_index];
      player_info[ycy_index] = temp;

      // Set players
      for (let i = 0; i < ctx.numPlayers; i++){
        players[i + ''] = {...playerSetup(), ...player_info[i]};
        // Set single player difficulty
        if (i != 0){
          players[i + ''].fans = 10;
        }
      }


      // Set G
      return {
        difficulty: 1,
        sleep_time: 0.01,
        days: 0,

        players: players,

        buffs: [],
        appointment_costs: [],

        messages: ["Welcome to produce 101 simulator."],

        get_allowed_moves: getAllowedMoves,
        onStageBegin: onStageBegin,
        onStageEnd: onStageEnd,
        onDayBegin: onDayBegin,
        get_feasible_players: getFeasiblePlayers,
        draw_card: drawCard,
        random_choice: (list) => randomChoice(list, ctx),
        cost_lp: costLP,
        start_turn: startTurn,
        execute: execute,


        camera_position: "0",
        practice_type: "sing",

      };
  },
  
    
  
    flow: {
      onTurnBegin(G, ctx){
        console.log("It's a new turn!");
        G.player = G.players[ctx.currentPlayer];

        G.start_turn(G, ctx);
      },

      onTurnEnd(G, ctx){
          console.log("End of this turn!");
          G.messages.unshift(G.player.name + " 结束了回合");
      },
  
      onMove(G, ctx){
        G.players[ctx.currentPlayer] = G.player;
      },
  
      setActionPlayers: true,
      endGame: true,
  
      startingPhase: 'practice',
  
      phases: {
        practice: {
          next: "practice",
          allowedMoves: getAllowedMoves,
          //turnOrder: TurnOrder.ONCE,
          turnOrder: {
            first: (G, ctx) => (G.days - 1) % ctx.numPlayers,
            next: (G, ctx) => {
              if (ctx.playOrderPos != (G.days - 2 + ctx.numPlayers) % ctx.numPlayers) {
                return (ctx.playOrderPos + 1) % ctx.playOrder.length;
              }
            },
        },



  
        onPhaseBegin: (G, ctx) => {
        console.log("It's a new phase!");
            if (G.days % 7 == 0){
                // Adjust whether stage is changed here
                G.onStageBegin(G, ctx);
            }
          // If preparation is required, run the preparation code here
  
          // If practice phase starts, run the following code
          console.log("A new day!");
          G.onDayBegin(G, ctx);
  
  
        },
  
        onPhaseEnd: (G, ctx) => {
          console.log("Good night!");
          if (G.days % 7 == 0){
            G.onStageEnd(G, ctx);
          }
        },
  
      }
    }},
  
    moves: {
      practiceBasicSing(G, ctx){
        if (G.cost_lp(G, 1)){ 
        let previous_value_sing = G.player.sing;

        G.player.sing += 1;
        G.player.sing = Math.min(32, G.player.sing);

        G.execute(G, ctx, G.player.onPracticeBasicSing);

        if (DIV(G.player.sing, 8) - DIV(previous_value_sing, 8) > 0){
          G.execute(G, ctx, G.player.onBasicSingLevelUp);
        }


        }
      },
      practiceBasicDance(G, ctx){
        if (G.cost_lp(G, 1)){ 
        let previous_value_dance = G.player.dance;

        G.player.dance += 1;
        G.player.dance = Math.min(32, G.player.dance);
        G.execute(G, ctx, G.player.onPracticeBasicDance);
        if (DIV(G.player.dance, 8) - DIV(previous_value_dance, 8) > 0){
          G.execute(G, ctx, G.player.onBasicDanceLevelUp);
        }

        }
    },
      practiceSong(G, ctx){
        if (G.cost_lp(G, 1)){
        let previous_value = G.player.proficiency;
        G.player.proficiency += Math.floor(Math.min(G.player.sing, G.player.dance) / 8) - G.difficulty + 2;
        G.player.proficiency = Math.min(48, G.player.proficiency);
        G.execute(G, ctx, G.player.onPracticeSong);
        if (DIV(G.player.proficiency, 8) - DIV(previous_value, 8) > 0){
          G.execute(G, ctx, G.player.onProficiencyLevelUp);
        }
        }
      },
      testMove(G, ctx){
        console.log("It is the test move.");
        G.player.lp = G.player.max_lp;
      },
      endTurn(G, ctx){
        ctx.events.endTurn();
      },
      invitePractice(G, ctx, id, practice_type){
        if (id == undefined){
            id = (parseInt(ctx.currentPlayer) + ctx.random.Die(ctx.numPlayers - 1)) % ctx.numPlayers; 
        }

        if (practice_type == undefined){
            practice_type = ctx.random.Shuffle(["sing", "dance", "proficiency"])[0]
        }

        //TODO: before ask for acception, check whether it's able to practice or not.
        let feasible_players = G.get_feasible_players(G, ctx);

        if (id != 0 && id in feasible_players){ // When fix the "player cannot choose" bug, this line will be changed.
            ctx.events.setActionPlayers([id.toString()]);
            G.practice_type = practice_type;

            console.log(ctx.currentPlayer, "invited", id, "to practice");
            G.messages.unshift(G.players[ctx.currentPlayer].name+" 邀请 "+G.players[id+""].name+" 一起练习")
        }
      },
      acceptInvitation(G, ctx){
        let player1 = G.player;
        let player2 = G.players[ctx.actionPlayers[0]];
  
        let pts_per_stage = (G.practice_type == "proficiency")? 16 : 8; 
        let delta = Math.floor(player1[G.practice_type] / pts_per_stage) - Math.floor(player2[G.practice_type] / pts_per_stage);
        console.log("Accepted!");
        G.messages.unshift(G.players[ctx.actionPlayers[0]].name+" 同意了合练请求")
  
        let teacher, student;
        
        if (delta > 0){
          teacher = player1;
          student = player2;
        }
        else {
          teacher = player2;
          student = player1;
        }
  
        if (teacher.lp > 0 && student.lp > 0){
            teacher[G.practice_type] += 1;
            student[G.practice_type] += 2;
            teacher.lp -= 1;
            student.lp -= 1;
            console.log("Practiced together!");

            if (G.camera_position in [ctx.currentPlayer, ctx.actionPlayers[0]]){
                teacher.fans += 3;
            }
        }
  
        ctx.events.setActionPlayers([ctx.currentPlayer]);
  
      },
  
      rejectInvitation(G, ctx){
        console.log("Invitation rejected!");
        G.messages.unshift(G.players[ctx.actionPlayers[0]].name+" 拒绝了合练请求")
        ctx.events.setActionPlayers([ctx.currentPlayer]);
      },

      promote(G, ctx){
          if (!G.player.promoted && G.player.lp > 0){
          G.player.fans += 1;
          G.player.lp -= 1;
          G.player.promoted = true;

          G.execute(G, ctx, G.player.onPromote);

          console.log("Promoted!");
          }
      },

      useCard(G, ctx, id){
          console.log("Player wants to use the card.");
          if (G.player.hand.length != 0 && id == undefined) {
              id = ctx.random.Die(G.player.hand.length) - 1;
          }
          if (id < G.player.hand.length){
              let card = G.player.hand[id];
              // Do not use || for undefined!
              let cost = Cards[card].cost;
              if (cost == undefined){
                  cost = 1;
              }
              console.log("Card cost: ", cost);
              if (G.cost_lp(G, cost)){
                // Use the card here
                G.player.hand.splice(id, 1);
                Cards[card].effect(G, ctx);
                console.log("Card used!");
                G.messages.unshift(G.player.name + " 使用了行动卡 " + card);

                if (G.camera_position == ctx.currentPlayer){
                    G.player.fans += 2;
                }
              }
          }

      },
      appoint(G, ctx, id){
        if (id == undefined && G.buffs.length > 0){
          id = ctx.random.Die(G.buffs.length) - 1;
        }

        if (id < G.buffs.length){
          console.log("Player wants to make an appointment.");
          let cost = G.appointment_costs[id];

          if (G.cost_lp(G, cost)){
            G.player.appointments.unshift(G.buffs[id]);
            G.buffs.splice(id, 1);
            G.appointment_costs.splice(id, 1);
            G.execute(G, ctx, G.player.onAppoint);
            console.log("Appointed!");
            G.messages.unshift(G.player.name + " 预约了特训课 "+G.player.appointments[0]);
          }

        }

      },

      train(G, ctx, id){
        console.log("Player wants to train.");
        if (G.player.appointments.length != 0 && id == undefined) {
            id = ctx.random.Die(G.player.appointments.length) - 1;
        }
        if (id < G.player.appointments.length){
            let card = G.player.appointments[id];
            let cost = 4;
            if (G.cost_lp(G, cost)){
              // Use the card here
              G.player.appointments.splice(id, 1);
              Buffs[card].effect(G, ctx);
              G.player.buffs.push(card);
              G.execute(G, ctx, G.player.onTrain);
              console.log("Trained!");
              G.messages.unshift(G.player.name + " 上了特训课 "+card);

              if (G.camera_position == ctx.currentPlayer){
                  G.player.fans += 5;
              }
            }
        }
      }

    }})
  

  