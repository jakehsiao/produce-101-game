import { Game, TurnOrder } from 'boardgame.io/core';
import { DIV } from './utils';
import { PlayerInfo } from './PlayerInfo';

import { Cards } from './Cards';


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
        "testMove",
        "promote",
        "useCard",
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
    for (var player_id in G.players){
        let player = G.players[player_id];

        player.proficiency = 0;
        player.hand.push(G.random_choice(Cards));  //TODO: change this according to which phase

        G.players[player_id] = player;
    }
}

function onDayBegin(G, ctx){
    G.days += 1;

    for (var player in G.players){
        G.players[player].lp = G.players[player].max_lp;
        G.players[player].promoted = false;
    }

    // Fix the player not updated bug
    // This solution is ugly, I know, when the author reply my issue it may be changed.
    G.player = G.players[(G.days - 1) % ctx.numPlayers];
    if (G.player.is_eliminated){
        ctx.events.endTurn();
    }

    G.camera_position = ctx.random.Die(ctx.numPlayers - 1) + "";

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

const playerSetup = () => ({
    sing: 0,
    dance: 0,
    proficiency: 0,
    lp: 3,
    max_lp: 3,
    fans: 0,
    promoted: false,
    is_eliminated: false,
    hand: [],
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
      }

      // Set G
      return {
        difficulty: 1,
        sleep_time: 0.1,
        days: 0,

        players: players,

        get_allowed_moves: getAllowedMoves,
        onStageBegin: onStageBegin,
        onStageEnd: onStageEnd,
        onDayBegin: onDayBegin,
        get_feasible_players: getFeasiblePlayers,
        draw_card: drawCard,
        random_choice: (list) => randomChoice(list, ctx),

        camera_position: "0",
        practice_type: "sing",
      };
  },
  
    
  
    flow: {
      onTurnBegin(G, ctx){
        console.log("It's a new turn!");
        G.player = G.players[ctx.currentPlayer];

        if (G.player.is_eliminated){
            console.log("Eliminated players can't play their turns.");
            ctx.events.endTurn();
        }
      },

      onTurnEnd(G, ctx){
          console.log("End of this turn!");
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
        if (G.player.lp > 0){
        G.player.sing += 1;
        G.player.lp -= 1;
        }
      },
      practiceBasicDance(G, ctx){
        if (G.player.lp > 0){
        G.player.dance += 1;
        G.player.lp -= 1;
        }
    },
      practiceSong(G, ctx){
        if (G.player.lp > 0){
        G.player.proficiency += Math.floor(Math.min(G.player.sing, G.player.dance) / 8) - G.difficulty + 2;
        G.player.lp -= 1;
        }
      },
      testMove(G, ctx){
        console.log("It is the test move.");
        G.draw_card(G, ctx);
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
        }
      },
      acceptInvitation(G, ctx){
        let player1 = G.player;
        let player2 = G.players[ctx.actionPlayers[0]];
  
        let pts_per_stage = (G.practice_type == "proficiency")? 16 : 8; 
        let delta = Math.floor(player1[G.practice_type] / pts_per_stage) - Math.floor(player2[G.practice_type] / pts_per_stage);
        console.log("Accepted!");
  
        let teacher, student;
        
        if (delta > 0){
          teacher = player1;
          student = player2;
        }
        else {
          teacher = player2;
          student = player1;
        }
  
        teacher[G.practice_type] += 1;
        student[G.practice_type] += 2;
        console.log("Practiced together!");

        if (G.camera_position in [ctx.currentPlayer, ctx.actionPlayers[0]]){
            teacher.fans += 3;
        }
  
        ctx.events.setActionPlayers([ctx.currentPlayer]);
  
      },
  
      rejectInvitation(G, ctx){
        console.log("Invitation rejected!");
        ctx.events.setActionPlayers([ctx.currentPlayer]);
      },

      promote(G, ctx){
          if (!G.player.promoted && G.player.lp > 0){
          G.player.fans += 1;
          G.player.lp -= 1;
          G.player.promoted = true;
          console.log("Promoted!");
          }
      },

      useCard(G, ctx, id){
          console.log("Player wants to use the card.");
          if (G.player.hand.length != 0 && id == undefined) {
              id = ctx.random.Die(G.player.hand.length);
          }
          if (id < G.player.hand.length){
              let card = G.player.hand[id];
              // Do not use || for undefined!
              let cost = card.cost;
              if (card.cost == undefined){
                  cost = 1;
              }
              if (G.player.lp >= cost){
                // Use the card here
                G.player.lp -= cost;

                G.player.hand.splice(id, 1);
                Cards[card].effect(G, ctx);
                console.log("Card used!");

                if (G.camera_position == ctx.currentPlayer){
                    G.player.fans += 2;
                }
              }
          }

      }
    }})
  

  