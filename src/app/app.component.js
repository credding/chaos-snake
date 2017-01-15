import Vue from 'vue';
import io from 'socket.io-client';

const PIXEL_SIZE = 30;
const GRID_WIDTH = 25;
const GRID_HEIGHT = 25;

let width = PIXEL_SIZE * GRID_WIDTH;
let height = PIXEL_SIZE * GRID_HEIGHT;
let centerX = width / 2;
let centerY = height / 2;

let data = {
    stats: { total: 1, no: 1, up: 0, down: 0, left: 0, right: 0 }
};

let renderData = {
    mode: '3',
    snake: [ [ 0, 0 ] ],
    food: [ 0, 0 ]
};

let currentKey = 'NO';

let canvas = null;
let ctx = null;
let socket = null;

let AppComponent = Vue.component('snake-app', {
    template: require('./app.html'),
    data: () => data,
    mounted: () => {
        canvas = document.getElementById('draw-surface');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
        openSocket();
    }
});

function keydown(event) {
    let old = currentKey;
    switch (event.key) {
        case 'ArrowUp':
            currentKey = 'UP';
            break;
        case 'ArrowDown':
            currentKey = 'DOWN';
            break;
        case 'ArrowLeft':
            currentKey = 'LEFT';
            break;
        case 'ArrowRight':
            currentKey = 'RIGHT';
            break;
    }
    if (old != currentKey) {
        socket.emit('key', currentKey);
    }
}

function keyup(event) {
    let old = currentKey;
    switch (event.key) {
        case 'ArrowUp':
            if (currentKey == 'UP') currentKey = 'NO';
            break;
        case 'ArrowDown':
            if (currentKey == 'DOWN') currentKey = 'NO';
            break;
        case 'ArrowLeft':
            if (currentKey == 'LEFT') currentKey = 'NO';
            break;
        case 'ArrowRight':
            if (currentKey == 'RIGHT') currentKey = 'NO';
            break;
    }
    if (old != currentKey) {
        socket.emit('key', currentKey);
    }
}

function openSocket() {
    socket = io();

    socket.on('stats', payload => {
        data.stats = payload;
    });
    socket.on('render', payload => {
        renderData = payload;
        render();
    });
    socket.on('session', id => {
        localStorage.setItem('session', id);
    });

    let session = localStorage.getItem('session');
    socket.emit('session', session);

    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
}

function render() {
    window.requestAnimationFrame(() => {
        ctx.save();
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0f0';
        ctx.lineWidth = 0;
        renderData.snake.forEach(val => {
            let x = PIXEL_SIZE * val[0];
            let y = PIXEL_SIZE * val[1];
            ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
        });
        ctx.fillStyle = '#f00';
        let x = PIXEL_SIZE * renderData.food[0];
        let y = PIXEL_SIZE * renderData.food[1];
        ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 10;
        ctx.font = 'bold 300px sans-serif';
        ctx.textAlign = 'center';
        switch (renderData.mode) {
            case '3':
                ctx.strokeText('3', centerX, centerY + 50);
                ctx.fillText('3', centerX, centerY + 50);
                break;
            case '2':
                ctx.strokeText('2', centerX, centerY + 50);
                ctx.fillText('2', centerX, centerY + 50);
                break;
            case '1':
                ctx.strokeText('1', centerX, centerY + 50);
                ctx.fillText('1', centerX, centerY + 50);
                break;
            case 'play':
                break;
            case 'end':
                ctx.font = 'bold 120px sans-serif';
                ctx.strokeText('Game Over', centerX, centerY + 10);
                ctx.fillText('Game Over', centerX, centerY + 10);
                break;
        }
        ctx.restore();
    });
}

export default AppComponent;
