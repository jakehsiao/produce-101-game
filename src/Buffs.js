var empty_buff = {
    name: {
        desc: "",
        img: "",
        effect(G, ctx){}
    },
}

export var Buffs = {
    
    唱歌练习方法: {
        desc: "唱歌基础达到3阶以前，每次练习唱歌基础的提升量+1",
        img: "Jason",
        effect(G, ctx){
            G.player.onPracticeBasicSing.push(
                (G, ctx) => {
                    if (G.player.sing < 24){
                        G.player.sing += 1;
                    }
                }
            );
        }
    },
    跳舞练习方法: {
        desc: "跳舞基础达到3阶以前，每次练习跳舞基础的提升量+1",
        img: "WYB",
        effect(G, ctx){
            G.player.onPracticeBasicDance.push(
                (G, ctx) => {
                    if (G.player.dance < 24){
                        G.player.dance += 1;
                    }
                }
            );
        }
    },

    歌曲学习方法: {
        desc: "在歌曲熟练度为1阶时，每次练习歌曲的熟练度提升量+2",
        img: "Red",
        effect(G, ctx){
            G.player.onPracticeSong.push(
                (G, ctx) => {
                    if (G.proficiency < 16){
                        G.proficiency += 2;
                    }

                }
            );
        }
    },
    实力派偶像素养: {
        desc: "在你的唱歌或跳舞基础升阶时，摸1张行动卡",
        img: "Ella",
        effect(G, ctx){
            G.player.onBasicSingLevelUp.push(G.draw_card);
            G.player.onBasicDanceLevelUp.push(G.draw_card);
        }
    },
    如何爱上练习: {
        desc: "在你的歌曲熟练度升阶时，将你的体力回复满",
        img: "HYB",
        effect(G, ctx){
            G.player.onProficiencyLevelUp.push(
                (G, ctx) => {
                    G.player.lp = G.player.max_lp;
                }
            );
        }
    },
    网红气质培养: {
        desc: "你每次推广获得的粉丝数+1",
        img: "WYB",
        effect(G, ctx){
            G.player.onPromote.push(
                (G, ctx) => {
                    G.player.fans += 1;
                }
            )
        }
    },
    OPPO_R15_使用方法: {
        desc: "你每次推广以后，如果你手里没有行动卡，则摸1张",
        img: "OPPO_R15",
        effect(G, ctx){
            G.player.onPromote.push(
                (G, ctx) => {
                    if (G.player.hand.length == 0){
                        G.draw_card(G, ctx);
                    }
                }
            )
        }
    },
    特别的表演技巧: {
        desc: "公演阶段，你的表现加分增加3分",
        img: "HYB",
        effect(G, ctx){
            G.player.onPerformanceBonus.push(
                (G, ctx) => (3)
            )
        }
    },
    导师们的喜爱: {
        desc: "如果你上过的特训课多于3节，则每次预约特训课后可回复1点体力",
        img: "Ella",
        effect(G, ctx){
            G.player.onAppointment.push(
                (G, ctx) => {
                    if ((G.player.buffs.length) >= 3){
                        G.player.lp += 1;
                        G.player.lp = min(G.player.lp, G.player.max_lp);
                    }
                }
            )
        }
    },
    导师们的青睐: {
        desc: "如果你上过的特训课多于3节，则每次上完特训课后，摸1张行动卡",
        img: "Red",
        effect(G, ctx){G.player.onTrain.push(
                (G, ctx) => {
                    if ((G.player.buffs.length) >= 3){
                        G.draw_card(G, ctx);
                    }
                }
            )}
    },
    行动力训练: {
        desc: "如果你手里的行动卡数量多于3张，则练习歌曲时，熟练度的提升量+2",
        img: "Ella",
        effect(G, ctx){
            G.player.onPracticeSong.push(
                (G, ctx) => {
                    if (G.player.hand.length >= 3){
                        G.player.proficiency += 2;
                    }
                }
            )
        }
    },
    体力训练: {
        desc: "增加1点体力上限",
        img: "WYB",
        effect(G, ctx){
            G.player.max_lp += 1;
        }
    },
}