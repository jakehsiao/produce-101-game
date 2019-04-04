import { Game, TurnOrder } from 'boardgame.io/core';
import { DIV } from './utils';
import { PlayerInfo } from './PlayerInfo';


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

            if (G.days / 7 > 1){
            player.votes = ctx.random.Die(6, player.fans).reduce((a,b)=>a+b, 0);
            }

            G.players[player_id] = player;
        }

}

function onStageBegin(G, ctx){
    for (var player_id in G.players){
        let player = G.players[player_id];

        player.proficiency = 0;

        G.players[player_id] = player;
    }
}

const playerSetup = () => ({
    sing: 0,
    dance: 0,
    proficiency: 0,
    lp: 3,
    max_lp: 3,
    fans: 0,
  });

export const Practice = Game({
  
    setup: (ctx) => {
      // Set players
      let players = {};
      let player_info = ctx.random.Shuffle(PlayerInfo);
      for (let i = 0; i < ctx.numPlayers; i++){
        players[i + ''] = {...playerSetup(), ...player_info[i]};
      }

      // Set G
      return {
        difficulty: 1,
        sleep_time: 0.25,
        days: 0,
        players: players,
        get_allowed_moves: getAllowedMoves,
        practice_type: "sing",
        onStageBegin: onStageBegin,
        onStageEnd: onStageEnd,
      };
  },
  
    
  
    flow: {
      onTurnBegin(G, ctx){
        G.player = G.players[ctx.currentPlayer];
      },
  
      onMove(G, ctx){
        G.players[ctx.currentPlayer] = G.player;
      },
  
      setActionPlayers: true,
  
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
            if (G.days % 7 == 0){
                G.onStageBegin(G, ctx);
            }
          // If preparation is required, run the preparation code here
  
          // If practice phase starts, run the following code
          G.days += 1;
  
          for (var player in G.players){
            G.players[player].lp = G.players[player].max_lp;
          }
  
  
        },
  
        onPhaseEnd: (G, ctx) => {
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
        if (id != 0){ // When fix the "player cannot choose" bug, this line will be changed.
            ctx.events.setActionPlayers([id.toString()]);
            G.practice_type = practice_type;

            console.log(ctx.currentPlayer, "invited", id, "to practice");
        }
      },
      acceptInvitation(G, ctx){
        let player1 = G.player;
        let player2 = G.players[ctx.actionPlayers[0]];
        // console.log(ctx.actionPlayers[0], player1, player2);
  
        let pts_per_stage = (G.practice_type == "proficiency")? 16 : 8; 
        let delta = Math.floor(player1[G.practice_type] / pts_per_stage) - Math.floor(player2[G.practice_type] / pts_per_stage);
        console.log("Accepted!");
  
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
          teacher[G.practice_type] += 1;
          student[G.practice_type] += 2;
          console.log("Practiced together!");
  
        }
        else{
          console.log("Cannot practice together!");
        }
  
        ctx.events.setActionPlayers([ctx.currentPlayer]);
  
      },
  
      rejectInvitation(G, ctx){
        console.log("Invitation rejected!");
        ctx.events.setActionPlayers([ctx.currentPlayer]);
      }
    }})
  

  