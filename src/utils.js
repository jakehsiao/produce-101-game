function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
function DIV(a, b){
    return Math.floor(a/b);
}

export {sleep, DIV};