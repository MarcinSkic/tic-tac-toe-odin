const Symbols = {
    Cross: Symbol('cross'),
    Circle: Symbol('circle')
}

const playerFactory = function(doc,username,symbol){

    const giveAction = function(){
        doc.querySelectorAll('.field').forEach(field => field.addEventListener('click',tryMakingMove));
    }

    const tryMakingMove = function(event){
        if(!gameBoard.isFieldMarked(event.currentTarget.dataset.pos)){
            makeMove(event.currentTarget);
        }
    }

    const makeMove = function(clickedNode){
        console.log("Made move");
        gameBoard.markField(clickedNode.dataset.pos,symbol);
        displayController.drawSymbol(clickedNode,symbol);
    }

    return {giveAction};
}

const gameController = (function(doc){

    const players = [];

    const initializeGame = function(){
        displayController.generateBoard();
        createPlayers();
        assignListeners();

        players[0].giveAction();
    }

    const createPlayers = function(){
        players.push(playerFactory(doc,"Player1",Symbols.Cross));
        players.push(playerFactory(doc,"Player2",Symbols.Circle));
    }

    const assignListeners = function(){
        
    }

    return {initializeGame};

})(document);

const gameBoard = (function(){
    board = Array.from(Array(3),() => new Array(3));
    
    const isFieldMarked = function(stringPosition){
        console.log(board);
        if(board[parseInt(stringPosition.charAt(0))][parseInt(stringPosition.charAt(1))] !== undefined){
            return true;
        } else {
            return false;
        }
        
    }

    const markField = function(stringPosition, symbol){
        board[parseInt(stringPosition.charAt(0))][parseInt(stringPosition.charAt(1))] = symbol;
    }

    return {isFieldMarked, markField};
})();

const displayController = (function(doc){
    const CROSS_PATH = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";
    const CIRCLE_PATH = "M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z";

    const FIELD_NODE = '<div class="field" data-pos="">'+
                            '<svg style="width:60%;height:60%" viewBox="0 0 24 24">'+
                                '<path fill="currentColor" d="" />'+
                            '</svg>'+
                        '</div>'

    const boardElement = doc.querySelector('#board');

    const stringToNode = function(string){
        template = doc.createElement('template');
        string = string.trim();
        template.innerHTML = string;
        return template.content.firstChild;
    }

    const generateBoard = function () {
        for(let i = 0; i < 3; i++){
            for(let x = 0; x < 3; x++){
                field = stringToNode(FIELD_NODE);
                field.dataset.pos = `${i}${x}`;
                boardElement.append(field);
            }
        }
    }

    const drawSymbol = function(clickedNode, symbol){
        clickedNode.querySelector("path").setAttribute('d',symbolToPath(symbol));
        
    }

    const symbolToPath = function(symbol){
        if(symbol === Symbols.Cross) {
            return CROSS_PATH;
        } else if (symbol === Symbols.Circle){
            return CIRCLE_PATH;
        }
    }


    return {generateBoard,drawSymbol};
    
})(document);

gameController.initializeGame();