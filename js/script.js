$(document).ready(function(){
    const gameSettings = {
    chance : true,
    chances : 0,
    twoPlayer : false,
    systemTurn : false,
    type: this.twoPlayer?'TwoPlayer':'OnePlayer',
    winScoreLocalStorage : function(key) {
        localStorage && localStorage[key] ? localStorage[key] = +localStorage[key]+1 : localStorage[key] = 1;
    },
    winPositions : [
        ['11', '12', '13'],
        ['21', '22', '23'],
        ['31', '32', '33'],
        ['11', '21', '31'],
        ['12', '22', '32'],
        ['13', '23', '33'],
        ['11', '22', '33'],
        ['13', '22', '31']
    ],
}
let DOM = {
    window : $(window),
    box : $('.game table.table tr td'),
    playerX : $('.score .score-container .player-X'),
    playerO : $('.score .score-container .player-O'),
    playerXO : $('.score .score-container .player-X, .score .score-container .player-O'),
    gameTie : $('.score .score-container .game-tie'),
    playerXScore : $('.player-X [data-score]'),
    playerOScore : $('.player-O [data-score]'),
    gameTieScore : $('.game-tie [data-score]'),
    result : $('.result'),
    oneTwoPlayerBtn : $('.one-player-btn, .two-player-btn'),

    // Returns current active player as per the chance
    dynamicPlayer : function(chance){
        return $(`.score .score-container .player-${chance? 'X': 'O'}`);
    }
}

// All boxes classes
let boxes = {
    box11 : $('.box11'),
    box12 : $('.box12'),
    box13 : $('.box13'),
    box21 : $('.box21'),
    box22 : $('.box22'),
    box23 : $('.box23'),
    box31 : $('.box31'),
    box32 : $('.box32'),
    box33 : $('.box33')
}
let updatedWinPositions;

// Checks if any win position is true
const checkEqual = function(a,b,c) {
    // return false if any of the box is empty in win positions
    if(!a.text()) return false;
    if(!b.text()) return false;
    if(!c.text()) return false;

    // Set will only contain unique values, so if all 3 values in win position are same,  
    // then that set size will be only 1
    let result = (new Set([a.text(),b.text(),c.text()])).size === 1;
    //Add bg-success for win positions
    if(result){
        a.addClass('bg-success');
        b.addClass('bg-success');
        c.addClass('bg-success');
    }
    return result;
}

// Checks all win positions 
const checkAllBoxes = function(){
return checkEqual(boxes.box11, boxes.box12, boxes.box13) || 
checkEqual(boxes.box21, boxes.box22, boxes.box23) || 
checkEqual(boxes.box31, boxes.box32, boxes.box33) ||
checkEqual(boxes.box11, boxes.box21, boxes.box31) || 
checkEqual(boxes.box12, boxes.box22, boxes.box32) || 
checkEqual(boxes.box13, boxes.box23, boxes.box33) ||
checkEqual(boxes.box11, boxes.box22, boxes.box33) || 
checkEqual(boxes.box31, boxes.box22, boxes.box13);
}

//Updates the scores for 1 & 2 player on screen
const UpdateScores = function(){
    let type = gameSettings.type;
    localStorage[`ticTacToe${type}PlayerX`] = localStorage[`ticTacToe${type}PlayerX`] || 0;
    localStorage[`ticTacToe${type}PlayerO`] = localStorage[`ticTacToe${type}PlayerO`] || 0;
    localStorage[`ticTacToeTie${type}`] = localStorage[`ticTacToeTie${type}`] || 0;
    DOM.playerXScore.html(localStorage[`ticTacToe${type}PlayerX`]).attr('data-score', localStorage[`ticTacToe${type}PlayerX`]);
    DOM.playerOScore.html(localStorage[`ticTacToe${type}PlayerO`]).attr('data-score', localStorage[`ticTacToe${type}PlayerO`]);
    DOM.gameTieScore.html(localStorage[`ticTacToeTie${type}`]).attr('data-score', localStorage[`ticTacToeTie${type}`]);
}

// Calling initially to update scores on page load
UpdateScores();

// Game Reset
const reset = function(won){
    let timeOut = 1000;
    let type = gameSettings.type;
    if(won === true){
        DOM.result.text(`Player ${gameSettings.chance? 'X': 'O'} won, New ${type} Game started!`);
        gameSettings.winScoreLocalStorage(`ticTacToe${type}Player${gameSettings.chance? 'X': 'O'}`);
    }
    // When 1 or 2 player button is clicked, reset values immediately
    else if(won === 'new'){
        timeOut = 1;
        DOM.result.text(`New ${type} Game started!`);
    }
    else{
        DOM.result.text(`Game is Draw, New ${type} Game started!`);
        DOM.box.addClass('bg-warning');
        gameSettings.winScoreLocalStorage(`ticTacToeTie${type}`);
    }
    UpdateScores();
    setTimeout(function(){
        DOM.box.html('').attr({'data-enable':'true', 'data-player':''}).removeClass('bg-success bg-warning');
        DOM.playerO.removeClass('bg-light');
        DOM.playerX.addClass('bg-light');
        gameSettings.chance = true;
        gameSettings.chances = 0;
    }, timeOut);
}

// Adjusting the height same as width of boxes on page load
DOM.box.height(DOM.box.width());

// Adjusting the height same as width on window resize
DOM.window.on('resize', function(){
    DOM.box.height(DOM.box.width());
});

DOM.oneTwoPlayerBtn.on('click',function(){
    event.preventDefault();
    gameSettings.twoPlayer = JSON.parse(this.dataset.twoplayer);
    gameSettings.type = gameSettings.twoPlayer?'TwoPlayer':'OnePlayer';
    reset('new'); // Reset game everytime 1 or 2 player button clicked
});

DOM.box.on('click', function() {

    // This is for updating the win positions with 'X' & 'O'
    updatedWinPositions = gameSettings.winPositions.map(function(arr) {return arr.slice();});
    if(this.dataset.enable === 'true'){
    
        //Update the selected box with 'X' or 'O' as per the chance
        gameSettings.chance ? $(this).html('<h1>X</h1>').attr('data-player', 'X'): $(this).html('<h1>O</h1>').attr('data-player', 'O');
        $(this).attr('data-enable','false'); // disable the clicked box
        ++gameSettings.chances; //Increase chance count by 1
        
        //This condition returns true when anyone won
        if(checkAllBoxes()){
            DOM.box.attr('data-enable','false');
            reset(true);
        }
        else{
            // Continue the game till the chances are not over 
            if(gameSettings.chances < 9){
                gameSettings.chance = !gameSettings.chance;
                DOM.playerXO.removeClass('bg-light'); // Remove highlight from both players
                DOM.dynamicPlayer(gameSettings.chance).addClass('bg-light'); // Add highlight only for current player
            }
            else{
                reset();
            }
        }  
    }

    // Logic for 1 player (With computer) only if twoPlayer is true & chance is of computer
    if(!gameSettings.twoPlayer && !gameSettings.chance) {
        let $emptyBoxes = $('.game tr td[data-enable="true"]');
        let $emptyDiagonalBoxes = $('.game tr td[data-enable="true"][data-diagonal="true"]');
        let $playerX = $('.game tr td[data-player="X"]');
        let $playerO = $('.game tr td[data-player="O"]');
        gameSettings.systemTurn = true; // Make system turn true

        // Next best move logic
        const counterNextWinMove = function(player){ // player is 'XX' or 'OO'
            updatedWinPositions.forEach( a => {
                //'a' will be each win array, check if 'a' has any numbers(number means still that 
                //position is empty, as we r updating the positions with 'X' & 'O' for each move) after converting it to string
                if( /\d/.test(a.join('')) ) { 
                    // remove numbers and check of it contains 'XX' or 'YY', passed as player
                    if( a.join('').replace(/[0-9]/g, '').indexOf(player) >= 0 ){
                        a.forEach( c =>{
                            //'c' will be box position 
                            if( parseInt(c) ){ // if it converts to number, means empty position
                                if( gameSettings.systemTurn ){ // if it is system turn
                                    // Then trigger click on that specific box
                                    $(`[data-enable="true"][data-position=${c}]`).click();
                                    gameSettings.systemTurn = false; // change system turn to false
                                    return false; // return false to break the loop
                                }
                            }   
                        });
                    }
                }
            });
        }
        
       // Update win positions with latest 'X' & 'Y' positions 
       updatedWinPositions.forEach( (a,b) =>{
                a.forEach( (c,d) => {
                    if( $(`[data-position="${c}"]`).text() !== '' ){
                        a[d] = $(`[data-position="${c}"]`).text();
                    }
                })
        });

        // When one move was made
        if( gameSettings.chances === 1 ){
            //In each method, 'b' will be index and 'a' will be element/value
            $emptyBoxes.each((b,a)=>{
                // Fill middle position if empty
                if(a.dataset.position === '22'){

                    if(gameSettings.systemTurn){ 
                        $(a).click();
                        gameSettings.systemTurn = false;
                        return false;
                    }
                }
            });

            //This will execute if middle box is not empty, then trigger click on any random diagonal box
            if(gameSettings.systemTurn){
                $emptyDiagonalBoxes[Math.floor(Math.random()*$emptyDiagonalBoxes.length)].click();
                gameSettings.systemTurn = false;
            }
        }

        // When 3,5,7 moves are made, use 'counterNextWinMove' method for next best move
        else if( gameSettings.chances === 3 || gameSettings.chances === 5 || gameSettings.chances === 7){
            
            if(gameSettings.chances === 5 || gameSettings.chances === 7){
                //First try to win, When chances are 5 or 7, then there are chances of consecutive 'O'
                counterNextWinMove('OO');
            }

            if(gameSettings.systemTurn){
                //Next try to defend
                counterNextWinMove('XX');
            }

            if(gameSettings.systemTurn){
                // If win or defend not possible, trigger click on the first empty diagonal/empty box
                $emptyDiagonalBoxes.length ? $emptyDiagonalBoxes[0].click() : $emptyBoxes[0].click();
                //Always make system turn false after each click triggered by system
                gameSettings.systemTurn = false;
                return false;
            }
        }
      }
    });
});