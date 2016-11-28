/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var
        //stale

        //rozmiar
        COLS = 20,
        ROWS = 20,
        //identyfikatory
        EMPTY = 0,
        SNAKE = 1,
        FRUIT = 2,
        LEFT = 0,
        UP = 1,
        RIGHT = 2,
        DOWN = 3,
        //kody klawiszy
        KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40,
        //obiekty gry - canvas i inne
        canvas, //HTMLCanvas
        ctx, //kontekst 2d
        keystate, //obsluga klawiatury
        frames, //licznik klatek
        score; //wynik gracza

//oklasy gry - plansza i waz
grid = {
    width: null, //ilosc kolumn
    height: null, //ilosc wierszt
    _grid: null, //tablica reprezentujaca plansze gry

    //inicjalizacja (c - kolumny, r - wiersze) i wypelnie wartoscia domyslna
    init: function (d, c, r) {
        this.width = c;
        this.height = r;
        this._grid = [];
        for (var x = 0; x < c; x++) {
            this._grid.push([]);
            for (var y = 0; y < r; y++) {
                this._grid[x].push(d);
            }
        }
    },
    //ustalanie wartosci pola
    set: function (val, x, y) {
        this._grid[x][y] = val;
    },
    //zwracanie wartosci pola
    get: function (x, y) {
        return this._grid[x][y];
    }
}

snake = {
    direction: null, //reprezentacja kierunku ruchy weza
    last: null, //wskaznik na ostatni element kolejki
    _queue: null, //kolejka reprezentujaca weza

    //czyszczenie kolejki, ustenie kierunku domyslnego
    //dodanie pierwszego elementu o wspozednych (x,y)
    init: function (d, x, y) {
        this.direction = d;
        this._queue = [];
        this.insert(x, y);
    },
    //dodawanie do kolejki elementu o wspozednych (x,y)
    insert: function (x, y) {
        //unshift wstawia na poczatek kolejki (fifo)
        this._queue.unshift({x: x, y: y});
        this.last = this._queue[0];
    },
    //usuwanie ostatniego elementu kolejki
    remove: function () {
        return this._queue.pop();
    }
};

//funkcja wstwaiania jedzenia
function setFood() {
    var empty = [];

    //przechodzenie calej tablicy i znajdowanie wszystkich wolnych miejsc
    for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
            if (grid.get(x, y) === EMPTY) {
                empty.push({x: x, y: y});
            }
        }
    }
    //losowy wybor jednego z pustych miejsc
    var randpos = empty[Math.round(Math.random() * (empty.length - 1))];
    grid.set(FRUIT, randpos.x, randpos.y);
}

//funkcja main - uruchomienie gry
function main() {
    //utworzenie Canvas
    canvas = document.createElement("canvas");
    canvas.width = COLS * 20;
    canvas.height = ROWS * 20;
    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    ctx.font = "12px Verdana";
    frames = 0;
    keystate = {};
    //obsluga klawiatury
    document.addEventListener("keydown", function (evt) {
        keystate[evt.keyCode] = true;
    });
    document.addEventListener("keyup", function (evt) {
        delete keystate[evt.keyCode];
    });

    //inicjalizacja i zapetlenie
    init();
    loop();
}

//inicjalizacja gry
function init() {
    score = 0;
    grid.init(EMPTY, COLS, ROWS);
    //ustalenie pozycji startowej
    var sp = {x: Math.floor(COLS / 2), y: ROWS - 1};
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);
    setFood();
}

//funkcja petli
function loop() {
    update();
    draw();
    //zapetlenie animacji
    window.requestAnimationFrame(loop, canvas);
}

//funkcja aktualizujaca dane przed wyswietleniem
function update() {
    frames++;
    //zmiana kierunku ruchu weza w zaleznosci od wcisnietego klawisza
    if (keystate[KEY_LEFT] && snake.direction !== RIGHT) {
        snake.direction = LEFT;
    }
    if (keystate[KEY_UP] && snake.direction !== DOWN) {
        snake.direction = UP;
    }
    if (keystate[KEY_RIGHT] && snake.direction !== LEFT) {
        snake.direction = RIGHT;
    }
    if (keystate[KEY_DOWN] && snake.direction !== UP) {
        snake.direction = DOWN;
    }
    //aktualizacja planszy co 20 klatek
    if (frames % 20 === 0) {
        //przenoszenie ostatniego elementu ("ogona") na sam poczatek w odpowiednim kierunku
        var nx = snake.last.x;
        var ny = snake.last.y;
        //wybor miejsca wzgledem "glowy" w zaleznosci od kierunku
        switch (snake.direction) {
            case LEFT:
                nx--;
                break;
            case UP:
                ny--;
                break;
            case RIGHT:
                nx++;
                break;
            case DOWN:
                ny++;
                break;
        }
        //sprawdzanie warunkow przegranej
        if (0 > nx || nx > grid.width - 1 ||
                0 > ny || ny > grid.height - 1 ||
                grid.get(nx, ny) === SNAKE
                ) {
            return init();
        }
        //sprawdzanie czy nowa pozycja jest jedzeniem
        if (grid.get(nx, ny) === FRUIT) {
            //inkrementacja wyniku, nowe jedzenie
            score++;
            setFood();
        } else {
            //przenoszenie ostatniego elementu na poczatek, czyszczenie przestrzeni
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
        }
        //dodanie identyfikatora weza do komorki i dodanie elementu do kolejki
        grid.set(SNAKE, nx, ny);
        snake.insert(nx, ny);
    }
}


function draw() {
    //obliczanie rozmiaru kafelkow
    var tw = canvas.width / grid.width;
    var th = canvas.height / grid.height;
    // iterate through the grid and draw all cells
    for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
            //przechodzenie po calej tablicy i wyswietlanie jej elementow
            switch (grid.get(x, y)) {
                case EMPTY:
                    ctx.fillStyle = "#fff";
                    break;
                case SNAKE:
                    ctx.fillStyle = "#0f0";
                    break;
                case FRUIT:
                    ctx.fillStyle = "#f00";
                    break;
            }
            ctx.fillRect(x * tw, y * th, tw, th);
        }
    }
    //wyswietlanie wyniku
    ctx.fillStyle = "#000";
    ctx.fillText("WYNIK: " + score, 10, canvas.height - 10);
}
//uruchomienie gry
main();