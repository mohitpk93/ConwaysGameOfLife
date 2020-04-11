function $(selector,container){
    return (container|| document).querySelector(selector);
}

(function(){

var _ = self.Life = function(seed){
    this.seed = seed;
    this.height = seed.length;
    this.width = seed[0].length;    

    this.prevBoard = [];
    this.board = cloneArray(seed);
};

_.prototype = {
    next: function(){
        this.prevBoard = cloneArray(this.board);

        // For loop to be inserted in the prototype as below:
        for (var y = 0; y < this.height; y++) {
            for(var x= 0; x < this.width; x++){
                var neighbors = this.aliveNeighbors(this.prevBoard,x,y);
              //  console.log(y,x, ' : ',neighbors);
              var alive = !!this.board[y][x];

              if(alive){
                  if(neighbors < 2 || neighbors > 3) {
                        this.board[y][x] = 0;
                  }
                }
                  else
                  {
                      if(neighbors == 3) {
                        this.board[y][x] = 1;
                      }
                  }
              
            }
        }
    },

    aliveNeighbors: function (array, x, y) {
		var prevRow = array[y-1] || [];
		var nextRow = array[y+1] || [];
		
		return [
			prevRow[x-1], prevRow[x], prevRow[x+1],
			array[y][x-1], array[y][x+1],
			nextRow[x-1], nextRow[x], nextRow[x+1]
		].reduce(function (prev, cur) {
			return prev + +!!cur;
		}, 0);
	},


    toString : function(){
        return this.board.map( function(row) { return row.join(' ');}).join('\n');
    }
};
//Helpers
//Warning: Only clones 2D Arrays
function cloneArray(array){
    return array.slice().map( function(row) { return row.slice(); });
}

})();

//#region "Debugging game algorithm"
// var game = new Life([
// [0,0,0,0,0,0],
// [0,0,0,0,0,0],
// [0,0,1,1,1,0],
// [0,1,1,1,0,0],
// [0,0,0,0,0,0],
// [0,0,0,0,0,0]
// ]); 

// console.log(game + '');     // +'' added to avoid printing object instead of string

// game.next();

// console.log(game + '');

// game.next();

// console.log(game + '');
//#endregion

(function(){
    var _ = self.LifeView = function(table,size){
        this.grid = table;
        this.size = size;
        this.started = false;
        this.autoplay = false;

        this.createGrid();
    };

    _.prototype = {
        createGrid : function(){
            var me = this;

            var fragment = document.createDocumentFragment();
            this.grid.innerHTML = '';
            this.checkBoxes = [];    

            for(var y=0; y < this.size; y++)  {
                var row = document.createElement('tr');
                this.checkBoxes[y] = [];    

                for (var x = 0; x < this.size; x ++){
                        var cell = document.createElement('td');
                        var checkBox = document.createElement('input');
                        checkBox.type = 'checkbox';
                        this.checkBoxes[y][x] = checkBox; 
                        checkBox.coords = [y,x];
                                                
                        cell.appendChild(checkBox);
                        row.appendChild(cell);
                    }
                fragment.appendChild(row);
            }

            this.grid.addEventListener('change',function(evt){
                if(evt.target.nodeName.toLowerCase()=='input'){
                    me.started = false;
                }
            });
          

            this.grid.appendChild(fragment);

            this.grid.addEventListener('keyup',function(evt){
                var checkbox  = evt.target;    

                if(checkbox.nodeName.toLowerCase()=='input'){
                    var coords = checkbox.coords;
                    var y = coords[0];
                    var x = coords[1];

                    //console.log(event.keyCode)
                    switch(evt.keyCode){
                        
                        case 37: //left
                       // console.log(x,y,evt.keyCode, me.size);
                        if(x>0){
                            me.checkBoxes[y][x-1].focus();
                        }
                        break;

                        case 39: //right
                        //console.log(x,y,evt.keyCode, me.size);
                        if(x<me.size-1){
                            me.checkBoxes[y][x+1].focus();
                        }
                        break;

                        case 38: //up
                        //console.log(x,y,evt.keyCode, me.size);
                        if(y>0){
                            me.checkBoxes[y-1][x].focus();
                        }
                        break;
                        
                        case 40: //bottom
                       // console.log(x,y,evt.keyCode, me.size);
                        if(y<me.size-1){
                            me.checkBoxes[y+1][x].focus();
                        }
                        break;
                        
                        
                    }
                }
            });
        },

        get boardArray(){
            return this.checkBoxes.map(function (row){
                return row.map(function (checkBox){
                    return +checkBox.checked;
                });
            });
        },

        play : function(){
            this.game = new Life(this.boardArray);
            this.started = true;
        },

      

        next:function(){
            //"me" variable used to autoplay to next step once game is started
            var me = this;

            if(!this.started || this.game){
                this.play();
            }
            else{

            }
            this.game.next();
            var board = this.game.board;

            for(var y = 0;y< this.size; y++){
                for(var x =0; x<this.size; x++){
                    this.checkBoxes[y][x].checked = !!board[y][x];
                }
            }

            if(this.autoplay){
               this.timer = setTimeout(function(){
                    me.next();
                },500);
            }
           
        }
    };
})();

var lifeView = new LifeView(document.getElementById('grid'),12);

(function (){

    var buttons = {
        next: $('button.next')
    };

    buttons.next.addEventListener('click', function(event) {
        lifeView.next();    
    });

    $('#autoplay').addEventListener('change',function(event){
        buttons.next.textContent = this.checked ? 'Start':'Next';
        lifeView.autoplay = this.checked;

        if(!this.timer){
            clearTimeout(this.timer);
        }
    });

})();