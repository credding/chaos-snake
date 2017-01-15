let Express = require('express');
let Http = require('http');
let Socket = require('socket.io');

const GRID_WIDTH = 25;
const GRID_HEIGHT = 25;

let app = Express();
let http = Http.Server(app);
let io = Socket(http);

let stats = {
    total: 0,
    no: 0,
    up: 0,
    down: 0,
    left: 0,
    right: 0
};

let render = {
    mode: 'end',
    snake: [ [ 0, 0 ] ],
    food: [ 0, 0 ]
};

let userCount = 0;
let users = {};
let velocity = [ 0, 0 ]

app.use(Express.static('build'));
app.get('/', (req, res) => {
    res.sendFile('build/index.html');
});

io.on('connection', function(socket){

    let id = '';
    let user = null

    socket.on('session', saveId => {

        if (saveId in users) {
            id = saveId;
            user = users[saveId];
            user.connected = true;
        } else {
            userCount++;
            id = Math.random().toString(36).substr(2, 10);
            user = { key: 'NO', current: 'NO', connected: true }
            users[id] = user;
        }

        socket.emit('session', id);
        socket.emit('render', render);
        sendStats();

        socket.on('key', key => {
            user.key = key;
            if (render.mode !== 'play' || key !== 'NO') user.current = key;
            sendStats();
        });
    });

    socket.on('disconnect', () => {
        if (user != null) {
            user.connected = false;
            setTimeout(function() {
                if (!user.connected) {
                    userCount--;
                    delete users[id];
                }
            }, 15000);
        }
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

sendRender();

function sendStats() {
    stats = {
        total: userCount,
        no: 0,
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };
    for (let id in users) {
        switch (users[id].current) {
            case 'NO':
                stats.no++;
                break;
            case 'UP':
                stats.up++;
                break;
            case 'DOWN':
                stats.down++;
                break;
            case 'LEFT':
                stats.left++;
                break;
            case 'RIGHT':
                stats.right++;
                break;
        }
    }
    io.emit('stats', stats);
}

function sendRender() {
    let nextTimeout = 0;
    switch (render.mode) {
        case '3':
            if (userCount > 0) {
                render.mode = '2';
                nextTimeout = 1000;
            } else {
                nextTimeout = 3000;
            }
            break;
        case '2':
            render.mode = '1';
            nextTimeout = 1000;
            break;
        case '1':
            render.mode = 'play';
            nextTimeout = 1000;
            break;
        case 'play':
            if (calculateVelocity()) {
                if (!moveTail()) {
                    render.mode = 'end';
                    nextTimeout = 3000;
                    break;
                }
            }
            for (let id in users) {
                users[id].current = users[id].key;
            }
            nextTimeout = 150;
            break;
        case 'end': {
            velocity = [0, 0];
            render.mode = '3';
            render.snake = [[
                Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1,
                Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1
            ]];
            generateFood();
            nextTimeout = 1000;
        }
    }
    io.emit('render', render);
    sendStats();
    setTimeout(sendRender, nextTimeout);
}

function calculateVelocity() {
    let noX = velocity[0] === 0;
    let noY = velocity[1] === 0;
    let isFirst = render.snake.length === 1;
    switch (Math.max(stats.up, stats.down, stats.left, stats.right)) {
        case 0:
            if (noX && noY) return false;
            break;
        case stats.up:
            if (noY || isFirst) velocity = [0, -1];
            break;
        case stats.down:
            if (noY || isFirst) velocity = [0, 1];
            break;
        case stats.left:
            if (noX || isFirst) velocity = [-1, 0];
            break;
        case stats.right:
            if (noX || isFirst) velocity = [1, 0];
            break;
    }
    return true;
}

function moveTail() {
    // Find next
    let head = render.snake[render.snake.length - 1];
    // Generate next
    let next = [head[0] + velocity[0], head[1] + velocity[1]];
    // Check boundaries
    if (next[0] < 0 || next[1] < 0 || next[0] >= GRID_WIDTH || next[1] >= GRID_HEIGHT) {
        return false;
    }
    // Check collisions
    for (let i = 0; i < render.snake.length; i++) {
        let part = render.snake[i];
        if (next[0] === part[0] && next[1] === part[1]) {
            return false;
        }
    }
    // Check food
    if (next[0] === render.food[0] && next[1] === render.food[1]) {
        generateFood();
    } else {
        render.snake.shift();
    }
    render.snake.push(next);
    return true;
}

function generateFood() {
    let next = [
        Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1,
        Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1
    ]
    // Check snake
    for (let i = 0; i < render.snake.length; i++) {
        let part = render.snake[i];
        if (next[0] === part[0] && next[1] === part[1]) {
            return generateFood();
        }
    }
    // Check existing food
    if (next[0] === render.food[0] && next[1] === render.food[1]) {
        return generateFood();
    }
    render.food = next;
}
