const Symbols = {   //"ENUM"
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
        displayController.drawSymbol(clickedNode,symbol);
        gameBoard.markField(clickedNode.dataset.pos,symbol);
        endAction();
        gameController.prepareNextTurn(gameBoard.didWin(clickedNode.dataset.pos,symbol));
    }

    const endAction = function(){
        if(doc){
            doc.querySelectorAll('.field').forEach(field => field.removeEventListener('click',tryMakingMove));
        }
    }

    const getUsername = function(){
        return username;
    }

    return {giveAction,getUsername,makeMove};
}

const AIFactory = function(doc,symbol){

    const {makeMove} = playerFactory(null,null,symbol);

    const giveAction = function(){
        tryMakingMove();
    }

    const tryMakingMove = function(){
        do {
            position = Math.floor(Math.random()*9);
        } while(gameBoard.isFieldMarked(position));

        makeMove(doc.querySelector(`.field[data-pos="${position}"]`));
    }

    const getUsername = function(){
        return null;
    }

    return {giveAction, getUsername};
}

const gameController = (function(doc){

    let currentTurn = 0;
    let currentPlayer = 1;  //Starting value for invoking nextPlayerTurn, where it will switch to 0
    const players = [];

    const initializeGame = function(){
        displayController.generateBoard();
        displayController.showGameTypeDialog();
        assignListeners();
    }

    const setupGame = function(event){
        console.log(event.target.returnValue);

        players.push(playerFactory(doc,event.target.querySelector('[name="player-0"]').value,Symbols.Cross));

        if(event.target.returnValue === 'player'){
            players.push(playerFactory(doc,event.target.querySelector('[name="player-1"]').value,Symbols.Circle));
        } else {
            players.push(AIFactory(doc,Symbols.Circle));
        }

        nextPlayerTurn();
    }

    const prepareNextTurn = function(didWin){
        if(didWin){
            winnerUsername = players[currentPlayer].getUsername();
            winnerUsername = winnerUsername === null ? 'AI' : `Player "${winnerUsername}"`;
            console.log(`${winnerUsername} won!`);
            return;
        } else if(currentTurn === 9){
            console.log("End of game");
            return;
        }

        nextPlayerTurn();
    }

    const nextPlayerTurn = function(){
        currentTurn++;

        currentPlayer = getNextPlayerIndex(currentPlayer);
        players[currentPlayer].giveAction();
    }

    const getNextPlayerIndex = function(index){
        return index === 1 ? 0 : 1;
    }

    const assignListeners = function(){
        doc.querySelector('.choose-names').addEventListener('close',setupGame);
    }

    return {initializeGame, prepareNextTurn};

})(document);

const gameBoard = (function(){
    board = Array.from(Array(3),() => new Array(3));
    
    const isFieldMarked = function(stringPosition){
        //const row = parseInt(stringPosition.charAt(0));
        //const column = parseInt(stringPosition.charAt(1));

        const row = Math.floor(parseInt(stringPosition) / 3);
        const column = parseInt(stringPosition) % 3;

        return board[row][column] !== undefined
    }

    const markField = function(stringPosition, symbol){
        const row = Math.floor(parseInt(stringPosition) / 3);
        const column = parseInt(stringPosition) % 3;

        board[row][column] = symbol;
    }

    const didWin = function(stringPosition, symbol){
        const row = Math.floor(parseInt(stringPosition) / 3);
        const column = parseInt(stringPosition) % 3;

        function checkColumn(){
            for(let i = 0; i < 3; i++){
                if(board[row][i] !== symbol){
                    return false;
                }
            }

            return true;
        }

        function checkRow(){
            for (let i = 0; i < 3;i++){
                if(board[i][column] !== symbol){
                    return false;
                }
            }

            return true;
        }

        function checkDiagonals(){
            if((row === 1 && column === 1) || (row !== 1 && column !== 1)){
                function checkTopLeftToBottomRight(){
                    for(let i = 0; i < 3; i++){
                        if(board[i][i] !== symbol){
                            return false;
                        }
                    }
        
                    return true;
                }
        
                function checkTopRightToBottomLeft(){
                    for(let i = 0; i < 3; i++){
                        if(board[i][2-i] !== symbol){
                            return false
                        }
                    }
        
                    return true;
                }

                return checkTopLeftToBottomRight() || checkTopRightToBottomLeft();
            }
        }

        return checkColumn() || checkRow() || checkDiagonals();
    }

    return {isFieldMarked, markField, didWin};
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
    const pickGameTypeDialog = doc.querySelector('.pick-game-type');
    const namePlayersDialog = doc.querySelector('.choose-names');

    const showGameTypeDialog = function (){
        pickGameTypeDialog.showModal();
        pickGameTypeDialog.addEventListener('close',showPlayerNamingDialog);
    }

    const showPlayerNamingDialog = function(event){
        const gameType = event.target.returnValue;

        namePlayersDialog.showModal();
        namePlayersDialog.querySelector('button').setAttribute('value',gameType);

        if(gameType === 'ai') {
            AIInput = namePlayersDialog.querySelector('input[type="text"]:last-of-type');
            AIInput.disabled = true;
            AIInput.value = "AI";
        }
    }

    const generateBoard = function () {
        /*for(let i = 0; i < 3; i++){
            for(let x = 0; x < 3; x++){
                field = stringToNode(FIELD_NODE);
                field.dataset.pos = `${i}${x}`;
                boardElement.append(field);
            }
        }*/

        for (let i = 0; i < 9; i++){
            field = stringToNode(FIELD_NODE);
            field.dataset.pos = `${i}`;
            boardElement.append(field);
        }
    }

    const drawSymbol = function(clickedNode, symbol){
        clickedNode.querySelector("path").setAttribute('d',symbolToPath(symbol));
    }

    const stringToNode = function(string){
        template = doc.createElement('template');
        string = string.trim();
        template.innerHTML = string;
        return template.content.firstChild;
    }

    const symbolToPath = function(symbol){
        if(symbol === Symbols.Cross) {
            return CROSS_PATH;
        } else if (symbol === Symbols.Circle){
            return CIRCLE_PATH;
        }
    }


    return {showGameTypeDialog,generateBoard,drawSymbol};
    
})(document);

gameController.initializeGame();