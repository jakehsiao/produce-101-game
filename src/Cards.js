import { Buffs } from "./Buffs"

var empty_card = {
    name: {
        desc: "",
        img: "",
        effect(G, ctx){}
    },
}

export var Cards = {

    康师傅冰红茶: {
        desc: "回复2点体力",
        cost: 0,
        img: "IceTea",
        effect(G, ctx){
            G.player.lp = Math.min(G.player.lp+2, G.player.max_lp);
        }
    },
    有趣的视频: {
        desc: "进行一次推广，并获得3个粉丝",
        img: "Jason",
        effect(G, ctx){
            if (!G.player.promoted){
                // EH: change this. "Promoted" stuffs should not be called here. Redundant code.
                G.player.promoted = true;

                G.player.fans += 3;
            }
        }
    },
    练习日常记录: {
        desc: "进行一次推广，并获得2个粉丝",
        cost: 0,
        img: "Ella",
        effect(G, ctx){
            if (!G.player.promoted){
                G.player.promoted = true;

                G.player.fans += 2;
            }

        }
    },

    流行唱法练习: {
        desc: "提升3点唱歌基础",
        img: "HYB",
        effect(G, ctx){
            G.player.sing += 3;
        }
    },
    爵士舞基础练习: {
        desc: "提升3点跳舞基础",
        img: "WYB",
        effect(G, ctx){
            G.player.dance += 3;
        }
    },
    唱跳练习: {
        desc: "提升2点唱歌基础和2点跳舞基础",
        img: "Jason",
        effect(G, ctx){
            G.player.sing += 2;
            G.player.dance += 2;
        }
    },
    歌曲强化练习: {
        desc: "提升5点歌曲熟练度",
        img: "Jason",
        effect(G, ctx){
            G.player.proficiency += 5;
        }
    },
    歌曲学习: {
        desc: "提升3点歌曲熟练度，如果你的歌曲熟练度为1阶，则再提升3点",
        img: "Red",
        effect(G, ctx){
            G.player.proficiency += 3;

            if (G.player.proficiency/16 < 1){
                G.player.proficiency += 3;
            }
        }
    },
    领悟: {
        desc: "提升2点歌曲熟练度",
        cost: 0,
        img: "郎一风",
        effect(G, ctx){
            G.player.proficiency += 2;
        }
    },
    蹭课: {
        desc: "随机预约1节特训课",
        img: "齐波澜",
        effect(G, ctx){
            console.log("Made an appointment.");
            G.player.appointments.unshift(G.random_choice(Buffs));
            G.execute(G, ctx, G.player.onAppoint);
        }
    },
    无中生有: {
        desc: "摸2张行动牌",
        img: "Delicious",
        effect(G, ctx){
            G.draw_card(G, ctx, 2);
        }
    },
}