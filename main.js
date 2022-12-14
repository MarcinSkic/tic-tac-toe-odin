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

        const firstPlayerUsername = event.target.querySelector('[name="player-0"]').value;
        players.push(playerFactory(doc,firstPlayerUsername,Symbols.Cross));

        if(event.target.returnValue === 'player'){
            const secondPlayerUsername = event.target.querySelector('[name="player-1"]').value;
            players.push(playerFactory(doc,secondPlayerUsername,Symbols.Circle));
            displayController.setupPlayersUI(`"${firstPlayerUsername}"`,`"${secondPlayerUsername}"`);
        } else {
            players.push(AIFactory(doc,Symbols.Circle));
            displayController.setupPlayersUI(`"${firstPlayerUsername}"`,'AI');
        }

        nextPlayerTurn();
    }

    const prepareNextTurn = function(didWin){
        if(didWin){
            winnerUsername = players[currentPlayer].getUsername();
            winnerUsername = winnerUsername === null ? 'AI' : `Player "${winnerUsername}"`;
            displayController.showGameEndDialog(`${winnerUsername} WON!`);
            return;
        } else if(currentTurn === 9){
            displayController.showGameEndDialog("TIE");
            return;
        }

        nextPlayerTurn();
    }

    const nextPlayerTurn = function(){
        currentTurn++;

        currentPlayer = getNextPlayerIndex(currentPlayer);
        players[currentPlayer].giveAction();
        displayController.changeActivePlayer();
    }

    const getNextPlayerIndex = function(index){
        return index === 1 ? 0 : 1;
    }

    const assignListeners = function(){
        doc.querySelector('.choose-names').addEventListener('close',setupGame);
        doc.querySelector('.restart').addEventListener('click',resetGame);
    }

    const resetGame = function(){
        currentTurn = 0;
        currentPlayer = 1;
        players.length = 0;

        gameBoard.clearData();
        displayController.clearBoard();
        displayController.fixAIInput();
        displayController.showGameTypeDialog();
    }

    return {initializeGame, prepareNextTurn};

})(document);

const gameBoard = (function(){
    let board = Array.from(Array(3),() => new Array(3));
    
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

    const clearData = function(){
        board = Array.from(Array(3),() => new Array(3));
    }

    return {isFieldMarked, markField, didWin, clearData};
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
    const endGameMessageDialog = doc.querySelector('.game-end');

    const firstPlayer = doc.querySelector('.player-0');
    const secondPlayer = doc.querySelector('.player-1');

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

    const showGameEndDialog = function(message){
        endGameMessageDialog.querySelector('.message').textContent = message;
        endGameMessageDialog.showModal();
    }

    const generateBoard = function () {

        for (let i = 0; i < 9; i++){
            field = stringToNode(FIELD_NODE);
            field.dataset.pos = `${i}`;
            boardElement.append(field);
        }
    }

    const clearBoard = function(){
        doc.querySelectorAll('.field path').forEach(path => path.setAttribute('d',''));
    }

    const setupPlayersUI = function(firstName, secondName){
        firstPlayer.classList.remove('active');
        firstPlayer.firstChild.textContent = firstName;
        secondPlayer.classList.add('active');
        secondPlayer.firstChild.textContent = secondName;
    }

    const changeActivePlayer = function(){
        firstPlayer.classList.toggle('active');
        secondPlayer.classList.toggle('active');
    }

    const drawSymbol = function(clickedNode, symbol){
        clickedNode.querySelector("path").setAttribute('d',symbolToPath(symbol));
    }

    const fixAIInput = function(){
        AIInput = namePlayersDialog.querySelector('input[type="text"]:last-of-type');
        AIInput.disabled = false;
        AIInput.value = "";
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

    return {showGameTypeDialog,showGameEndDialog,generateBoard,clearBoard,setupPlayersUI,changeActivePlayer,drawSymbol,fixAIInput};
    
})(document);

gameController.initializeGame();

/* Angry Robot if I ever implement unbeatable AI
<svg style="width:24px;height:24px" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22 14H21C21 10.13 17.87 7 14 7H13V5.73C13.6 5.39 14 4.74 14 4C14 2.9 13.11 2 12 2S10 2.9 10 4C10 4.74 10.4 5.39 11 5.73V7H10C6.13 7 3 10.13 3 14H2C1.45 14 1 14.45 1 15V18C1 18.55 1.45 19 2 19H3V20C3 21.11 3.9 22 5 22H19C20.11 22 21 21.11 21 20V19H22C22.55 19 23 18.55 23 18V15C23 14.45 22.55 14 22 14M7.5 18C6.12 18 5 16.88 5 15.5C5 14.68 5.4 13.96 6 13.5L9.83 16.38C9.5 17.32 8.57 18 7.5 18M16.5 18C15.43 18 14.5 17.32 14.17 16.38L18 13.5C18.6 13.96 19 14.68 19 15.5C19 16.88 17.88 18 16.5 18Z" />
</svg>
*/