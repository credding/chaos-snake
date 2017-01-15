import Vue from 'vue';

let VoteRowComponent = Vue.component('snake-vote-row', {
    template: require('./vote-row.html'),
    props: {
        count: Number,
        total: Number,
        icon: String,
        row: {
            type: Boolean,
            default: false
        }
    }
});

export default VoteRowComponent;
