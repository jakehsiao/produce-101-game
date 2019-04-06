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
        effect(G, ctx){}
    },
    有趣的视频: {
        desc: "进行一次推广，并获得3个粉丝",
        img: "Jason",
        effect(G, ctx){}
    },
    练习日常记录: {
        desc: "进行一次推广，并获得2个粉丝",
        cost: 0,
        img: "Ella",
        effect(G, ctx){}
    },

    流行唱法练习: {
        desc: "提升3点唱歌基础",
        img: "HYB",
        effect(G, ctx){}
    },
    爵士舞基础练习: {
        desc: "提升3点跳舞基础",
        img: "WYB",
        effect(G, ctx){}
    },
    唱跳练习: {
        desc: "提升2点唱歌基础和2点跳舞基础",
        img: "Jason",
        effect(G, ctx){}
    },
    歌曲强化练习: {
        desc: "提升5点歌曲熟练度",
        img: "Jason",
        effect(G, ctx){}
    },
    歌曲学习: {
        desc: "提升3点歌曲熟练度，如果你的歌曲熟练度为1阶，则再提升3点",
        img: "Red",
        effect(G, ctx){}
    },
    领悟: {
        desc: "提升2点歌曲熟练度",
        cost: 0,
        img: "郎一风",
        effect(G, ctx){}
    },
    蹭课: {
        desc: "随机预约1节特训课",
        img: "",
        effect(G, ctx){}
    },
    无中生有: {
        desc: "",
        img: "",
        effect(G, ctx){}
    },
}